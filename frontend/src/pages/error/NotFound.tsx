import Lottie from "lottie-react";
import Animation from "./styles/Animations/404 blue.json";
import "./styles/NotFound.css";
import { useNavigate } from "react-router-dom";

const NotFound = () => {
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
    <div className="error-page notfound-page">
      <div className="error-animation notfound-animation">
        <Lottie animationData={Animation} loop={true} />
      </div>
      <h1 className="error-title notfound-title">¡Ups! Página no encontrada</h1>
      <p className="error-text notfound-text">
        ¡Error 404! Esta página decidió que hoy era buen día para hacerse invisible. ¡Y lo logró!
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

export default NotFound;
