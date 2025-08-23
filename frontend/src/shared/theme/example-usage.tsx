import React from 'react';
import { useTheme } from '../context/ThemeContext';
import './Colors.css';

/**
 * Componente de ejemplo que muestra cómo usar las variables CSS del tema
 * para backgrounds en modo claro y oscuro
 */
const ThemeExample: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="theme-example">
      {/* Header con fondo del tema */}
      <header className="bg-header" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <h1>Ejemplo de Uso del Tema</h1>
        <p>Tema actual: <strong>{theme}</strong></p>
        <button onClick={toggleTheme} className="bg-button" style={{ color: 'white', padding: '0.5rem 1rem', border: 'none', borderRadius: '4px' }}>
          Cambiar a {theme === 'light' ? 'oscuro' : 'claro'}
        </button>
      </header>

      {/* Contenedor principal */}
      <main className="bg-container" style={{ padding: '2rem', borderRadius: '8px', marginBottom: '1rem' }}>
        <h2>Fondos Principales</h2>

        {/* Grid de ejemplos */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>

          {/* Fondo primario */}
          <div className="bg-primary" style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h3>Fondo Primario</h3>
            <p>Usa <code>var(--bg-primary)</code></p>
          </div>

          {/* Fondo secundario */}
          <div className="bg-secondary" style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h3>Fondo Secundario</h3>
            <p>Usa <code>var(--bg-secondary)</code></p>
          </div>

          {/* Fondo terciario */}
          <div className="bg-tertiary" style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h3>Fondo Terciario</h3>
            <p>Usa <code>var(--bg-tertiary)</code></p>
          </div>
        </div>

        {/* Fondos de tarjetas */}
        <h2 style={{ marginTop: '2rem' }}>Fondos de Tarjetas</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>

          <div className="bg-card" style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h4>Tarjeta</h4>
            <p>Fondo: <code>var(--bg-card)</code></p>
          </div>

          <div className="bg-modal" style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h4>Modal</h4>
            <p>Fondo: <code>var(--bg-modal)</code></p>
          </div>

          <div className="bg-container" style={{ padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}>
            <h4>Contenedor</h4>
            <p>Fondo: <code>var(--bg-container)</code></p>
          </div>
        </div>

        {/* Fondos de estado */}
        <h2 style={{ marginTop: '2rem' }}>Fondos de Estado</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginTop: '1rem' }}>

          <div className="bg-success" style={{ padding: '1rem', borderRadius: '8px' }}>
            <h4>Éxito</h4>
            <p>Fondo: <code>var(--bg-success)</code></p>
          </div>

          <div className="bg-warning" style={{ padding: '1rem', borderRadius: '8px' }}>
            <h4>Advertencia</h4>
            <p>Fondo: <code>var(--bg-warning)</code></p>
          </div>

          <div className="bg-error" style={{ padding: '1rem', borderRadius: '8px' }}>
            <h4>Error</h4>
            <p>Fondo: <code>var(--bg-error)</code></p>
          </div>

          <div className="bg-info" style={{ padding: '1rem', borderRadius: '8px' }}>
            <h4>Información</h4>
            <p>Fondo: <code>var(--bg-info)</code></p>
          </div>
        </div>

        {/* Fondos con gradientes */}
        <h2 style={{ marginTop: '2rem' }}>Fondos con Gradientes</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginTop: '1rem' }}>

          <div className="bg-gradient-primary" style={{ padding: '2rem', borderRadius: '8px', color: 'white', textAlign: 'center' }}>
            <h3>Gradiente Primario</h3>
            <p>Usa <code>var(--bg-gradient-primary)</code></p>
          </div>

          <div className="bg-gradient-secondary" style={{ padding: '2rem', borderRadius: '8px', color: 'white', textAlign: 'center' }}>
            <h3>Gradiente Secundario</h3>
            <p>Usa <code>var(--bg-gradient-secondary)</code></p>
          </div>

          <div className="bg-gradient-success" style={{ padding: '2rem', borderRadius: '8px', color: 'white', textAlign: 'center' }}>
            <h3>Gradiente de Éxito</h3>
            <p>Usa <code>var(--bg-gradient-success)</code></p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-footer" style={{ padding: '1rem', textAlign: 'center', borderRadius: '8px' }}>
        <p>Este es un ejemplo de cómo usar las variables CSS del tema para backgrounds</p>
        <p>Cambia el tema usando el botón del header para ver la diferencia</p>
      </footer>
    </div>
  );
};

export default ThemeExample;
