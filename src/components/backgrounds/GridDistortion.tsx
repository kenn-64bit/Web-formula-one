"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  /** subdivisions of the displacement grid */
  grid?: number;
  /** cursor influence radius (0–1 of the grid) */
  mouse?: number;
  /** displacement intensity */
  strength?: number;
  /** per-frame relaxation of the displacement back to rest (0–1) */
  relaxation?: number;
  className?: string;
};

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform sampler2D uDataTexture;
  uniform float uTime;
  varying vec2 vUv;

  void main() {
    vec4 offset = texture2D(uDataTexture, vUv);
    // slow idle drift so the grid breathes without cursor input
    vec2 drift = vec2(
      sin(vUv.y * 6.0 + uTime * 0.15),
      cos(vUv.x * 6.0 + uTime * 0.12)
    ) * 0.0025;
    vec2 uv = vUv + drift;
    // RGB split: sample each channel with a slightly different displacement
    float r = texture2D(uTexture, uv - 0.02 * offset.rg).r;
    float g = texture2D(uTexture, uv - 0.017 * offset.rg).g;
    float b = texture2D(uTexture, uv - 0.014 * offset.rg).b;
    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

/** Paints the base gradient + cyan telemetry grid onto a canvas. */
function paintGrid(canvas: HTMLCanvasElement, w: number, h: number) {
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const g = ctx.createLinearGradient(0, 0, w * 0.4, h);
  g.addColorStop(0, "#0B0E17");
  g.addColorStop(1, "#161B26");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);

  const pitch = Math.max(28, Math.round(Math.min(w, h) / 22));
  ctx.lineWidth = 1;
  ctx.strokeStyle = "rgba(0, 245, 212, 0.13)";
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

  // brighter horizon line + a couple of accent verticals
  ctx.strokeStyle = "rgba(0, 245, 212, 0.28)";
  ctx.beginPath();
  ctx.moveTo(0, Math.round(h * 0.5) + 0.5);
  ctx.lineTo(w, Math.round(h * 0.5) + 0.5);
  ctx.stroke();

  // vignette
  const v = ctx.createRadialGradient(
    w / 2,
    h / 2,
    Math.min(w, h) * 0.2,
    w / 2,
    h / 2,
    Math.max(w, h) * 0.7,
  );
  v.addColorStop(0, "rgba(11,14,23,0)");
  v.addColorStop(1, "rgba(11,14,23,0.7)");
  ctx.fillStyle = v;
  ctx.fillRect(0, 0, w, h);
}

export default function GridDistortion({
  grid = 15,
  mouse = 0.1,
  strength = 0.15,
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
      return; // no WebGL — parent fallback covers it
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);
    Object.assign(renderer.domElement.style, {
      position: "absolute",
      inset: "0",
      width: "100%",
      height: "100%",
    });

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 0, 0, 0, -1000, 1000);
    camera.position.z = 2;

    // procedural texture
    const texCanvas = document.createElement("canvas");
    paintGrid(texCanvas, 512, 512);
    const imageTexture = new THREE.CanvasTexture(texCanvas);
    imageTexture.colorSpace = THREE.SRGBColorSpace;
    imageTexture.minFilter = THREE.LinearFilter;

    // displacement data texture (grid x grid, RGBA float)
    const size = grid;
    const data = new Float32Array(size * size * 4);
    const dataTexture = new THREE.DataTexture(
      data,
      size,
      size,
      THREE.RGBAFormat,
      THREE.FloatType,
    );
    dataTexture.magFilter = THREE.NearestFilter;
    dataTexture.minFilter = THREE.NearestFilter;
    dataTexture.needsUpdate = true;

    const material = new THREE.ShaderMaterial({
      uniforms: {
        uTexture: { value: imageTexture },
        uDataTexture: { value: dataTexture },
        uTime: { value: 0 },
      },
      vertexShader,
      fragmentShader,
    });

    const geometry = new THREE.PlaneGeometry(1, 1, size - 1, size - 1);
    const plane = new THREE.Mesh(geometry, material);
    scene.add(plane);

    // cover-fit the unit plane to the container aspect
    let imageAspect = 1;
    function resize() {
      const w = container!.offsetWidth;
      const h = container!.offsetHeight;
      if (!w || !h) return;
      renderer.setSize(w, h);

      const a1 = w / h > imageAspect ? (h / w) * imageAspect : 1;
      const a2 = w / h > imageAspect ? 1 : w / h / imageAspect;
      plane.scale.set(a1 < 1 ? 1 : a1, a2 < 1 ? 1 : a2, 1);

      camera.left = -0.5;
      camera.right = 0.5;
      camera.top = 0.5;
      camera.bottom = -0.5;
      camera.updateProjectionMatrix();

      // repaint texture near the display resolution for crisp lines
      const tw = Math.min(1024, Math.round(w));
      const th = Math.min(1024, Math.round(h));
      paintGrid(texCanvas, tw, th);
      imageAspect = tw / th;
      imageTexture.needsUpdate = true;
    }

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    // pointer state
    const mouseState = { x: 0, y: 0, prevX: 0, prevY: 0, vX: 0, vY: 0 };
    function onMove(e: MouseEvent) {
      const rect = container!.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = 1 - (e.clientY - rect.top) / rect.height;
      mouseState.vX = x - mouseState.prevX;
      mouseState.vY = y - mouseState.prevY;
      mouseState.prevX = x;
      mouseState.prevY = y;
      mouseState.x = x;
      mouseState.y = y;
    }
    function onLeave() {
      mouseState.vX = 0;
      mouseState.vY = 0;
    }
    container.addEventListener("mousemove", onMove);
    container.addEventListener("mouseleave", onLeave);

    // render loop, gated by visibility
    let raf = 0;
    let running = false;
    let t = 0;

    function frame() {
      t += 0.05;
      material.uniforms.uTime.value = t;

      const gridMouseX = size * mouseState.x;
      const gridMouseY = size * mouseState.y;
      const maxDist = size * mouse;
      const maxDistSq = maxDist * maxDist;

      for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
          const idx = 4 * (i + size * j);
          const dx = gridMouseX - i;
          const dy = gridMouseY - j;
          const distSq = dx * dx + dy * dy;
          if (distSq < maxDistSq) {
            const power = Math.min(maxDist / Math.sqrt(distSq || 1), 10);
            data[idx] += strength * 100 * mouseState.vX * power;
            data[idx + 1] -= strength * 100 * mouseState.vY * power;
          }
          data[idx] *= relaxation;
          data[idx + 1] *= relaxation;
        }
      }

      mouseState.vX *= 0.9;
      mouseState.vY *= 0.9;
      dataTexture.needsUpdate = true;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }

    function start() {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
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

    function onVisibility() {
      if (document.hidden) stop();
      else if (container!.getBoundingClientRect().bottom > 0) start();
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
      style={{ position: "absolute", inset: 0, overflow: "hidden" }}
    />
  );
}
