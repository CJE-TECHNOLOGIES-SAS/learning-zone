import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec3 } from "ogl";

interface PlanetProps {
  hue?: number;
  hoverIntensity?: number;
  rotateOnHover?: boolean;
  forceHoverState?: boolean;
}

export default function Planet({
  hue = 0,
  hoverIntensity = 0.2,
  rotateOnHover = true,
  forceHoverState = false,
}: PlanetProps) {
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

    // ---- Utils de color: hue shift (YIQ) ----
    vec3 rgb2yiq(vec3 c){ return vec3(
      dot(c, vec3(0.299, 0.587, 0.114)),
      dot(c, vec3(0.596,-0.274,-0.322)),
      dot(c, vec3(0.211,-0.523, 0.312))
    );}
    vec3 yiq2rgb(vec3 c){ return vec3(
      c.x + 0.956*c.y + 0.621*c.z,
      c.x - 0.272*c.y - 0.647*c.z,
      c.x - 1.106*c.y + 1.703*c.z
    );}
    vec3 adjustHue(vec3 color, float hueDeg){
      float a = radians(hueDeg);
      vec3 y = rgb2yiq(color);
      float cs = cos(a), sn = sin(a);
      float i = y.y*cs - y.z*sn;
      float q = y.y*sn + y.z*cs;
      return yiq2rgb(vec3(y.x,i,q));
    }

    // ---- SDF / helpers ----
    float sdCircle(vec2 p, float r){ return length(p) - r; }
    vec2  rot2(vec2 p, float a){ float s = sin(a), c = cos(a); return vec2(c*p.x - s*p.y, s*p.x + c*p.y); }

    // banda elíptica: 1 dentro del anillo, 0 fuera
    float ellipseBand(vec2 p, float a, float b, float thick){
      float v = (p.x*p.x)/(a*a) + (p.y*p.y)/(b*b) - 1.0;
      return 1.0 - smoothstep(thick, thick*1.6, abs(v));
    }

    // hash para estrellas
    float hash21(vec2 p){
      p = fract(p*vec2(123.34, 345.45));
      p += dot(p, p+34.345);
      return fract(p.x*p.y);
    }

    // ---- Paleta base (se desplaza con hue) ----
    const vec3 basePlanet = vec3(0.28, 0.53, 0.95);
    const vec3 baseRings  = vec3(0.95, 0.85, 0.65);
    const vec3 baseMoon   = vec3(0.92, 0.94, 0.98);

    vec4 premul(vec3 c, float a){ return vec4(c*a, a); }

    vec4 drawScene(vec2 uv){
      // Rotación global + warp de hover (sutil)
      uv = rot2(uv, rot);
      uv.x += hover * hoverIntensity * 0.05 * sin(uv.y*10.0 + iTime);
      uv.y += hover * hoverIntensity * 0.05 * sin(uv.x*10.0 + iTime);

      // ----- Estrellas de fondo (baja opacidad) -----
      vec3 col = vec3(0.0);
      float aScene = 0.0;

      vec2 grid = floor(uv*vec2(90.0, 90.0));
      float rnd = hash21(grid);
      float star = step(0.995, rnd); // pocas
      float tw  = 0.4 + 0.6*sin(iTime*5.0 + rnd*100.0);
      col += star * tw * 0.35;
      aScene = max(aScene, star * 0.25);

      // ----- Planeta -----
      float rp = 0.56;
      float dP = sdCircle(uv, rp);
      float mPlanet = 1.0 - smoothstep(0.0, 0.012, dP); // máscara

      // Normales esféricas fake para luz
      vec3 cPlanet = adjustHue(basePlanet, hue);
      float z = sqrt(max(0.0, rp*rp - dot(uv, uv)));
      vec3 n = normalize(vec3(uv, z));
      vec3 L = normalize(vec3(0.6, 0.35, 0.8));
      float ndl = clamp(dot(n, L), 0.0, 1.0);

      // Bandas (tipo nubes/cinturones)
      float belts = 0.12 * sin(uv.y*28.0 + 0.4*sin(uv.x*3.0) + iTime*0.3);
      vec3 planetShaded = cPlanet*(0.45 + 0.55*ndl) + belts;

      // Atmósfera (halo)
      float atmo = 1.0 - smoothstep(0.02, 0.16, abs(dP));
      vec3 cAtmo = adjustHue(vec3(0.55, 0.80, 1.0), hue)*0.6;

      col = mix(col, planetShaded, mPlanet);
      col = mix(col, cAtmo, atmo * 0.35);
      aScene = max(aScene, max(mPlanet, atmo*0.35));

      // ----- Anillos (inclinados) -----
      float tilt = 0.58; // ~33°
      vec2 ur = rot2(uv, tilt);

      // tres bandas con distinto radio/espesor
      float ring1 = ellipseBand(ur, 0.90, 0.32, 0.010);
      float ring2 = ellipseBand(ur, 0.74, 0.26, 0.010);
      float ring3 = ellipseBand(ur, 0.60, 0.20, 0.009);

      // texturizado radial simple
      float stripes = 0.5 + 0.5*sin(ur.x*90.0);
      vec3 cRings = adjustHue(baseRings, hue) * (0.8 + 0.2*stripes);

      // Parte trasera: sólo fuera del disco del planeta
      float backMask = step(0.0, dP); // dP>0: fuera
      float ringBack = (ring1 + 0.85*ring2 + 0.7*ring3) * backMask;
      col = mix(col, cRings, ringBack*0.85);
      aScene = max(aScene, ringBack*0.8);

      // ----- Luna -----
      float ang = -iTime * 0.6;
      vec2 moonPos = vec2(cos(ang), sin(ang)) * 1.05;
      float dM = sdCircle(uv - moonPos, 0.10);
      float mMoon = 1.0 - smoothstep(0.0, 0.01, dM);

      // sombreado lambertiano simple
      vec3 cMoon = baseMoon;
      float ndlM = clamp(dot(normalize(vec3(uv - moonPos, sqrt(max(0.0, 0.1*0.1 - dot(uv - moonPos, uv - moonPos))))), L), 0.0, 1.0);
      cMoon *= 0.55 + 0.45*ndlM;

      // oclusión si pasa "detrás" del planeta (aprox)
      float moonBehind = step(0.0, -dP); // dentro del planeta
      float moonVisible = mix(1.0, 0.25, moonBehind); // atenúa si pasa detrás
      col = mix(col, cMoon, mMoon * moonVisible);
      aScene = max(aScene, mMoon * moonVisible);

      // ----- Anillo delantero: sobre el planeta en la mitad "cercana"
      float frontSide = step(0.0, ur.y); // y>0 asume parte cercana
      float ringFront = (ring1 + 0.85*ring2 + 0.7*ring3) * frontSide;

      // recorta fuera del planeta para no duplicar
      float insidePlanet = 1.0 - step(0.0, dP);
      ringFront *= insidePlanet;

      // pequeño auto-sombreado por el planeta (contact shadow)
      float contact = smoothstep(0.0, 0.20, abs(dP));
      vec3 cRingsFront = cRings * (0.85 + 0.15*contact);

      col = mix(col, cRingsFront, ringFront);
      aScene = max(aScene, ringFront);

      // clamp & premul
      col = clamp(col, 0.0, 1.0);
      aScene = clamp(aScene, 0.0, 1.0);
      return premul(col, aScene);
    }

    vec4 mainImage(vec2 fragCoord){
      vec2 center = iResolution.xy * 0.5;
      float size = min(iResolution.x, iResolution.y);
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
      targetHover = Math.sqrt(uvX*uvX + uvY*uvY) < 1.2 ? 1 : 0;
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
