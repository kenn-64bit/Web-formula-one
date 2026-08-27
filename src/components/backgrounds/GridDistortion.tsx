"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  grid?: number;
  mouse?: number;
  strength?: number;
  relaxation?: number;
  className?: string;
};

const vertexShader = /* glsl */ `
  uniform float time;
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uDataTexture;
  uniform sampler2D uTexture;
  uniform float time;
  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;
    // slow idle warp so the grid moves without the cursor
    uv += vec2(
      sin(vUv.y * 8.0 + time * 0.30),
      cos(vUv.x * 8.0 + time * 0.26)
    ) * 0.004;

    vec4 offset = texture2D(uDataTexture, vUv);
    float r = texture2D(uTexture, uv - 0.060 * offset.rg).r;
    float g = texture2D(uTexture, uv - 0.050 * offset.rg).g;
    float b = texture2D(uTexture, uv - 0.042 * offset.rg).b;
    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

/** Paints the base gradient + glowing cyan telemetry grid onto a canvas. */
function paintGrid(canvas: HTMLCanvasElement, w: number, h: number) {
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const bg = ctx.createLinearGradient(0, 0, w * 0.35, h);
  bg.addColorStop(0, "#0B0E17");
  bg.addColorStop(0.55, "#141A28");
  bg.addColorStop(1, "#0B0E17");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  const pitch = Math.max(34, Math.round(Math.min(w, h) / 16));

  ctx.shadowColor = "rgba(0, 245, 212, 0.55)";
  ctx.shadowBlur = 6;

  // minor grid
  ctx.strokeStyle = "rgba(0, 245, 212, 0.24)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = pitch; x < w; x += pitch) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
  }
  for (let y = pitch; y < h; y += pitch) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
  }
  ctx.stroke();

  // major lines every 4th cell
  ctx.strokeStyle = "rgba(0, 245, 212, 0.45)";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  for (let x = pitch * 4; x < w; x += pitch * 4) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
  }
  for (let y = pitch * 4; y < h; y += pitch * 4) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
  }
  ctx.stroke();

  // bright horizon
  ctx.strokeStyle = "rgba(0, 245, 212, 0.7)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, Math.round(h * 0.5) + 0.5);
  ctx.lineTo(w, Math.round(h * 0.5) + 0.5);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // edge vignette
  const v = ctx.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * 0.25,
    w / 2,
    h / 2,
    Math.max(w, h) * 0.75,
  );
  v.addColorStop(0, "rgba(11,14,23,0)");
  v.addColorStop(1, "rgba(11,14,23,0.5)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
}

export default function GridDistortion({
  grid = 15,
  mouse = 0.12,
  strength = 0.16,
  relaxation = 0.9,
  className,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "high-performance",
      });
    } catch {
      return; // no WebGL — the CSS grid layer stays visible
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);
    container.innerHTML = "";
    container.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
      display: "block",
    });

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 0, 0, 0, -1000, 1000);
    camera.position.z = 2;

    const texCanvas = document.createElement("canvas");
    paintGrid(texCanvas, 1024, 1024);
    const imageTexture = new THREE.CanvasTexture(texCanvas);
    imageTexture.colorSpace = THREE.SRGBColorSpace;
    imageTexture.minFilter = THREE.LinearFilter;
    imageTexture.magFilter = THREE.LinearFilter;

    const size = grid;
    const data = new Float32Array(4 * size * size);
    for (let i = 0; i < size * size; i++) {
      data[i * 4] = Math.random() * 250 - 125;
      data[i * 4 + 1] = Math.random() * 250 - 125;
    }
    const dataTexture = new THREE.DataTexture(
      data,
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType,
    );
    dataTexture.needsUpdate = true;

    const uniforms = {
      time: { value: 0 },
      uTexture: { value: imageTexture },
      uDataTexture: { value: dataTexture },
    };

    const material = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
    });
    const geometry = new THREE.PlaneGeometry(1, 1, size - 1, size - 1);
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    function handleResize() {
      const rect = container!.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;
      if (!width || !height) return;

      renderer.setSize(width, height);
      const aspect = width / height;
      plane.scale.set(aspect, 1, 1);
      camera.left = -aspect / 2;
      camera.right = aspect / 2;
      camera.top = 0.5;
      camera.bottom = -0.5;
      camera.updateProjectionMatrix();

      const tw = Math.min(1400, Math.round(width));
      const th = Math.min(1400, Math.round(height));
      paintGrid(texCanvas, tw, th);
      imageTexture.needsUpdate = true;
    }

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);
    handleResize();
    renderer.render(scene, camera); // synchronous first paint

    const mouseState = { x: 0, y: 0, prevX: 0, prevY: 0, vX: 0, vY: 0 };
    function onMove(e: MouseEvent) {
      const rect = container!.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      mouseState.vX = x - mouseState.prevX;
      mouseState.vY = y - mouseState.prevY;
      Object.assign(mouseState, { x, y, prevX: x, prevY: y });
    }
    function onLeave() {
      Object.assign(mouseState, { x: 0, y: 0, prevX: 0, prevY: 0, vX: 0, vY: 0 });
    }
    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseleave", onLeave);

    let raf = 0;
    let running = false;

    function animate() {
      raf = requestAnimationFrame(animate);
      uniforms.time.value += 0.05;

      const d = data;
      for (let i = 0; i < size * size; i++) {
        d[i * 4] *= relaxation;
        d[i * 4 + 1] *= relaxation;
      }

      const gmx = size * mouseState.x;
      const gmy = size * mouseState.y;
      const maxDist = size * mouse;
      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const distSq = (gmx - i) ** 2 + (gmy - j) ** 2;
          if (distSq < maxDist * maxDist) {
            const idx = 4 * (i + size * j);
            const power = Math.min(maxDist / Math.sqrt(distSq || 1), 10);
            d[idx] += strength * 100 * mouseState.vX * power;
            d[idx + 1] -= strength * 100 * mouseState.vY * power;
          }
        }
      }

      mouseState.vX *= 0.9;
      mouseState.vY *= 0.9;
      dataTexture.needsUpdate = true;
      renderer.render(scene, camera);
    }

    function start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(animate);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    const io = new IntersectionObserver(
      ([entry]) => (entry.isIntersecting ? start() : stop()),
      { threshold: 0.01 },
    );
    io.observe(container);
    start();

    function onVisibility() {
      if (document.hidden) stop();
      else start();
    }
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      container.removeEventListener("mousemove", onMove);
      container.removeEventListener("mouseleave", onLeave);
      geometry.dispose();
      material.dispose();
      imageTexture.dispose();
      dataTexture.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [grid, mouse, strength, relaxation]);

  return (
    <div
      ref={containerRef}
      aria-hidden
      className={className}
      style={{ width: "100%", height: "100%", overflow: "hidden" }}
    />
  );
}
