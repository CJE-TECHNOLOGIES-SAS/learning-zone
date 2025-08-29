import { useEffect, useRef, useState, useLayoutEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import imgIcon from "../../assets/Carrusel/img-ier.jpg";
import imgIcon2 from "../../assets/Carrusel/img-ier-2.jpg";
import imgIcon3 from "../../assets/Carrusel/img-ier-3.jpg";
import imgIcon4 from "../../assets/Carrusel/img-ier-4.jpg";
import "./styles/Carrusel.css";
import { useNavigate } from 'react-router-dom';

// ✅ NUEVO: GSAP para animaciones
import gsap from 'gsap';

const items = [
  {
    img: imgIcon,
    title: "¡Estudiantes brillantes!",
    description:
      "Los estudiantes de hoy son curiosos, creativos y aprenden rápido. Este aplicativo fue creado pensando en ustedes.",
  },
  {
    img: imgIcon2,
    title: "Dominan la tecnología",
    description:
      "Con herramientas como Word, Excel y PowerPoint, muestran su potencial y crean proyectos increíbles.",
  },
  {
    img: imgIcon3,
    title: "Organizados y capaces",
    description:
      "Excel te permite planear, analizar y tomar decisiones de forma lógica. Una habilidad valiosa en cualquier área.",
  },
  {
    img: imgIcon4,
    title: "El futuro es de ustedes",
    description:
      "Tienen talento, energía y grandes sueños. Este aplicativo es solo una herramienta más en su camino al éxito.",
  },
];

export default function Carrusel() {
  const [current, setCurrent] = useState(0);
  const total = items.length;
  const navigate = useNavigate();

  // ============================
  // Refs para animaciones GSAP
  // ============================
  const rootRef = useRef<HTMLDivElement>(null);          // scope para gsap.context
  const listRef = useRef<HTMLUListElement>(null);        // lista del carrusel
  const heroTitleRef = useRef<HTMLHeadingElement>(null); // título principal
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null); // subtítulo
  const heroCtasRef = useRef<HTMLDivElement>(null);      // botones de acción
  const carruselItemsRef = useRef<HTMLLIElement[]>([]);  // items del carrusel

  const goTo = (idx: number) => {
    const newIndex = (idx + total) % total;
    setCurrent(newIndex);
  };

  // ============================
  // Animaciones al montar
  // ============================
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Entrada del título principal
      gsap.from(heroTitleRef.current, {
        y: -40,
        duration: 0.8,
        ease: "power2.out"
      });

      // Entrada del subtítulo
      gsap.from(heroSubtitleRef.current, {
        y: -20,
        duration: 1,
        delay: 0.2,
        ease: "power2.out"
      });

      // Entrada de los botones de acción
      gsap.from(heroCtasRef.current, {
        y: -10,
        x: -10,
        duration: 0.8,
        delay: 0.8,
        ease: "sine.in"
      });

      // Entrada de los items del carrusel
      gsap.from(carruselItemsRef.current, {
        x: 100,
        duration: 0.8,
        delay: 0.6,
        stagger: 0.1,
        ease: "expo.out"
      });

      // Animación continua del título (efecto flotante sutil)
      gsap.to(heroTitleRef.current, {
        y: -2,
        x: -5,
        duration: 2,
        ease: "power1.inOut",
        yoyo: true,
        repeat: -1
      });

    }, rootRef);

    return () => ctx.revert();
  }, []);

  // ============================
  // Animaciones del carrusel
  // ============================
  useEffect(() => {
    if (listRef.current) {
      // Animación suave del carrusel
      gsap.to(listRef.current, {
        x: `-${current * 100}%`,
        duration: 0.8,
        ease: "power1.inOut"
      });

      // Efecto de scale para el item actual (sin opacidad)
      carruselItemsRef.current.forEach((item, index) => {
        if (item) {
          if (index === current) {
            gsap.to(item, {
              scale: 1.05,
              duration: 0.5,
              ease: "power2.out"
            });
          } else {
            gsap.to(item, {
              scale: 1,
              duration: 0.5,
              ease: "power2.out"
            });
          }
        }
      });
    }
  }, [current]);

  // Auto-play del carrusel
  useEffect(() => {
    const interval = setInterval(() => {
      goTo(current + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, [current]);

  const handleCickContinue = () => {
    // Animación de salida antes de navegar
    gsap.to(rootRef.current, {
      y: -50,
      duration: 0.5,
      ease: "power2.in",
      onComplete: () => {
        navigate('/redirect');
      }
    });
  };

  // ============================
  // Micro-interacciones de botones
  // ============================
  const onButtonEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.05,
      y: -3,
      duration: 0.2,
      ease: "power2.out"
    });
  };

  const onButtonLeave = (e: React.MouseEvent<HTMLAnchorElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      y: 0,
      duration: 0.2,
      ease: "power2.out"
    });
  };

  const onNavButtonEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1.1,
      backgroundColor: "rgba(243, 159, 16, 0.9)",
      duration: 0.2,
      ease: "power2.out"
    });
  };

  const onNavButtonLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    gsap.to(e.currentTarget, {
      scale: 1,
      backgroundColor: "rgba(179, 131, 50, 0.892)",
      duration: 0.2,
      ease: "power2.out"
    });
  };

  return (
    <section ref={rootRef} className="section-carrusel">
      <section className="hero-landing">
        <div className="hero-landing__content">
          <h1 ref={heroTitleRef} className="hero-landing__title">
            Aprende, Crea <br />
            Y Conquista El Mundo Digital
          </h1>
          <p ref={heroSubtitleRef} className="hero-landing__subtitle">
            Cursos interactivos, evaluaciones en tiempo real y herramientas para estudiantes y docentes.
            Prepárate para el futuro, hoy.
          </p>
          <div ref={heroCtasRef} className="hero-landing__ctas">
            <a
              onClick={handleCickContinue}
              className="btn btn--primary"
              onMouseEnter={onButtonEnter}
              onMouseLeave={onButtonLeave}
            >
              Comenzar ahora
            </a>
            <a
              onClick={handleCickContinue}
              className="btn btn--ghost"
              onMouseEnter={onButtonEnter}
              onMouseLeave={onButtonLeave}
            >
              Ver cursos
            </a>
          </div>
        </div>
      </section>

      <div className="container-carrusel">
        <ul
          ref={listRef}
          className="carrusel-list"
        >
          {items.map((item, i) => (
            <li
              key={i}
              className="carrusel-item"
              ref={el => {
                if (el) carruselItemsRef.current[i] = el;
              }}
            >
              <img src={item.img} alt={item.title} />
              <div className="texto">
                <h2>{item.title}</h2>
                <p>{item.description}</p>
              </div>
            </li>
          ))}
        </ul>

        <button
          aria-label="Anterior"
          className="slider-nav prev"
          onClick={() => goTo(current - 1)}
          onMouseEnter={onNavButtonEnter}
          onMouseLeave={onNavButtonLeave}
        >
          <ChevronLeft />
        </button>
        <button
          aria-label="Siguiente"
          className="slider-nav next"
          onClick={() => goTo(current + 1)}
          onMouseEnter={onNavButtonEnter}
          onMouseLeave={onNavButtonLeave}
        >
          <ChevronRight />
        </button>
      </div>
    </section>
  );
}
