import Lottie from "lottie-react";
import Animation from "./styles/Animations/Error.json";
import "./styles/ServerError.css";
import { useNavigate } from "react-router-dom";

const ServerError = () => {
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
    <div className="error-page server-error-page">
      <div className="error-animation server-error-animation">
        <Lottie animationData={Animation} loop={true} />
      </div>
      <h1 className="error-title server-error-title">Error del servidor</h1>
      <p className="error-text server-error-text">
        ¡Error 500! Parece que hubo un error inesperado en nuestro sistema.
        Estamos trabajando para solucionarlo lo antes posible.
        Por favor, intenta de nuevo más tarde.
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

export default ServerError;
