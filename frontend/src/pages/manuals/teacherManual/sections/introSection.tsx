import '../sections/styles/introSection.css'
import image from '../../../../assets/learningZone/docentes.png'
const Introduction = () => (
  <section>
    <h2 className="introduction-title">Introducción</h2>
    <p className="introduction-parrafo">
Este manual está dirigido a docentes y administradores de la plataforma Learning Zone, una herramienta web enfocada en fortalecer las competencias digitales de estudiantes de grado 11 en el área de la tecnología. Permite gestionar cursos, evaluaciones y estudiantes. El objetivo es apoyar y personalizar el proceso educativo, especialmente en contextos rurales.    </p>
    <img src={image} alt="docente" className="docente-photo" />

    <p className="page-number">1</p>

  </section>
);
export default Introduction;