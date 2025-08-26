import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec3 } from "ogl";

interface FrascoProps {
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
}: FrascoProps) {
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
    uniform vec3 iResolution;
    uniform float hue;
    uniform float hover;
    uniform float rot;
    uniform float hoverIntensity;
    varying vec2 vUv;

    // --------- Color utils (YIQ hue shift) ----------
    vec3 rgb2yiq(vec3 c){
      float y = dot(c, vec3(0.299, 0.587, 0.114));
      float i = dot(c, vec3(0.596, -0.274, -0.322));
      float q = dot(c, vec3(0.211, -0.523, 0.312));
      return vec3(y,i,q);
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

    // --------- SDF helpers ----------
    float sdRoundedBox(vec2 p, vec2 b, float r){
      vec2 q = abs(p) - (b - vec2(r));
      return length(max(q,0.0)) + min(max(q.x,q.y),0.0) - r;
    }
    float sdCircle(vec2 p, float r){ return length(p) - r; }

    vec2 rotate2(vec2 p, float a){
      float s = sin(a), c = cos(a);
      return vec2(c*p.x - s*p.y, s*p.x + c*p.y);
    }

    vec4 premul(vec3 c, float a){ return vec4(c*a, a); }

    // --------- Paleta base ----------
    const vec3 glassHi  = vec3(0.90, 0.96, 1.00);
    const vec3 glassLo  = vec3(0.75, 0.86, 0.98);
    const vec3 liquid0  = vec3(0.18, 0.75, 0.95);
    const vec3 bubbleHi = vec3(1.0, 1.0, 1.0);

    // Warp para ensanchar hacia abajo (simula paredes del Erlenmeyer)
    vec2 widenDown(vec2 p, float amount){
      // p.y ~ [-1,1]; solo ensancha por debajo del centro
      float t = clamp(-p.y, 0.0, 1.0);         // 0 arriba, 1 abajo
      float s = 1.0 + amount * t;              // escala X creciente hacia abajo
      return vec2(p.x * s, p.y);
    }

    // SDF de frasco (cuerpo + cuello) aproximado por intersección de cajas redondeadas con warp
    float sdfFlaskOuter(vec2 uv){
      vec2 p = uv / 0.92;               // escala global
      vec2 pw = widenDown(p, 0.65);     // ensancha base
      float dBody = sdRoundedBox(pw + vec2(0.0, 0.05), vec2(0.36, 0.62), 0.14);
      float dNeck = sdRoundedBox(p - vec2(0.0, 0.52), vec2(0.12, 0.18), 0.07);
      float dLip  = sdRoundedBox(p - vec2(0.0, 0.72), vec2(0.18, 0.06), 0.05); // boquilla
      // Unión de cuerpo y cuello + boquilla
      float d = min(min(dBody, dNeck), dLip);
      return d;
    }

    vec4 drawFlask(vec2 uv){
      // Rotación global (sutil con hover)
      float s = sin(rot), c = cos(rot);
      uv = vec2(c*uv.x - s*uv.y, s*uv.x + c*uv.y);

      // Hover warp (ligero)
      uv.x += hover * hoverIntensity * 0.05 * sin(uv.y*10.0 + iTime);
      uv.y += hover * hoverIntensity * 0.05 * sin(uv.x*10.0 + iTime);

      // Distancia a contorno del frasco
      float dOut = sdfFlaskOuter(uv);

      // "Interior" desplazando el contorno hacia adentro (pared de vidrio)
      float wall = 0.035;
      float dInner = dOut + wall;

      // Máscaras
      float aFlask = 1.0 - smoothstep(0.0, 0.012, dOut);           // silueta
      float rim    = 1.0 - smoothstep(0.025, 0.12, abs(dOut));     // brillo perimetral
      float inside = 1.0 - smoothstep(-0.002, 0.002, dInner);      // interior geométrico

      // Superficie del líquido (olas)
      float level = -0.12 + 0.03*sin(iTime*0.7);
      float wave  = 0.03*sin(uv.x*18.0 + iTime*1.4) * smoothstep(-1.0, 0.3, -uv.y); // más olas abajo
      float surfY = level + wave;

      float isBelow = smoothstep(0.0, 0.002, surfY - uv.y);        // 1 si uv.y por debajo de la superficie
      float liquidMask = inside * isBelow;

      // Colores
      vec3 cGlass = mix(glassLo, glassHi, 0.6);
      cGlass = adjustHue(cGlass, hue);
      vec3 cLiquid = adjustHue(liquid0, hue);

      // Color base: leve gradiente vertical del vidrio
      float gy = clamp((uv.y + 1.0)*0.5, 0.0, 1.0);
      vec3 col = mix(cGlass*0.85, cGlass, gy);

      // Sombras internas del vidrio (falso fresnel)
      float fres = pow(1.0 - clamp(length(uv)*0.6, 0.0, 1.0), 2.0);
      col += vec3(0.04) * fres * inside;

      // Líquido
      col = mix(col, cLiquid, liquidMask * 0.95);

      // Frontera de la superficie (espuma sutil)
      float foam = inside * (1.0 - smoothstep(0.006, 0.02, abs(uv.y - surfY)));
      col += vec3(0.05) * foam;

      // Burbujas que suben (3 burbujas)
      for (int i=0; i<3; i++){
        float fi = float(i);
        // posiciones pseudo-aleatorias
        float bx = -0.20 + fi*0.18 + 0.06*sin(iTime*(1.3+fi*0.2) + fi*2.0);
        float speed = 0.25 + fi*0.05;
        float by = -0.62 + mod(iTime*speed + fi*0.33, 1.2); // ascienden y reaparecen
        vec2  bp = vec2(bx, by);
        float r  = 0.025 + 0.01*sin(iTime*1.7 + fi);
        float bubble = 1.0 - smoothstep(0.0, 0.008, sdCircle(uv - bp, r));
        // Sólo visibles dentro del líquido y por debajo de la superficie
        float visible = liquidMask * (1.0 - smoothstep(-0.002, 0.002, (uv.y - surfY)));
        col = mix(col, bubbleHi, bubble * 0.7 * visible);
        // halo suave
        col += vec3(0.03) * exp(-20.0 * length(uv - bp)) * visible;
      }

      // Brillo perimetral del vidrio
      col = mix(col, cGlass + vec3(0.08), rim * 0.35);

      // Alpha: combinamos silueta + contenido
      float alpha = clamp(aFlask, 0.0, 1.0);
      return premul(clamp(col, 0.0, 1.0), alpha);
    }

    vec4 mainImage(vec2 fragCoord){
      vec2 center = iResolution.xy * 0.5;
      float size = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;
      return drawFlask(uv);
    }

    void main(){
      vec2 fragCoord = vUv * iResolution.xy;
      vec4 col = mainImage(fragCoord);
      gl_FragColor = col;
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
    const rotationSpeed = 0.25;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const w = rect.width;
      const h = rect.height;
      const size = Math.min(w, h);
      const cx = w / 2, cy = h / 2;
      const uvX = ((x - cx) / size) * 2.0;
      const uvY = ((y - cy) / size) * 2.0;
      targetHover = Math.sqrt(uvX*uvX + uvY*uvY) < 1.15 ? 1 : 0;
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

  return <div ref={ctnDom} className="Fastro-container" />;
}
