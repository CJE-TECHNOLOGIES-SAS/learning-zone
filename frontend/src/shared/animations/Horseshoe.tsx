import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec3 } from "ogl";

interface HorseProps {
  hue?: number;
  hoverIntensity?: number;
  rotateOnHover?: boolean;
  forceHoverState?: boolean;
}

export default function Horse({
  hue = 0,
  hoverIntensity = 0.2,
  rotateOnHover = true,
  forceHoverState = false,
}: HorseProps) {
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

    // ---- helpers color (YIQ hue shift) ----
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

    // ---- paleta ----
    const vec3 redN   = vec3(0.92, 0.18, 0.22);
    const vec3 blueS  = vec3(0.18, 0.38, 0.95);
    const vec3 metal  = vec3(0.78, 0.82, 0.88);
    const vec3 fieldC = vec3(0.95, 0.98, 1.0);

    // patrón de líneas de campo usando diferencia de ángulos a dos polos
    float fieldLines(vec2 p, vec2 A, vec2 B, float density, float thickness){
      float a1 = atan(p.y - A.y, p.x - A.x);
      float a2 = atan(p.y - B.y, p.x - B.x);
      float phi = a1 - a2; // ortogonal a equipotenciales del dipolo
      float s = sin(phi * density);
      return 1.0 - smoothstep(thickness, thickness*2.0, abs(s));
    }

    // pequeñas “limaduras” como puntos cerca de líneas de campo
    float filings(vec2 p, vec2 A, vec2 B){
      // grid aleatorio simple
      vec2 g = floor(p * 90.0);
      float r = fract(sin(dot(g, vec2(127.1, 311.7))) * 43758.5453);
      // desplazamiento en el tiempo (se “alinean” lentamente)
      float t = iTime*0.3;
      float dA = length(p - A), dB = length(p - B);
      float vis = smoothstep(1.8, 0.35, dA + dB); // concentradas entre polos
      // distribuye puntitos
      float blink = step(0.985, fract(r + t));
      return blink * vis * 0.7;
    }

    vec4 drawMagnet(vec2 uv){
      // rotación global + warp por hover
      uv = rot2(uv, rot);
      uv.x += hover * hoverIntensity * 0.05 * sin(uv.y*10.0 + iTime);
      uv.y += hover * hoverIntensity * 0.05 * sin(uv.x*10.0 + iTime);

      // --- geometría del imán en U (outer - inner) ---
      // piernas
      float dL  = sdRoundedBox(uv - vec2(-0.35, 0.20), vec2(0.14, 0.58), 0.16);
      float dR  = sdRoundedBox(uv - vec2( 0.35, 0.20), vec2(0.14, 0.58), 0.16);
      // puente superior
      float dTop= sdRoundedBox(uv - vec2(0.0, 0.58), vec2(0.49, 0.14), 0.16);
      float dOuter = min(min(dL, dR), dTop);

      // hueco interior para formar la U
      float diL  = sdRoundedBox(uv - vec2(-0.35, 0.18), vec2(0.06, 0.50), 0.10);
      float diR  = sdRoundedBox(uv - vec2( 0.35, 0.18), vec2(0.06, 0.50), 0.10);
      float diTop= sdRoundedBox(uv - vec2(0.0, 0.44), vec2(0.35, 0.08), 0.10);
      float dInner = min(min(diL, diR), diTop);

      // frame U: exterior menos interior
      float dU = max(dOuter, -dInner);
      float mU = 1.0 - smoothstep(0.0, 0.012, dU);
      float rim = 1.0 - smoothstep(0.03, 0.14, abs(dU));

      // polos (tapas metálicas)
      float aCapL = 1.0 - smoothstep(0.0, 0.010, sdRoundedBox(uv - vec2(-0.35, -0.40), vec2(0.14, 0.06), 0.05));
      float aCapR = 1.0 - smoothstep(0.0, 0.010, sdRoundedBox(uv - vec2( 0.35, -0.40), vec2(0.14, 0.06), 0.05));

      // colores base (aplico hue suavemente a los metales/acentos, no a los rojos/azules clásicos)
      vec3 cMetal = adjustHue(metal, hue * 0.5);
      vec3 cField = adjustHue(fieldC, hue);

      vec3 col = vec3(0.0);
      float a  = 0.0;

      // color de cada pierna: izquierda N (roja), derecha S (azul)
      // máscaras por lado (compara x con centro de cada pierna)
      float leftMask  = 1.0 - smoothstep(0.06, 0.12, abs(uv.x + 0.35));
      float rightMask = 1.0 - smoothstep(0.06, 0.12, abs(uv.x - 0.35));

      vec3 cLeft  = redN;
      vec3 cRight = blueS;

      // cuerpo U
      vec3 cU = mix(cRight, cLeft, step(0.0, -uv.x)); // aproximación por lado
      // mejor: mezclar por cercanía a cada pierna
      float wL = 1.0 / (0.0001 + length(uv - vec2(-0.35, clamp(uv.y, -0.35, 0.80))));
      float wR = 1.0 / (0.0001 + length(uv - vec2( 0.35, clamp(uv.y, -0.35, 0.80))));
      cU = normalize(vec3(wL, wR, 0.0));
      cU = mix(cRight, cLeft, wL/(wL + wR));

      col = mix(col, cU, mU);
      a   = max(a, mU);
      col = mix(col, cMetal, rim * 0.18);

      // tapas metálicas
      col = mix(col, cMetal*0.95, aCapL);
      a   = max(a, aCapL);
      col = mix(col, cMetal*0.95, aCapR);
      a   = max(a, aCapR);

      // placas de color sobre las tapas (finas)
      float aPlateL = 1.0 - smoothstep(0.0, 0.010, sdRoundedBox(uv - vec2(-0.35, -0.33), vec2(0.14, 0.035), 0.03));
      float aPlateR = 1.0 - smoothstep(0.0, 0.010, sdRoundedBox(uv - vec2( 0.35, -0.33), vec2(0.14, 0.035), 0.03));
      col = mix(col, redN,  aPlateL);
      a   = max(a, aPlateL);
      col = mix(col, blueS, aPlateR);
      a   = max(a, aPlateR);

      // --- líneas de campo ---
      vec2 poleN = vec2(-0.35, -0.38);
      vec2 poleS = vec2( 0.35, -0.38);

      float density = 16.0;                                  // cuántas líneas
      float thickness = 0.08 - 0.03*hover*hoverIntensity;    // más delgadas al hacer hover
      float lines = fieldLines(uv, poleN, poleS, density, thickness);

      // visibilidad concentrada entre polos
      float vis = smoothstep(1.8, 0.35, length(uv - poleN) + length(uv - poleS));
      vec3 lineCol = cField * (0.55 + 0.45*sin(uv.y*9.0 + iTime*0.8));
      col = mix(col, lineCol, lines * vis * 0.85);
      a   = max(a, lines * vis * 0.75);

      // limaduras (puntitos) animadas
      float dust = filings(uv, poleN, poleS);
      col = mix(col, cField*0.9, dust);
      a   = max(a, dust*0.8);

      // pequeño glow cerca de polos
      col += redN  * exp(-18.0 * length(uv - poleN)) * 0.25;
      col += blueS * exp(-18.0 * length(uv - poleS)) * 0.25;

      col = clamp(col, 0.0, 1.0);
      a   = clamp(a,   0.0, 1.0);
      return premul(col, a);
    }

    vec4 mainImage(vec2 fragCoord){
      vec2 center = iResolution.xy * 0.5;
      float size  = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;
      return drawMagnet(uv);
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

  return <div ref={ctnDom} className="Horse-container" />;
}
