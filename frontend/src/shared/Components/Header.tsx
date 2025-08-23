import Navbar from "./Navbar";
import './styles/Header.css'
import { useNavigationHandler } from "../../hooks/useNavigationHandler";
import AuthNavbar from "./AuthNavbar";

// GSAP solo para movimientos (sin tocar colores)
import gsap from "gsap";
import { useLayoutEffect, useRef } from "react";

type THeaderProps = {
  isPublic: boolean
}

export default function Header({ isPublic }: THeaderProps) {
  const handleBtnNavigate = useNavigationHandler();

  // Refs para animaciones
  const headerRef = useRef<HTMLElement>(null);
  const nameRef = useRef<HTMLHeadingElement>(null);
  const zoneRef = useRef<HTMLSpanElement>(null);
  const underlineRef = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // 1) Entrada del header: pequeño slide desde arriba (movimiento + opacidad)
      gsap.from(headerRef.current, {
        y: -8,
        opacity: 0,
        duration: 0.35,
        ease: "power2.out",
        clearProps: "transform,opacity"
      });

      // 2) “Zone” flotando en loop (movimiento vertical + leve oscilación)
      if (zoneRef.current) {
        zoneRef.current.style.willChange = "transform"; // performance hint

        // Flotación vertical
        gsap.to(zoneRef.current, {
          x:-16,
          y: -0,
          duration:3,
          ease: "power3.inOut",
          yoyo: true,
          repeat: -1,
          color:'#48e',

        });

        // Oscilación angular sutil (no cambia color)
        gsap.to(zoneRef.current, {
          rotation: .5,
          duration: 3.2,
          ease: "power2.out",
          yoyo: true,
          repeat: -1,
          transformOrigin: "150% 10%"
        });
      }

    }, headerRef);

    return () => ctx.revert();
  }, []);

  return (
    <header
      ref={headerRef}
      className="header"
      // Fondo blanco como pediste (no tocamos colores de texto)
      style={{ background: "#fff" }}
    >
      <h1
        ref={nameRef}
        onClick={() => handleBtnNavigate('/')}
        className="name-app"
      >
        Learning{" "}
        <span ref={zoneRef} className="word-zone" style={{ display: "inline-block" }}>
          Zone
        </span>

        {/* Subrayado animado: usa el color actual del texto (currentColor), sin cambiar paleta */}
        <span
          ref={underlineRef}
          aria-hidden="true"
          style={{
            display: "block",
            height: "2px",
            marginTop: "6px",
            backgroundColor: "currentColor", // mismo color del texto
            width: "28%",                    // valor inicial; GSAP lo animará
            borderRadius: "999px"
          }}
        />
      </h1>

      <div className="header-controls">
        {isPublic ? <Navbar /> : <AuthNavbar />}
      </div>
    </header>
  );
}
