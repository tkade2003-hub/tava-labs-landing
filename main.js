/* ============================================================
   Tava Labs — main.js
   1. Scroll reveal animations + parallax + sticky nav state
   2. Interactive 3D serum bottle (Three.js)
   ============================================================ */

/* ---------- 1. Scroll animations & parallax ---------- */
(function () {
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* --- Reveal on scroll (IntersectionObserver) --- */
  var revealEls = document.querySelectorAll('[data-reveal]');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(function (el) { el.classList.add('revealed'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  }

  /* --- Sticky nav state --- */
  var nav = document.querySelector('nav');
  if (nav) {
    var onNavScroll = function () {
      nav.classList.toggle('scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', onNavScroll, { passive: true });
    onNavScroll();
  }

  /* --- Parallax layers ---
     Elements with [data-parallax="speed"] drift relative to the
     viewport centre as the page scrolls. Positive speeds lag
     behind the scroll; negative speeds move against it. */
  var layers = document.querySelectorAll('[data-parallax]');
  if (!reduceMotion && layers.length) {
    var ticking = false;
    var updateParallax = function () {
      ticking = false;
      var mid = window.innerHeight / 2;
      layers.forEach(function (el) {
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.15;
        var r = el.getBoundingClientRect();
        var offset = (r.top + r.height / 2 - mid) * speed;
        el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0)';
      });
    };
    var requestUpdate = function () {
      if (!ticking) { ticking = true; requestAnimationFrame(updateParallax); }
    };
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);
    updateParallax();
  }
})();

/* ---------- 2. Interactive 3D serum bottle ---------- */
(async function initBottle() {
  const canvas = document.getElementById('scene');
  if (!canvas) return; // Legal pages have no stage — nothing to do.

  let THREE, OrbitControls, RoomEnvironment;
  try {
    THREE = await import('three');
    ({ OrbitControls } = await import('three/addons/controls/OrbitControls.js'));
    ({ RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js'));
  } catch (e) {
    document.getElementById('nogl').style.display = 'flex';
    return;
  }

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch (e) {
    document.getElementById('nogl').style.display = 'flex';
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.set(3.4, 1.9, 5.2);

  const controls = new OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.minDistance = 3.4;
  controls.maxDistance = 9;
  controls.minPolarAngle = 0.85;
  controls.maxPolarAngle = 1.85;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 1.1;
  controls.target.set(0, 0.15, 0);

  scene.add(new THREE.AmbientLight(0xfff4e0, 0.5));
  const key = new THREE.DirectionalLight(0xffffff, 1.6); key.position.set(4, 6, 4); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffe9bb, 0.9); rim.position.set(-5, 3, -4); scene.add(rim);

  // ---------- 3D serum bottle (procedurally modelled) ----------
  const bottle = new THREE.Group();

  // Glass body — lathe profile: base, straight body, shoulder, neck
  const pts = [];
  pts.push(new THREE.Vector2(0.0, -1.45));
  pts.push(new THREE.Vector2(0.78, -1.45));
  pts.push(new THREE.Vector2(0.86, -1.38));
  pts.push(new THREE.Vector2(0.88, -0.4));
  pts.push(new THREE.Vector2(0.88, 0.55));
  pts.push(new THREE.Vector2(0.80, 0.95));
  pts.push(new THREE.Vector2(0.45, 1.22));
  pts.push(new THREE.Vector2(0.30, 1.30));
  pts.push(new THREE.Vector2(0.30, 1.52));
  pts.push(new THREE.Vector2(0.0, 1.52));
  const glass = new THREE.Mesh(
    new THREE.LatheGeometry(pts, 72),
    new THREE.MeshPhysicalMaterial({ color: 0xf7f1e3, metalness: 0, roughness: 0.08, transmission: 0.92, thickness: 1.1, ior: 1.45, clearcoat: 0.6, clearcoatRoughness: 0.2 })
  );
  bottle.add(glass);

  // Serum liquid inside
  const lpts = [];
  lpts.push(new THREE.Vector2(0.0, -1.36));
  lpts.push(new THREE.Vector2(0.72, -1.36));
  lpts.push(new THREE.Vector2(0.79, -0.4));
  lpts.push(new THREE.Vector2(0.79, 0.45));
  lpts.push(new THREE.Vector2(0.55, 0.82));
  lpts.push(new THREE.Vector2(0.0, 0.9));
  const liquid = new THREE.Mesh(
    new THREE.LatheGeometry(lpts, 72),
    new THREE.MeshPhysicalMaterial({ color: 0xe8a93c, metalness: 0, roughness: 0.25, transmission: 0.55, thickness: 0.8, ior: 1.36 })
  );
  bottle.add(liquid);

  // Label — canvas texture with the Tava branding
  function makeLabel() {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 512;
    const x = c.getContext('2d');
    x.fillStyle = '#fdfcf9'; x.fillRect(0, 0, 1024, 512);
    x.strokeStyle = '#C19A3D'; x.lineWidth = 6; x.strokeRect(18, 18, 988, 476);
    x.fillStyle = '#141414'; x.textAlign = 'center';
    x.font = '700 150px Georgia, serif';
    x.fillText('T', 512, 185);
    x.beginPath(); x.arc(512, 62, 17, 0, Math.PI * 2); x.fillStyle = '#C19A3D'; x.fill();
    x.fillStyle = '#141414'; x.font = '600 64px Georgia, serif';
    x.fillText('T A V A', 512, 285);
    x.font = '500 30px Arial'; x.fillStyle = '#9A7B2D';
    x.fillText('L A B S', 512, 330);
    x.font = '500 37px Arial'; x.fillStyle = '#141414';
    x.fillText('GLOW BRIGHTENING SERUM', 512, 405);
    x.font = '400 28px Arial'; x.fillStyle = '#6d675c';
    x.fillText('1 fl oz (30 ml)', 512, 452);
    const t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
    return t;
  }
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(0.895, 0.895, 1.55, 72, 1, true, -Math.PI / 2.6, Math.PI / 1.3),
    new THREE.MeshStandardMaterial({ map: makeLabel(), roughness: 0.55, metalness: 0.02 })
  );
  label.position.y = -0.35;
  bottle.add(label);

  // Gold dropper cap + black bulb
  const gold = new THREE.MeshStandardMaterial({ color: 0xc9a227, metalness: 1.0, roughness: 0.27 });
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.34, 0.62, 48), gold);
  cap.position.y = 1.83; bottle.add(cap);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.37, 0.37, 0.1, 48), gold);
  collar.position.y = 1.55; bottle.add(collar);
  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.21, 32, 24),
    new THREE.MeshStandardMaterial({ color: 0x17181a, roughness: 0.45, metalness: 0.1 })
  );
  bulb.scale.y = 1.25; bulb.position.y = 2.32; bottle.add(bulb);
  // Pipette tube inside the glass
  const tube = new THREE.Mesh(
    new THREE.CylinderGeometry(0.045, 0.045, 2.3, 16),
    new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.05, transmission: 0.9, thickness: 0.2 })
  );
  tube.position.y = 0.35; bottle.add(tube);

  scene.add(bottle);

  // Soft ground shadow
  function makeShadow() {
    const c = document.createElement('canvas'); c.width = c.height = 256;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(128, 128, 10, 128, 128, 120);
    g.addColorStop(0, 'rgba(50,38,10,0.35)'); g.addColorStop(1, 'rgba(50,38,10,0)');
    x.fillStyle = g; x.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(1.7, 48),
    new THREE.MeshBasicMaterial({ map: makeShadow(), transparent: true, depthWrite: false })
  );
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = -1.52;
  scene.add(shadow);

  // Floating gold droplets
  const drops = new THREE.Group();
  const dropMat = new THREE.MeshPhysicalMaterial({ color: 0xd9ab3c, metalness: 0.4, roughness: 0.15, transmission: 0.35, thickness: 0.4 });
  for (let i = 0; i < 26; i++) {
    const s = 0.03 + Math.random() * 0.05;
    const m = new THREE.Mesh(new THREE.SphereGeometry(s, 16, 12), dropMat);
    const a = Math.random() * Math.PI * 2, r = 1.6 + Math.random() * 1.6;
    m.position.set(Math.cos(a) * r, -1.3 + Math.random() * 3.6, Math.sin(a) * r);
    m.userData.speed = 0.15 + Math.random() * 0.35;
    m.userData.phase = Math.random() * Math.PI * 2;
    drops.add(m);
  }
  scene.add(drops);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    if (canvas.width !== w || canvas.height !== h) {
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }
  }
  const clock = new THREE.Clock();
  function tick() {
    requestAnimationFrame(tick);
    const t = clock.getElapsedTime();
    resize();
    bottle.position.y = Math.sin(t * 0.9) * 0.07;
    bottle.rotation.z = Math.sin(t * 0.5) * 0.015;
    drops.children.forEach(d => { d.position.y += Math.sin(t * d.userData.speed + d.userData.phase) * 0.0016; });
    drops.rotation.y = t * 0.05;
    controls.update();
    renderer.render(scene, camera);
  }
  tick();
})();
