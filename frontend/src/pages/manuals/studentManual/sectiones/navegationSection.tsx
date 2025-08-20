import '../sectiones/styles/navegationSection.css'
const NavigationSection = () => (
  <section>
    <h2 className="navigation-section-title">Navegación general</h2>
    <ul className="navigation-list">
      <li>
      <li><strong>Filtrar curso : </strong>Puede filtrar un curso desde su home principal</li>
      <li><strong>Realización de lecciones de un curso : </strong>Puede realizar y ver las lecciones completadas </li> 
      <li><strong>Realización de evaluaciones : </strong> Puede realizar evaluación de su lección para avanzar a la siguiente </li>   
      <li><strong>Ver progreso : </strong>Puede ver su progreso acumulado </li>      
      <li><strong>Crear comentario : </strong>Crear, eliminar o editar comentario y responder</li> 
      <li><strong>Envio de quejas : </strong>Puede realizar quejas y sugerencias </li> 
      <li><strong>Cerrar sesión : </strong>Puede cerrar su sesion en el aplicativo</li> 
      </li>
    </ul>
    <p className="page-number">3</p>
  </section>
);
export default NavigationSection;