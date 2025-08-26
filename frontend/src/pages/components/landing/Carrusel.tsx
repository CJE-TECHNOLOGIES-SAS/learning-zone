import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import imgIcon from "../../assets/Carrusel/img-ier.jpg";
import imgIcon2 from "../../assets/Carrusel/img-ier-2.jpg";
import imgIcon3 from "../../assets/Carrusel/img-ier-3.jpg";
import imgIcon4 from "../../assets/Carrusel/img-ier-4.jpg";
import "./styles/Carrusel.css";
import { useNavigate } from "react-router-dom";

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
  const listRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();

  const goTo = (idx: number) => {
    const newIndex = (idx + total) % total;
    setCurrent(newIndex);
  };

  useEffect(() => {
    const interval = setInterval(() => {
      goTo(current + 1);
    }, 8000);
    return () => clearInterval(interval);
  }, [current]);

  const handleCickContinue =()=>{
    navigate('/redirect')

  }

  return (
    <section className="section-carrusel">
      <section className="hero-landing">
        <div className="hero-landing__content">
          <h1 className="hero-landing__title">
            Aprende, Crea <br />
            Y Conquista El Mundo Digital
          </h1>
          <p className="hero-landing__subtitle">
            Cursos interactivos, evaluaciones en tiempo real y herramientas para estudiantes y docentes.
            Prepárate para el futuro, hoy.
          </p>
          <div className="hero-landing__ctas">
            <a onClick={handleCickContinue} className="btn btn--primary">Comenzar ahora</a>
            <a onClick={handleCickContinue} className="btn btn--ghost">Ver cursos</a>
          </div>
        </div>
      </section>
      <div className="container-carrusel">
        <ul
          ref={listRef}
          style={{ transform: `translateX(-${current * 100}%)` }}
          className="carrusel-list"
        >
          {items.map((item, i) => (
            <li key={i} className="carrusel-item">
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
        >
          <ChevronLeft />
        </button>
        <button
          aria-label="Siguiente"
          className="slider-nav next"
          onClick={() => goTo(current + 1)}
        >
          <ChevronRight />
        </button>
      </div>
    </section>
  );
}
