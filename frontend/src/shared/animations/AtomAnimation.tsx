import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle, Vec3 } from "ogl";

interface AtomProps {
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
}: AtomProps) {
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

    // Parámetros de órbitas (elipses)
    uniform float o1a;  // semi-eje mayor
    uniform float o1b;  // semi-eje menor
    uniform float o1rot;
    uniform float o1speed;

    uniform float o2a;
    uniform float o2b;
    uniform float o2rot;
    uniform float o2speed;

    uniform float o3a;
    uniform float o3b;
    uniform float o3rot;
    uniform float o3speed;

    // Tamaños de electrones
    uniform float e1Size;
    uniform float e2Size;
    uniform float e3Size;

    varying vec2 vUv;

    // --------- Utils de color (hue shift YIQ) ---------
    vec3 rgb2yiq(vec3 c){
      float y = dot(c, vec3(0.299,0.587,0.114));
      float i = dot(c, vec3(0.596,-0.274,-0.322));
      float q = dot(c, vec3(0.211,-0.523,0.312));
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
      return yiq2rgb(vec3(y.x,i,q));
    }

    // --------- SDF helpers ---------
    float sdCircle(vec2 p, float r){ return length(p) - r; }

    // Triángulo equilátero SDF (by iq)
    float sdEquilateralTriangle(vec2 p, float r){
      const float k = 1.7320508; // sqrt(3)
      p.x = abs(p.x) - r;
      p.y = p.y + r/k;
      if (p.x + k*p.y > 0.0) p = vec2(p.x - k*p.y, -k*p.x - p.y)/2.0;
      p.x -= clamp(p.x, -2.0*r, 0.0);
      return -length(p) * sign(p.y);
    }

    float sdStar(vec2 p, float m, float rOuter, float rInner){
      float a = atan(p.y,p.x);
      float k = 3.14159265/m;
      float d = cos(floor(0.5 + a/k)*k - a) * length(p);
      float idx = mod(floor(0.5 + a/k), 2.0);
      float r = mix(rOuter, rInner, idx);
      return d - r;
    }

    vec2 rot2(vec2 p, float a){
      float s = sin(a), c = cos(a);
      return vec2(c*p.x - s*p.y, s*p.x + c*p.y);
    }

    // Distancia "de línea" a una elipse aproximada: |x^2/a^2 + y^2/b^2 - 1|
    float ellipseLineMask(vec2 p, float a, float b, float thickness){
      float v = (p.x*p.x)/(a*a) + (p.y*p.y)/(b*b) - 1.0;
      return 1.0 - smoothstep(thickness, thickness*1.6, abs(v));
    }

    // Posición en la elipse parametrizada
    vec2 ellipsePos(float t, float a, float b){
      return vec2(a*cos(t), b*sin(t));
    }

    // --------- Paleta base ---------
    const vec3 base1 = vec3(0.611765, 0.262745, 0.996078);
    const vec3 base2 = vec3(0.298039, 0.760784, 0.913725);
    const vec3 base3 = vec3(0.062745, 0.078431, 0.600000);

    vec4 premul(vec3 c, float a){ return vec4(c*a, a); }

    vec4 drawAtom(vec2 uv){
      // NÚCLEO
      float nucleusR = 0.24;
      float dN = sdCircle(uv, nucleusR);
      float nucleus = 1.0 - smoothstep(0.0, 0.02, dN);
      vec3 cN = mix(adjustHue(base1, hue), adjustHue(base2, hue), 0.4);
      cN += vec3(0.08) * (1.0 - smoothstep(0.05, 0.22, abs(dN))); // leve glow interior

      // ORBITAS (líneas elípticas)
      float thickness = 0.02;

      // Órbita 1
      vec2 p1 = rot2(uv, o1rot);
      float ring1 = ellipseLineMask(p1, o1a, o1b, thickness);

      // Órbita 2
      vec2 p2 = rot2(uv, o2rot);
      float ring2 = ellipseLineMask(p2, o2a, o2b, thickness);

      // Órbita 3
      vec2 p3 = rot2(uv, o3rot);
      float ring3 = ellipseLineMask(p3, o3a, o3b, thickness);

      // ELECTRONES (formas distintas)
      float t = iTime;

      // e1: círculo
      float ang1 = -o1speed * t;
      vec2 e1 = rot2(ellipsePos(ang1, o1a, o1b), o1rot);
      float a1 = 1.0 - smoothstep(0.0, e1Size*0.28, sdCircle(uv - e1, e1Size));
      vec3 cE1 = vec3(1.0, 0.85, 0.30);

      // e2: triángulo
      float ang2 = -o2speed * t;
      vec2 e2 = rot2(ellipsePos(ang2, o2a, o2b), o2rot);
      float a2 = 1.0 - smoothstep(0.0, e2Size*0.28, sdEquilateralTriangle(uv - e2, e2Size));
      vec3 cE2 = vec3(0.35, 0.95, 1.0);

      // e3: estrella
      float ang3 = -o3speed * t;
      vec2 e3 = rot2(ellipsePos(ang3, o3a, o3b), o3rot);
      float a3 = 1.0 - smoothstep(0.0, e3Size*0.28, sdStar(uv - e3, 5.0, e3Size, e3Size*0.55));
      vec3 cE3 = vec3(0.92, 0.55, 1.0);

      // Composición
      vec3 col = vec3(0.0);
      float alpha = 0.0;

      // Anillos con color sutil
      vec3 ringCol = adjustHue(base3, hue);
      col = mix(col, ringCol, clamp(ring1*0.85 + ring2*0.85 + ring3*0.85, 0.0, 1.0));
      alpha = max(alpha, max(ring1, max(ring2, ring3)) * 0.8);

      // Núcleo
      col = mix(col, cN, nucleus);
      alpha = max(alpha, nucleus);

      // Electrones + glow
      col = mix(col, cE1, a1);
      col += cE1 * exp(-6.0 * length(uv - e1)) * 0.25;
      alpha = max(alpha, a1);

      col = mix(col, cE2, a2);
      col += cE2 * exp(-6.0 * length(uv - e2)) * 0.25;
      alpha = max(alpha, a2);

      col = mix(col, cE3, a3);
      col += cE3 * exp(-6.0 * length(uv - e3)) * 0.25;
      alpha = max(alpha, a3);

      col = clamp(col, 0.0, 1.0);
      alpha = clamp(alpha, 0.0, 1.0);
      return premul(col, alpha);
    }

    vec4 mainImage(vec2 fragCoord){
      vec2 center = iResolution.xy * 0.5;
      float size = min(iResolution.x, iResolution.y);
      vec2 uv = (fragCoord - center) / size * 2.0;

      // Rotación global sutil (en hover)
      float s = sin(rot), c = cos(rot);
      uv = vec2(c*uv.x - s*uv.y, s*uv.x + c*uv.y);

      // Hover warp
      uv.x += hover * hoverIntensity * 0.05 * sin(uv.y * 10.0 + iTime);
      uv.y += hover * hoverIntensity * 0.05 * sin(uv.x * 10.0 + iTime);

      return drawAtom(uv);
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

        // Defaults de órbitas: tres elipses separadas y rotadas
        o1a: { value: 0.70 }, o1b: { value: 0.35 }, o1rot: { value: 0.0 },   o1speed: { value: 0.9 },
        o2a: { value: 0.90 }, o2b: { value: 0.30 }, o2rot: { value: 1.05 },  o2speed: { value: 1.1 },
        o3a: { value: 1.10 }, o3b: { value: 0.40 }, o3rot: { value: -0.8 },  o3speed: { value: 1.3 },

        e1Size: { value: 0.055 },
        e2Size: { value: 0.070 },
        e3Size: { value: 0.085 },
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
      const width = rect.width;
      const height = rect.height;
      const size = Math.min(width, height);
      const centerX = width / 2;
      const centerY = height / 2;
      const uvX = ((x - centerX) / size) * 2.0;
      const uvY = ((y - centerY) / size) * 2.0;
      targetHover = Math.sqrt(uvX * uvX + uvY * uvY) < 1.2 ? 1 : 0;
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

  return <div ref={ctnDom} className="Atom-container" />;
}
