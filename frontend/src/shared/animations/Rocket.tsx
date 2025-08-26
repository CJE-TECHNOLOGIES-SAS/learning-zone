import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec3 } from "ogl";

interface RocketProps {
  hue?: number;
  hoverIntensity?: number;
  rotateOnHover?: boolean;
  forceHoverState?: boolean;
}

export default function Rocket({
  hue = 0,
  hoverIntensity = 0.2,
  rotateOnHover = true,
  forceHoverState = false,
}: RocketProps) {
  const ctnDom = useRef<HTMLDivElement>(null);

  const vert = /* glsl */ `
    precision highp float;
    attribute vec2 position;
    attribute vec2 uv;
    varying vec2 vUv;
    void main() {
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
    vec2 rot2(vec2 p, float a){ float s = sin(a), c = cos(a); return vec2(c*p.x - s*p.y, s*p.x + c*p.y); }
    vec4 premul(vec3 c, float a){ return vec4(c*a, a); }

    // ---- paleta ----
    const vec3 bodyMain = vec3(0.85, 0.90, 0.98);
    const vec3 bodyBand = vec3(0.20, 0.55, 0.95);
    const vec3 finCol   = vec3(0.95, 0.28, 0.30);
    const vec3 windowC  = vec3(0.60, 0.85, 1.00);
    const vec3 flameHot = vec3(1.00, 0.75, 0.20);
    const vec3 flameCool= vec3(1.00, 0.40, 0.10);

    // estrellas simples
    float hash21(vec2 p){
      p = fract(p*vec2(123.34, 345.45));
      p += dot(p, p+34.345);
      return fract(p.x*p.y);
    }

    vec4 drawRocket(vec2 uv){
      // rotación global + warp por hover
      uv = rot2(uv, rot);
      uv.x += hover * hoverIntensity * 0.05 * sin(uv.y*10.0 + iTime);
      uv.y += hover * hoverIntensity * 0.05 * sin(uv.x*10.0 + iTime);

      // --- fondo con estrellas ---
      vec3 col = vec3(0.0);
      float aScene = 0.0;
      vec2 grid = floor(uv*vec2(90.0,90.0));
      float rnd = hash21(grid);
      float star = step(0.995, rnd);
      float tw = 0.5 + 0.5*sin(iTime*5.0 + rnd*100.0);
      col += star * tw * 0.35;
      aScene = max(aScene, star * 0.25);

      // --- cohete ---
      // cuerpo principal
      float dBody = sdRoundedBox(uv - vec2(0.0, 0.05), vec2(0.18, 0.42), 0.18);
      // cono superior
      float dNose = sdTriIsosceles(uv - vec2(0.0, 0.40), vec2(0.20, 0.22));
      // tobera inferior
      float dNoz  = sdRoundedBox(uv - vec2(0.0, -0.38), vec2(0.10, 0.05), 0.04);
      // aletas
      float dFinL = sdTriIsosceles((uv - vec2(-0.16, -0.18))*mat2(0.96,0.28,-0.28,0.96), vec2(0.20, 0.16));
      float dFinR = sdTriIsosceles((uv - vec2( 0.16, -0.18))*mat2(0.96,-0.28,0.28,0.96), vec2(0.20, 0.16));
      // unión
      float dHull = min(min(dBody, dNose), dNoz);
      float dUnion = min(dHull, min(dFinL, dFinR));

      float mHull = 1.0 - smoothstep(0.0, 0.012, dHull);
      float mFinL = 1.0 - smoothstep(0.0, 0.012, dFinL);
      float mFinR = 1.0 - smoothstep(0.0, 0.012, dFinR);
      float rim   = 1.0 - smoothstep(0.03, 0.14, abs(dUnion));

      // bandas decorativas
      float mBand1 = 1.0 - smoothstep(0.0, 0.010, sdBox(uv - vec2(0.0, 0.05), vec2(0.18, 0.035)));
      float mBand2 = 1.0 - smoothstep(0.0, 0.010, sdBox(uv - vec2(0.0, -0.10), vec2(0.18, 0.028)));

      // ventana
      float dWin   = sdCircle(uv - vec2(0.0, 0.18), 0.09);
      float mWin   = 1.0 - smoothstep(0.0, 0.010, dWin);
      float mWinRim= 1.0 - smoothstep(0.05, 0.12, abs(dWin));

      // color cuerpo
      vec3 cBody = adjustHue(bodyMain, hue);
      vec3 cBand = adjustHue(bodyBand, hue);
      vec3 cFin  = mix(adjustHue(finCol, hue), cBand, 0.25);

      col = mix(col, cBody, mHull);
      col = mix(col, cFin,  max(mFinL, mFinR));
      col = mix(col, cBand, mBand1 * 0.9);
      col = mix(col, cBand * 0.9, mBand2 * 0.9);
      aScene = max(aScene, max(mHull, max(mFinL, mFinR)));
      col = mix(col, cBody + vec3(0.10), rim * 0.25);

      // ventana brillante
      vec3 cWin = adjustHue(windowC, hue);
      float glint = 0.35 * exp(-18.0 * length(uv - vec2(0.05, 0.23)));
      col = mix(col, cWin * (0.85 + 0.15*sin(iTime*2.0)), mWin);
      col += vec3(1.0) * glint * mWin;
      col = mix(col, cBody*0.85, mWinRim*0.45);
      aScene = max(aScene, mWin);

      // --- llama procedural ---
      float flick = 0.04*sin(iTime*20.0) + 0.03*sin(iTime*13.0);
      vec2 pf = uv - vec2(0.0, -0.42);
      pf.x += 0.05*sin(iTime*7.0 + pf.y*20.0);
      float dFlame = sdTriIsosceles(pf, vec2(0.14 + 0.02*sin(iTime*3.0), -0.35 - flick));
      float mFlame = 1.0 - smoothstep(0.0, 0.010, dFlame);
      float core   = 1.0 - smoothstep(0.0, 0.025, dFlame + 0.04);
      vec3 cFlame  = mix(flameCool, flameHot, core);
      col = mix(col, cFlame, mFlame);
      aScene = max(aScene, mFlame);

      // --- humo en burbujas que suben ---
      for (int i=0; i<5; i++){
        float fi = float(i);
        float t  = iTime*0.6 + fi*0.7;
        vec2  p  = vec2(0.0, -0.58) + vec2(0.22*sin(t+fi), t*0.25);
        float r  = 0.12 + 0.04*sin(t*2.0 + fi);
        float dS = sdCircle(uv - p, r);
        float mS = 1.0 - smoothstep(0.0, 0.018, dS);
        float alphaS = smoothstep(-0.02, 0.18, dS + 0.05) * 0.55;
        vec3 cS = vec3(0.9,0.93,0.98) * (0.8 - 0.2*fi/5.0);
        col = mix(col, cS, mS * alphaS);
        aScene = max(aScene, mS * alphaS);
      }

      // sombra de contacto bajo el cohete
      float contact = exp(-25.0 * length(uv - vec2(0.0, -0.48)));
      col -= vec3(0.08) * contact;

      col = clamp(col, 0.0, 1.0);
      aScene = clamp(aScene, 0.0, 1.0);
      return premul(col, aScene);
    }

    vec4 mainImage(vec2 fragCoord){
      vec2 center = iResolution.xy * 0.5;
      float size  = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;
      return drawRocket(uv);
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

  return <div ref={ctnDom} className="Rocket-container" />;
}
