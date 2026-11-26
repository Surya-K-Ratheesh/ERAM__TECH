const viewport = document.querySelector('[data-scene]');
const finishButtons = [...document.querySelectorAll('[data-finish]')];
const doorButton = document.querySelector('[data-door]');
const resetButton = document.querySelector('[data-reset-view]');
const rotation = document.querySelector('[data-rotation]');
const status = document.querySelector('[data-scene-status]');

async function start() {
  const THREE = await import('./assets/vendor/three/three.module.js');
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.95;
  renderer.setClearColor(0xf2f4ee, 0);
  renderer.domElement.setAttribute('aria-hidden', 'true');
  viewport.append(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 80);
  const lookAt = new THREE.Vector3(0, 1.65, 0);
  scene.add(new THREE.HemisphereLight(0xf8ffff, 0xc6bba0, 1.7));
  const sun = new THREE.DirectionalLight(0xfff2db, 3);
  sun.position.set(-3, 8, 5);
  sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024);
  Object.assign(sun.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 0.5, far: 25 });
  sun.shadow.normalBias = 0.025;
  sun.shadow.bias = -0.0002;
  scene.add(sun);

  // A small studio environment supplies reflections without downloading texture maps.
  const studio = new THREE.Scene();
  studio.background = new THREE.Color(0xe6ede8);
  const softbox = new THREE.Mesh(new THREE.BoxGeometry(6, 10, 1), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  softbox.position.set(-5, 4, 3);
  studio.add(softbox);
  const darkbox = new THREE.Mesh(new THREE.BoxGeometry(5, 8, 1), new THREE.MeshBasicMaterial({ color: 0x56685e }));
  darkbox.position.set(5, 1, -3);
  studio.add(darkbox);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(studio, 0.1);
  scene.environment = environment.texture;
  pmrem.dispose();
  softbox.geometry.dispose(); softbox.material.dispose();
  darkbox.geometry.dispose(); darkbox.material.dispose();

  const metal = new THREE.MeshStandardMaterial({ color: 0x303944, metalness: 0.88, roughness: 0.27 });
  const doorSkin = new THREE.MeshStandardMaterial({ color: 0x46515f, metalness: 0.25, roughness: 0.57 });
  const recess = new THREE.MeshStandardMaterial({ color: 0x10171e, metalness: 0.25, roughness: 0.65 });
  const inset = new THREE.MeshStandardMaterial({ color: 0x35473c, roughness: 0.5, metalness: 0.45 });
  const stone = new THREE.MeshStandardMaterial({ color: 0xe7e2d5, roughness: 0.94 });
  const plinth = new THREE.MeshStandardMaterial({ color: 0xe1e1d5, roughness: 0.87 });
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xb5d5ce, metalness: 0.05, roughness: 0.07, transparent: true, opacity: 0.33, side: THREE.DoubleSide, depthWrite: false, envMapIntensity: 1.5 });
  const model = new THREE.Group();
  scene.add(model);
  function box(w, h, d, x, y, z, material, parent = model) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
    mesh.position.set(x, y, z);
    mesh.castShadow = material !== glass;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  }
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(40, 40), new THREE.ShadowMaterial({ opacity: 0.13 }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.12;
  ground.receiveShadow = true;
  scene.add(ground);
  box(4.8, 0.17, 3.1, 0, 0, 0, plinth);
  box(3.5, 0.12, 0.55, 0.15, -0.055, 1.77, stone);
  box(0.95, 3.5, 0.4, -1.64, 1.83, -0.25, stone);
  box(3.85, 0.26, 0.72, -0.15, 3.69, -0.17, stone);
  // Fine joints keep the solid wall architectural rather than a blank block.
  const joint = new THREE.MeshStandardMaterial({ color: 0xbdbbad, roughness: 1 });
  [0.94, 1.8, 2.66].forEach(y => box(0.954, 0.012, 0.407, -1.64, y, -0.25, joint));
  for (let i = 0; i < 6; i++) box(0.09, 3.5, 0.4, 0.9 + i * 0.17, 1.83, -0.25, metal);
  // Reference door: left sidelight, solid leaf and a full-height recessed pull.
  box(2.0, 0.11, 0.19, -0.15, 3.43, 0.05, metal);
  box(2.0, 0.085, 0.19, -0.15, 0.2, 0.05, metal);
  [-1.1, 0.82].forEach(x => box(0.095, 3.27, 0.19, x, 1.82, 0.05, metal));
  box(0.055, 3.1, 0.11, -0.70, 1.82, 0.05, metal);
  box(0.29, 3.07, 0.025, -0.89, 1.82, 0.07, glass);
  const hinge = new THREE.Group();
  hinge.position.set(-0.66, 0.25, 0.09);
  model.add(hinge);
  box(1.40, 3.12, 0.035, 0.70, 1.56, -0.06, doorSkin, hinge);
  box(0.91, 3.12, 0.11, 0.455, 1.56, 0.005, doorSkin, hinge);
  box(0.32, 3.12, 0.11, 1.24, 1.56, 0.005, doorSkin, hinge);
  box(0.17, 3.0, 0.012, 0.995, 1.56, -0.035, recess, hinge);
  [0.03, 3.09].forEach(y => box(0.17, 0.06, 0.11, 0.995, y, 0.005, doorSkin, hinge));
  box(0.018, 3.0, 0.075, 1.071, 1.56, 0.01, inset, hinge);
  const lock = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.015, 20), inset);
  lock.rotation.x = Math.PI / 2;
  lock.position.set(1.31, 1.46, 0.075);
  lock.castShadow = true;
  hinge.add(lock);
  const keyMetal = new THREE.MeshStandardMaterial({ color: 0xc8c4b9, metalness: 0.8, roughness: 0.3 });
  box(0.012, 0.032, 0.007, 1.31, 1.46, 0.086, keyMetal, hinge);
  // A return of glazing makes the model legible in three dimensions.
  box(0.065, 3.22, 0.065, 1.93, 1.77, -1.18, metal);
  box(0.065, 3.22, 0.065, 1.93, 1.77, 0.4, metal);
  box(0.065, 0.065, 1.64, 1.93, 3.36, -0.39, metal);
  box(0.065, 0.065, 1.64, 1.93, 0.18, -0.39, metal);
  box(0.025, 3.1, 1.5, 1.93, 1.77, -0.39, glass);

  // Render on demand: animations settle and stop instead of running an idle loop.
  let angle = 21, targetAngle = 21, door = 0, targetDoor = 0;
  let frame = 0, visible = true;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  function render() {
    frame = 0;
    if (!visible || document.hidden) return;
    angle += (targetAngle - angle) * (reduced.matches ? 1 : 0.17);
    door += (targetDoor - door) * (reduced.matches ? 1 : 0.14);
    const theta = THREE.MathUtils.degToRad(angle);
    const distance = viewport.clientWidth < 380 ? 10.3 : 9.7;
    camera.position.set(Math.sin(theta) * distance, 4.8, Math.cos(theta) * distance);
    camera.lookAt(lookAt);
    hinge.rotation.y = door;
    renderer.render(scene, camera);
    if (Math.abs(targetAngle - angle) > 0.02 || Math.abs(targetDoor - door) > 0.002) requestRender();
  }
  function requestRender() { if (!frame && visible && !document.hidden) frame = requestAnimationFrame(render); }
  const resize = new ResizeObserver(() => {
    const width = viewport.clientWidth, height = viewport.clientHeight;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    requestRender();
  });
  resize.observe(viewport);
  new IntersectionObserver(entries => { visible = entries[0].isIntersecting; if (visible) requestRender(); }, {rootMargin:'80px'}).observe(viewport);
  document.addEventListener('visibilitychange', requestRender);
  const finishes = { silver: [0xa9b6ad, 'Brushed silver', 0xb6bebc], graphite: [0x303944, 'Graphite', 0x46515f], champagne: [0xb49a70, 'Champagne', 0xbfa983] };
  finishButtons.forEach(button => {
    button.disabled = false;
    button.addEventListener('click', () => {
      const [color, name, panelColor] = finishes[button.dataset.finish];
      metal.color.setHex(color);
      doorSkin.color.setHex(panelColor);
      finishButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
      document.querySelector('[data-finish-name]').textContent = name;
      viewport.dataset.finish = button.dataset.finish;
      requestRender();
    });
  });
  doorButton.disabled = resetButton.disabled = rotation.disabled = false;
  doorButton.addEventListener('click', () => {
    const open = doorButton.getAttribute('aria-pressed') !== 'true';
    doorButton.setAttribute('aria-pressed', String(open));
    doorButton.textContent = open ? 'Close entrance' : 'Open entrance';
    targetDoor = open ? -1.2 : 0;
    requestRender();
  });
  rotation.addEventListener('input', () => { targetAngle = Number(rotation.value); requestRender(); });
  resetButton.addEventListener('click', () => { targetAngle = 21; rotation.value = '21'; requestRender(); });
  let drag;
  viewport.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0) return;
    drag = { x: event.clientX, angle: targetAngle, id: event.pointerId };
    viewport.setPointerCapture(event.pointerId);
  });
  viewport.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    targetAngle = Math.max(-55, Math.min(55, drag.angle - (event.clientX - drag.x) * 0.3));
    rotation.value = String(Math.round(targetAngle));
    requestRender();
  });
  ['pointerup','pointercancel','lostpointercapture'].forEach(name => viewport.addEventListener(name, () => { drag = null; }));
  renderer.domElement.addEventListener('webglcontextlost', event => {
    event.preventDefault();
    viewport.dataset.ready = 'false';
    status.textContent = '3D paused. Refresh to reload; a static concept is shown.';
    finishButtons.forEach(button => { button.disabled = true; });
    doorButton.disabled = resetButton.disabled = rotation.disabled = true;
    visible = false;
  });
  viewport.dataset.ready = 'true';
  viewport.dataset.finish = 'graphite';
  status.textContent = 'Concept visualization. Finishes and details are illustrative.';
  requestRender();
}
// Defer the renderer until the hero approaches the viewport; the fallback is always available.
const loader = new IntersectionObserver(entries => {
  if (!entries[0].isIntersecting) return;
  loader.disconnect();
  start().catch(() => {
    viewport.querySelector('canvas')?.remove();
    status.textContent = 'Static concept view. Interactive 3D is unavailable on this browser.';
  });
}, {rootMargin:'150px'});
loader.observe(viewport);
