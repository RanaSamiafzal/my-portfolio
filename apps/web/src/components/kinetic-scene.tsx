import { useEffect, useRef, useState } from "react";

type SceneControls = { shape: number; paused: boolean; pulse: number; reset: number };

/** A small, self-contained WebGL island; content never depends on the canvas. */
export function KineticScene({ src = "/hero-desk.jpg", mask = "/hero-desk-mask.png", matte = "/hero-desk-matte.png", cinematic = false, workstation = false }: { src?: string; mask?: string; matte?: string; cinematic?: boolean; workstation?: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const wake = useRef<() => void>(() => {});
  const controls = useRef<SceneControls>({ shape: 0, paused: false, pulse: 0, reset: 0 });
  const [shape, setShape] = useState(0);
  const [paused, setPaused] = useState(false);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">("loading");

  useEffect(() => {
    const container = host.current;
    if (!container) return;
    setStatus("loading");
    let disposed = false;
    let cleanup = () => {};
    void (async () => {
      const THREE = await import("three");
      if (disposed) return;
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 40);
      camera.position.z = cinematic && mobile ? 10.6 : 8.5;
      if (cinematic && mobile) camera.position.x = -.25;
      let renderer: InstanceType<typeof THREE.WebGLRenderer>;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: !mobile, powerPreference: mobile ? "low-power" : "high-performance" });
      } catch { setStatus("fallback"); return; }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, mobile ? 1 : 1.5));
      renderer.setClearColor(0x000000, 0);
      const canvas = renderer.domElement;
      canvas.setAttribute("aria-hidden", "true");
      container.appendChild(canvas);
      // Navigation can happen before image loading finishes.
      cleanup = () => { renderer.dispose(); canvas.remove(); };
      const system = new THREE.Group();
      scene.add(system);

      // Both the image surface and particles use the same source and matte.
      // This keeps the face legible while the surrounding geometry stays tactile.
      const loader = new THREE.TextureLoader();
      const loaded = await Promise.allSettled([loader.loadAsync(src), loader.loadAsync(workstation ? "/hero-workstation-mask.svg" : mask)]);
      if (disposed || loaded.some((result) => result.status === "rejected")) {
        for (const result of loaded) if (result.status === "fulfilled") result.value.dispose();
        if (!disposed) { renderer.dispose(); canvas.remove(); setStatus("fallback"); }
        return;
      }
      const imageTexture = (loaded[0] as PromiseFulfilledResult<InstanceType<typeof THREE.Texture>>).value;
      const maskTexture = (loaded[1] as PromiseFulfilledResult<InstanceType<typeof THREE.Texture>>).value;
      imageTexture.colorSpace = THREE.SRGBColorSpace;
      imageTexture.minFilter = THREE.LinearFilter;
      maskTexture.minFilter = THREE.LinearFilter;
      const sampleWidth = mobile ? 144 : 256;
      const sourceImage = imageTexture.image as HTMLImageElement;
      const imageAspect = workstation ? sourceImage.naturalWidth / sourceImage.naturalHeight : 3 / 4;
      const planeWidth = workstation ? 10 : 8;
      const planeHeight = planeWidth / imageAspect;
      const sampleHeight = Math.round(sampleWidth / imageAspect);
      const sample = document.createElement("canvas");
      sample.width = sampleWidth; sample.height = sampleHeight;
      const context = sample.getContext("2d", { willReadFrequently: true });
      if (!context) { imageTexture.dispose(); maskTexture.dispose(); renderer.dispose(); canvas.remove(); setStatus("fallback"); return; }
      let pixels: Uint8ClampedArray;
      let mattePixels: Uint8ClampedArray;
      try {
        context.drawImage(sourceImage, 0, 0, sampleWidth, sampleHeight);
        pixels = context.getImageData(0, 0, sampleWidth, sampleHeight).data;
        context.clearRect(0, 0, sampleWidth, sampleHeight);
        context.drawImage(maskTexture.image as HTMLImageElement, 0, 0, sampleWidth, sampleHeight);
        mattePixels = context.getImageData(0, 0, sampleWidth, sampleHeight).data;
      } catch {
        imageTexture.dispose(); maskTexture.dispose(); renderer.dispose(); canvas.remove(); setStatus("fallback"); return;
      }
      // The laptop is a procedural quadrilateral over the original photo; no new raster asset.
      const laptop = [[.07, .478], [.177, .457], [.262, .65], [.16, .68]] as const;
      const onLaptop = (x: number, y: number) => {
        let inside = false;
        for (let i = 0, j = laptop.length - 1; i < laptop.length; j = i++) {
          const a = laptop[i]!, b = laptop[j]!;
          if ((a[1] > y) !== (b[1] > y) && x < (b[0] - a[0]) * (y - a[1]) / (b[1] - a[1]) + a[0]) inside = !inside;
        }
        return inside;
      };
      const portrait: number[] = [], colors: number[] = [], alpha: number[] = [];
      const color = new THREE.Color();
      for (let y = Math.floor(sampleHeight * (workstation ? .12 : .22)); y < sampleHeight * (workstation ? .98 : .8); y++) {
        for (let x = Math.floor(sampleWidth * .04); x < sampleWidth * .96; x++) {
          const i = (y * sampleWidth + x) * 4;
          const metal = Math.max(pixels[i]!, pixels[i + 1]!, pixels[i + 2]!) - Math.min(pixels[i]!, pixels[i + 1]!, pixels[i + 2]!);
          const subject = Math.max(mattePixels[i]! / 255, !workstation && cinematic && metal < 46 && onLaptop(x / sampleWidth, y / sampleHeight) ? 1 : 0);
          const nearby = cinematic && subject < .25 && [[-4, 0], [4, 0], [0, -4], [0, 4]].some(([dx, dy]) => {
            const nx = x + dx!, ny = y + dy!;
            return nx >= 0 && nx < sampleWidth && ny >= 0 && ny < sampleHeight && mattePixels[(ny * sampleWidth + nx) * 4]! > 128;
          });
          const edge = Math.abs(pixels[i]! - pixels[i + 4]!) + Math.abs(pixels[i + 1]! - pixels[i + 5]!);
          if (cinematic ? subject < .25 && (!nearby || (x + y) % 2 !== 0) : subject < .25 && (edge < 55 || (x + y) % 3 !== 0)) continue;
          const r = pixels[i]! / 255, g = pixels[i + 1]! / 255, b = pixels[i + 2]! / 255;
          const luminance = r * .299 + g * .587 + b * .114;
          portrait.push((x / sampleWidth - (workstation ? .5 : .55)) * planeWidth, (.5 - y / sampleHeight) * planeHeight, (luminance - .4) * .5 + subject * .12);
          if (cinematic && subject < .25) color.set("#d5f56a");
          else color.setRGB(r, g, b).convertSRGBToLinear();
          colors.push(color.r, color.g, color.b);
          alpha.push(subject > .25 ? (workstation ? .32 : cinematic ? .3 : .8) : (cinematic ? .45 : .14));
        }
      }
      const count = portrait.length / 3;
      const positions = new Float32Array(portrait);
      const knots = new Float32Array(count * 3);
      const spheres = new Float32Array(count * 3);
      const seeds = new Float32Array(count);
      const knot = new THREE.TorusKnotGeometry(1.3, .43, mobile ? 180 : 320, 28, 2, 3);
      const vertices = knot.getAttribute("position");
      for (let i = 0; i < count; i++) {
        const index = Math.floor(i * vertices.count / count) % vertices.count;
        knots.set([vertices.getX(index), vertices.getY(index), vertices.getZ(index)], i * 3);
        const y = 1 - (i / (count - 1)) * 2;
        const radius = Math.sqrt(1 - y * y);
        const angle = i * Math.PI * (3 - Math.sqrt(5));
        spheres.set([Math.cos(angle) * radius * 1.95, y * 1.95, Math.sin(angle) * radius * 1.95], i * 3);
        seeds[i] = (i * .61803398875) % 1;
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("aKnot", new THREE.BufferAttribute(knots, 3));
      geometry.setAttribute("aSphere", new THREE.BufferAttribute(spheres, 3));
      geometry.setAttribute("aColor", new THREE.Float32BufferAttribute(colors, 3));
      geometry.setAttribute("aAlpha", new THREE.Float32BufferAttribute(alpha, 1));
      geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
      const shared = {
        uTime: { value: 0 }, uMorph: { value: 0 }, uPulse: { value: 0 },
        uClick: { value: new THREE.Vector2(0, 0) },
        uMouse: { value: new THREE.Vector2(99, 99) }, uHover: { value: 0 },
        uAccent: { value: new THREE.Color("#d5f56a") },
      };
      const material = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        uniforms: { ...shared, uPixelRatio: { value: renderer.getPixelRatio() } },
        vertexShader: `
          attribute vec3 aKnot, aSphere, aColor;
          attribute float aSeed, aAlpha;
          uniform float uTime, uMorph, uPulse, uPixelRatio, uHover;
          uniform vec2 uMouse, uClick;
          varying float vSeed, vDepth, vAlpha, vPortrait;
          varying vec3 vColor;
          void main() {
            float portrait = 1. - smoothstep(0., 1., uMorph);
            vec3 p = mix(mix(position, aKnot, min(uMorph, 1.)), aSphere, max(uMorph - 1., 0.));
            vec2 offset = p.xy - uMouse;
            float influence = exp(-dot(offset, offset) * 1.6) * uHover * portrait;
            p.xy += offset * influence * .55;
            p.z += influence * .65 + sin(p.y * 4. + uTime * .7) * .025;
            vec3 scatter = vec3(sin(aSeed * 123.), cos(aSeed * 93.), sin(aSeed * 71.));
            vec2 radial = normalize(position.xy - uClick + vec2(.001));
            p += vec3(radial * (1.2 + aSeed * 1.8), scatter.z * 1.5) * uPulse;
            p += scatter * uPulse * .7;
            vec4 mv = modelViewMatrix * vec4(p, 1.);
            gl_Position = projectionMatrix * mv;
            gl_PointSize = min(7., mix(2.1 + uPulse * 3., 3., 1. - portrait) * uPixelRatio * 6. / -mv.z);
            vDepth = clamp((mv.z + 11.) / 7., .18, 1.);
            vSeed = aSeed; vColor = aColor; vAlpha = aAlpha; vPortrait = portrait;
          }
        `,
        fragmentShader: `
          uniform vec3 uAccent;
          uniform float uPulse;
          varying float vSeed, vDepth, vAlpha, vPortrait;
          varying vec3 vColor;
          void main() {
            float d = length(gl_PointCoord - .5);
            if (d > .5) discard;
            vec3 formColor = mix(vec3(.65, .72, .52), uAccent, step(.5, vSeed));
            vec3 photoColor = mix(vColor * 1.3, uAccent, .22 + uPulse * .25);
            vec3 color = mix(formColor, photoColor, vPortrait);
            float alpha = mix(.85, vAlpha * .6 + uPulse * .85, vPortrait);
            gl_FragColor = vec4(color, (1. - smoothstep(.15, .5, d)) * (.45 + vDepth * .55) * alpha);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `,
      });
      const particles = new THREE.Points(geometry, material);
      particles.frustumCulled = false; particles.renderOrder = 2;
      system.add(particles);
      const portraitGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight, mobile ? 32 : 64, mobile ? 42 : 84);
      portraitGeometry.translate(workstation ? 0 : -.4, 0, 0);
      const portraitMaterial = new THREE.ShaderMaterial({
        transparent: true, depthWrite: false, side: THREE.DoubleSide,
        uniforms: { ...shared, uImage: { value: imageTexture }, uMask: { value: maskTexture }, uCinematic: { value: cinematic ? 1 : 0 }, uWorkstation: { value: workstation ? 1 : 0 } },
        vertexShader: `
          uniform vec2 uMouse, uClick;
          uniform float uHover, uTime, uPulse;
          varying vec2 vUv;
          void main() {
            vUv = uv;
            vec3 p = position;
            vec2 delta = p.xy - uMouse;
            float influence = exp(-dot(delta, delta) * 1.6) * uHover;
            p.z += influence * .12 + sin(p.y * 3. + uTime * .6) * .015;
            p.xy += delta * influence * .015;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
          }
        `,
        fragmentShader: `
          uniform sampler2D uImage, uMask;
          uniform vec3 uAccent;
          uniform float uMorph, uPulse, uTime, uCinematic, uWorkstation;
          varying vec2 vUv;
          float laptopEdge(vec2 a, vec2 b, vec2 p) {
            vec2 edge = b - a;
            return smoothstep(-.001, .001, -(edge.x * (p.y - a.y) - edge.y * (p.x - a.x)) / length(edge));
          }
          void main() {
            vec4 image = texture2D(uImage, vUv);
            float mask = texture2D(uMask, vUv).r;
            float laptop = laptopEdge(vec2(.07,.522), vec2(.177,.543), vUv)
              * laptopEdge(vec2(.177,.543), vec2(.262,.35), vUv)
              * laptopEdge(vec2(.262,.35), vec2(.16,.32), vUv)
              * laptopEdge(vec2(.16,.32), vec2(.07,.522), vUv);
            float metal = 1. - smoothstep(.12, .22, max(image.r, max(image.g, image.b)) - min(image.r, min(image.g, image.b)));
            mask = max(mask, laptop * metal * uCinematic);
            vec2 texel = vec2(.0018, .0014);
            vec3 dx = texture2D(uImage, vUv + vec2(texel.x, 0.)).rgb - texture2D(uImage, vUv - vec2(texel.x, 0.)).rgb;
            vec3 dy = texture2D(uImage, vUv + vec2(0., texel.y)).rgb - texture2D(uImage, vUv - vec2(0., texel.y)).rgb;
            float edge = clamp((length(dx) + length(dy)) * 2., 0., 1.);
            float luminance = dot(image.rgb, vec3(.299, .587, .114));
            vec3 color = mix(image.rgb, uAccent * luminance, mix(.28, .08, uCinematic));
            color += uAccent * edge * .1;
            float scan = exp(-pow((vUv.y - (.3 + fract(uTime * .09) * .42)) * 160., 2.));
            color += uAccent * scan * mix(.22, .035, uCinematic) * mask;
            float context = edge * mix(.13, .008, uCinematic) * (1. - mask);
            float fade = smoothstep(.03, .14, vUv.x) * (1. - smoothstep(.87, .98, vUv.x));
            fade *= smoothstep(.2, .3, vUv.y) * (1. - smoothstep(.73, .83, vUv.y));
            if (uWorkstation > .5) {
              // A shared vector matte retains dark hair, clothing and chair shadows.
              mask = texture2D(uMask, vUv).r;
              fade = smoothstep(0., .05, vUv.x) * (1. - smoothstep(.95, 1., vUv.x));
              fade *= smoothstep(0., .12, vUv.y) * (1. - smoothstep(.85, 1., vUv.y));
              color = image.rgb + uAccent * scan * .012 * mask;
              context = 0.;
            }
            // Keep the artwork crisp, with a restrained sampled texture like the original portrait.
            if (uWorkstation > .5) {
              float dots = 1. - smoothstep(.1, .45, length(fract(vUv * vec2(300., 169.)) - .5));
              color = mix(color, color * .72 + uAccent * .025, dots * .22);
            }
            float alpha = (mask * mix(.94, 1., uCinematic) + context) * fade * (1. - smoothstep(0., .85, uMorph)) * (1. - uPulse * .85);
            gl_FragColor = vec4(color, alpha);
            #include <tonemapping_fragment>
            #include <colorspace_fragment>
          }
        `,
      });
      const portraitSurface = new THREE.Mesh(portraitGeometry, portraitMaterial);
      portraitSurface.renderOrder = 1;
      system.add(portraitSurface);
      const wireMaterial = new THREE.MeshBasicMaterial({ color: "#d5f56a", wireframe: true, transparent: true, depthWrite: false, depthTest: false, opacity: 0 });
      const wire = new THREE.Mesh(knot, wireMaterial);
      system.add(wire);
      const orbitGeometry = new THREE.BufferGeometry().setFromPoints(Array.from({ length: 180 }, (_, i) => {
        const angle = i / 180 * Math.PI * 2;
        return new THREE.Vector3(Math.cos(angle) * 2.75, Math.sin(angle) * 2.75, 0);
      }));
      const orbitMaterial = new THREE.LineBasicMaterial({ color: cinematic ? "#d5f56a" : "#b8bdaf", transparent: true, opacity: cinematic ? .5 : .18 });
      const orbit = new THREE.LineLoop(orbitGeometry, orbitMaterial);
      orbit.rotation.set(1.1, 0.35, -0.3);
      system.add(orbit);
      const satellite = new THREE.Mesh(new THREE.SphereGeometry(0.065, 12, 12), new THREE.MeshBasicMaterial({ color: "#d5f56a" }));
      scene.add(satellite);

      let frame = 0;
      let hasRendered = false;
      let visible = true;
      let last = 0;
      let time = 0;
      let drag = false;
      let moved = false;
      let previousX = 0;
      let previousY = 0;
      let rotationX = 0;
      let rotationY = 0;
      let previousShape = 0;
      let seenReset = 0;
      let hover = 0;
      let hoverTarget = 0;
      const pointer = new THREE.Vector2(99, 99);
      let hoverX = 0;
      let hoverY = 0;
      let pulse = 0;
      let seenPulse = 0;
      let morph = 0;
      const resize = () => {
        const { width, height } = container.getBoundingClientRect();
        renderer.setSize(width, height, false);
        wake.current();
        camera.aspect = width / Math.max(height, 1);
        if (cinematic) {
          // Fit the full cutout even on narrow phones and at tablet breakpoints.
          camera.position.z = Math.max(workstation ? planeHeight / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2))) : 8.5, (workstation ? 8.8 : 7.5) / (2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect));
          camera.position.x = workstation ? .3 : -.25;
        }
        camera.updateProjectionMatrix();
      };
      const resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(container);
      resize();
      const pointerDown = (event: PointerEvent) => {
        drag = true; moved = false; previousX = event.clientX; previousY = event.clientY;
        canvas.setPointerCapture(event.pointerId);
        pointerMove(event);
        wake.current();
      };
      const pointerMove = (event: PointerEvent) => {
        const bounds = canvas.getBoundingClientRect();
        const nx = (event.clientX - bounds.left) / bounds.width;
        const ny = (event.clientY - bounds.top) / bounds.height;
        const visibleHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
        pointer.set((nx - .5) * camera.aspect * visibleHeight + camera.position.x, (.5 - ny) * visibleHeight);
        hoverTarget = reducedMotion.matches ? 0 : 1;
        hoverX = (nx - .5) * .18;
        hoverY = (ny - .5) * .12;
        if (!reducedMotion.matches) wake.current();
        if (drag) {
          const dx = event.clientX - previousX, dy = event.clientY - previousY;
          if (Math.abs(dx) + Math.abs(dy) > 2) moved = true;
          rotationY += dx * .006; rotationX += dy * .006;
          previousX = event.clientX; previousY = event.clientY;
        }
      };
      const pointerUp = (event: PointerEvent) => {
        if (drag && !moved) { shared.uClick.value.copy(pointer); controls.current.pulse++; }
        drag = false;
        wake.current();
        if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
      };
      const pointerLeave = () => { hoverX = 0; hoverY = 0; hoverTarget = 0; wake.current(); };
      const keyDown = (event: KeyboardEvent) => {
        if (!["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Enter", " "].includes(event.key)) return;
        event.preventDefault();
        if (event.key === "ArrowLeft") rotationY -= .2;
        if (event.key === "ArrowRight") rotationY += .2;
        if (event.key === "ArrowUp") rotationX -= .2;
        if (event.key === "ArrowDown") rotationX += .2;
        if (event.key === "Enter" || event.key === " ") { shared.uClick.value.set(0, 0); controls.current.pulse++; }
        wake.current();
      };
      container.addEventListener("keydown", keyDown);
      const contextLost = (event: Event) => { event.preventDefault(); setStatus("fallback"); cancelAnimationFrame(frame); };
      canvas.addEventListener("pointerdown", pointerDown);
      canvas.addEventListener("pointermove", pointerMove);
      canvas.addEventListener("pointerup", pointerUp);
      canvas.addEventListener("pointercancel", pointerUp);
      canvas.addEventListener("pointerleave", pointerLeave);
      canvas.addEventListener("webglcontextlost", contextLost);
      const render = (now: number) => {
        if (disposed) return;
        frame = 0;
        if (!visible || document.hidden) { last = now; return; }
        if (mobile && now - last < 32) { frame = requestAnimationFrame(render); return; }
        const delta = Math.min((now - last) / 1000 || .016, .05);
        last = now;
        if (controls.current.reset !== seenReset) {
          seenReset = controls.current.reset;
          rotationX = 0; rotationY = 0; hoverX = 0; hoverY = 0;
          hoverTarget = 0; pulse = 0; morph = 0; time = 0;
          system.rotation.set(0, 0, 0);
        }
        const still = controls.current.paused || reducedMotion.matches;
        if (!still) time += delta;
        if (controls.current.shape !== previousShape) {
          previousShape = controls.current.shape;
          if (previousShape === 0) { rotationX = 0; rotationY = 0; }
        }
        if (!still && !drag && controls.current.shape !== 0) rotationY += delta * .1;
        if (controls.current.shape === 0) {
          rotationX = Math.max(-.35, Math.min(.35, rotationX));
          rotationY = Math.max(-.55, Math.min(.55, rotationY));
        }
        const damping = reducedMotion.matches ? 1 : 1 - Math.exp(-delta * 6);
        system.rotation.x += (rotationX + hoverY - system.rotation.x) * damping;
        system.rotation.y += (rotationY + hoverX - system.rotation.y) * damping;
        morph += (controls.current.shape - morph) * (reducedMotion.matches ? 1 : damping);
        pulse *= Math.exp(-delta * 2.4);
        if (controls.current.pulse !== seenPulse) { seenPulse = controls.current.pulse; pulse = reducedMotion.matches ? 0 : 1; }
        hover += (hoverTarget - hover) * damping;
        shared.uTime.value = time;
        shared.uMorph.value = morph;
        shared.uPulse.value = pulse;
        shared.uMouse.value.copy(pointer);
        shared.uHover.value = hover;
        wireMaterial.opacity = Math.max(0, 1 - Math.abs(morph - 1)) * .035;
        wire.visible = morph > .01 && morph < 1.99;
        orbitMaterial.opacity = (cinematic ? .42 : .12) + Math.min(morph, 1) * .06;
        satellite.position.set(Math.cos(time * .25) * 2.75, Math.sin(time * .25) * 1.25, Math.sin(time * .25) * 2.45);
        renderer.render(scene, camera);
        // Keep the poster visible until there is an actual WebGL frame to show.
        if (!hasRendered) { hasRendered = true; setStatus("ready"); }
        const unsettled = Math.abs(controls.current.shape - morph) > .001 || pulse > .001 || Math.abs(hoverTarget - hover) > .001 ||
          Math.abs(rotationX + hoverY - system.rotation.x) > .001 || Math.abs(rotationY + hoverX - system.rotation.y) > .001;
        if (!still || unsettled) frame = requestAnimationFrame(render);
      };
      const invalidate = () => { if (!disposed && !frame && visible && !document.hidden) frame = requestAnimationFrame(render); };
      wake.current = invalidate;
      const documentVisibility = () => { last = performance.now(); invalidate(); };
      document.addEventListener("visibilitychange", documentVisibility);
      reducedMotion.addEventListener("change", invalidate);
      const visibilityObserver = new IntersectionObserver(([entry]) => { visible = Boolean(entry?.isIntersecting); invalidate(); }, { rootMargin: "80px" });
      visibilityObserver.observe(container);
      frame = requestAnimationFrame(render);
      cleanup = () => {
        cancelAnimationFrame(frame);
        wake.current = () => {};
        document.removeEventListener("visibilitychange", documentVisibility);
        reducedMotion.removeEventListener("change", invalidate);
        resizeObserver.disconnect(); visibilityObserver.disconnect();
        container.removeEventListener("keydown", keyDown);
        canvas.removeEventListener("pointerdown", pointerDown); canvas.removeEventListener("pointermove", pointerMove);
        canvas.removeEventListener("pointerup", pointerUp); canvas.removeEventListener("pointercancel", pointerUp);
        canvas.removeEventListener("pointerleave", pointerLeave); canvas.removeEventListener("webglcontextlost", contextLost);
        portraitGeometry.dispose(); portraitMaterial.dispose(); imageTexture.dispose(); maskTexture.dispose();
        geometry.dispose(); knot.dispose(); material.dispose(); wireMaterial.dispose(); orbitGeometry.dispose(); orbitMaterial.dispose();
        satellite.geometry.dispose(); satellite.material.dispose(); renderer.dispose(); canvas.remove();
      };
    })().catch(() => { if (!disposed) setStatus("fallback"); });
    return () => {
      disposed = true; cleanup();
    };
  }, [src, mask, cinematic, workstation]);

  const replay = () => {
    controls.current.shape = 0;
    controls.current.reset++;
    controls.current.paused = false;
    setShape(0); setPaused(false);
    window.dispatchEvent(new CustomEvent("portfolio:replay-intro"));
    wake.current();
  };
  const cycleForm = () => {
    const next = (controls.current.shape + 1) % 3;
    controls.current.shape = next; setShape(next); wake.current();
  };
  const togglePause = () => {
    const next = !paused;
    controls.current.paused = next; setPaused(next); wake.current();
  };

  return <div className={`kinetic-experiment${cinematic ? " kinetic-cinematic" : ""}${workstation ? " kinetic-workstation" : ""}`} data-scene-state={status} data-shape={shape}>
    <div className="scene-coordinate scene-coordinate-top" aria-hidden="true"><span>BEHIND THE WORK</span><span className="scene-live"><i /> INTERACTIVE</span></div>
    <div className="scene-cross scene-cross-a" aria-hidden="true">+</div><div className="scene-cross scene-cross-b" aria-hidden="true">+</div>
    <div className="scene-visual">
      <div ref={host} className="kinetic-canvas" tabIndex={0} role="group" aria-label="Interactive portrait. Use arrow keys to rotate, Enter to scatter." />
      <div className="scene-fallback scene-portrait-fallback" aria-hidden="true">
        {cinematic && !workstation && <div className="portrait-laptop" style={{ backgroundImage: `url(${src})` }} />}
        {workstation ? <img className="workstation-poster" src={src} alt="" fetchPriority="high" width="1672" height="941" /> : <div className="portrait-poster" style={{ backgroundImage: `url(${src})`, maskImage: `url(${matte})`, WebkitMaskImage: `url(${matte})` }} />}
      </div>
    </div>
    <div className="scene-caption"><span className="scene-status-dot" />{status === "ready" ? "Move to explore · click to scatter" : "The engineer behind the systems"}</div>
    <div className="scene-controls scene-tools" role="group" aria-label="Scene controls">
      <button type="button" aria-label="Replay reveal" onClick={replay}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10a8 8 0 1 1 1 7M4 4v6h6" /></svg>
        <span className="scene-tool-tip" aria-hidden="true">Replay</span>
      </button>
      <button type="button" aria-label="Change form" onClick={cycleForm}>
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="7" /><ellipse cx="12" cy="12" rx="3" ry="9" transform="rotate(40 12 12)" /></svg>
        <span className="scene-tool-tip" aria-hidden="true">Explore forms</span>
      </button>
      <button type="button" aria-label={paused ? "Play animation" : "Pause animation"} aria-pressed={paused} onClick={togglePause}>
        <svg viewBox="0 0 24 24" aria-hidden="true">{paused ? <path d="m9 5 11 7-11 7Z" /> : <><path d="M9 5v14M16 5v14" /></>}</svg>
        <span className="scene-tool-tip" aria-hidden="true">{paused ? "Play" : "Pause"}</span>
      </button>
      <span className="sr-only" aria-live="polite">{["Portrait view", "Knot view", "Sphere view"][shape]}</span>
    </div>
    <div className="scene-coordinate scene-coordinate-bottom" aria-hidden="true"><span>HUMAN × CODE</span><span>ALWAYS EXPLORING</span></div>
  </div>;
}
