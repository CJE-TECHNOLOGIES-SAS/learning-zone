import Lottie from "lottie-react";
import Animation from "./styles/Animations/search for employee.json";
import "./styles/InvalidPermission.css";
import { useNavigate } from "react-router-dom";

const InvalidPermission = () => {
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
    <div className="error-page invalid-permission-page">
      <div className="error-animation invalid-permission-animation">
        <Lottie animationData={Animation} loop={true} />
      </div>
      <h1 className="error-title invalid-permission-title">Acceso denegado</h1>
      <p className="error-text invalid-permission-text">
        ¡Error 401! No tienes permisos para acceder a esta página.
        Por favor, inicia sesión con una cuenta que tenga los permisos necesarios.
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

export default InvalidPermission;
