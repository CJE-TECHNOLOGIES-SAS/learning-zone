import Lottie from "lottie-react";
import Animation from "./styles/Animations/Under Maintenance.json";
import "./styles/WebsiteMaintenance.css";
import { useNavigate } from "react-router-dom";

const WebsiteMaintenance = () => {
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
    <div className="error-page website-maintenance-page">
      <div className="error-animation website-maintenance-animation">
        <Lottie animationData={Animation} loop={true} />
      </div>
      <h1 className="error-title website-maintenance-title">Sitio en mantenimiento</h1>
      <p className="error-text website-maintenance-text">
        ¡Error 503! Estamos realizando mantenimiento en nuestro sitio web.
        Por favor, vuelve más tarde. Gracias por tu paciencia.
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

export default WebsiteMaintenance;
