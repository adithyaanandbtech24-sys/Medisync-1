import { useRef, useEffect } from 'react';
import * as THREE from 'three';

interface LiquidEtherProps {
  mouseForce?: number;
  cursorSize?: number;
  resolution?: number;
  colors?: string[];
  autoDemo?: boolean;
  autoSpeed?: number;
  autoIntensity?: number;
  autoResumeDelay?: number;
}

export default function LiquidEther({
  mouseForce = 20,
  cursorSize = 100,
  resolution = 0.5,
  colors = ['#5227FF', '#FF9FFC', '#B19EEF'],
  autoDemo = true,
  autoSpeed = 0.5,
  autoIntensity = 2.2,
  autoResumeDelay = 3000
}: LiquidEtherProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!mountRef.current) return;

    function makePaletteTexture(stops: string[]) {
      const arr = stops.length === 1 ? [stops[0], stops[0]] : stops;
      const w = arr.length;
      const data = new Uint8Array(w * 4);
      for (let i = 0; i < w; i++) {
        const c = new THREE.Color(arr[i]);
        data[i * 4] = Math.round(c.r * 255);
        data[i * 4 + 1] = Math.round(c.g * 255);
        data[i * 4 + 2] = Math.round(c.b * 255);
        data[i * 4 + 3] = 255;
      }
      const tex = new THREE.DataTexture(data, w, 1, THREE.RGBAFormat);
      tex.magFilter = THREE.LinearFilter;
      tex.minFilter = THREE.LinearFilter;
      tex.needsUpdate = true;
      return tex;
    }

    const paletteTex = makePaletteTexture(colors);
    const bgVec4 = new THREE.Vector4(0, 0, 0, 0);

    class CommonClass {
      width = 0;
      height = 0;
      pixelRatio = 1;
      container: HTMLElement | null = null;
      renderer: THREE.WebGLRenderer | null = null;
      clock: THREE.Clock | null = null;
      time = 0;
      delta = 0;

      init(container: HTMLElement) {
        this.container = container;
        this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        this.resize();
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.renderer.autoClear = false;
        this.renderer.setClearColor(new THREE.Color(0x000000), 0);
        this.renderer.setPixelRatio(this.pixelRatio);
        this.renderer.setSize(this.width, this.height);
        this.renderer.domElement.style.width = '100%';
        this.renderer.domElement.style.height = '100%';
        this.renderer.domElement.style.display = 'block';
        this.clock = new THREE.Clock();
        this.clock.start();
      }

      resize() {
        if (!this.container) return;
        const rect = this.container.getBoundingClientRect();
        this.width = Math.max(1, Math.floor(rect.width));
        this.height = Math.max(1, Math.floor(rect.height));
        if (this.renderer) this.renderer.setSize(this.width, this.height, false);
      }

      update() {
        if (this.clock) {
          this.delta = this.clock.getDelta();
          this.time += this.delta;
        }
      }
    }

    const Common = new CommonClass();

    class MouseClass {
      coords = new THREE.Vector2();
      coords_old = new THREE.Vector2();
      diff = new THREE.Vector2();
      isHoverInside = false;
      hasUserControl = false;
      isAutoActive = false;
      autoIntensity = 2.0;
      onInteract: (() => void) | null = null;
      container: HTMLElement | null = null;

      init(container: HTMLElement) {
        this.container = container;
        window.addEventListener('mousemove', this.onMove);
      }

      onMove = (e: MouseEvent) => {
        if (!this.container) return;
        const rect = this.container.getBoundingClientRect();
        const inside = e.clientX >= rect.left && e.clientX <= rect.right && 
                      e.clientY >= rect.top && e.clientY <= rect.bottom;
        this.isHoverInside = inside;
        if (!inside) return;
        if (this.onInteract) this.onInteract();
        const nx = (e.clientX - rect.left) / rect.width;
        const ny = (e.clientY - rect.top) / rect.height;
        this.coords.set(nx * 2 - 1, -(ny * 2 - 1));
        this.hasUserControl = true;
      };

      update() {
        this.diff.subVectors(this.coords, this.coords_old);
        this.coords_old.copy(this.coords);
        if (this.isAutoActive) this.diff.multiplyScalar(this.autoIntensity);
      }

      dispose() {
        window.removeEventListener('mousemove', this.onMove);
      }
    }

    const Mouse = new MouseClass();

    class AutoDriver {
      mouse: MouseClass;
      manager: { lastUserInteraction: number };
      enabled: boolean;
      speed: number;
      resumeDelay: number;
      active = false;
      current = new THREE.Vector2(0, 0);
      target = new THREE.Vector2();
      lastTime = performance.now();

      constructor(mouse: MouseClass, manager: { lastUserInteraction: number }, opts: { enabled: boolean; speed: number; resumeDelay: number }) {
        this.mouse = mouse;
        this.manager = manager;
        this.enabled = opts.enabled;
        this.speed = opts.speed;
        this.resumeDelay = opts.resumeDelay || 3000;
        this.pickNewTarget();
      }

      pickNewTarget() {
        this.target.set((Math.random() * 2 - 1) * 0.8, (Math.random() * 2 - 1) * 0.8);
      }

      update() {
        if (!this.enabled) return;
        const now = performance.now();
        const idle = now - this.manager.lastUserInteraction;
        if (idle < this.resumeDelay || this.mouse.isHoverInside) {
          this.active = false;
          this.mouse.isAutoActive = false;
          return;
        }
        if (!this.active) {
          this.active = true;
          this.current.copy(this.mouse.coords);
          this.lastTime = now;
        }
        this.mouse.isAutoActive = true;
        let dtSec = (now - this.lastTime) / 1000;
        this.lastTime = now;
        if (dtSec > 0.2) dtSec = 0.016;
        const dir = new THREE.Vector2().subVectors(this.target, this.current);
        const dist = dir.length();
        if (dist < 0.01) {
          this.pickNewTarget();
          return;
        }
        dir.normalize();
        const step = this.speed * dtSec;
        const move = Math.min(step, dist);
        this.current.addScaledVector(dir, move);
        this.mouse.coords.copy(this.current);
      }
    }

    const faceVert = `
      attribute vec3 position;
      uniform vec2 boundarySpace;
      varying vec2 uv;
      void main() {
        vec3 pos = position;
        vec2 scale = 1.0 - boundarySpace * 2.0;
        pos.xy = pos.xy * scale;
        uv = vec2(0.5) + (pos.xy) * 0.5;
        gl_Position = vec4(pos, 1.0);
      }
    `;

    const advectionFrag = `
      precision highp float;
      uniform sampler2D velocity;
      uniform float dt;
      uniform vec2 fboSize;
      varying vec2 uv;
      void main() {
        vec2 ratio = max(fboSize.x, fboSize.y) / fboSize;
        vec2 vel = texture2D(velocity, uv).xy;
        vec2 uv2 = uv - vel * dt * ratio;
        vec2 newVel = texture2D(velocity, uv2).xy;
        gl_FragColor = vec4(newVel, 0.0, 0.0);
      }
    `;

    const colorFrag = `
      precision highp float;
      uniform sampler2D velocity;
      uniform sampler2D palette;
      uniform vec4 bgColor;
      varying vec2 uv;
      void main() {
        vec2 vel = texture2D(velocity, uv).xy;
        float lenv = clamp(length(vel), 0.0, 1.0);
        vec3 c = texture2D(palette, vec2(lenv, 0.5)).rgb;
        vec3 outRGB = mix(bgColor.rgb, c, lenv);
        float outA = mix(bgColor.a, 1.0, lenv);
        gl_FragColor = vec4(outRGB, outA);
      }
    `;

    const mouseVert = `
      precision highp float;
      attribute vec3 position;
      attribute vec2 uv;
      uniform vec2 center;
      uniform vec2 scale;
      uniform vec2 px;
      varying vec2 vUv;
      void main() {
        vec2 pos = position.xy * scale * 2.0 * px + center;
        vUv = uv;
        gl_Position = vec4(pos, 0.0, 1.0);
      }
    `;

    const externalForceFrag = `
      precision highp float;
      uniform vec2 force;
      varying vec2 vUv;
      void main() {
        vec2 circle = (vUv - 0.5) * 2.0;
        float d = 1.0 - min(length(circle), 1.0);
        d *= d;
        gl_FragColor = vec4(force * d, 0.0, 1.0);
      }
    `;

    class ShaderPass {
      props: any;
      uniforms: any;
      scene: THREE.Scene | null = null;
      camera: THREE.Camera | null = null;
      material: THREE.RawShaderMaterial | null = null;
      geometry: THREE.PlaneGeometry | null = null;
      plane: THREE.Mesh | null = null;

      constructor(props: any) {
        this.props = props || {};
        this.uniforms = this.props.material?.uniforms;
      }

      init() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.Camera();
        if (this.uniforms) {
          this.material = new THREE.RawShaderMaterial(this.props.material);
          this.geometry = new THREE.PlaneGeometry(2.0, 2.0);
          this.plane = new THREE.Mesh(this.geometry, this.material);
          this.scene.add(this.plane);
        }
      }

      update(_props?: any) {
        if (Common.renderer && this.scene && this.camera) {
          Common.renderer.setRenderTarget(this.props.output || null);
          Common.renderer.render(this.scene, this.camera);
          Common.renderer.setRenderTarget(null);
        }
      }
    }

    class Advection extends ShaderPass {
      constructor(simProps: any) {
        super({
          material: {
            vertexShader: faceVert,
            fragmentShader: advectionFrag,
            uniforms: {
              boundarySpace: { value: simProps.cellScale },
              velocity: { value: simProps.src.texture },
              dt: { value: simProps.dt },
              fboSize: { value: simProps.fboSize }
            }
          },
          output: simProps.dst
        });
        this.init();
      }

      update(props?: { dt: number }) {
        if (this.uniforms && props) this.uniforms.dt.value = props.dt;
        super.update(props);
      }
    }

    class ExternalForce extends ShaderPass {
      mouse: THREE.Mesh | null = null;

      constructor(simProps: any) {
        super({ output: simProps.dst });
        this.initMouse(simProps);
      }

      initMouse(simProps: any) {
        super.init();
        const mouseG = new THREE.PlaneGeometry(1, 1);
        const mouseM = new THREE.RawShaderMaterial({
          vertexShader: mouseVert,
          fragmentShader: externalForceFrag,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
          uniforms: {
            px: { value: simProps.cellScale },
            force: { value: new THREE.Vector2(0.0, 0.0) },
            center: { value: new THREE.Vector2(0.0, 0.0) },
            scale: { value: new THREE.Vector2(simProps.cursor_size, simProps.cursor_size) }
          }
        });
        this.mouse = new THREE.Mesh(mouseG, mouseM);
        if (this.scene) this.scene.add(this.mouse);
      }

      update(props?: any) {
        if (!this.mouse || !props) return;
        const forceX = (Mouse.diff.x / 2) * props.mouse_force;
        const forceY = (Mouse.diff.y / 2) * props.mouse_force;
        const uniforms = (this.mouse.material as THREE.RawShaderMaterial).uniforms;
        uniforms.force.value.set(forceX, forceY);
        uniforms.center.value.set(Mouse.coords.x, Mouse.coords.y);
        uniforms.scale.value.set(props.cursor_size, props.cursor_size);
        super.update(props);
      }
    }

    class Simulation {
      options: any;
      fbos: any = { vel_0: null, vel_1: null };
      fboSize = new THREE.Vector2();
      cellScale = new THREE.Vector2();
      advection: Advection | null = null;
      externalForce: ExternalForce | null = null;

      constructor(options: any) {
        this.options = { ...options };
        this.init();
      }

      init() {
        this.calcSize();
        this.createAllFBO();
        this.createShaderPass();
      }

      createAllFBO() {
        const opts = {
          type: THREE.FloatType,
          minFilter: THREE.LinearFilter,
          magFilter: THREE.LinearFilter
        };
        for (let key in this.fbos) {
          this.fbos[key] = new THREE.WebGLRenderTarget(this.fboSize.x, this.fboSize.y, opts);
        }
      }

      createShaderPass() {
        this.advection = new Advection({
          cellScale: this.cellScale,
          fboSize: this.fboSize,
          dt: this.options.dt,
          src: this.fbos.vel_0,
          dst: this.fbos.vel_1
        });
        this.externalForce = new ExternalForce({
          cellScale: this.cellScale,
          cursor_size: this.options.cursor_size,
          dst: this.fbos.vel_1
        });
      }

      calcSize() {
        const width = Math.max(1, Math.round(this.options.resolution * Common.width));
        const height = Math.max(1, Math.round(this.options.resolution * Common.height));
        this.cellScale.set(1.0 / width, 1.0 / height);
        this.fboSize.set(width, height);
      }

      resize() {
        this.calcSize();
        for (let key in this.fbos) {
          this.fbos[key].setSize(this.fboSize.x, this.fboSize.y);
        }
      }

      update() {
        if (this.advection) this.advection.update({ dt: this.options.dt });
        if (this.externalForce) {
          this.externalForce.update({
            cursor_size: this.options.cursor_size,
            mouse_force: this.options.mouse_force,
            cellScale: this.cellScale
          });
        }
      }
    }

    class Output {
      simulation: Simulation;
      scene = new THREE.Scene();
      camera = new THREE.Camera();
      output: THREE.Mesh;

      constructor() {
        this.simulation = new Simulation({ 
          resolution, 
          dt: 0.014, 
          cursor_size: cursorSize, 
          mouse_force: mouseForce 
        });
        this.output = new THREE.Mesh(
          new THREE.PlaneGeometry(2, 2),
          new THREE.RawShaderMaterial({
            vertexShader: faceVert,
            fragmentShader: colorFrag,
            transparent: true,
            uniforms: {
              velocity: { value: this.simulation.fbos.vel_0.texture },
              boundarySpace: { value: new THREE.Vector2() },
              palette: { value: paletteTex },
              bgColor: { value: bgVec4 }
            }
          })
        );
        this.scene.add(this.output);
      }

      resize() {
        this.simulation.resize();
      }

      render() {
        if (Common.renderer) {
          Common.renderer.setRenderTarget(null);
          Common.renderer.render(this.scene, this.camera);
        }
      }

      update() {
        this.simulation.update();
        this.render();
      }
    }

    class WebGLManager {
      props: any;
      lastUserInteraction = performance.now();
      autoDriver: AutoDriver | null = null;
      output: Output | null = null;
      running = false;

      constructor(props: any) {
        this.props = props;
        Common.init(props.$wrapper);
        Mouse.init(props.$wrapper);
        Mouse.autoIntensity = props.autoIntensity;
        Mouse.onInteract = () => {
          this.lastUserInteraction = performance.now();
        };
        this.autoDriver = new AutoDriver(Mouse, this, {
          enabled: props.autoDemo,
          speed: props.autoSpeed,
          resumeDelay: props.autoResumeDelay
        });
        this.init();
      }

      init() {
        if (Common.renderer) {
          this.props.$wrapper.prepend(Common.renderer.domElement);
        }
        this.output = new Output();
      }

      resize() {
        Common.resize();
        if (this.output) this.output.resize();
      }

      render() {
        if (this.autoDriver) this.autoDriver.update();
        Mouse.update();
        Common.update();
        if (this.output) this.output.update();
      }

      loop = () => {
        if (!this.running) return;
        this.render();
        rafRef.current = requestAnimationFrame(this.loop);
      };

      start() {
        if (this.running) return;
        this.running = true;
        this.loop();
      }

      pause() {
        this.running = false;
      }

      dispose() {
        Mouse.dispose();
        if (Common.renderer) {
          const canvas = Common.renderer.domElement;
          if (canvas?.parentNode) canvas.parentNode.removeChild(canvas);
          Common.renderer.dispose();
        }
      }
    }

    const container = mountRef.current;
    const webgl = new WebGLManager({
      $wrapper: container,
      autoDemo,
      autoSpeed,
      autoIntensity,
      autoResumeDelay
    });
    webgl.start();

    const handleResize = () => webgl.resize();
    window.addEventListener('resize', handleResize);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
      webgl.dispose();
    };
  }, [colors, autoDemo, autoSpeed, autoIntensity, resolution, mouseForce, cursorSize, autoResumeDelay]);

  return (
    <div 
      ref={mountRef} 
      style={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        width: '100%', 
        height: '100%', 
        zIndex: 0 
      }} 
    />
  );
}
