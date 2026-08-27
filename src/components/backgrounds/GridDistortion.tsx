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
    // slow idle warp so the field drifts without the cursor
    uv += vec2(
      sin(vUv.y * 6.0 + time * 0.30),
      cos(vUv.x * 6.0 + time * 0.26)
    ) * 0.006;

    vec4 offset = texture2D(uDataTexture, vUv);
    float r = texture2D(uTexture, uv - 0.032 * offset.rg).r;
    float g = texture2D(uTexture, uv - 0.030 * offset.rg).g;
    float b = texture2D(uTexture, uv - 0.028 * offset.rg).b;
    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

type Blob = { x: number; y: number; r: number; color: string };

/** Paints a soft flowing indigo/violet colour field onto a canvas (no grid). */
function paintField(canvas: HTMLCanvasElement, w: number, h: number) {
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  ctx.fillStyle = "#0B0E17";
  ctx.fillRect(0, 0, w, h);

  const s = Math.max(w, h);
  const blobs: Blob[] = [
    { x: 0.16, y: 0.28, r: 0.78, color: "#0E2A2C" },
    { x: 0.72, y: 0.18, r: 0.7, color: "#123642" },
    { x: 0.5, y: 0.64, r: 0.9, color: "rgba(0, 245, 212, 0.28)" },
    { x: 0.86, y: 0.72, r: 0.58, color: "#0C4A46" },
    { x: 0.26, y: 0.84, r: 0.6, color: "rgba(0, 200, 190, 0.22)" },
    { x: 0.62, y: 0.4, r: 0.4, color: "#161B26" },
    { x: 0.8, y: 0.5, r: 0.2, color: "rgba(255, 128, 0, 0.12)" },
    { x: 0.44, y: 0.34, r: 0.24, color: "rgba(210, 255, 248, 0.5)" },
  ];

  ctx.globalCompositeOperation = "lighter";
  for (const b of blobs) {
    const cx = b.x * w;
    const cy = b.y * h;
    const rad = b.r * s;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rad);
    g.addColorStop(0, b.color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.globalCompositeOperation = "source-over";

  // deepen the low corner for contrast
  const shade = ctx.createLinearGradient(0, 0, w * 0.4, h);
  shade.addColorStop(0, "rgba(11,14,23,0)");
  shade.addColorStop(1, "rgba(8,10,18,0.5)");
  ctx.fillStyle = shade;
  ctx.fillRect(0, 0, w, h);

  // soft edge vignette
  const v = ctx.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * 0.2,
    w / 2,
    h / 2,
    Math.max(w, h) * 0.8,
  );
  v.addColorStop(0, "rgba(11,14,23,0)");
  v.addColorStop(1, "rgba(11,14,23,0.62)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
}

export default function GridDistortion({
  grid = 6,
  mouse = 0.4,
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
    paintField(texCanvas, 1024, 1024);
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
      paintField(texCanvas, tw, th);
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
