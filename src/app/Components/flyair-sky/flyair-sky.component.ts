import { Component, ElementRef, OnDestroy, ViewChild, afterNextRender } from '@angular/core';

/**
 * FlyAir hero sky — elegant, breathtaking, NO plane.
 * Real cloud photos rebuilt as a forward FLY-THROUGH: clouds stream from
 * far ahead toward the camera, grow, and dissolve as we pass into them —
 * the view from the flight deck punching through a cloud bank. Slow
 * dawn↔day colour breathing. SSR-safe: Three.js is dynamically imported
 * and only initialised in the browser.
 */
@Component({
  selector: 'app-flyair-sky',
  standalone: true,
  template: `<canvas #c style="position:absolute;inset:0;width:100%;height:100%;display:block"></canvas>`,
})
export class FlyairSkyComponent implements OnDestroy {
  @ViewChild('c', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private raf = 0;
  private disposer: (() => void) | null = null;

  constructor() {
    afterNextRender(() => this.init());
  }

  ngOnDestroy(): void {
    if (typeof cancelAnimationFrame !== 'undefined') cancelAnimationFrame(this.raf);
    this.disposer?.();
  }

  private async init(): Promise<void> {
    // ── PERFORMANCE MODE ─────────────────────────────────────────────────
    // Small-touch devices (phones) skip the WebGL clouds entirely — the
    // parent .fly-hero CSS gradient becomes the static backdrop, GPU stays
    // cool, scroll stays smooth. This is the single biggest win for the
    // class of devices that were complaining (sticky animation on phones,
    // hot fans on old MacBooks).
    if (typeof matchMedia !== 'undefined' && matchMedia('(max-width: 600px) and (hover: none)').matches) return;
    // Auto-degrade on low-power signals — any single hint kicks the device
    // into the static-gradient path. Same render path as phones, no WebGL.
    // Kept intentionally CONSERVATIVE so normal 4-core laptops still get the
    // cinematic clouds (the prior `cores <= 4` rule was demoting most of
    // them; with the rest of perf mode applied — 60 sprites, 24fps, no
    // MSAA — a 4-core machine handles it fine).
    //   • Save-Data: user has explicitly asked for minimal payload (mobile
    //     data, Data Saver mode in Chrome/Edge, low-bandwidth indicators)
    //   • deviceMemory < 2GB: only the genuinely tiny devices (low-end
    //     Chromebooks, ancient tablets, 2GB Android sticks)
    // hardwareConcurrency check removed — too noisy. Battery API is dead in
    // modern browsers (Chrome removed it, Firefox/Safari never shipped it).
    const nav = navigator as any;
    const lowPower =
      nav.connection?.saveData === true ||
      (typeof nav.deviceMemory === 'number' && nav.deviceMemory < 2);
    if (lowPower) return;
    // On desktops, drop MSAA (clouds are blurry textures — antialias buys
    // ~nothing visually, costs 25-40% GPU on iGPU) and cap pixel ratio at
    // 1.5 (full retina rasterisation is overkill for a soft sky).
    const THREE: any = await import('three');
    const canvas = this.canvasRef.nativeElement;
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true });
    renderer.setClearColor(0x000000, 0);
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.02;

