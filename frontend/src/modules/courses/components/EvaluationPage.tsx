/* Page donde se renderiza la evaluación de una lección (dinámico para cualquier curso) */

import { useState, useEffect, useRef } from "react"
import type { TEvaluation, TScore } from "../types/CourseStudent"
import { useNavigationHandler } from "../../../hooks/useNavigationHandler";
import '../styles/EvaluationPage.css'
import { IoArrowBackCircleSharp } from "react-icons/io5";
import SendResponseLessonAPI from "../services/SendResponseLesson.server";
import toast from "react-hot-toast";
import { useStudentCourseContext } from "../hooks/useCourse";
import { useNavigate } from "react-router-dom";
/* Page donde se renderiza la evaluación de una lección (dinámico para cualquier curso) */


export default function EvaluationPage() {
  const { evaluation, currentLesson, loadLessonsCourse, palette } = useStudentCourseContext();
  const [response, setResponse] = useState<string>('');
  const [score, setScore] = useState<TScore | null>(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const handleBtnNavigate = useNavigationHandler();
  const [animatedScore, setAnimatedScore] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const navigate = useNavigate()


  // Animación progresiva del puntaje en el modal
  useEffect(() => {
    if (showScoreModal && score) {
      setAnimatedScore(score.oldScore);
      const diff = score.newScore - score.oldScore;
      const duration = 2000;
      const steps = 40;
      const increment = diff / steps;
      let current = score.oldScore;
      let count = 0;
      intervalRef.current = setInterval(() => {
        count++;
        current += increment;
        if (count >= steps) {
          setAnimatedScore(score.newScore);
          if (intervalRef.current) clearInterval(intervalRef.current);
        } else {
          setAnimatedScore(Number(current.toFixed(2)));
        }
      }, duration / steps);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [showScoreModal, score]);

  if (!palette) return <div>Error: No se pudo cargar la paleta de colores.</div>;

  // Maneja la respuesta del estudiante y actualiza progreso y puntaje
  const handleAnswer = async (
    e: React.FormEvent<HTMLFormElement> | null,
    id: TEvaluation['id'],
    response: string,
    questionType: TEvaluation['questionType']
  ) => {
    // [NUEVO]: si viene de un <form>, prevenimos y deshabilitamos el botón submit de inmediato
    let submitterBtn: HTMLButtonElement | null = null; // [NUEVO]: referencia al botón que disparó el submit
    if (e) {
      e.preventDefault();
      // [NUEVO]: obtener el botón "submitter" del evento nativo y deshabilitarlo
      submitterBtn = (e.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
      if (submitterBtn) submitterBtn.disabled = true;
    }

    try {
      const idCourse = currentLesson!.idCourse;
      const idLesson = currentLesson!.id;
      const res = await SendResponseLessonAPI({ id, idCourse, idLesson, response, questionType });
      if (res.status === 200) {
        const score: TScore = {
          newScore: res.score!.new_score,
          oldScore: res.score!.old_score,
          date: res.score!.date
        };
        toast.success(res.message);
        setScore(score);
        setShowScoreModal(true);
        loadLessonsCourse(idCourse);
        return;
      }
      toast.error(res.message);
      navigate('/student/content-page');
    } catch {
      toast.error("Ocurrió un error al enviar la respuesta");
    } finally {
      // [NUEVO]: si el submit vino desde un form, re-habilitar el botón al terminar
      if (submitterBtn) submitterBtn.disabled = false;
    }
  }

  // Cierra el modal de puntaje y vuelve al home del curso
  const handleBtnClickModalScore = () => {
    setShowScoreModal(false);
    navigate(`/student/course/${currentLesson.idCourse}/${currentLesson.name}`);
  }

  if (!evaluation) return <div>No hay evaluación</div>;

  return (
    <div
      className="container-evaluation-lesson"
      style={{ backgroundColor: palette.surface, color: palette.text }}
    >
      {/* Botón de regreso */}
      <button
        className="btn-back-evaluation"
        style={{
          color: palette.accent,
          backgroundColor: palette.surface,
        }}
        onClick={() => handleBtnNavigate('/back')}
      >
        <IoArrowBackCircleSharp />
      </button>

      {/* Pregunta principal */}
      <h2
        className="question-evaluation"
      >
        {evaluation.question}
      </h2>

      {/* Opciones o formulario según el tipo de pregunta */}
      {evaluation.questionType === 'multiple_choice' ? (
        <div className="container-options" style={{'gridTemplateColumns':evaluation.options?.length ===3? '1fr': '1fr 1fr'}}>
          {evaluation.options?.map((option, i) => (
            <button
              key={i}
              type="button"
              className="option"
              style={{
                backgroundColor: palette.surface,
                color: palette.text,
                border: `2px solid ${palette.accent}`,
              }}
              value={option}
              // [NUEVO]: deshabilitar el botón de la opción al instante para bloquear doble click
              onClick={async (ev) => {
                const btn = ev.currentTarget as HTMLButtonElement; // [NUEVO]
                btn.disabled = true;                                // [NUEVO]
                try {
                  await handleAnswer(null, evaluation.id, option, evaluation.questionType); // [NUEVO]
                } finally {
                  btn.disabled = false; // [NUEVO]: re-habilitar (si sigues en la vista actual)
                }
              }}
            >
              {option}
            </button>
          ))}
        </div>
      ) : (
        <form
          className="form-evaluation"
          onSubmit={(e) => handleAnswer(e, evaluation.id, response, evaluation.questionType)}
        >
          <input
            className="input-evaluation"
            type="text"
            value={response}
            placeholder="Escribe tu respuesta aquí..."
            onChange={e => setResponse(e.target.value)}
            style={{ backgroundColor: palette.surface, color: palette.text, border: `1px solid ${palette.accent}` }}
          />
          <input
            className="btn-send-evaluation"
            type="submit"
            style={{ backgroundColor: palette.brand, color: palette.text }}
          />
        </form>
      )}

      {/* Modal de resultados con puntaje animado */}
      {showScoreModal && score && (
        <div
          className="score-modal"
          style={{ backgroundColor: palette.surface, color: palette.text, border: `2px solid ${palette.accent}` }}
        >
          <p className="paragraph-left-top">
            {"Correcto!".split("").map((char, idx) => (
              <span
                key={idx}
                style={{
                  animation: showScoreModal ? `fadeInLetter 0.25s ${idx * 0.1}s forwards` : "none",
                  opacity: 0,
                }}
                className="animated-correct-letter"
              >
                {char}
              </span>
            ))}
          </p>

          <h2 className="title-window-score-modal" style={{ color: palette.brand }}>Resultados</h2>

          <div style={{ position:'relative', display:'inline-block', marginBottom:'1rem' }}>
            <span style={{ color: palette.accent, fontWeight:700, fontSize:'2rem' }}>
              {animatedScore !== null ? animatedScore.toFixed(2) : score.oldScore.toFixed(2)}
            </span>
            <span
              style={{
                position:'absolute', top:'-1.7rem', right:'.5rem',
                background: palette.brand, color: palette.text,
                borderRadius:'16px', padding:'0.2rem 0.7rem',
                fontWeight:600, fontSize:'1rem', boxShadow:'0 2px 8px rgba(0,0,0,0.08)', zIndex:2,
                transition:'opacity 0.3s', opacity: animatedScore !== null && animatedScore < score.newScore ? 1 : 0
              }}
            >
              +{(score.newScore - score.oldScore).toFixed(2)}
            </span>
          </div>

          {animatedScore !== null && animatedScore >= score.newScore && (
            <p style={{ marginTop:'0.5rem' }}>¡Puntaje Acumulado!</p>
          )}

          <p className="date-score">{score.date}</p>
          <button
            onClick={() => handleBtnClickModalScore()}
            style={{ backgroundColor: palette.accent, color: palette.text, border:'none', padding:'0.5rem 1.5rem', borderRadius:'8px', cursor:'pointer', marginTop:'1rem' }}
          >
            Cerrar
          </button>
        </div>
      )}
    </div>
  );
}
