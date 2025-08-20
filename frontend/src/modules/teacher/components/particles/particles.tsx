"use client";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import Particles, { initParticlesEngine } from "@tsparticles/react";
import type { Engine, Container, ISourceOptions } from "@tsparticles/engine";
import { loadBigCirclesPreset } from "@tsparticles/preset-big-circles";
import './styles/ParticlesBG.css'
function ParticlesBGBase() {
  const [ready, setReady] = useState(false);
  const containerRef = useRef<Container | null>(null);

  useEffect(() => {
    let mounted = true;
    initParticlesEngine(async (engine: Engine) => {
      await loadBigCirclesPreset(engine);
    }).then(() => { if (mounted) setReady(true); });
    return () => { mounted = false; };
  }, []);

  const options = useMemo<ISourceOptions>(() => ({
    preset: "bigCircles",
    background: { color: { value: "transparent" } },
    fullScreen: { enable: false },   
    detectRetina: true,
    fpsLimit: 60,
    pauseOnBlur: false,
    pauseOnOutsideViewport: false,
    particles: { move: { enable: true, speed: 2 } },
  }), []);

  if (!ready) return null;

  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        zIndex: -1,           
        pointerEvents: "none",
        overflow: "hidden",
        width: "100%",
        height: "1090px",
      }}
    >
      <Particles
        id="tsparticles"
        options={options}
        particlesLoaded={async (container?: Container): Promise<void> => {
          if (!container) return;
          containerRef.current = container;
          // 🔒 bloquea reinicios internos
          const patch = container as unknown as { refresh?: () => void; resize?: () => void };
          patch.refresh = () => {};
          patch.resize  = () => {};
        }}
      />
    </div>
  );
}

export default memo(ParticlesBGBase, () => true); // no re-render aunque el form cambie