    const REDUCED = matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Clean up any stale night-mode body class from previous experiments —
    // ensures CSS night-overrides never apply when this component mounts.
    document.body.classList.remove('fly-night');
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xcfe6fb, 0.00023);
    const camera = new THREE.PerspectiveCamera(54, 2, 1, 30000);
    camera.position.set(0, 40, 250);

    const resize = () => {
      const w = canvas.clientWidth || innerWidth, h = canvas.clientHeight || innerHeight;
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
    };

    // sky dome — two day palettes the shader breathes between for a slow shift.
    const A = { top: new THREE.Color('#073a73'), mid: new THREE.Color('#1685cf'), bot: new THREE.Color('#dfeffb') };
    const B = { top: new THREE.Color('#0b2f63'), mid: new THREE.Color('#3f7fc0'), bot: new THREE.Color('#f4dcc0') };
    const skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide, depthWrite: false, depthTest: false, fog: false,
      uniforms: {
        top: { value: A.top.clone() }, mid: { value: A.mid.clone() }, bot: { value: A.bot.clone() },
        sunDir: { value: new THREE.Vector3(.32, .26, -1).normalize() }, sunColor: { value: new THREE.Color('#fff7ec') }, sunI: { value: 1 },
      },
      vertexShader: `varying vec3 v;void main(){v=normalize(position);gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `varying vec3 v;uniform vec3 top,mid,bot,sunColor,sunDir;uniform float sunI;
        void main(){float h=clamp(v.y*.5+.5,0.,1.);vec3 c=h>.5?mix(mid,top,(h-.5)*2.):mix(bot,mid,h*2.);
        gl_FragColor=vec4(c,1.);}`,
    });
    const dome = new THREE.Mesh(new THREE.SphereGeometry(18000, 40, 20), skyMat); dome.renderOrder = -1; scene.add(dome);

    // (sun glow & drifting light particles removed — clouds only)

    // clouds from real photos (CORS) keyed to alpha
    const cloudGroup = new THREE.Group(); scene.add(cloudGroup); const clouds: any[] = [];
    const texFromImg = (img: HTMLImageElement, sx: number, sy: number, sw: number, sh: number) => {
      const S = 256, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d')!;
      x.drawImage(img, sx, sy, sw, sh, 0, 0, S, S); const id = x.getImageData(0, 0, S, S), d = id.data;
      for (let i = 0; i < d.length; i += 4) { const r = d[i], g = d[i + 1], b = d[i + 2], lum = (r + g + b) / 3, blue = b - (r + g) / 2;
        let a = (lum - 92) / 112; a *= 1 - Math.min(Math.max((blue - 4) / 38, 0), 1); d[i + 3] = Math.round(Math.min(Math.max(a, 0), 1) * 255); }
      x.putImageData(id, 0, 0); x.globalCompositeOperation = 'destination-in';
      const m = x.createRadialGradient(S / 2, S / 2, S * .08, S / 2, S / 2, S * .52); m.addColorStop(0, '#fff'); m.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = m; x.fillRect(0, 0, S, S); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    };
    // ── fly-through cloud field ──────────────────────────────────────
    // Clouds spawn far ahead (lost in the haze) and stream toward us; as
    // one reaches the camera it has grown to fill the view and fades, so
    // we appear to plunge straight through it.
    const FAR = 9200;                                    // spawn distance ahead
    const resetCloud = (sp: any, initial: boolean) => {
      const z = initial ? -Math.random() * FAR : -(FAR - Math.random() * 1400);
      sp.position.set((Math.random() - .5) * 5400, 40 + (Math.random() - .5) * 2600, z);
      const sc = 900 + Math.random() * 1700; sp.scale.set(sc * 1.65, sc, 1);
      sp.userData['base'] = .72 + Math.random() * .28;   // peak opacity — solid sunlit white
      sp.userData['spd'] = (REDUCED ? 60 : 260) * (.85 + Math.random() * .3);
    };
    const build = (tex: any[]) => {
      // 160 → 60 clouds: each sprite is huge, so fewer alpha-blended quads is
      // the biggest fill-rate saving on integrated GPUs. The field still feels
      // dense at 60 because clouds overlap heavily and each covers a wide area.
      const N = REDUCED ? 40 : 60;
      for (let i = 0; i < N; i++) {
        const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex[i % tex.length], transparent: true, depthWrite: false, opacity: .5, fog: true }));
        resetCloud(sp, true);
        cloudGroup.add(sp); clouds.push(sp);
      }
    };
    const PHOTOS = [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Cumulus_Clouds.JPG/1280px-Cumulus_Clouds.JPG',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/05/Cumulus_mediocris_3.JPG/1280px-Cumulus_mediocris_3.JPG',
    ];
    const fallback = () => {
      const S = 256, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d')!; x.filter = 'blur(8px)';
      for (let i = 0; i < 22; i++) { const a = Math.random() * 6.28, rr = Math.random() * .4, cx = 128 + Math.cos(a) * S * rr * 1.5, cy = 128 + Math.sin(a) * S * rr * .7, r = S * (.1 + Math.random() * .16);
        const g = x.createRadialGradient(cx, cy, 0, cx, cy, r); g.addColorStop(0, 'rgba(255,255,255,.85)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.beginPath(); x.arc(cx, cy, r, 0, 6.28); x.fill(); }
      return new THREE.CanvasTexture(c);
    };
    Promise.all(PHOTOS.map(s => new Promise<HTMLImageElement | null>(res => { const im = new Image(); im.crossOrigin = 'anonymous'; im.onload = () => res(im); im.onerror = () => res(null); im.src = s; })))
      .then(imgs => { const tx: any[] = []; imgs.forEach(im => { if (!im || !im.naturalWidth) return; const iw = im.naturalWidth, ih = im.naturalHeight;
        for (let k = 0; k < 5; k++) { const sw = iw * (.34 + Math.random() * .26), sh = sw * .62; tx.push(texFromImg(im, Math.random() * (iw - sw), Math.random() * Math.max(ih - sh, 1) * .85, sw, sh)); } });
        build(tx.length ? tx : [fallback()]); }).catch(() => build([fallback()]));

    let t0 = performance.now(), tEl = 0, visible = true; const _a = new THREE.Color();
    const lerpC = (o: any, a: any, b: any, t: number) => o.copy(a).lerp(b, t);
    // 24 fps cap. The cloud "breathing" is slow enough that 24 fps reads as
    // identical to 60/120 but cuts rasterisation work to ~40% of native rate.
    // We still requestAnimationFrame every frame so visibility/throttling
    // stays correct — we just skip rendering on frames that arrive too soon.
    const FRAME_MS = 1000 / 24;
    let lastDraw = 0;
    const tick = (now: number) => {
      if (!visible) { this.raf = 0; return; }                  // paused while the hero is off-screen
      this.raf = requestAnimationFrame(tick);
      if (now - lastDraw < FRAME_MS) return;                   // skip — keeps under 30 fps
      lastDraw = now;
      const dt = Math.min((now - t0) / 1000, .05); t0 = now; tEl += dt;
      const camZ = camera.position.z;
      for (const c of clouds) {
        c.position.z += c.userData['spd'] * dt;                           // stream toward the camera
        const d = camZ - c.position.z;                                    // distance still ahead of us
        if (d <= 180) { resetCloud(c, false); continue; }                 // recycle while invisible → no pop
        // TWO-SIDED FADE so spawns are never visible:
        //   • Far fade (8500→6500): clouds emerge from the haze gradually.
        //     Without this, recycled clouds spawn at d≈8000-9400 already
        //     fully opaque — fog tints them but they still read as a "patch
        //     popping in." Now they start at opacity 0 and ramp up while
        //     perspective naturally scales them up from a small dot.
        //   • Near fade (940→220): clouds dissolve before reaching the camera.
        let f: number;
        if (d > 6500)      f = (8500 - d) / 2000;        // fade IN from haze
        else if (d > 940)  f = 1;                        // fully visible band
        else               f = (d - 220) / 720;          // fade OUT before camera
        if (f < 0) f = 0; else if (f > 1) f = 1;
        c.material.opacity = c.userData['base'] * f * f * (3 - 2 * f);   // smoothstep ease
      }
      const k = (Math.sin(tEl * .05) * .5 + .5) * .55;
      lerpC(_a, A.top, B.top, k); skyMat.uniforms.top.value.copy(_a);
      lerpC(_a, A.mid, B.mid, k); skyMat.uniforms.mid.value.copy(_a);
      lerpC(_a, A.bot, B.bot, k); skyMat.uniforms.bot.value.copy(_a);
      camera.position.x = Math.sin(tEl * .12) * 34; camera.position.y = 40 + Math.sin(tEl * .17) * 15;
      camera.lookAt(0, 58, -900); camera.rotateZ(Math.sin(tEl * .08) * .016);   // gentle banking
      renderer.render(scene, camera);
    };
    resize(); addEventListener('resize', resize); this.raf = requestAnimationFrame(tick);
    // pause the render loop when the hero scrolls out of view — frees the GPU/CPU so the
    // marquees and scroll reveals stay smooth, and saves battery.
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && !this.raf) { t0 = performance.now(); this.raf = requestAnimationFrame(tick); }
    }, { threshold: 0 });
    io.observe(canvas);
    this.disposer = () => { removeEventListener('resize', resize); io.disconnect(); renderer.dispose(); };
  }
}
