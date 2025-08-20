import '../sections/styles/accesSection.css'
import image from '../../../../assets/learningZone/loguin.png'
const AccessSection = () => (
<div className="acces-section-container">
  <section>
    <h2 className= "acces-section-title">  Acceso a la plataforma</h2>
    <ul className="acces-section-list">
      <li>Ingresa al sitio oficial de Learning Zone.</li>
      <li>Haz clic en “Iniciar sesión”.</li>
      <li>Ingresa su correo y contraseña y será redirigido al panel de administrador</li>
    </ul>
    <br></br>
 
    <img src={image} alt="Logo de Learning Zone" className="acces-section-photo" />
   <p className="page-number">2</p>

  </section>

  </div>
);

export default AccessSection;