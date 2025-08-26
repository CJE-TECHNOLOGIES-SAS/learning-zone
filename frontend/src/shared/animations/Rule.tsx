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

    // --- Utils color (YIQ hue shift) ---
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

    // To local coordinates aligned to a direction
    vec2 toLocal(vec2 p, vec2 origin, vec2 dir){
      vec2 d = normalize(dir);
      mat2 M = mat2(d.x, d.y, -d.y, d.x);
      return (p - origin) * M;
    }

    // --- Paleta ---
    const vec3 metalC  = vec3(0.78, 0.82, 0.88);
    const vec3 accentC = vec3(0.20, 0.55, 0.95);
    const vec3 wood1   = vec3(0.52, 0.36, 0.22);
    const vec3 wood2   = vec3(0.64, 0.44, 0.26);
    const vec3 pencilY = vec3(0.96, 0.78, 0.18);
    const vec3 graphite= vec3(0.20, 0.20, 0.22);
    const vec3 chalk   = vec3(0.96, 0.98, 1.00);

    // --- Figura principal ---
    vec4 drawCompassRuler(vec2 uv){
      // Rotación global + deformación por hover
      uv = rot2(uv, rot);
      uv.x += hover * hoverIntensity * 0.05 * sin(uv.y*10.0 + iTime);
      uv.y += hover * hoverIntensity * 0.05 * sin(uv.x*10.0 + iTime);

      vec3 col = vec3(0.0);
      float aScene = 0.0;

      // ====== Regla (abajo-derecha) ======
      vec2 rPos = vec2(0.35, -0.45);
      vec2 ruv  = rot2(uv - rPos, 0.12);
      float dRule = sdRoundedBox(ruv, vec2(0.45, 0.09), 0.06);
      float mRule = 1.0 - smoothstep(0.0, 0.010, dRule);
      vec3 wood = mix(wood1, wood2, 0.5 + 0.5*sin(ruv.x*5.0));
      wood = adjustHue(wood, hue*0.2);
      col = mix(col, wood, mRule);
      aScene = max(aScene, mRule);

      // Marcas de la regla
      for (int i=0; i<14; i++){
        float fi = float(i);
        float x = mix(-0.40, 0.40, fi/13.0);
        float len = (mod(fi, 5.0) < 0.5) ? 0.065 : ((mod(fi,1.0)<0.5)?0.035:0.02);
        float tick = 1.0 - smoothstep(0.0, 0.010,
                      sdBox(ruv - vec2(x, 0.0), vec2(0.0035, len)));
        vec3 tickCol = adjustHue(metalC, hue*0.3) * 0.85;
        col = mix(col, tickCol, tick * mRule);
        aScene = max(aScene, tick * mRule);
      }

      // ====== Compás ======
      // Centro del compás (articulación superior)
      vec2 pivot = vec2(-0.10, 0.28);
      float baseAng = 0.15*sin(iTime*0.7);
      float openAng = clamp(0.9 + 0.4*sin(iTime*0.8 + 1.5) + hover*hoverIntensity*0.6, 0.45, 1.8);
      float L = 0.56; // longitud de piernas

      // Direcciones de cada pierna
      float ang1 = baseAng + openAng*0.5;
      float ang2 = baseAng - openAng*0.5;
      vec2 end1 = pivot + rot2(vec2(0.0, -L), ang1); // lápiz
      vec2 end2 = pivot + rot2(vec2(0.0, -L), ang2); // aguja (centro de la circunferencia)

      // Piernas (segmentos gruesos)
      float thickLeg = 0.018;
      float mLeg1 = 1.0 - smoothstep(thickLeg, thickLeg*1.8, sdSegment(uv, pivot, end1));
      float mLeg2 = 1.0 - smoothstep(thickLeg, thickLeg*1.8, sdSegment(uv, pivot, end2));
      vec3 cMetal = adjustHue(metalC, hue*0.5);
      col = mix(col, cMetal*(0.90 + 0.10*sin((uv.y+uv.x)*6.0)), max(mLeg1, mLeg2));
      aScene = max(aScene, max(mLeg1, mLeg2));

      // Articulación superior
      float mJoint = 1.0 - smoothstep(0.0, 0.012, sdCircle(uv - pivot, 0.06));
      vec3 jointCol = mix(cMetal, adjustHue(accentC, hue), 0.25);
      col = mix(col, jointCol, mJoint);
      aScene = max(aScene, mJoint);

      // Refuerzos (bisagras intermedias)
      vec2 knee1 = mix(pivot, end1, 0.45);
      vec2 knee2 = mix(pivot, end2, 0.45);
      float mK1 = 1.0 - smoothstep(0.0, 0.010, sdCircle(uv - knee1, 0.035));
      float mK2 = 1.0 - smoothstep(0.0, 0.010, sdCircle(uv - knee2, 0.035));
      col = mix(col, jointCol*0.95, max(mK1, mK2));
      aScene = max(aScene, max(mK1, mK2));

      // Lápiz (en end1): cuerpo + punta
      vec2 dir1 = normalize(end1 - pivot);
      vec2 lp = toLocal(uv, end1, dir1); // coords con origen en la punta
      float mPencilBody = 1.0 - smoothstep(0.0, 0.010,
                          sdRoundedBox(lp - vec2(-0.06, 0.0), vec2(0.07, 0.018), 0.01));
      float mPencilTip  = 1.0 - smoothstep(0.0, 0.010,
                          sdTriIsosceles(lp - vec2(0.005, 0.0), vec2(0.02, -0.018)));
      col = mix(col, pencilY, mPencilBody);
      col = mix(col, graphite, mPencilTip);
      aScene = max(aScene, max(mPencilBody, mPencilTip));

      // Aguja (en end2): pequeña punta metálica
      vec2 dir2 = normalize(end2 - pivot);
      vec2 np = toLocal(uv, end2, dir2);
      float mNeedle = 1.0 - smoothstep(0.0, 0.010,
                        sdTriIsosceles(np - vec2(0.008, 0.0), vec2(0.018, -0.014)));
      col = mix(col, cMetal*0.95, mNeedle);
      aScene = max(aScene, mNeedle);

      // ====== Arco trazado por el compás ======
      // Centro = aguja (end2), radio = distancia entre end1 y end2
      float R = length(end1 - end2);
      float band = 0.012 - 0.004*hover*hoverIntensity; // grosor de trazo
      vec2  v   = uv - end2;
      float r   = length(v);
      float ring = 1.0 - smoothstep(band, band*2.0, abs(r - R));

      // Progreso angular (0..2PI)
      float startAng = atan((end1-end2).y, (end1-end2).x);
      float ang = atan(v.y, v.x);
      float dAng = mod(ang - startAng + 6.2831853, 6.2831853);
      float prog = fract(iTime*0.20 + 0.15*hover*hoverIntensity); // más rápido al hover
      float arcMask = step(0.0, dAng) * step(dAng, 6.2831853*prog);

      vec3 arcCol = adjustHue(chalk, hue) * (0.85 + 0.15*sin(iTime*6.0));
      col = mix(col, arcCol, ring * arcMask);
      aScene = max(aScene, ring * arcMask);

      // Glow sutil en la trayectoria
      float glow = exp(-40.0*abs(r - R)) * arcMask * 0.35;
      col += arcCol * glow;

      // ====== Sombras de contacto ======
      col -= vec3(0.06) * exp(-18.0*length(uv - end2)); // bajo la aguja
      col -= vec3(0.05) * exp(-18.0*length(uv - (pivot + vec2(0.0,0.02))));

      col = clamp(col, 0.0, 1.0);
      aScene = clamp(aScene, 0.0, 1.0);
      return premul(col, aScene);
    }

    vec4 mainImage(vec2 fragCoord){
      vec2 center = iResolution.xy * 0.5;
      float size  = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;
      return drawCompassRuler(uv);
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
