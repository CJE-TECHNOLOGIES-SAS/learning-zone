import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec3 } from "ogl";

interface OrbProps {
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
}: OrbProps) {
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

    // ---- Color utils (YIQ hue shift) ----
    vec3 rgb2yiq(vec3 c){
      return vec3(
        dot(c, vec3(0.299,0.587,0.114)),
        dot(c, vec3(0.596,-0.274,-0.322)),
        dot(c, vec3(0.211,-0.523,0.312))
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
      return yiq2rgb(vec3(y.x,i,q));
    }

    // ---- SDF helpers ----
    float sdBox(vec2 p, vec2 b){
      vec2 d = abs(p) - b;
      return length(max(d,0.0)) + min(max(d.x,d.y), 0.0);
    }
    float sdRoundedBox(vec2 p, vec2 b, float r){
      vec2 q = abs(p) - (b - vec2(r));
      return length(max(q,0.0)) + min(max(q.x,q.y), 0.0) - r;
    }
    float sdCircle(vec2 p, float r){ return length(p) - r; }
    float sdSegment(vec2 p, vec2 a, vec2 b){
      vec2 pa = p - a, ba = b - a;
      float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0);
      return length(pa - ba*h);
    }
    float sdTriIsosceles(vec2 p, vec2 q){
      p.x = abs(p.x);
      vec2 a = p - q * clamp(dot(p,q)/dot(q,q), 0.0, 1.0);
      vec2 b = p - q * vec2(clamp(p.x/q.x, 0.0, 1.0), 1.0);
      float s = -sign(q.y);
      vec2 d = min(vec2(dot(a,a), s*(p.x*q.y - p.y*q.x)),
                   vec2(dot(b,b), s*(p.y - q.y)));
      return -sqrt(d.x)*sign(d.y);
    }
    vec2 rot2(vec2 p, float a){ float s=sin(a), c=cos(a); return vec2(c*p.x - s*p.y, s*p.x + c*p.y); }
    vec4 premul(vec3 c, float a){ return vec4(c*a, a); }

    // hash simple
    float hash21(vec2 p){
      p = fract(p*vec2(123.34, 345.45));
      p += dot(p, p + 34.345);
      return fract(p.x*p.y);
    }

    // ---- Paleta ----
    const vec3 glassC   = vec3(0.70, 0.85, 1.00);
    const vec3 glassHL  = vec3(0.95, 0.98, 1.00);
    const vec3 liquidA  = vec3(0.20, 0.75, 0.95);
    const vec3 liquidB  = vec3(0.95, 0.55, 0.75);
    const vec3 foamC    = vec3(0.98, 0.99, 1.00);
    const vec3 vaporC   = vec3(0.96, 0.98, 1.00);

    // ---- Figura principal ----
    vec4 drawFlask(vec2 uv){
      // Rotación global + leve warp con hover (modo “ebullición”)
      uv = rot2(uv, rot);
      uv.x += hover * hoverIntensity * 0.05 * sin(uv.y*10.0 + iTime);
      uv.y += hover * hoverIntensity * 0.05 * sin(uv.x*10.0 + iTime);

      vec3 col = vec3(0.0);
      float aScene = 0.0;

      // Geometría del matraz (cuerpo triangular + cuello redondeado)
      // posiciones base
      vec2 bodyOff = vec2(0.0, -0.08);
      vec2 neckC   = vec2(0.0,  0.42);

      // "Outer" y "Inner" para crear borde de vidrio
      float dBodyOuter = sdTriIsosceles(uv - bodyOff, vec2(0.64, 0.70));
      float dNeckOuter = sdRoundedBox(uv - neckC, vec2(0.18, 0.26), 0.12);
      float dOuter = min(dBodyOuter, dNeckOuter);

      float dBodyInner = sdTriIsosceles(uv - bodyOff, vec2(0.56, 0.64));
      float dNeckInner = sdRoundedBox(uv - neckC, vec2(0.12, 0.22), 0.10);
      float dInner = min(dBodyInner, dNeckInner);

      float mOuter = 1.0 - smoothstep(0.0, 0.010, dOuter);
      float mInner = 1.0 - smoothstep(0.0, 0.010, dInner);

      // borde de vidrio = outer - inner
      float mGlass = clamp(mOuter - mInner, 0.0, 1.0);
      vec3 cGlass = adjustHue(glassC, hue) * (0.65 + 0.35*sin(uv.y*3.0 + iTime*0.5));
      col = mix(col, cGlass, mGlass);
      aScene = max(aScene, mGlass);

      // reflejos en vidrio
      float rim = 1.0 - smoothstep(0.03, 0.14, abs(dOuter));
      col = mix(col, glassHL, rim * 0.25);

      // base de mesa (sombra)
      float baseShadow = exp(-20.0 * length(uv - vec2(0.0, -0.58)));
      col -= vec3(0.07) * baseShadow;

      // -------- Líquido ----------
      // nivel con ola + “ebullición” con hover
      float wobble = 0.045*sin(uv.x*8.0 + iTime*1.6);
      float boil   = hover * hoverIntensity * 0.06 * sin(uv.x*15.0 + iTime*3.5);
      float level  = -0.08 + 0.08*sin(iTime*0.6) + wobble + boil;

      // máscara “debajo de la superficie” dentro del matraz
      float below = 1.0 - smoothstep(0.0, 0.008, uv.y - level);
      float mLiquid = mInner * below;

      // color del líquido (interpolado por hue)
      vec3 cA = adjustHue(liquidA, hue);
      vec3 cB = adjustHue(liquidB, hue);
      vec3 cLiq = mix(cA, cB, 0.5 + 0.5*sin(iTime*0.8));
      // gradiente vertical
      cLiq *= 0.85 + 0.15*smoothstep(-0.60, 0.20, uv.y);

      col = mix(col, cLiq, mLiquid);
      aScene = max(aScene, mLiquid);

      // espuma en la superficie
      float foam = 1.0 - smoothstep(0.0, 0.010, abs(uv.y - level)) ;
      foam *= mInner * (0.8 + 0.2*sin(uv.x*20.0 + iTime*2.0));
      col = mix(col, foamC, foam * 0.85);
      aScene = max(aScene, foam * 0.6);

      // -------- Burbujas ascendentes ----------
      float speed = 0.30 + hover * hoverIntensity * 0.55;
      for (int i=0; i<12; i++){
        float fi = float(i);
        // lane x pseudo-aleatorio dentro del cuerpo
        float lane = mix(-0.42, 0.42, fract(sin(fi*34.3)*43758.5453));
        // ciclo vertical 0..1
        float cy = fract(iTime*speed + fi*0.17);
        float y  = mix(-0.48, level - 0.06, cy);
        float r  = 0.018 + 0.010 * fract(sin(fi*12.7)*2345.7);
        vec2  p  = vec2(lane + 0.03*sin(y*25.0 + fi), y);

        // sólo dentro del interior del matraz y bajo el nivel
        float inBottle = mInner * (1.0 - smoothstep(0.0, 0.002, y - level));
        float dB = sdCircle(uv - p, r);
        float mB = (1.0 - smoothstep(0.0, 0.012, dB)) * inBottle;
        vec3 cBub = vec3(1.0) * (0.65 + 0.35*sin(iTime*2.0 + fi));
        col = mix(col, cBub, mB);
        // halo
        col += cBub * exp(-22.0 * abs(dB)) * 0.15 * inBottle;
        aScene = max(aScene, mB*0.9);
      }

      // -------- Vapor desde el cuello ----------
      for (int i=0; i<6; i++){
        float fi = float(i);
        float t  = iTime*0.35 + fi*0.37;
        vec2  p  = neckC + vec2(0.0, 0.08) + vec2(0.12*sin(t*2.0 + fi), 0.30*fract(t));
        float r  = 0.055 + 0.02*sin(t*3.0 + fi);
        float dV = sdCircle(uv - p, r);
        float mV = 1.0 - smoothstep(0.0, 0.018, dV);
        // más vapor con hover
        float boost = 0.5 + hover * hoverIntensity * 0.8;
        vec3 cV = adjustHue(vaporC, hue) * (0.7 + 0.3*sin(t*4.0));
        col = mix(col, cV, mV * 0.55 * boost);
        aScene = max(aScene, mV * 0.45 * boost);
      }

      // brillo en bordes del vidrio (izq-superior)
      vec2 hlP = uv - vec2(-0.22, 0.25);
      float hl = exp(-18.0 * length(hlP));
      col += glassHL * hl * 0.20;

      // etiqueta mínima (línea horizontal como marca de volumen)
      float mark = 1.0 - smoothstep(0.0, 0.010, sdSegment(uv, vec2(-0.30, -0.02), vec2(0.30, -0.02)));
      col = mix(col, adjustHue(glassHL, hue)*0.8, mark * 0.15);

      col = clamp(col, 0.0, 1.0);
      aScene = clamp(aScene, 0.0, 1.0);
      return premul(col, aScene);
    }

    vec4 mainImage(vec2 fragCoord){
      vec2 center = iResolution.xy * 0.5;
      float size  = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;
      return drawFlask(uv);
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
      program.uniforms.iResolution.value.set(
        gl.canvas.width, gl.canvas.height, gl.canvas.width / gl.canvas.height
      );
    }
    window.addEventListener("resize", resize);
    resize();

    let targetHover = 0;
    let lastTime = 0;
    let currentRot = 0;
    const rotationSpeed = 0.26;

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
