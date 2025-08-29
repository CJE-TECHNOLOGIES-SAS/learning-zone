import Lottie from "lottie-react";
import Animation from "./styles/Animations/Session Expired.json";
import "./styles/UnauthorizedAccess.css";
import { useNavigate } from "react-router-dom";

const UnauthorizedAccess = () => {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/", { replace: true });
  };

  const handleGoBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="error-page unauthorized-access-page">
      <div className="error-animation unauthorized-access-animation">
        <Lottie animationData={Animation} loop={true} />
      </div>
      <h1 className="error-title unauthorized-access-title">Acceso no autorizado</h1>
      <p className="error-text unauthorized-access-text">
        ¡Error 403! No tienes autorización para acceder a este recurso.
        Si crees que esto es un error, contacta al administrador del sistema.
      </p>
      <div className="error-actions">
        <button className="error-button primary-button" onClick={handleGoHome}>
          Ir al inicio
        </button>
        <button className="error-button secondary-button" onClick={handleGoBack}>
          Volver atrás
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedAccess;
