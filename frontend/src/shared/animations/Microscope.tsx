import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec3 } from "ogl";

interface MicroscopeProps {
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
}: MicroscopeProps) {
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

    // ---- Utils color (YIQ hue shift) ----
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
        c.x - 0.272*c.y + -0.647*c.z,
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
    // Triángulo isósceles para el cono de luz
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

    // ---- Paleta ----
    const vec3 body1   = vec3(0.18, 0.35, 0.70);
    const vec3 body2   = vec3(0.10, 0.22, 0.48);
    const vec3 metal   = vec3(0.76, 0.82, 0.89);
    const vec3 rubber  = vec3(0.15, 0.16, 0.19);
    const vec3 lightC  = vec3(1.00, 0.92, 0.55);

    vec4 drawMicroscope(vec2 uv){
      // Rotación global + hover warp
      uv = rot2(uv, rot);
      uv.x += hover * hoverIntensity * 0.05 * sin(uv.y*10.0 + iTime);
      uv.y += hover * hoverIntensity * 0.05 * sin(uv.x*10.0 + iTime);

      // --- Piezas (coordenadas aproximadas) ---
      // Base
      float dBase = sdRoundedBox(uv - vec2(0.0, -0.55), vec2(0.45, 0.10), 0.10);
      float dFoot = sdRoundedBox(uv - vec2(-0.20, -0.42), vec2(0.18, 0.06), 0.06);

      // Columna vertical
      float dPillar = sdRoundedBox(uv - vec2(-0.12, -0.10), vec2(0.08, 0.34), 0.10);

      // Brazo inclinado
      vec2 armC = rot2(uv - vec2(-0.05, 0.05), 0.9);
      float dArm = sdRoundedBox(armC, vec2(0.14, 0.32), 0.10);

      // Tubo óptico (barril) inclinado hacia la platina
      vec2 tubeC = rot2(uv - vec2(0.18, 0.30), -0.8);
      float dTube = sdRoundedBox(tubeC, vec2(0.26, 0.06), 0.05);

      // Ocular (arriba)
      float dEye = sdCircle(uv - vec2(0.34, 0.44), 0.06);

      // Objetivo (cerca de la platina)
      float dObj = sdCircle(uv - vec2(0.02, 0.18), 0.045);

      // Platina (mesa)
      float dStage = sdRoundedBox(uv - vec2(0.08, -0.06), vec2(0.30, 0.04), 0.03);
      // Orificio de platina
      float dHole = sdCircle(uv - vec2(0.18, -0.06), 0.035);

      // Perilla de enfoque
      float dKnob = sdCircle(uv - vec2(-0.28, 0.00), 0.065);

      // Cono de luz (triángulo isósceles animado)
      float wob = 0.03*sin(iTime*2.0);
      vec2 tc = uv - vec2(0.18, -0.10);
      tc.x += wob;
      float dLight = sdTriIsosceles(tc - vec2(0.0, -0.05), vec2(0.20, 0.16)); // alto=0.20, semibase=0.16

      // --- Composición de máscaras ---
      float aBase  = 1.0 - smoothstep(0.0, 0.010, dBase);
      float aFoot  = 1.0 - smoothstep(0.0, 0.010, dFoot);
      float aPill  = 1.0 - smoothstep(0.0, 0.010, dPillar);
      float aArm   = 1.0 - smoothstep(0.0, 0.010, dArm);
      float aTube  = 1.0 - smoothstep(0.0, 0.010, dTube);
      float aEye   = 1.0 - smoothstep(0.0, 0.010, dEye);
      float aObj   = 1.0 - smoothstep(0.0, 0.010, dObj);
      float aStage = 1.0 - smoothstep(0.0, 0.010, dStage);
      float aHole  = 1.0 - smoothstep(0.0, 0.010, dHole);
      float aKnob  = 1.0 - smoothstep(0.0, 0.010, dKnob);
      float aLight = 1.0 - smoothstep(0.0, 0.012, dLight);

      // Rim general (contorno suave del conjunto)
      float dUnion = min(min(min(min(dBase, dFoot), min(dPillar, dArm)), min(dTube, dStage)), min(dEye, min(dObj, dKnob)));
      float rim = 1.0 - smoothstep(0.03, 0.14, abs(dUnion));

      // --- Colores ---
      vec3 cBody1 = adjustHue(body1, hue);
      vec3 cBody2 = adjustHue(body2, hue);
      vec3 cMetal = metal;
      vec3 cRub   = rubber;
      vec3 cLight = lightC;

      vec3 col = vec3(0.0);
      float a  = 0.0;

      // base + pie
      vec3 baseCol = mix(cBody2, cBody1, 0.35);
      col = mix(col, baseCol, aBase);
      a   = max(a, aBase);
      col = mix(col, baseCol*0.95, aFoot);
      a   = max(a, aFoot);

      // columna y brazo
      col = mix(col, cBody1, aPill);
      a   = max(a, aPill);
      col = mix(col, cBody1*1.02, aArm);
      a   = max(a, aArm);

      // tubo (metal) + sombreado sutil
      float shade = 0.15*sin(tubeC.x*20.0);
      col = mix(col, cMetal*(0.9 + shade), aTube);
      a   = max(a, aTube);

      // ocular y objetivo (goma/metal)
      col = mix(col, cRub, aEye);
      a   = max(a, aEye);
      col = mix(col, cMetal*0.9, aObj);
      a   = max(a, aObj);

      // platina (oscura) y su orificio (más oscuro)
      vec3 stageCol = mix(cBody2*0.9, cRub, 0.4);
      col = mix(col, stageCol, aStage);
      a   = max(a, aStage);
      col = mix(col, stageCol*0.6, aHole);
      a   = max(a, aHole);

      // perilla (metal)
      col = mix(col, cMetal*0.95, aKnob);
      a   = max(a, aKnob);

      // cono de luz sobrepuesto (con degradado)
      float grad = smoothstep(-0.22, 0.05, tc.y);
      vec3 lightCol = cLight * (0.55 + 0.45*grad);
      col = mix(col, lightCol, aLight*0.85);
      a   = max(a, aLight*0.7);

      // brillo general de contorno
      col = mix(col, cMetal, rim*0.18);

      // clamp + premul
      col = clamp(col, 0.0, 1.0);
      a   = clamp(a,   0.0, 1.0);
      return premul(col, a);
    }

    vec4 mainImage(vec2 fragCoord){
      vec2 center = iResolution.xy * 0.5;
      float size  = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;
      return drawMicroscope(uv);
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
        gl.clearColor(0, 0, 0, 0);
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
            const w = rect.width, h = rect.height;
            const size = Math.min(w, h);
            const cx = w / 2, cy = h / 2;
            const ux = ((x - cx) / size) * 2.0;
            const uy = ((y - cy) / size) * 2.0;
            targetHover = Math.sqrt(ux * ux + uy * uy) < 1.15 ? 1 : 0;
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

    return <div ref={ctnDom} className="Microscope-container" />;
}
