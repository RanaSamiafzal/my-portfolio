"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

/**
 * Turns a plain portrait into a green "datamosh scan":
 * subject matte (from Apple Vision), green duotone, glowing edges, horizontal smear streaks,
 * data dashes, scanlines and grain — animated, with a scan-in reveal and a
 * distortion field that follows the pointer.
 */
const fragmentShader = /* glsl */ `
  precision highp float;
  uniform sampler2D uTex;
  uniform sampler2D uMask;    // subject matte (white = person)
  uniform vec2 uTexel;        // 1 / texture size
  uniform vec2 uRes;          // canvas size in px
  uniform float uImgAspect;   // image w / h
  uniform float uTime;
  uniform float uIntro;       // 0 → 1 scan-in
  uniform vec2 uMouse;        // canvas uv
  uniform float uHover;
  uniform float uMotion;
  uniform float uKey;         // keystroke pulse from the live editor (decays)
  varying vec2 vUv;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1, 0)), f.x), mix(hash(i + vec2(0, 1)), hash(i + vec2(1, 1)), f.x), f.y);
  }

  // Canvas uv → image uv: cover the canvas, keeping the subject (≈60% across the image) in view.
  vec2 toImage(vec2 uv) {
    float canvasAspect = uRes.x / uRes.y;
    vec2 scale = canvasAspect > uImgAspect ? vec2(1.0, uImgAspect / canvasAspect) : vec2(canvasAspect / uImgAspect, 1.0);
    vec2 focus = vec2(0.36, 0.42);
    return (uv - 0.5) * scale + mix(vec2(0.5), focus, 1.0 - scale);
  }

  float lum(vec3 c) { return dot(c, vec3(0.299, 0.587, 0.114)); }

  // rgb = image, a = subject matte
  vec4 sampleImg(vec2 iuv) {
    if (iuv.x < 0.0 || iuv.x > 1.0 || iuv.y < 0.0 || iuv.y > 1.0) return vec4(0.0);
    return vec4(texture2D(uTex, iuv).rgb, texture2D(uMask, iuv).r);
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime * uMotion;

    // ---- horizontal smear bands ----
    float rows = 260.0;
    float row = floor((1.0 - uv.y) * rows);
    float band = noise(vec2(row * 0.08, t * 0.35));
    float smear = smoothstep(0.62, 0.95, band);
    float jitter = (hash(vec2(row, floor(t * 8.0))) - 0.5);

    // pointer distortion field
    vec2 md = (uv - uMouse) * vec2(uRes.x / uRes.y, 1.0);
    float m = smoothstep(0.28, 0.0, length(md)) * uHover;

    // hands on the keyboard: each keystroke flickers and glitches this zone
    vec2 handUv = toImage(uv);
    float hand = smoothstep(0.16, 0.0, length((handUv - vec2(0.28, 0.38)) * vec2(1.0, 1.33)));
    float shift = (smear * 0.035 + m * 0.06 + hand * uKey * 0.03) * jitter + smear * 0.012 * sin(t * 2.0 + row);
    vec2 iuv = toImage(uv + vec2(shift, 0.0));
    vec4 img = sampleImg(iuv);

    // smear: stretch pixels toward the right inside active bands
    vec4 trail = sampleImg(toImage(uv - vec2(0.02 + 0.05 * smear, 0.0)));
    float trailAmt = smear * 0.55 + m * 0.5;
    float a = max(img.a, trail.a * trailAmt * step(0.5, hash(vec2(row, 3.0))));

    // ---- tone: contrasty green duotone ----
    float l = lum(mix(img.rgb, trail.rgb, (1.0 - img.a) * trailAmt));
    l = pow(smoothstep(0.08, 0.92, l), 1.55);
    vec3 col = mix(vec3(0.0, 0.03, 0.01), vec3(0.08, 0.95, 0.28), l);
    col = mix(col, vec3(0.82, 1.0, 0.82), smoothstep(0.78, 1.0, l));

    // ---- edges glow ----
    float gx = lum(sampleImg(iuv + vec2(uTexel.x * 1.5, 0.0)).rgb) - lum(sampleImg(iuv - vec2(uTexel.x * 1.5, 0.0)).rgb);
    float gy = lum(sampleImg(iuv + vec2(0.0, uTexel.y * 1.5)).rgb) - lum(sampleImg(iuv - vec2(0.0, uTexel.y * 1.5)).rgb);
    float edge = clamp(length(vec2(gx, gy)) * 3.0, 0.0, 1.0);
    col += vec3(0.2, 1.0, 0.35) * edge * 0.55;
    col += vec3(0.55, 1.0, 0.6) * hand * uKey * 0.9 * img.a;

    // the room (desk, laptop, chair) stays as faint green line-art behind the subject
    float scene = smoothstep(0.25, 0.9, edge) * 0.6 + l * 0.03;
    a = max(a, scene * 0.32 * (1.0 - img.a));

    // ---- data dashes: thin bright strokes on a few rows ----
    float dashRow = step(0.985, hash(vec2(row, floor(t * 3.0))));
    float dash = dashRow * step(0.55, noise(vec2(uv.x * 60.0 + t * 4.0, row)));
    float nearSubject = sampleImg(toImage(uv - vec2(0.08, 0.0))).a;
    col += vec3(0.3, 1.0, 0.45) * dash * 0.9;
    a = max(a, dash * nearSubject * 0.9);

    // ---- texture: scanlines + grain ----
    col *= 0.82 + 0.18 * sin(gl_FragCoord.y * 1.6);
    col += (hash(gl_FragCoord.xy + t) - 0.5) * 0.09;

    // ---- framing fades ----
    a *= smoothstep(0.0, 0.3, uv.x);           // fade into the text column
    a *= smoothstep(0.0, 0.12, uv.y);          // fade at the bottom

    // ---- scan-in reveal from the top with a bright scan line ----
    float y = 1.0 - uv.y;
    float front = uIntro * 1.15;
    float revealed = smoothstep(front, front - 0.04, y);
    float scanLine = smoothstep(0.012, 0.0, abs(y - front)) * (1.0 - smoothstep(0.95, 1.0, uIntro));
    a *= revealed;
    col += vec3(0.4, 1.0, 0.5) * scanLine * 1.4;
    a = max(a, scanLine * 0.6 * step(0.001, img.a + trail.a));

    a = clamp(a, 0.0, 1.0);
    gl_FragColor = vec4(col * a, a);
  }
`;

