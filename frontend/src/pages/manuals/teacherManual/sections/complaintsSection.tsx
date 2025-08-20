import '../sections/styles/complaintsSection.css'
import image from '../../../../assets/learningZone/sugerencias.png'
export const ComplaintsSection = () => {
  return (
    <div className="manual-subsection">
      <h3 className="complaints-Section-title">Enviar quejas y sugerencias</h3>
      <ul className="complaint-list">
        <li><strong>1 : </strong>Ve a la sección ubicada en el footer inquiteudes y sugerencias.</li>
        <li><strong>2 : </strong>Encontraras un formulario para realizar tu queja o sugerencia al equipo tecnico.</li>
      </ul>
      <img src={image} alt="suggestion" className="suggestion-photo" />

      <p className="page-number">7</p>

    </div>
  );
};
