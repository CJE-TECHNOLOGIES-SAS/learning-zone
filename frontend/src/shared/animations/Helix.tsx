import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec3 } from "ogl";

interface HelixProps {
  hue?: number;
  hoverIntensity?: number;
  rotateOnHover?: boolean;
  forceHoverState?: boolean;
}

export default function Helix({
  hue = 0,
  hoverIntensity = 0.2,
  rotateOnHover = true,
  forceHoverState = false,
}: HelixProps) {
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
      return yiq2rgb(vec3(y.x,i,q));
    }

    // ---- SDF helpers ----
    float sdSegment(vec2 p, vec2 a, vec2 b){
      vec2 pa = p - a, ba = b - a;
      float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0);
      return length(pa - ba*h);
    }
    float sdCircle(vec2 p, float r){ return length(p) - r; }
    vec2  rot2(vec2 p, float a){ float s = sin(a), c = cos(a); return vec2(c*p.x - s*p.y, s*p.x + c*p.y); }
    vec4  premul(vec3 c, float a){ return vec4(c*a, a); }

    // ---- paleta base ----
    const vec3 strandA = vec3(0.28, 0.74, 0.96); // backbone 1
    const vec3 strandB = vec3(0.92, 0.56, 1.00); // backbone 2
    const vec3 rungCol = vec3(0.98, 0.95, 0.75); // pares de bases

    // distancia "gaussiana" a curva x = A*sin(k*y + ph)
    float strandMask(vec2 uv, float A, float k, float ph, float thick){
      float dx = uv.x - A * sin(k*uv.y + ph);
      float m = exp(- (dx*dx) / (thick*thick)); // pico fino sin aliasing
      // limitar a banda vertical [-H, H]
      float H = 0.88;
      float v = smoothstep(-H, -H+0.05, uv.y) * (1.0 - smoothstep(H-0.05, H, uv.y));
      return m * v;
    }

    vec4 drawDNA(vec2 uv){
      // Rotación global + deformación por hover
      uv = rot2(uv, rot);
      uv.x += hover * hoverIntensity * 0.05 * sin(uv.y * 10.0 + iTime);
      uv.y += hover * hoverIntensity * 0.05 * sin(uv.x * 10.0 + iTime);

      // parámetros de la hélice
      float A = 0.42;        // amplitud (separación)
      float k = 8.0;         // vueltas por alto
      float ph = iTime * 0.8;

      // grosor visual
      float thick = 0.05;

      // máscaras de cada hebra
      float m1 = strandMask(uv,  A, k, ph,        thick);
      float m2 = strandMask(uv, -A, k, ph + 3.14159265, thick); // desplazar pi para la opuesta

      // “profundidad” fake: usa cos para saber parte frontal/trasera
      float depth1 = 0.5 + 0.5 * cos(k*uv.y + ph);
      float depth2 = 0.5 + 0.5 * cos(k*uv.y + ph + 3.14159265);

      vec3 c1 = adjustHue(strandA, hue) * (0.65 + 0.35*depth1);
      vec3 c2 = adjustHue(strandB, hue) * (0.65 + 0.35*depth2);

      // color base
      vec3 col = vec3(0.0);
      float a  = 0.0;

      // backbones
      col += c1 * m1;
      col += c2 * m2;
      a   = max(a, max(m1, m2));

      // halo sutil alrededor de cada hebra
      float halo1 = exp(-12.0 * abs(uv.x -  A * sin(k*uv.y + ph))) * 0.12;
      float halo2 = exp(-12.0 * abs(uv.x - -A * sin(k*uv.y + ph + 3.14159265))) * 0.12;
      col += (c1 + c2) * (halo1 + halo2);

      // --- “escalones” (pares de bases) como segmentos horizontales que ascienden ---
      float step = 0.22;                  // distancia entre escalones
      float yOff = fract(iTime * 0.18) * step; // scroll suave hacia arriba
      // calcula y más cercano al píxel
      float n = round((uv.y - (-0.88 + yOff)) / step);
      float yLine = -0.88 + yOff + n * step;

      // extremos del escalón = posiciones de cada hebra en yLine
      float xL =  A * sin(k*yLine + ph);
      float xR = -A * sin(k*yLine + ph + 3.14159265);

      // ulimit para que el escalón no exceda las hebras
      vec2 pA = vec2(xL, yLine);
      vec2 pB = vec2(xR, yLine);

      // distancia del píxel a ese segmento
      float dRung = sdSegment(uv, pA, pB);
      float rung = 1.0 - smoothstep(0.010, 0.018, dRung);

      // fade por “profundidad”: si ambas hebras están “atrás”, atenúa
      float rungDepth = 0.5 + 0.5 * cos(k*yLine + ph);
      float rungMask = rung * smoothstep(-0.9, 0.9, yLine);
      vec3  rungColor = adjustHue(rungCol, hue) * (0.7 + 0.3*rungDepth);

      col = mix(col, rungColor, rungMask * 0.85);
      a   = max(a, rungMask * 0.8);

      // tapas/redondeo de extremos (pequeños discos)
      float capL = 1.0 - smoothstep(0.0, 0.012, sdCircle(uv - pA, 0.02));
      float capR = 1.0 - smoothstep(0.0, 0.012, sdCircle(uv - pB, 0.02));
      col = mix(col, rungColor*0.95, max(capL, capR));
      a   = max(a, max(capL, capR));

      // clamp & premul
      col = clamp(col, 0.0, 1.0);
      a   = clamp(a, 0.0, 1.0);
      return premul(col, a);
    }

    vec4 mainImage(vec2 fragCoord){
      vec2 center = iResolution.xy * 0.5;
      float size  = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;
      return drawDNA(uv);
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
