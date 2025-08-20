import '../sections/styles/faqSection.css'
const FAQSection = () => (
  <section>
    <h2 className="FAQ-section-title">Preguntas frecuentes</h2>
    <ul className="FAQ-list">
      <li><strong>¿Cómo actualizo una lección?</strong><br />
      Ve a la sección de mi espacio y alli visualizaras las lecciones de tu curso</li>

      <li><strong>No me sube una lección</strong><br />
      Verifica tu conexión a internet.</li>

      <li><strong>¿Cómo cambio mi contraseña?</strong><br />
      Comunicate con el soporte tecnico</li>
    </ul>
    <p className="page-number">8</p>

  </section>
);

export default FAQSection;