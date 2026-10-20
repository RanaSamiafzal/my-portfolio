import { useEffect, useRef, useState } from "react";

/** Autonomous geometry; the workstation image remains completely independent. */
export function HeroSculpture() {
  const host = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    void (async () => {
      const THREE = await import("three");
      const element = host.current;
      if (disposed || !element) return;
      const root = element.parentElement!;
      const reduce = matchMedia("(prefers-reduced-motion: reduce)");
      const mobile = matchMedia("(max-width: 767px)").matches;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
      } catch { return; }
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.setClearColor(0x000000, 0);
      renderer.domElement.setAttribute("aria-hidden", "true");
      element.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, .1, 30);
      camera.position.z = 7.8;
      const knot = new THREE.TorusKnotGeometry(1.15, .34, mobile ? 140 : 200, 12);
      const vertices = knot.getAttribute("position");
      const count = vertices.count;
      const positions = new Float32Array(count * 3);
      const sphere = new Float32Array(count * 3);
      const torus = new Float32Array(count * 3);
      for (let i = 0; i < count; i++) {
        positions.set([vertices.getX(i), vertices.getY(i), vertices.getZ(i)], i * 3);
        const y = 1 - i / (count - 1) * 2;
        const r = Math.sqrt(1 - y * y), angle = i * Math.PI * (3 - Math.sqrt(5));
        sphere.set([Math.cos(angle) * r * 1.5, y * 1.5, Math.sin(angle) * r * 1.5], i * 3);
        const u = i / count * Math.PI * 2;
        const v = i * Math.PI * (3 - Math.sqrt(5));
        torus.set([(1.1 + .43 * Math.cos(v)) * Math.cos(u), (1.1 + .43 * Math.cos(v)) * Math.sin(u), .43 * Math.sin(v)], i * 3);
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("aSphere", new THREE.BufferAttribute(sphere, 3));
      geometry.setAttribute("aTorus", new THREE.BufferAttribute(torus, 3));
      const uniforms = {
        uWeights: { value: new THREE.Vector3(1, 0, 0) },
        uPointer: { value: new THREE.Vector2(99, 99) },
        uHover: { value: 0 }, uPulse: { value: 0 }, uRatio: { value: renderer.getPixelRatio() },
      };
      const material = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, uniforms,
        vertexShader: `
          attribute vec3 aSphere, aTorus;
          uniform vec3 uWeights;
          uniform vec2 uPointer;
          uniform float uHover, uPulse, uRatio;
          varying float vDepth;
          void main() {
            vec3 p = position * uWeights.x + aSphere * uWeights.y + aTorus * uWeights.z;
            p += normalize(p + vec3(.001)) * uPulse * .45;
            vec4 mv = modelViewMatrix * vec4(p, 1.);
            vec2 delta = mv.xy - uPointer;
            float influence = exp(-dot(delta, delta) * 2.) * uHover;
            mv.xy += delta * influence * .6;
            mv.z += influence * .35;
            gl_Position = projectionMatrix * mv;
            gl_PointSize = (2. + uPulse + influence) * uRatio;
            vDepth = clamp((mv.z + 10.) / 5., .25, 1.);
          }`,
        fragmentShader: `
          varying float vDepth;
          void main() {
            float d = length(gl_PointCoord - .5);
            if (d > .5) discard;
            gl_FragColor = vec4(vec3(.835, .96, .416), (1. - smoothstep(.1, .5, d)) * (.6 + vDepth * .4));
          }`,
      });
      const dots = new THREE.Points(geometry, material);
      dots.rotation.set(.3, .4, 0);
      scene.add(dots);

      let frame = 0, visible = true, last = 0, hasRendered = false;
      let autoTime = 0, nextChange = 5.5, form = 0, pulse = 0, hover = 0;
      let drag = false, over = false, keyboard = false;
      let px = 0, py = 0, rx = .3, ry = .4, tiltX = 0, tiltY = 0, travel = 0;
      let lastGestureChange = 0;
      const target = new THREE.Vector3(1, 0, 0);
      const advance = () => {
        form = (form + 1) % 3;
        target.set(form === 0 ? 1 : 0, form === 1 ? 1 : 0, form === 2 ? 1 : 0);
        root.dataset.form = String(form);
        nextChange = autoTime + 5.5;
      };
      root.dataset.form = "0";
      root.dataset.motion = "auto";
      const render = (now: number) => {
        frame = 0;
        if (disposed || !visible || document.hidden) return;
        const delta = Math.min((now - last) / 1000 || .016, .05);
        last = now;
        const engaged = over || drag || keyboard;
        if (!reduce.matches && !engaged) {
          autoTime += delta;
          ry += delta * .16;
          if (autoTime >= nextChange) advance();
        }
        const damping = reduce.matches ? 1 : 1 - Math.exp(-delta * 6);
        const morphDamping = reduce.matches ? 1 : 1 - Math.exp(-delta * 2.8);
        const targetX = rx + (engaged && !reduce.matches ? tiltY : 0);
        const targetY = ry + (engaged && !reduce.matches ? tiltX : 0);
        dots.rotation.x += (targetX - dots.rotation.x) * damping;
        dots.rotation.y += (targetY - dots.rotation.y) * damping;
        uniforms.uWeights.value.lerp(target, morphDamping);
        hover += ((over && !reduce.matches ? 1 : 0) - hover) * damping;
        pulse *= Math.exp(-delta * 4);
        uniforms.uHover.value = hover;
        uniforms.uPulse.value = reduce.matches ? 0 : pulse;
        const mode = drag ? "drag" : over ? "pointer" : keyboard ? "keyboard" : "auto";
        if (root.dataset.motion !== mode) root.dataset.motion = mode;
        renderer.render(scene, camera);
        if (!hasRendered) { hasRendered = true; setReady(true); }
        const unsettled = pulse > .001 || hover > .001 || uniforms.uWeights.value.distanceTo(target) > .001 ||
          Math.abs(targetX - dots.rotation.x) > .001 || Math.abs(targetY - dots.rotation.y) > .001;
        if (!reduce.matches || unsettled) frame = requestAnimationFrame(render);
      };
      const invalidate = () => {
        if (!disposed && visible && !document.hidden && !frame) {
          last = performance.now();
          frame = requestAnimationFrame(render);
        }
      };
      const resize = new ResizeObserver(() => {
        const { width, height } = element.getBoundingClientRect();
        renderer.setSize(width, height, false);
        camera.aspect = width / Math.max(height, 1);
        camera.updateProjectionMatrix();
        invalidate();
      });
      resize.observe(element);
      const observer = new IntersectionObserver(([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        invalidate();
      });
      observer.observe(element);
      const track = (e: PointerEvent) => {
        const bounds = element.getBoundingClientRect();
        const x = (e.clientX - bounds.left) / bounds.width;
        const y = (e.clientY - bounds.top) / bounds.height;
        over = x >= 0 && x <= 1 && y >= 0 && y <= 1;
        const height = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
        uniforms.uPointer.value.set((x - .5) * height * camera.aspect, (.5 - y) * height);
        tiltX = (x - .5) * .65;
        tiltY = (y - .5) * .45;
      };
      const enter = (e: PointerEvent) => { keyboard = false; track(e); invalidate(); };
      const down = (e: PointerEvent) => {
        keyboard = false; drag = true; travel = 0; px = e.clientX; py = e.clientY;
        track(e); advance(); pulse = reduce.matches ? 0 : 1; lastGestureChange = performance.now();
        element.setPointerCapture(e.pointerId);
        invalidate();
      };
      const move = (e: PointerEvent) => {
        track(e);
        if (drag && !reduce.matches) {
          const dx = e.clientX - px, dy = e.clientY - py;
          ry += dx * .012; rx += dy * .012;
          travel += Math.hypot(dx, dy);
          if (travel > 100 && performance.now() - lastGestureChange > 600) {
            advance(); travel = 0; lastGestureChange = performance.now();
          }
          px = e.clientX; py = e.clientY;
        }
        invalidate();
      };
      const up = (e: PointerEvent) => {
        drag = false; track(e);
        if (e.pointerType !== "mouse") over = false;
        if (element.hasPointerCapture(e.pointerId)) element.releasePointerCapture(e.pointerId);
        invalidate();
      };
      const leave = () => { over = false; tiltX = 0; tiltY = 0; invalidate(); };
      const cancel = () => { drag = false; leave(); };
      const lostCapture = () => { drag = false; invalidate(); };
      const blur = () => { keyboard = false; invalidate(); };
      const key = (e: KeyboardEvent) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter", " "].includes(e.key)) return;
        e.preventDefault(); keyboard = true;
        if (e.key === "ArrowLeft") ry -= .25;
        if (e.key === "ArrowRight") ry += .25;
        if (e.key === "ArrowUp") rx -= .25;
        if (e.key === "ArrowDown") rx += .25;
        if (e.key === "Enter" || e.key === " ") { advance(); pulse = reduce.matches ? 0 : 1; }
        invalidate();
      };
      element.addEventListener("pointerenter", enter);
      element.addEventListener("pointerdown", down);
      element.addEventListener("pointermove", move);
      element.addEventListener("pointerup", up);
      element.addEventListener("pointerleave", leave);
      element.addEventListener("pointercancel", cancel);
      element.addEventListener("lostpointercapture", lostCapture);
      element.addEventListener("keydown", key);
      element.addEventListener("blur", blur);
      const lost = (e: Event) => {
        e.preventDefault(); cancelAnimationFrame(frame); frame = 0; visible = false; setReady(false);
      };
      renderer.domElement.addEventListener("webglcontextlost", lost);
      document.addEventListener("visibilitychange", invalidate);
      reduce.addEventListener("change", invalidate);
      invalidate();
      cleanup = () => {
        cancelAnimationFrame(frame); resize.disconnect(); observer.disconnect();
        document.removeEventListener("visibilitychange", invalidate);
        reduce.removeEventListener("change", invalidate);
        element.removeEventListener("pointerenter", enter);
        element.removeEventListener("pointerdown", down);
        element.removeEventListener("pointermove", move);
        element.removeEventListener("pointerup", up);
        element.removeEventListener("pointerleave", leave);
        element.removeEventListener("pointercancel", cancel);
        element.removeEventListener("lostpointercapture", lostCapture);
        element.removeEventListener("keydown", key);
        element.removeEventListener("blur", blur);
        renderer.domElement.removeEventListener("webglcontextlost", lost);
        knot.dispose(); geometry.dispose(); material.dispose(); renderer.dispose(); renderer.domElement.remove();
      };
    })().catch(() => {});
    return () => { disposed = true; cleanup(); };
  }, []);

  return <div className="hero-sculpture" data-ready={ready}>
    <div ref={host} className="hero-sculpture-canvas" role="group" tabIndex={ready ? 0 : -1}
      aria-label="Automatically changing dotted sculpture. Move your pointer to guide it; click or press Enter to change shape, or drag or use arrow keys to rotate." />
  </div>;
}
