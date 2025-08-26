import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec3 } from "ogl";

interface TasselProps {
  hue?: number;
  hoverIntensity?: number;
  rotateOnHover?: boolean;
  forceHoverState?: boolean;
}

export default function Tassel({
  hue = 0,
  hoverIntensity = 0.2,
  rotateOnHover = true,
  forceHoverState = false,
}: TasselProps) {
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

    // --- utils color (YIQ hue shift) ---
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

    // --- SDF helpers ---
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
    vec2 rot2(vec2 p, float a){ float s = sin(a), c = cos(a); return vec2(c*p.x - s*p.y, s*p.x + c*p.y); }
    vec4 premul(vec3 c, float a){ return vec4(c*a, a); }

    // --- paleta base ---
    const vec3 capTop    = vec3(0.12, 0.16, 0.24);
    const vec3 capBand   = vec3(0.08, 0.11, 0.18);
    const vec3 tasselCol = vec3(0.98, 0.82, 0.20);
    const vec3 glowCol   = vec3(0.60, 0.85, 1.00);

    vec4 drawCap(vec2 uv){
      // Rotación global + warp por hover
      uv = rot2(uv, rot);
      uv.x += hover * hoverIntensity * 0.05 * sin(uv.y*10.0 + iTime);
      uv.y += hover * hoverIntensity * 0.05 * sin(uv.x*10.0 + iTime);

      // --- tablero (cuadrado rotado 45°) ---
      vec2 topC = vec2(0.0, 0.22);
      float topSize = 0.44;          // semilado del cuadrado
      vec2 q = rot2(uv - topC, -0.78539816339); // -45°
      float dTop = sdBox(q, vec2(topSize, topSize));
      float mTop = 1.0 - smoothstep(0.0, 0.010, dTop);
      float rimTop = 1.0 - smoothstep(0.03, 0.14, abs(dTop));

      // sombreado direccional para el tablero
      vec3 cTop = adjustHue(capTop, hue);
      vec3 cBand = adjustHue(capBand, hue);
      vec3 cTassel = adjustHue(tasselCol, hue);

      vec3 col = vec3(0.0);
      float a  = 0.0;

      // luz simple
      vec3 L = normalize(vec3(0.6, 0.4, 0.7));
      vec3 nFake = normalize(vec3(uv.x - topC.x, uv.y - topC.y, 0.6));
      float ndl = clamp(dot(nFake, L), 0.0, 1.0);
      vec3 topShaded = cTop * (0.55 + 0.45*ndl);

      col = mix(col, topShaded, mTop);
      col = mix(col, cTop + vec3(0.10), rimTop * 0.30);
      a   = max(a, mTop);

      // --- banda (gorro) bajo el tablero ---
      float dBand = sdRoundedBox(uv - vec2(0.0, -0.02), vec2(0.26, 0.10), 0.08);
      float mBand = 1.0 - smoothstep(0.0, 0.010, dBand);
      float rimBand = 1.0 - smoothstep(0.03, 0.14, abs(dBand));
      col = mix(col, cBand, mBand);
      col = mix(col, cBand + vec3(0.05), rimBand * 0.25);
      a   = max(a, mBand);

      // --- pivote de la borla (botón) sobre el tablero ---
      vec2 pivot = topC + vec2(0.32, 0.00); // aprox. esquina derecha del rombo
      float dBtn = sdCircle(uv - pivot, 0.035);
      float mBtn = 1.0 - smoothstep(0.0, 0.010, dBtn);
      col = mix(col, cTop*0.9 + vec3(0.05), mBtn);
      a   = max(a, mBtn);

      // --- borla: péndulo animado ---
      float swing = 0.35*sin(iTime*1.5) + hover*hoverIntensity*0.60*sin(iTime*3.0);
      float len   = 0.34;
      vec2  end   = pivot + rot2(vec2(0.0, -len), swing);

      // cordón
      float dCord = sdSegment(uv, pivot, end);
      float mCord = 1.0 - smoothstep(0.008, 0.015, dCord);
      col = mix(col, cTassel*0.85, mCord);
      a   = max(a, mCord);

      // cabeza de la borla
      float dHead = sdCircle(uv - end, 0.045);
      float mHead = 1.0 - smoothstep(0.0, 0.012, dHead);
      col = mix(col, cTassel, mHead);
      a   = max(a, mHead);

      // flecos de la borla (tres segmentos)
      for (int i=0; i<3; i++){
        float fi = float(i) - 1.0;
        vec2 dir = rot2(vec2(0.0, -0.10), swing + fi*0.18);
        float dF = sdSegment(uv, end, end + dir);
        float mF = 1.0 - smoothstep(0.008, 0.016, dF);
        col = mix(col, cTassel*0.95, mF);
        a   = max(a, mF);
      }

      // glow sutil superior (ambiente académico 😄)
      float g = exp(-8.0 * length(uv - (topC + vec2(-0.10, 0.38))));
      col += adjustHue(glowCol, hue) * g * 0.15;

      col = clamp(col, 0.0, 1.0);
      a   = clamp(a, 0.0, 1.0);
      return premul(col, a);
    }

    vec4 mainImage(vec2 fragCoord){
      vec2 center = iResolution.xy * 0.5;
      float size  = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;
      return drawCap(uv);
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
