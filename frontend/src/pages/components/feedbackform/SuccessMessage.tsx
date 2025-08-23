import "./styles/Complain.css";
import './styles/SuccesMessage.css'
interface Props {
  onReset: () => void;
}

const SuccessMessage: React.FC<Props> = ({ onReset }) => {
  return (
    <div className="success-message">
      <h2>¡Gracias por tu mensaje!</h2>
      <p>Tu queja ha sido registrada correctamente.</p>
      <button onClick={onReset}>Enviar otra</button>
    </div>
  );
};

export default SuccessMessage;