/**
 * Resting pose in degrees.
 * TILT_Z: positive rotates clockwise around the seat, straightening the figure upright.
 * TILT_X / TILT_Y: subtle 3D depth (pointer adds a little parallax on top).
 */
const TILT_Z = 7;
const TILT_X = -3;
const TILT_Y = -6;

/**
 * src: illustration · mask: greyscale matte for the shader · matte: alpha matte for the instant CSS poster.
 */
export function ScanPortrait({ src, mask, matte, className }: { src: string; mask: string; matte: string; className?: string }) {
  const mountRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const posterRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mount = mountRef.current;
    const stage = stageRef.current;
    const poster = posterRef.current;
    if (!mount || !stage || !poster) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile =
      window.matchMedia("(max-width: 1023px)").matches || window.matchMedia("(pointer: coarse)").matches;

    const tilt = { x: TILT_X, y: TILT_Y };
    const tiltTarget = { x: TILT_X, y: TILT_Y };
    const applyTilt = () => {
      const scale = mobile ? 1.03 : 1.06;
      stage.style.transform = `rotateZ(${TILT_Z}deg) rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg) scale(${scale})`;
    };
    applyTilt();

    // Reduced-motion only: static CSS poster (accessibility).
    if (reduceMotion) {
      poster.style.opacity = "1";
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, premultipliedAlpha: true, powerPreference: mobile ? "low-power" : "default" });
    } catch {
      poster.style.opacity = "1";
      return;
    }
    // Mobile: cap DPR hard so the scan stays smooth.
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1 : 1.5));
    renderer.setClearColor(0x000000, 0);
    Object.assign(renderer.domElement.style, { position: "absolute", inset: "0", display: "block", opacity: "0" });
    stage.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const uniforms = {
      uTex: { value: null as THREE.Texture | null },
      uMask: { value: null as THREE.Texture | null },
      uTexel: { value: new THREE.Vector2(1 / 1086, 1 / 1448) },
      uRes: { value: new THREE.Vector2(1, 1) },
      uImgAspect: { value: 1086 / 1448 },
      uTime: { value: 0 },
      uIntro: { value: 0 },
      uMouse: { value: new THREE.Vector2(-1, -1) },
      uHover: { value: 0 },
      uMotion: { value: 1 },
      uKey: { value: 0 },
    };
    const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true });
    const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(quad);

    let loaded = false;
    let loadedAt = 0;
    const loader = new THREE.TextureLoader();
    const prep = (tex: THREE.Texture) => {
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = false;
      return tex;
    };
    Promise.all([loader.loadAsync(src), loader.loadAsync(mask)])
      .then(([tex, matteTex]) => {
        const img = tex.image as HTMLImageElement;
        uniforms.uTex.value = prep(tex);
        uniforms.uMask.value = prep(matteTex);
        uniforms.uTexel.value.set(1 / img.width, 1 / img.height);
        uniforms.uImgAspect.value = img.width / img.height;
        loaded = true;
        loadedAt = performance.now();
      })
      .catch(() => {
        poster.style.opacity = "1";
      });

    const resize = () => {
      const w = stage.clientWidth;
      const h = stage.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = `${w}px`;
      renderer.domElement.style.height = `${h}px`;
      uniforms.uRes.value.set(w, h);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    resize();

    let hoverTarget = 0;
    const onMove = (e: PointerEvent) => {
      if (mobile) return; // skip tilt/pointer tracking on phones
      const r = stage.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = 1 - (e.clientY - r.top) / r.height;
      uniforms.uMouse.value.set(x, y);
      hoverTarget = x >= 0 && x <= 1 && y >= 0 && y <= 1 ? 1 : 0;
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = (e.clientY / window.innerHeight) * 2 - 1;
      tiltTarget.y = TILT_Y + nx * 4;
      tiltTarget.x = TILT_X - ny * 3;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    const onKey = () => {
      uniforms.uKey.value = Math.min(1, uniforms.uKey.value + 0.55);
    };
    window.addEventListener("livecode:key", onKey);

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = Boolean(e?.isIntersecting)), { threshold: 0.05 });
    io.observe(mount);

    const start = performance.now();
    let frame = 0;
    const tick = () => {
      frame = requestAnimationFrame(tick);
      if (!visible) return;
      if (!mobile) {
        tilt.x += (tiltTarget.x - tilt.x) * 0.06;
        tilt.y += (tiltTarget.y - tilt.y) * 0.06;
        applyTilt();
      }
      if (!loaded) return;
      const now = performance.now();
      uniforms.uTime.value = (now - start) / 1000;
      const intro = Math.min(1, (now - loadedAt) / (mobile ? 700 : 900));
      uniforms.uIntro.value = intro;
      renderer.domElement.style.opacity = "1";
      poster.style.opacity = String(1 - intro);
      uniforms.uHover.value += (hoverTarget - uniforms.uHover.value) * 0.08;
      uniforms.uKey.value *= 0.9;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("livecode:key", onKey);
      ro.disconnect();
      io.disconnect();
      uniforms.uTex.value?.dispose();
      uniforms.uMask.value?.dispose();
      material.dispose();
      quad.geometry.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [src, mask]);

  // Matches the shader's cover-fit and focus point so the hand-off is seamless.
  const fit = { backgroundSize: "cover", backgroundPosition: "36% 58%", backgroundRepeat: "no-repeat" } as const;

  return (
    <div ref={mountRef} className={className} style={{ perspective: "1200px" }} aria-hidden>
      <div ref={stageRef} className="absolute inset-0" style={{ transformOrigin: "62% 72%", willChange: "transform" }}>
        {/* Instant CSS poster: same image, Vision matte and green duotone — visible before WebGL boots */}
        <div
          ref={posterRef}
          className="absolute inset-0 [mask-image:linear-gradient(90deg,transparent,#000_30%),linear-gradient(0deg,transparent,#000_12%)] [mask-composite:intersect] [-webkit-mask-composite:source-in]"
        >
          <div
            className="absolute inset-0"
            style={{
              ...fit,
              backgroundImage: `url(${src})`,
              WebkitMaskImage: `url(${matte})`,
              maskImage: `url(${matte})`,
              WebkitMaskSize: "cover",
              maskSize: "cover",
              WebkitMaskPosition: "36% 58%",
              maskPosition: "36% 58%",
              filter: "grayscale(1) sepia(1) hue-rotate(72deg) saturate(4.5) brightness(0.62) contrast(1.6)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
