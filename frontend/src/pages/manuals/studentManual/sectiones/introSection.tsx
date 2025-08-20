import '../sectiones/styles/introSection.css'
import image from '../../../../assets/learningZone/docentes.png'
const introduction = () => (
  <section>
    <h2 className="introduction-title"> Introducción</h2>
    <p className="introduction-paragraph">
      Learning Zone es una plataforma educativa web que fortalece las competencias digitales de estudiantes de grado 11, especialmente en zonas rurales. Ofrece cursos interactivos para el aprendizaje autónomo y permite a los docentes gestionar contenidos. Promueve el desarrollo de habilidades tecnológicas útiles en el ámbito académico y laboral.
      </p>
      <img src={image} alt="docente" className="docente-photo" />

      <p className="page-number">1</p>
  </section>
    
);
export default introduction;