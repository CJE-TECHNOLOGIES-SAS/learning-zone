import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec3 } from "ogl";

interface GlobeProps {
  hue?: number;
  hoverIntensity?: number;
  rotateOnHover?: boolean;
  forceHoverState?: boolean;
}

export default function Globe({
  hue = 0,
  hoverIntensity = 0.2,
  rotateOnHover = true,
  forceHoverState = false,
}: GlobeProps) {
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

    // --- Noise (para “continentes”) ---
    vec3 hash33(vec3 p3){
      p3 = fract(p3 * vec3(0.1031, 0.11369, 0.13787));
      p3 += dot(p3, p3.yxz + 19.19);
      return -1.0 + 2.0 * fract(vec3(
        p3.x + p3.y,
        p3.x + p3.z,
        p3.y + p3.z
      ) * p3.zyx);
    }
    float snoise3(vec3 p){
      const float K1 = 0.333333333;
      const float K2 = 0.166666667;
      vec3 i = floor(p + (p.x + p.y + p.z) * K1);
      vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);
      vec3 e = step(vec3(0.0), d0 - d0.yzx);
      vec3 i1 = e * (1.0 - e.zxy);
      vec3 i2 = 1.0 - e.zxy * (1.0 - e);
      vec3 d1 = d0 - (i1 - K2);
      vec3 d2 = d0 - (i2 - K1);
      vec3 d3 = d0 - 0.5;
      vec4 h = max(0.6 - vec4(
        dot(d0,d0), dot(d1,d1), dot(d2,d2), dot(d3,d3)
      ), 0.0);
      vec4 n = h*h*h*h * vec4(
        dot(d0, hash33(i)),
        dot(d1, hash33(i + i1)),
        dot(d2, hash33(i + i2)),
        dot(d3, hash33(i + 1.0))
      );
      return dot(vec4(31.316), n);
    }

    // --- SDF helpers ---
    float sdCircle(vec2 p, float r){ return length(p) - r; }
    float sdRoundedBox(vec2 p, vec2 b, float r){
      vec2 q = abs(p) - (b - vec2(r));
      return length(max(q,0.0)) + min(max(q.x,q.y), 0.0) - r;
    }
    float sdSegment(vec2 p, vec2 a, vec2 b){
      vec2 pa = p - a, ba = b - a;
      float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0);
      return length(pa - ba*h);
    }
    vec2 rot2(vec2 p, float a){ float s = sin(a), c = cos(a); return vec2(c*p.x - s*p.y, s*p.x + c*p.y); }

    // --- Paleta base ---
    const vec3 oceanBase = vec3(0.20, 0.55, 0.95);
    const vec3 landBase  = vec3(0.25, 0.73, 0.47);
    const vec3 stand1    = vec3(0.11, 0.14, 0.24);
    const vec3 stand2    = vec3(0.75, 0.80, 0.88);

    // Meridianos/Paralelos (líneas finas en coords esféricas)
    float gridMeridian(float lon, float thickness, float count){
      float v = abs(sin(lon * count));
      return 1.0 - smoothstep(thickness, thickness*2.0, v);
    }
    float gridParallel(float lat, float thickness, float count){
      float v = abs(sin(lat * count));
      return 1.0 - smoothstep(thickness, thickness*2.0, v);
    }

    vec4 drawGlobe(vec2 uv){
      // Rotación global + warp por hover
      uv = rot2(uv, rot);
      uv.x += hover * hoverIntensity * 0.05 * sin(uv.y*10.0 + iTime);
      uv.y += hover * hoverIntensity * 0.05 * sin(uv.x*10.0 + iTime);

      // Radio del globo
      float R = 0.56;
      float dSphere = sdCircle(uv, R);
      float mSphere = 1.0 - smoothstep(0.0, 0.012, dSphere);

      // Normal “esférica” (para luz) y coords esféricas
      vec2 uvs = uv / R;
      float z = sqrt(max(0.0, 1.0 - dot(uvs, uvs)));
      vec3 n = normalize(vec3(uvs.x, uvs.y, z));

      // Rotación “terrestre” (sobre eje Y) para simular giro
      float spin = iTime * 0.25;
      float cs = cos(spin), sn = sin(spin);
      vec3 nr = vec3( n.x*cs + n.z*sn, n.y, -n.x*sn + n.z*cs );

      // Longitud/Latitud
      float lon = atan(nr.z, nr.x);      // -pi..pi
      float lat = asin(nr.y);            // -pi/2..pi/2

      // Luz
      vec3 L = normalize(vec3(0.5, 0.4, 0.7));
      float ndl = clamp(dot(nr, L), 0.0, 1.0);

      // “Continentes” por ruido en la esfera
      float landNoise = snoise3(nr * 4.0) * 0.5 + 0.5;
      float landMask  = smoothstep(0.56, 0.60, landNoise); // umbral
      vec3 ocean = adjustHue(oceanBase, hue);
      vec3 land  = adjustHue(landBase,  hue);
      vec3 globeCol = mix(ocean, land, landMask);

      // sombreado lambert + un poco de ambiente
      globeCol *= (0.42 + 0.58 * ndl);

      // Meridianos y paralelos
      float mer = gridMeridian(lon, 0.03, 10.0);
      float par = gridParallel(lat, 0.03, 7.0);
      vec3 gridCol = vec3(1.0) * 0.25;
      globeCol = mix(globeCol, gridCol, clamp((mer + par) * 0.5, 0.0, 1.0));

      // Halo atmosférico
      float atmo = 1.0 - smoothstep(0.02, 0.16, abs(dSphere));
      vec3 atmoCol = adjustHue(vec3(0.60, 0.85, 1.0), hue) * 0.5;
      globeCol = mix(globeCol, atmoCol, atmo * 0.35);

      // Soporte: anillo inclinado + eje + base
      float tilt = 0.55;
      vec2 ur = rot2(uv, tilt);

      // Anillo (cradle)
      float ringR = R * 1.02;
      float ringBand = 1.0 - smoothstep(0.010, 0.018, abs(sdCircle(ur, ringR)));
      vec3 ringCol = adjustHue(stand2, hue);
      globeCol = mix(globeCol, ringCol, ringBand * 0.9);
      float aScene = max(mSphere, ringBand * 0.9);

      // Eje (segmento atravesando el globo)
      vec2 aAx = rot2(vec2(-ringR, 0.0), -tilt);
      vec2 bAx = rot2(vec2( ringR, 0.0), -tilt);
      float axisMask = 1.0 - smoothstep(0.010, 0.018, sdSegment(uv, aAx, bAx));
      globeCol = mix(globeCol, ringCol * 0.85, axisMask);
      aScene = max(aScene, axisMask);

      // Columna y base
      float colMask = 1.0 - smoothstep(0.0, 0.010, sdRoundedBox(uv - vec2(0.0, -0.35), vec2(0.06, 0.22), 0.04));
      float baseMask= 1.0 - smoothstep(0.0, 0.010, sdRoundedBox(uv - vec2(0.0, -0.58), vec2(0.32, 0.08), 0.10));
      vec3 standCol = mix(adjustHue(stand1, hue), adjustHue(stand2, hue), 0.35);
      globeCol = mix(globeCol, standCol, colMask);
      globeCol = mix(globeCol, standCol, baseMask);
      aScene = max(aScene, max(colMask, baseMask));

      // clamp y salida premultiplicada
      globeCol = clamp(globeCol, 0.0, 1.0);
      aScene = clamp(aScene, 0.0, 1.0);
      return vec4(globeCol * aScene, aScene);
    }

    vec4 mainImage(vec2 fragCoord){
      vec2 center = iResolution.xy * 0.5;
      float size  = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;
      return drawGlobe(uv);
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

  return <div ref={ctnDom} className="Globe-container" />;
}
