import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec3 } from "ogl";

interface blackboardProps {
  hue?: number;
  hoverIntensity?: number;
  rotateOnHover?: boolean;
  forceHoverState?: boolean;
}

export default function blackboard({
  hue = 0,
  hoverIntensity = 0.2,
  rotateOnHover = true,
  forceHoverState = false,
}: blackboardProps) {
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
    vec2 rot2(vec2 p, float a){ float s = sin(a), c = cos(a); return vec2(c*p.x - s*p.y, s*p.x + c*p.y); }
    vec4 premul(vec3 c, float a){ return vec4(c*a, a); }

    // ---- hash para polvo de tiza ----
    float hash21(vec2 p){
      p = fract(p*vec2(123.34, 345.45));
      p += dot(p, p+34.345);
      return fract(p.x*p.y);
    }

    // ---- paleta ----
    const vec3 wood1 = vec3(0.50, 0.33, 0.20);
    const vec3 wood2 = vec3(0.64, 0.44, 0.26);
    const vec3 boardG= vec3(0.10, 0.32, 0.20); // tablero verde
    const vec3 boardB= vec3(0.07, 0.07, 0.08); // tablero negro
    const vec3 chalkC= vec3(0.96, 0.97, 0.98);
    const vec3 eraserTop = vec3(0.82, 0.52, 0.28);
    const vec3 eraserBot = vec3(0.25, 0.27, 0.33);

    // línea de tiza “orgánica” (con grano)
    float chalkLineY(vec2 p, float y, float thick, float grain){
      float d = abs(p.y - y);
      float core = 1.0 - smoothstep(thick, thick*1.8, d);
      float g = hash21(floor(p*vec2(180.0, 180.0))) * grain;
      return core * (0.88 + 0.12*g);
    }
    float chalkLineX(vec2 p, float x, float thick, float grain){
      float d = abs(p.x - x);
      float core = 1.0 - smoothstep(thick, thick*1.8, d);
      float g = hash21(floor(p*vec2(180.0, 180.0))) * grain;
      return core * (0.88 + 0.12*g);
    }
    float chalkCurve(vec2 p, float yCurve, float thick){
      float d = abs(p.y - yCurve);
      return 1.0 - smoothstep(thick, thick*1.8, d);
    }
    float chalkCircle(vec2 p, float r, float thick){
      float d = abs(sdCircle(p, r));
      return 1.0 - smoothstep(thick, thick*1.8, d);
    }

    vec4 drawBoard(vec2 uv){
      // Rotación global + “warp” por hover
      uv = rot2(uv, rot);
      uv.x += hover * hoverIntensity * 0.05 * sin(uv.y*10.0 + iTime);
      uv.y += hover * hoverIntensity * 0.05 * sin(uv.x*10.0 + iTime);

      // ---- Marco de madera + tablero ----
      float dOuter = sdRoundedBox(uv, vec2(0.95, 0.70), 0.10);
      float dInner = sdRoundedBox(uv, vec2(0.82, 0.52), 0.06);
      float mOuter = 1.0 - smoothstep(0.0, 0.010, dOuter);
      float mBoard = 1.0 - smoothstep(0.0, 0.010, dInner);
      vec3 wood = mix(wood1, wood2, 0.5 + 0.5*sin(uv.x*5.0));
      wood = adjustHue(wood, hue*0.2);

      vec3 col = vec3(0.0);
      float a  = 0.0;
      col = mix(col, wood, mOuter);
      a   = max(a, mOuter);

      // tablero: mezcla entre verde y negro según hue
      vec3 baseBoard = mix(boardG, boardB, clamp(hue/360.0, 0.0, 1.0));
      baseBoard = adjustHue(baseBoard, hue*0.4);
      // ligero gradiente
      baseBoard *= 0.85 + 0.15*smoothstep(-0.60, 0.60, uv.y);
      col = mix(col, baseBoard, mBoard);
      a   = max(a, mBoard);

      // repisa inferior
      float mTray = 1.0 - smoothstep(0.0, 0.010,
                    sdRoundedBox(uv - vec2(0.0, -0.60), vec2(0.70, 0.06), 0.04));
      col = mix(col, wood*0.95, mTray);
      a   = max(a, mTray);

      // ---- Borrador animado (borra lo que toca) ----
      float radius = 0.14 + 0.06*hover*hoverIntensity;
      vec2 ePos = vec2(-0.65 + fract(iTime*0.12)*(1.30), 0.12*sin(iTime*1.1));
      float dEraser = sdRoundedBox(uv - ePos, vec2(0.16, 0.08), 0.05);
      float mEraser = 1.0 - smoothstep(0.0, 0.010, dEraser);
      // dos bandas de color
      float mEraserTop = 1.0 - smoothstep(0.0, 0.010,
                             sdRoundedBox(uv - (ePos + vec2(0.0, 0.03)),
                                          vec2(0.16, 0.05), 0.04));
      col = mix(col, adjustHue(eraserTop, hue*0.2), mEraserTop);
      col = mix(col, adjustHue(eraserBot, hue*0.2), mEraser * (1.0 - mEraserTop));
      a   = max(a, mEraser);

      // máscara de borrado
      float erase = smoothstep(0.0, radius, radius - length(uv - ePos));

      // ---- Ecuaciones de tiza (dentro del tablero) ----
      float thick = 0.014 - 0.004*hover*hoverIntensity;
      float grain = 1.0;

      // Curva seno: y = 0.18*sin(3x + t)
      float t = iTime*1.2;
      float yS = 0.18*sin(3.0*uv.x + t);
      float mSine = chalkCurve(uv, yS, thick);

      // Parábola: y = 0.08*(x+0.6)^2 - 0.1
      float yP = 0.08*pow(uv.x + 0.6, 2.0) - 0.10;
      float mPar = chalkCurve(uv, yP, thick);

      // Circunferencia: (x+0.35)^2 + (y-0.10)^2 = R^2
      vec2 pc = uv - vec2(-0.35, 0.10);
      float mCirc = chalkCircle(pc, 0.22, thick);

      // Ejes (líneas rectas)
      float mAxisX = chalkLineY(uv - vec2(0.0, -0.25), 0.0, thick*0.8, grain);
      float mAxisY = chalkLineX(uv - vec2(-0.60, 0.0), 0.0, thick*0.8, grain);

      // Polvo de tiza aleatorio en área del tablero
      float dust = 0.0;
      if (mBoard > 0.0){
        vec2 g = floor(uv*vec2(120.0, 120.0));
        float r = hash21(g + vec2(13.2, 7.7));
        float blink = step(0.995, fract(r + iTime*0.3));
        // concentra polvo cerca de curvas
        float nearLines = max(mSine, max(mPar, mCirc)) * 0.6 + (mAxisX + mAxisY)*0.2;
        dust = blink * nearLines;
      }

      // color de la tiza (con matiz leve por hue)
      vec3 chalk = adjustHue(chalkC, hue*0.2);

      // aplica borrado sobre las máscaras de tiza
      float chalkMask = clamp(mSine + mPar + mCirc + mAxisX + mAxisY, 0.0, 1.0);
      chalkMask *= (1.0 - erase*0.9); // borrar
      // grano adicional
      float grain2 = 0.85 + 0.15*hash21(floor(uv*vec2(200.0)));
      vec3 chalkCol = chalk * grain2;

      col = mix(col, chalkCol, chalkMask * mBoard);
      a   = max(a, chalkMask * mBoard * 0.95);

      // polvo
      col = mix(col, chalk * 0.8, dust * 0.8);
      a   = max(a, dust * 0.6);

      // ---- Tiza en la repisa ----
      vec2 chalkPos = vec2(0.35, -0.58);
      vec2 cuv = rot2(uv - chalkPos, 0.12);
      float mChalk = 1.0 - smoothstep(0.0, 0.010,
                     sdRoundedBox(cuv, vec2(0.18, 0.035), 0.02));
      col = mix(col, chalk, mChalk);
      a   = max(a, mChalk);

      // brillo sutil en el tablero (bloom ambiental)
      col += vec3(0.25,0.30,0.35) * exp(-12.0*abs(dInner)) * 0.10;

      col = clamp(col, 0.0, 1.0);
      a   = clamp(a, 0.0, 1.0);
      return premul(col, a);
    }

    vec4 mainImage(vec2 fragCoord){
      vec2 center = iResolution.xy * 0.5;
      float size  = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;
      return drawBoard(uv);
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
