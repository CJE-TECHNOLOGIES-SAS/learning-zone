import '../sections/styles/supportSection.css'
import image from '../../../../assets/cjeTect/myteam.jpg'
const SupportSection = () => (
  <section>
    <h2 className="support-section-title"> Soporte técnico</h2>
    <p className="email"><strong>Correo:</strong> <a href="mailto:cjetechnologies.tech@gmail.com">cjetechnologies.tech@gmail.com</a></p>
    <p className="support-hour"><strong>Horario de atención:</strong> Lunes a viernes, 8:00 a.m. - 4:00 p.m.</p>
    <img src={image} alt="suggestion" className="suggestion-photo" />

    <p className="page-number">10</p>
  </section>
  
);
export default SupportSection;