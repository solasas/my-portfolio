// Hero scene: a living particle knot with an orbiting halo.
// The pointer pushes particles away and the piece tilts toward the cursor.
// Colours and blending follow the active theme (--knot-a, --knot-b, --knot-blend).
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const hasWebGL = (() => {
  try {
    return !!document.createElement("canvas").getContext("webgl2");
  } catch (e) {
    return false;
  }
})();

/**
 * Mounts the particle scene into `container`. Returns false when WebGL is
 * unavailable (the CSS orb fallback then stays). Loaded on demand by script.js.
 */
export function mountHeroScene(container, { reducedMotion = false } = {}) {
  if (!container || !hasWebGL) return false;
  const reduceMotion = reducedMotion;
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  container.appendChild(renderer.domElement);
  container.classList.add("is-live");
  document.body.classList.add("has-3d");

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 5.2);

  const colorA = new THREE.Color("#b8452a");
  const colorB = new THREE.Color("#f4e7d0");

  // Main knot: particles sampled from a torus knot surface
  const knot = new THREE.TorusKnotGeometry(1.1, 0.36, 480, 56, 2, 3);
  const knotPos = knot.attributes.position;
  const count = knotPos.count;
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    positions[i * 3] = knotPos.getX(i);
    positions[i * 3 + 1] = knotPos.getY(i);
    positions[i * 3 + 2] = knotPos.getZ(i);
    seeds[i] = Math.random();
  }
  knot.dispose();

  const knotGeo = new THREE.BufferGeometry();
  knotGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  knotGeo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

  const uniforms = {
    uTime: { value: 0 },
    uPointer: { value: new THREE.Vector2(9, 9) },
    uPixelRatio: { value: renderer.getPixelRatio() },
    uSize: { value: 6.0 },
    uColorA: { value: colorA },
    uColorB: { value: colorB },
  };

  const knotMat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: `
      uniform float uTime;
      uniform vec2 uPointer;
      uniform float uPixelRatio;
      uniform float uSize;
      attribute float aSeed;
      varying float vMix;
      varying float vAlpha;

      void main() {
        vec3 p = position;

        // Slow organic breathing along the normal direction
        float n = sin(p.x * 3.1 + uTime * 0.9 + aSeed * 6.28)
                * cos(p.y * 2.6 - uTime * 0.7)
                * sin(p.z * 3.4 + uTime * 0.5);
        p += normalize(p) * n * 0.16;

        // Push particles away from the pointer (screen-space falloff)
        vec4 clip0 = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        vec2 ndc = clip0.xy / clip0.w;
        float d = distance(ndc, uPointer);
        float push = smoothstep(0.42, 0.0, d);
        p += normalize(p) * push * 0.45;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;

        vMix = 0.5 + 0.5 * n;
        vAlpha = 0.45 + 0.55 * (1.0 - smoothstep(2.0, 7.0, -mv.z));
        gl_PointSize = uSize * uPixelRatio * (1.0 / -mv.z) * (0.7 + push * 1.6);
      }
    `,
    fragmentShader: `
      uniform vec3 uColorA;
      uniform vec3 uColorB;
      varying float vMix;
      varying float vAlpha;

      void main() {
        vec2 c = gl_PointCoord - 0.5;
        float r = length(c);
        if (r > 0.5) discard;
        float glow = smoothstep(0.5, 0.0, r);
        vec3 col = mix(uColorA, uColorB, vMix);
        gl_FragColor = vec4(col, glow * vAlpha);
      }
    `,
  });

  const knotPoints = new THREE.Points(knotGeo, knotMat);

  // Orbiting halo: a flat ring of fine dust
  const haloCount = 3200;
  const haloPos = new Float32Array(haloCount * 3);
  for (let i = 0; i < haloCount; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 2.1 + Math.pow(Math.random(), 1.5) * 1.1;
    const y = (Math.random() - 0.5) * 0.12;
    haloPos[i * 3] = Math.cos(a) * r;
    haloPos[i * 3 + 1] = y;
    haloPos[i * 3 + 2] = Math.sin(a) * r;
  }
  const haloGeo = new THREE.BufferGeometry();
  haloGeo.setAttribute("position", new THREE.BufferAttribute(haloPos, 3));
  const haloMat = new THREE.PointsMaterial({
    color: colorB,
    size: 0.018,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  const halo = new THREE.Points(haloGeo, haloMat);
  halo.rotation.x = Math.PI * 0.42;

  // Wireframe core that sits inside the knot
  const coreMat = new THREE.MeshBasicMaterial({
    color: colorA,
    wireframe: true,
    transparent: true,
    opacity: 0.18,
  });
  const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.62, 1), coreMat);

  const group = new THREE.Group();
  group.add(knotPoints, halo, core);
  scene.add(group);

  // Follow the page theme: colours come from --knot-a / --knot-b
  function applyTheme() {
    const cs = getComputedStyle(document.documentElement);
    const a = cs.getPropertyValue("--knot-a").trim() || "#b8452a";
    const b = cs.getPropertyValue("--knot-b").trim() || "#f4e7d0";
    colorA.set(a);
    colorB.set(b);
    haloMat.color.set(b);
    coreMat.color.set(a);

    // Additive light on dark themes, plain ink specks on light ones
    const mode = cs.getPropertyValue("--knot-blend").trim() === "normal"
      ? THREE.NormalBlending
      : THREE.AdditiveBlending;
    knotMat.blending = mode;
    haloMat.blending = mode;
    knotMat.needsUpdate = true;
    haloMat.needsUpdate = true;
    if (reduceMotion) renderer.render(scene, camera);
  }
  applyTheme();
  window.addEventListener("portfolio:themechange", applyTheme);

  // Pointer tracking (in NDC of the canvas)
  const pointer = new THREE.Vector2(9, 9);
  const target = new THREE.Vector2(9, 9);
  let tilt = { x: 0, y: 0 };
  let tiltTarget = { x: 0, y: 0 };

  window.addEventListener("pointermove", (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    target.set(x * 2 - 1, -(y * 2 - 1));
    tiltTarget.x = (y - 0.5) * 0.5;
    tiltTarget.y = (x - 0.5) * 0.7;
  });
  window.addEventListener("pointerleave", () => {
    target.set(9, 9);
    tiltTarget.x = 0;
    tiltTarget.y = 0;
  });

  function resize() {
    const { clientWidth: w, clientHeight: h } = container;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = w + "px";
    renderer.domElement.style.height = h + "px";
    camera.aspect = w / Math.max(h, 1);
    // Keep the knot framed on narrow screens
    camera.position.z = w < 640 ? 5.6 : 5.0;
    camera.updateProjectionMatrix();
    uniforms.uPixelRatio.value = renderer.getPixelRatio();
  }
  resize();
  window.addEventListener("resize", resize);

  let visible = true;
  const io = new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
  });
  io.observe(container);

  const clock = new THREE.Clock();

  function frame() {
    const dt = clock.getDelta();
    const t = clock.elapsedTime;

    if (!reduceMotion) {
      uniforms.uTime.value = t;
      pointer.lerp(target, 0.12);
      uniforms.uPointer.value.copy(pointer);

      tilt.x += (tiltTarget.x - tilt.x) * 0.06;
      tilt.y += (tiltTarget.y - tilt.y) * 0.06;

      knotPoints.rotation.y += dt * 0.18;
      knotPoints.rotation.x = Math.sin(t * 0.25) * 0.2;
      halo.rotation.z += dt * 0.12;
      core.rotation.x += dt * 0.1;
      core.rotation.y += dt * 0.14;

      group.rotation.x = tilt.x;
      group.rotation.y = tilt.y;
    }

    renderer.render(scene, camera);
  }

  if (reduceMotion) {
    // Draw one still frame, no loop
    frame();
  } else {
    // Pause the loop while the hero is off screen
    const loop = () => {
      if (visible) {
        frame();
      }
      requestAnimationFrame(loop);
    };
    loop();
  }

  return true;
}
