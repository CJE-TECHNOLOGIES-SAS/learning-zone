import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec3 } from "ogl";

interface DiplomaProps {
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
}: DiplomaProps) {
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
    uniform vec3 iResolution;
    uniform float hue;
    uniform float hover;
    uniform float rot;
    uniform float hoverIntensity;
    varying vec2 vUv;

    // ---------- Utils de color (hue shift YIQ) ----------
    vec3 rgb2yiq(vec3 c){
      float y = dot(c, vec3(0.299, 0.587, 0.114));
      float i = dot(c, vec3(0.596, -0.274, -0.322));
      float q = dot(c, vec3(0.211, -0.523, 0.312));
      return vec3(y, i, q);
    }
    vec3 yiq2rgb(vec3 c){
      float r = c.x + 0.956*c.y + 0.621*c.z;
      float g = c.x - 0.272*c.y - 0.647*c.z;
      float b = c.x - 1.106*c.y + 1.703*c.z;
      return vec3(r,g,b);
    }
    vec3 adjustHue(vec3 color, float hueDeg){
      float a = radians(hueDeg);
      vec3 y = rgb2yiq(color);
      float c = cos(a), s = sin(a);
      float i = y.y*c - y.z*s;
      float q = y.y*s + y.z*c;
      return yiq2rgb(vec3(y.x, i, q));
    }

    // ---------- SDF helpers ----------
    float sdBox(vec2 p, vec2 b){
      vec2 d = abs(p) - b;
      return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
    }
    float sdRoundedBox(vec2 p, vec2 b, float r){
      vec2 q = abs(p) - (b - vec2(r));
      return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
    }
    float sdCircle(vec2 p, float r){ return length(p) - r; }

    // Distancia a segmento (para la cuerda de la borla)
    float sdSegment(vec2 p, vec2 a, vec2 b){
      vec2 pa = p - a, ba = b - a;
      float h = clamp(dot(pa, ba)/dot(ba, ba), 0.0, 1.0);
      return length(pa - ba*h);
    }

    // Triángulo isósceles (para la cinta del diploma)
    float sdTriIsosceles(vec2 p, vec2 q){
      p.x = abs(p.x);
      vec2 a = p - q * clamp(dot(p, q) / dot(q, q), 0.0, 1.0);
      vec2 b = p - q * vec2(clamp(p.x / q.x, 0.0, 1.0), 1.0);
      float s = -sign(q.y);
      vec2 d = min(vec2(dot(a,a), s*(p.x*q.y - p.y*q.x)),
                   vec2(dot(b,b), s*(p.y - q.y)));
      return -sqrt(d.x) * sign(d.y);
    }

    vec2 rotate2(vec2 p, float a){
      float s = sin(a), c = cos(a);
      return vec2(c*p.x - s*p.y, s*p.x + c*p.y);
    }

    vec4 premul(vec3 c, float a){ return vec4(c*a, a); }

    // ---------- Paleta base ----------
    const vec3 base1 = vec3(0.12, 0.16, 0.30);  // azul profundo para birrete
    const vec3 base2 = vec3(0.06, 0.09, 0.20);  // banda más oscura
    const vec3 base3 = vec3(0.97, 0.98, 0.995); // papel diploma
    const vec3 tasselGold = vec3(1.00, 0.85, 0.35);
    const vec3 ribbonRed  = vec3(0.90, 0.20, 0.30);

    // ---------- Dibujo del BIRRETE ----------
    vec4 drawCap(vec2 uv, float hue){
      // Mortero: un cuadrado rotado 45° y centrado un poco arriba
      float topAngle = 0.785398; // 45°
      vec2 topCenter = vec2(0.0, 0.12);
      vec2 q = rotate2(uv - topCenter, topAngle);

      float topSize = 0.42; // semi-extensión del cuadrado
      float dTop = sdRoundedBox(q, vec2(topSize), 0.04);

      // Banda (headband) debajo
      vec2 bandCenter = vec2(0.0, -0.12);
      float dBand = sdRoundedBox(uv - bandCenter, vec2(0.55, 0.12), 0.10);

      // Botón (centro del mortero)
      float dButton = sdCircle(uv - topCenter, 0.05);

      // Punto de anclaje de la borla: borde derecho del cuadrado rotado
      // Tomamos (topSize, 0) en coords del cuadrado y lo llevamos a uv:
      vec2 tasselPivot = rotate2(vec2(topSize, 0.0), -topAngle) + topCenter;

      // Animación de oscilación de la borla (más hover = más swing)
      float swing = 0.35 * sin(iTime * 1.4) + hover * 0.25 * sin(iTime * 3.0);
      float len = 0.55;
      vec2 tasselEnd = tasselPivot + rotate2(vec2(0.0, -len), swing);

      // Cuerda como segmento
      float dCord = sdSegment(uv, tasselPivot, tasselEnd) - 0.015;

      // Pompón al final (pequeño círculo)
      float dPom = sdCircle(uv - tasselEnd, 0.05);

      // Colores con hue aplicado a los azules
      vec3 cTop   = adjustHue(base1, hue);
      vec3 cBand  = adjustHue(base2, hue);
      vec3 cPaper = base3; // sin hue para mantener blanco papel
      vec3 cGold  = tasselGold;

      // Masks
      float aTop   = 1.0 - smoothstep(0.0, 0.01, dTop);
      float aBand  = 1.0 - smoothstep(0.0, 0.01, dBand);
      float aBtn   = 1.0 - smoothstep(0.0, 0.01, dButton);
      float aCord  = 1.0 - smoothstep(0.0, 0.008, dCord);
      float aPom   = 1.0 - smoothstep(0.0, 0.01, dPom);

      // Rim sutil en el mortero
      float rimTop = 1.0 - smoothstep(0.03, 0.14, abs(dTop));
      float rimBand= 1.0 - smoothstep(0.03, 0.14, abs(dBand));

      vec3 col = vec3(0.0);
      float a  = 0.0;

      // mortero
      col = mix(col, cTop, aTop);
      a   = max(a, aTop);
      col = mix(col, cTop + vec3(0.08), rimTop * 0.25);

      // banda
      col = mix(col, cBand, aBand);
      a   = max(a, aBand);
      col = mix(col, cBand + vec3(0.05), rimBand * 0.20);

      // botón
      col = mix(col, cTop + vec3(0.15), aBtn);
      a   = max(a, aBtn);

      // borla
      col = mix(col, cGold, aCord);
      a   = max(a, aCord);
      col = mix(col, cGold + vec3(0.1), aPom);
      a   = max(a, aPom);

      return premul(clamp(col, 0.0, 1.0), clamp(a, 0.0, 1.0));
    }

    // ---------- Dibujo del DIPLOMA ----------
    vec4 drawDiploma(vec2 uv){
      // Centro abajo a la derecha
      vec2 center = vec2(0.35, -0.35);
      vec2 p = uv - center;

      float dBody = sdRoundedBox(p, vec2(0.52, 0.12), 0.12);
      float aBody = 1.0 - smoothstep(0.0, 0.01, dBody);

      // Cinta (banda vertical)
      float dBand = sdRoundedBox(p, vec2(0.07, 0.13), 0.06);
      float aBand = 1.0 - smoothstep(0.0, 0.01, dBand);

      // Lazos de la cinta (dos triángulos hacia abajo)
      float dTieL = sdTriIsosceles((p - vec2(-0.05, -0.12)) * vec2(1.0, 1.2), vec2(0.09, 0.16));
      float dTieR = sdTriIsosceles((p - vec2( 0.05, -0.12)) * vec2(1.0, 1.2), vec2(0.09, 0.16));
      float aTieL = 1.0 - smoothstep(0.0, 0.01, dTieL);
      float aTieR = 1.0 - smoothstep(0.0, 0.01, dTieR);

      // “Sombras” circulares en los extremos para sugerir rollo
      float endShadeL = 1.0 - smoothstep(0.10, 0.38, length(p + vec2(0.50, 0.0)));
      float endShadeR = 1.0 - smoothstep(0.10, 0.38, length(p - vec2(0.50, 0.0)));

      vec3 col = vec3(0.0);
      float a  = 0.0;

      // papel
      col = mix(col, base3, aBody);
      a   = max(a, aBody);
      col -= (endShadeL + endShadeR) * 0.08;

      // cinta
      col = mix(col, ribbonRed, aBand);
      a   = max(a, aBand);

      // lazos
      col = mix(col, ribbonRed * 0.95, aTieL);
      a   = max(a, aTieL);
      col = mix(col, ribbonRed * 0.95, aTieR);
      a   = max(a, aTieR);

      // borde suave del diploma
      float rim = 1.0 - smoothstep(0.03, 0.12, abs(dBody));
      col = mix(col, vec3(0.9,0.93,0.98), rim * 0.25);

      return premul(clamp(col, 0.0, 1.0), clamp(a, 0.0, 1.0));
    }

    vec4 mainImage(vec2 fragCoord) {
      vec2 center = iResolution.xy * 0.5;
      float size = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;

      // Rotación global sutil activada por hover
      float s = sin(rot), c = cos(rot);
      uv = vec2(c * uv.x - s * uv.y, s * uv.x + c * uv.y);

      // Hover warp sutil
      uv.x += hover * hoverIntensity * 0.06 * sin(uv.y * 10.0 + iTime);
      uv.y += hover * hoverIntensity * 0.06 * sin(uv.x * 10.0 + iTime);

      // Dibujo: primero diploma, luego birrete encima
      vec4 diploma = drawDiploma(uv);
      vec4 cap     = drawCap(uv, hue);

      // Composición premultiplicada
      vec4 outCol = diploma + cap * (1.0 - diploma.a);
      return outCol;
    }

    void main() {
      vec2 fragCoord = vUv * iResolution.xy;
      vec4 col = mainImage(fragCoord);
      gl_FragColor = col; // premultiplied
    }
  `;

  useEffect(() => {
    const container = ctnDom.current;
    if (!container) return;

    const renderer = new Renderer({ alpha: true, premultipliedAlpha: false });
    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    container.appendChild(gl.canvas);

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: vert,
      fragment: frag,
      uniforms: {
        iTime: { value: 0 },
        iResolution: {
          value: new Vec3(
            gl.canvas.width,
            gl.canvas.height,
            gl.canvas.width / gl.canvas.height
          ),
        },
        hue: { value: hue },
        hover: { value: 0 },
        rot: { value: 0 },
        hoverIntensity: { value: hoverIntensity },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });

    function resize() {
      if (!container) return;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = container.clientWidth;
      const height = container.clientHeight;
      renderer.setSize(width * dpr, height * dpr);
      gl.canvas.style.width = width + "px";
      gl.canvas.style.height = height + "px";
      program.uniforms.iResolution.value.set(
        gl.canvas.width,
        gl.canvas.height,
        gl.canvas.width / gl.canvas.height
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
      const width = rect.width;
      const height = rect.height;
      const size = Math.min(width, height);
      const centerX = width / 2;
      const centerY = height / 2;
      const uvX = ((x - centerX) / size) * 2.0;
      const uvY = ((y - centerY) / size) * 2.0;
      targetHover = Math.sqrt(uvX * uvX + uvY * uvY) < 1.15 ? 1 : 0;
    };

    const handleMouseLeave = () => { targetHover = 0; };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    let rafId: number;
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

  return <div ref={ctnDom} className="Diploma-container" />;
}
