import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec3 } from "ogl";

interface AbacusProps {
  hue?: number;
  hoverIntensity?: number;
  rotateOnHover?: boolean;
  forceHoverState?: boolean;
}

export default function Abacus({
  hue = 0,
  hoverIntensity = 0.2,
  rotateOnHover = true,
  forceHoverState = false,
}: AbacusProps) {
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

    // --- Color utils (YIQ hue shift) ---
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

    // --- Paleta base (madera, metal, cuentas) ---
    const vec3 wood1 = vec3(0.48, 0.30, 0.18);
    const vec3 wood2 = vec3(0.63, 0.43, 0.26);
    const vec3 rodC  = vec3(0.78, 0.82, 0.88);
    const vec3 bead0 = vec3(0.95, 0.55, 0.65);

    vec3 beadColor(float i){
      // Variación por varilla (cinco tonos)
      float t = i / 4.0;
      vec3 c = mix(bead0, vec3(0.30,0.75,0.95), t);
      return adjustHue(c, hue);
    }

    vec4 drawAbacus(vec2 uv){
      // Rotación global + warp por hover (sutil)
      uv = rot2(uv, rot);
      uv.x += hover * hoverIntensity * 0.05 * sin(uv.y*10.0 + iTime);
      uv.y += hover * hoverIntensity * 0.05 * sin(uv.x*10.0 + iTime);

      // MARCO
      float rimOuter = sdRoundedBox(uv, vec2(0.95, 0.70), 0.12);
      float rimInner = sdRoundedBox(uv, vec2(0.82, 0.55), 0.08);
      float aOuter = 1.0 - smoothstep(0.0, 0.010, rimOuter);
      float aInner = 1.0 - smoothstep(0.0, 0.010, rimInner);

      vec3 wood = mix(wood1, wood2, 0.5 + 0.5*sin(uv.x*5.0));
      wood = adjustHue(wood, hue * 0.2); // poco efecto de hue en madera

      vec3 col = vec3(0.0);
      float alpha = 0.0;

      // Marco exterior e interior (interior como panel claro)
      col = mix(col, wood, aOuter);
      alpha = max(alpha, aOuter);

      vec3 panel = adjustHue(vec3(0.93, 0.96, 1.0), hue) * 0.9;
      col = mix(col, panel, aInner * 0.85);
      alpha = max(alpha, aInner * 0.85);

      // VARILLAS (5)
      float rodMask = 0.0;
      float xs[5];
      xs[0] = -0.60; xs[1] = -0.30; xs[2] = 0.0; xs[3] = 0.30; xs[4] = 0.60;
      for (int i = 0; i < 5; i++){
        float x = xs[i];
        float dRod = sdBox(uv - vec2(x, 0.0), vec2(0.010, 0.48));
        float mRod = 1.0 - smoothstep(0.0, 0.010, dRod);
        vec3 rc = rodC * (0.9 + 0.1*sin((uv.y+float(i))*8.0));
        col = mix(col, rc, mRod);
        alpha = max(alpha, mRod);
        rodMask = max(rodMask, mRod);
      }

      // CUENTAS: 5 por varilla (25 en total)
      // Y base de recorrido
      float yMin = -0.42, yMax = 0.42;
      float rBead = 0.055;

      for (int i = 0; i < 5; i++){
        float x = xs[i];
        vec3 bc = beadColor(float(i));

        for (int j = 0; j < 5; j++){
          float t = iTime*0.5 + float(i)*0.7 + float(j)*0.33;
          // posición base a lo largo de la varilla
          float baseY = mix(yMin, yMax, float(j)/4.0);

          // animación sutil + "atracción" al centro en hover
          float dir = (mod(float(i+j), 2.0) < 1.0) ? 1.0 : -1.0;
          float wobble = 0.035 * sin(t*2.0 + float(j));
          float pull   = dir * hover * hoverIntensity * 0.20; // mueve hacia/desde el centro
          float y = baseY + wobble - pull * sign(baseY);

          float d = sdCircle(uv - vec2(x, y), rBead);
          float m = 1.0 - smoothstep(0.0, 0.012, d);

          // brillo/rim de la cuenta
          float rim = 1.0 - smoothstep(0.020, 0.10, abs(d));
          vec3 beadCol = bc * (0.85 + 0.15*sin((y+1.0)*4.0));
          col = mix(col, beadCol, m);
          col = mix(col, beadCol + vec3(0.10), rim * 0.35 * m);
          alpha = max(alpha, m);
        }
      }

      // Patas inferiores (dos bloques)
      float aFootL = 1.0 - smoothstep(0.0, 0.010, sdRoundedBox(uv - vec2(-0.58, -0.58), vec2(0.14, 0.06), 0.04));
      float aFootR = 1.0 - smoothstep(0.0, 0.010, sdRoundedBox(uv - vec2( 0.58, -0.58), vec2(0.14, 0.06), 0.04));
      col = mix(col, wood*0.95, max(aFootL, aFootR));
      alpha = max(alpha, max(aFootL, aFootR));

      // Sombras suaves bajo cuentas (contact)
      float shade = 0.0;
      for (int i=0; i<5; i++){
        float x = xs[i];
        float beam = 1.0 - smoothstep(0.035, 0.12, abs(uv.x - x));
        shade += beam * exp(-8.0 * abs(uv.y - 0.0));
      }
      col -= vec3(0.05) * shade * 0.12;

      col = clamp(col, 0.0, 1.0);
      alpha = clamp(alpha, 0.0, 1.0);
      return premul(col, alpha);
    }

    vec4 mainImage(vec2 fragCoord){
      vec2 center = iResolution.xy * 0.5;
      float size  = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;
      return drawAbacus(uv);
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
    const rotationSpeed = 0.25;

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
