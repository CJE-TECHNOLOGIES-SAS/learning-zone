import '../sections/styles/navigationSection.css'
const NavigationSection = () => (
  <section>
    <h2 className="navigation-section-title">Navegación general</h2>
    <ul className="navigation-list">
      <li><strong>Gestión de cursos</strong>: crear, desactivar curso para editar o eliminar cursos.</li>
      <li><strong>Gestión de lecciones</strong>: crear y eliminar lecciones.</li>
      <li><strong>Gestión de estudiantes</strong>: ver información de estudiantes, progreso de los estudiantes</li>
      <li><strong>Evaluaciones</strong>: crear y revisar evaluaciones de los estudiantes del curso.</li>
      <li><strong>Notificaciones</strong>: Crear y gestionar notificaciones</li>
      <li><strong>Envio de quejas</strong>: Enviar sugerencias o reclamos.</li>
    </ul>
    <p className="page-number">3</p>
  </section>
);
export default NavigationSection;