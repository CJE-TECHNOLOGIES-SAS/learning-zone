import { useState } from "react";
import RegisterStudent from "./RegisterStudent";
// import RegisterStudents from "./RegisterStudents"; // si lo tienes
import { AiOutlineCloseCircle } from "react-icons/ai";
import RegisterStudents from "./RegisterStudents";
import '../styles/OpcRegisterStudents.css'
type Props = {
  onToggleOpcRegisterStudent: () => void; // cierra el panel externo
};

type Mode = "menu" | "single" | "bulk";

export default function OpcRegisterStudent({ onToggleOpcRegisterStudent }: Props) {
  // un sólo estado controla qué vista mostrar
  const [mode, setMode] = useState<Mode>("menu");

  // vuelve al menú sin cerrar el panel
  const handleBackToMenu = () => setMode("menu");

  if (mode === "single") {
    return (
      <div className="container-opc-register-student">
        <button className="btn-cancel-register" onClick={handleBackToMenu}>
          <AiOutlineCloseCircle/>
        </button>
        <RegisterStudent />
      </div>
    );
  }

  if (mode === "bulk") {
    return (
      <div className="container-opc-register-student">
        <button className="btn-cancel-register" onClick={handleBackToMenu}>
          <AiOutlineCloseCircle/>
        </button>
        <div className="placeholder-bulk">
          <RegisterStudents onToggleOpcRegisterStudent ={onToggleOpcRegisterStudent} />
        </div>
      </div>
    );
  }

  // modo "menu"
  return (
    <div className="container-opc-register-student">
      <button className="btn-cancel-register" onClick={onToggleOpcRegisterStudent}>
        <AiOutlineCloseCircle/>
      </button>
      <h2 className="title-container-opc-register-student">¿Qué deseas registrar?</h2>
      <div className="opcs-register-student">
        <button className="btn-opc-register-student" onClick={() => setMode("single")}>
          Estudiante
        </button>
        <button className="btn-opc-register-students" onClick={() => setMode("bulk")}>
          Estudiantes
        </button>
      </div>
    </div>
  );
}
