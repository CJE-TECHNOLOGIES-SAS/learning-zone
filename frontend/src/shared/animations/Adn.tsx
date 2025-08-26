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

    // ---- utils color (YIQ hue shift) ----
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
      return yiq2rgb(vec3(y.x, i, q));
    }

    // ---- helpers ----
    float sdCircle(vec2 p, float r){ return length(p) - r; }
    float sdBox(vec2 p, vec2 b){
      vec2 d = abs(p) - b;
      return length(max(d,0.0)) + min(max(d.x,d.y), 0.0);
    }
    vec2 rot2(vec2 p, float a){ float s = sin(a), c = cos(a); return vec2(c*p.x - s*p.y, s*p.x + c*p.y); }
    vec4 premul(vec3 c, float a){ return vec4(c*a, a); }

    // triángulo [0..1] por segmento angular
    float toothProfile(float ang, float teeth){
      float seg = ang / (6.2831853/teeth);
      float f   = fract(seg);
      float tri = abs(f - 0.5) * 2.0;  // 1 en bordes, 0 en centro
      return 1.0 - tri;                // 1 en centro del diente
    }

    // SDF de engranaje: anillo con dientes
    float sdGear(vec2 p, float R, float ringW, float toothH, float teeth){
      float r = length(p);
      float a = atan(p.y, p.x);
      float tp = toothProfile(a, teeth);
      float Rout = R + toothH * pow(tp, 0.85);
      float Rin  = R - ringW;
      float outside = r - Rout;
      float inside  = Rin - r;
      return max(outside, inside); // <=0 dentro del metal
    }

    // sombreado metálico simple
    vec3 metalShade(vec2 p, vec3 base){
      vec3 L = normalize(vec3(0.6, 0.35, 0.7));
      vec3 n = normalize(vec3(p, 0.28));
      float ndl = clamp(dot(n, L), 0.0, 1.0);
      float fres = pow(1.0 - ndl, 2.0);
      vec3 spec = vec3(1.0) * pow(ndl, 22.0) * 0.25;
      return base * (0.55 + 0.45*ndl) + spec + fres*0.05;
    }

    // pinta un engranaje y devuelve (color premultiplicado, alpha) acumulables
    vec4 drawGear(vec2 uv, vec2 center, float R, float ringW, float toothH, float teeth, float theta, vec3 color){
      vec2 p = uv - center;
      // giramos el espacio para animar la pieza
      p = rot2(p, theta);

      float d = sdGear(p, R, ringW, toothH, teeth);
      float m = 1.0 - smoothstep(0.0, 0.010, d);

      // borde
      float rim = 1.0 - smoothstep(0.03, 0.14, abs(d));

      // eje (tornillo central)
      float axle = 1.0 - smoothstep(0.0, 0.010, sdCircle(p, R*0.16));

      // color base metálico
      vec3 c = adjustHue(color, hue);
      vec3 shaded = metalShade(p/R, c);
      shaded = mix(shaded, shaded + vec3(0.15), rim*0.35);
      shaded = mix(shaded, vec3(0.95), axle*0.45);

      // marcas radiales sutiles
      float mark = 1.0 - smoothstep(0.0, 0.010, sdBox(p, vec2(R*0.85, 0.006)));
      shaded = mix(shaded, shaded*0.85 + vec3(0.05), mark*0.25);

      return premul(clamp(shaded,0.0,1.0), m);
    }

    vec4 drawScene(vec2 uv){
      // rotación global + warp por hover
      uv = rot2(uv, rot);
      uv.x += hover * hoverIntensity * 0.05 * sin(uv.y*10.0 + iTime);
      uv.y += hover * hoverIntensity * 0.05 * sin(uv.x*10.0 + iTime);

      // fondo blueprint sutil
      float g1 = (sin(uv.x*24.0) * sin(uv.y*24.0)) * 0.04;
      vec3 bg = adjustHue(vec3(0.08,0.11,0.16), hue*0.2) + vec3(g1);
      float alpha = 0.0;
      vec3  col = bg;

      // parámetros de engranajes
      float R1=0.32, R2=0.22, R3=0.14;
      float W = 0.11; // ancho del anillo
      float T1=18.0, T2=12.0, T3=9.0;
      float toothH = 0.06;

      vec2 C1 = vec2(-0.45, -0.05);
      vec2 C2 = vec2( 0.10,  0.10);
      vec2 C3 = vec2( 0.45, -0.05);

      // cinemática: velocidades inversamente proporcionales al radio (engranajes en contacto)
      float baseSpeed = 0.6 + hover * hoverIntensity * 1.2;
      float t1 =  iTime * baseSpeed;
      float t2 = -t1 * (R1/R2);
      float t3 = -t2 * (R2/R3);

      // colores
      vec3 c1 = vec3(0.78, 0.82, 0.88);
      vec3 c2 = vec3(0.65, 0.72, 0.90);
      vec3 c3 = vec3(0.90, 0.74, 0.38);

      // dibujar y componer (premultiplicado)
      vec4 g1col = drawGear(uv, C1, R1, W, toothH, T1, t1, c1);
      vec4 g2col = drawGear(uv, C2, R2, W, toothH, T2, t2, c2);
      vec4 g3col = drawGear(uv, C3, R3, W, toothH, T3, t3, c3);

      vec4 acc = vec4(col, alpha);
      acc = acc + g1col*(1.0 - acc.a);
      acc = acc + g2col*(1.0 - acc.a);
      acc = acc + g3col*(1.0 - acc.a);

      // pequeñas chispas de “lubricante” (porque glam)
      float spark = step(0.997, fract(sin(dot(floor(uv*vec2(140.0)), vec2(12.7,78.3))) * 43758.5453));
      acc.rgb += vec3(0.6,0.85,1.0) * spark * 0.12;

      return acc;
    }

    vec4 mainImage(vec2 fragCoord){
      vec2 center = iResolution.xy * 0.5;
      float size  = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;
      return drawScene(uv);
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
    const rotationSpeed = 0.24;

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
