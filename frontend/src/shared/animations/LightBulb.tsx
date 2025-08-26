import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec3 } from "ogl";

interface LightBullProps {
  hue?: number;
  hoverIntensity?: number;
  rotateOnHover?: boolean;
  forceHoverState?: boolean;
}

export default function Orb({
  hue = 0,
  hoverIntensity = 0.2,
  rotateOnHover = true,
  forceHoverState = false,
}: LightBullProps) {
  const ctnDom = useRef<HTMLDivElement>(null);

  const vert = /* glsl */ `
    precision highp float;
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main(){
      vUv = uv;
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const frag = /* glsl */ `
    precision highp float;

    uniform float iTime;
    uniform vec3  iResolution;
    uniform float hue;
    uniform float hover;
    uniform float rot;
    uniform float hoverIntensity;
    varying vec2 vUv;

    // ---- utils color (YIQ hue shift) ----
    vec3 rgb2yiq(vec3 c){
      return vec3(
        dot(c, vec3(0.299, 0.587, 0.114)),
        dot(c, vec3(0.596,-0.274,-0.322)),
        dot(c, vec3(0.211,-0.523, 0.312))
      );
    }
    vec3 yiq2rgb(vec3 c){
      return vec3(
        c.x + 0.956*c.y + 0.621*c.z,
        c.x - 0.272*c.y - 0.647*c.z,
        c.x - 1.106*c.y + 1.703*c.z
      );
    }
    vec3 adjustHue(vec3 color, float hueDeg){
      float a = radians(hueDeg);
      vec3 y = rgb2yiq(color);
      float cs = cos(a), sn = sin(a);
      float i = y.y*cs - y.z*sn;
      float q = y.y*sn + y.z*cs;
      return yiq2rgb(vec3(y.x, i, q));
    }

    // ---- SDF helpers ----
    float sdCircle(vec2 p, float r){ return length(p) - r; }
    float sdBox(vec2 p, vec2 b){
      vec2 d = abs(p) - b;
      return length(max(d,0.0)) + min(max(d.x,d.y), 0.0);
    }
    float sdRoundedBox(vec2 p, vec2 b, float r){
      vec2 q = abs(p) - (b - vec2(r));
      return length(max(q,0.0)) + min(max(q.x,q.y), 0.0) - r;
    }
    float sdSegment(vec2 p, vec2 a, vec2 b){
      vec2 pa = p - a, ba = b - a;
      float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0);
      return length(pa - ba*h);
    }
    vec2 rot2(vec2 p, float a){ float s = sin(a), c = cos(a); return vec2(c*p.x - s*p.y, s*p.x + c*p.y); }
    vec4 premul(vec3 c, float a){ return vec4(c*a, a); }

    // ---- paleta ----
    const vec3 glassLo = vec3(0.80, 0.88, 0.98);
    const vec3 glassHi = vec3(0.92, 0.97, 1.00);
    const vec3 metal    = vec3(0.78, 0.82, 0.88);
    const vec3 filamentWarm = vec3(1.00, 0.78, 0.22);

    // ---- dibujo bombilla ----
    vec4 drawBulb(vec2 uv){
      // rotación global + warp hover
      uv = rot2(uv, rot);
      uv.x += hover * hoverIntensity * 0.05 * sin(uv.y*10.0 + iTime);
      uv.y += hover * hoverIntensity * 0.05 * sin(uv.x*10.0 + iTime);

      // geometría: cabeza (círculo), cuello (caja), base (rosca)
      vec2 headC = vec2(0.0, 0.12);
      float headR = 0.58;
      float dHead = sdCircle(uv - headC, headR);

      vec2 neckC = vec2(0.0, -0.18);
      float dNeck = sdRoundedBox(uv - neckC, vec2(0.20, 0.16), 0.08);

      vec2 baseC = vec2(0.0, -0.46);
      float dBase = sdRoundedBox(uv - baseC, vec2(0.26, 0.12), 0.07);

      // unión de sólidos
      float dBulb = min(min(dHead, dNeck), dBase);

      // interior del vidrio
      float wall = 0.028;
      float dInner = dBulb + wall; // desplaza hacia adentro

      // máscaras
      float mBulb  = 1.0 - smoothstep(0.0, 0.012, dBulb);
      float rim    = 1.0 - smoothstep(0.02, 0.13, abs(dBulb));
      float inside = 1.0 - smoothstep(-0.002, 0.002, dInner);

      // vidrio con gradiente
      vec3 cGlass = mix(glassLo, glassHi, 0.6);
      cGlass = adjustHue(cGlass, hue);
      float vgrad = clamp((uv.y + 1.0)*0.5, 0.0, 1.0);
      vec3 col = mix(cGlass*0.9, cGlass, vgrad);

      // base metálica + estrías
      float ribs = 0.20 * sin((uv.x - baseC.x)*90.0);
      vec3 baseCol = metal * (0.85 + 0.15 * smoothstep(-0.12, 0.12, uv.y - baseC.y)) + ribs;
      float mBase = 1.0 - smoothstep(0.0, 0.012, dBase);
      col = mix(col, baseCol, mBase);

      // cuello (ligeramente más oscuro)
      vec3 neckCol = adjustHue(vec3(0.88, 0.93, 1.0), hue) * 0.95;
      float mNeck = 1.0 - smoothstep(0.0, 0.012, dNeck);
      col = mix(col, neckCol, mNeck);

      // filamento: soportes + zig-zag
      // soportes
      vec2 pL = headC + vec2(-0.18, -0.10);
      vec2 pR = headC + vec2( 0.18, -0.10);
      vec2 pB = neckC + vec2(0.0, 0.10);
      float dSupL = sdSegment(uv, pL, pB);
      float dSupR = sdSegment(uv, pR, pB);
      float mSup  = 1.0 - smoothstep(0.008, 0.014, min(dSupL, dSupR));
      col = mix(col, filamentWarm*0.6, mSup);

      // zig-zag (3 segmentos) animando su amplitud
      float amp = 0.08 + 0.02*sin(iTime*3.0);
      vec2 z0 = pL;
      vec2 z1 = headC + vec2(-0.06, -0.10 + amp);
      vec2 z2 = headC + vec2( 0.06, -0.10 - amp);
      vec2 z3 = pR;
      float dz = min(min(sdSegment(uv,z0,z1), sdSegment(uv,z1,z2)), sdSegment(uv,z2,z3));
      float mZ = 1.0 - smoothstep(0.008, 0.013, dz);

      // brillo del filamento
      float pulse = 0.75 + 0.25*sin(iTime*4.0);
      vec3 filoCol = filamentWarm * (0.9 + 0.1*pulse);
      col = mix(col, filoCol, mZ);
      col += filoCol * exp(-11.0 * abs(dz)) * 0.25;

      // destellos: rayos alrededor de la cabeza
      float rays = 0.0;
      for (int i=0; i<8; i++){
        float fi = float(i);
        float ang = fi * 3.14159265/4.0 + 0.2*sin(iTime*1.6 + fi);
        vec2 a = headC + vec2(cos(ang), sin(ang)) * (headR + 0.04);
        vec2 b = headC + vec2(cos(ang), sin(ang)) * (headR + 0.30 + 0.04*sin(iTime*2.0 + fi));
        float dRay = sdSegment(uv, a, b);
        rays += 1.0 - smoothstep(0.010, 0.020, dRay);
      }
      col += filamentWarm * rays * 0.08;

      // halo del vidrio
      col = mix(col, cGlass + vec3(0.10), rim * 0.35);

      // alpha total
      float alpha = clamp(mBulb, 0.0, 1.0);
      return premul(clamp(col, 0.0, 1.0), alpha);
    }

    vec4 mainImage(vec2 fragCoord){
      vec2 center = iResolution.xy * 0.5;
      float size  = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;
      return drawBulb(uv);
    }

    void main(){
      vec2 fragCoord = vUv * iResolution.xy;
      vec4 col = mainImage(fragCoord);
      gl_FragColor = col; // premultiplied alpha
    }
  `;

  useEffect(() => {
    const container = ctnDom.current;
    if (!container) return;

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
    const gl = renderer.gl;
    gl.clearColor(0,0,0,0);
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms: {
        iTime: { value: 0 },
        iResolution: { value: new Vec3(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height) },
        hue: { value: hue },
        hover: { value: 0 },
        rot: { value: 0 },
        hoverIntensity: { value: hoverIntensity },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    function resize(){
      if (!container) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w * dpr, h * dpr);
      gl.canvas.style.width = w + "px";
      gl.canvas.style.height = h + "px";
      program.uniforms.iResolution.value.set(gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height);
    }
    window.addEventListener("resize", resize);
    resize();

    let targetHover = 0;
    let lastTime = 0;
    let currentRot = 0;
    const rotationSpeed = 0.28;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const w = rect.width, h = rect.height;
      const size = Math.min(w, h);
      const cx = w/2, cy = h/2;
      const ux = ((x - cx) / size) * 2.0;
      const uy = ((y - cy) / size) * 2.0;
      targetHover = Math.sqrt(ux*ux + uy*uy) < 1.15 ? 1 : 0;
    };
    const handleMouseLeave = () => { targetHover = 0; };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    let rafId = 0;
    const update = (t: number) => {
      rafId = requestAnimationFrame(update);
      const dt = (t - lastTime) * 0.001;
      lastTime = t;

      program.uniforms.iTime.value = t * 0.001;
      program.uniforms.hue.value = hue;
      program.uniforms.hoverIntensity.value = hoverIntensity;

      const effectiveHover = forceHoverState ? 1 : targetHover;
      program.uniforms.hover.value += (effectiveHover - program.uniforms.hover.value) * 0.12;

      if (rotateOnHover && effectiveHover > 0.5) currentRot += dt * rotationSpeed;
      program.uniforms.rot.value = currentRot;

      renderer.render({ scene: mesh });
    };
    rafId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeChild(gl.canvas);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [hue, hoverIntensity, rotateOnHover, forceHoverState]);

  return <div ref={ctnDom} className="Orb-container" />;
}
