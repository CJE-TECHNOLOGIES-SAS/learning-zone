import React from 'react';
import { useNavigate } from 'react-router-dom';
import './styles/ErrorBase.css';

const ErrorTestPage: React.FC = () => {
  const navigate = useNavigate();

  const testErrors = [
    { path: '/401', name: 'Error 401 - Permiso Inválido', description: 'Prueba la página de acceso denegado' },
    { path: '/403', name: 'Error 403 - Acceso No Autorizado', description: 'Prueba la página de acceso no autorizado' },
    { path: '/404', name: 'Error 404 - Página No Encontrada', description: 'Prueba la página de página no encontrada' },
    { path: '/500', name: 'Error 500 - Error del Servidor', description: 'Prueba la página de error del servidor' },
    { path: '/503', name: 'Error 503 - Mantenimiento', description: 'Prueba la página de mantenimiento' }
  ];

  return (
    <div className="error-page" style={{ background: 'var(--color-primary-blue)' }}>
      <h1 className="error-title">Página de Prueba de Errores</h1>
      <p className="error-text">
        Esta página te permite probar todas las páginas de error de la aplicación.
        Haz clic en cualquiera de los botones para navegar a la página de error correspondiente.
      </p>

      <div className="error-actions" style={{ flexDirection: 'column', gap: '1rem' }}>
        {testErrors.map((error) => (
          <button
            key={error.path}
            className="error-button primary-button"
            onClick={() => navigate(error.path)}
            style={{ width: '300px', margin: '0.5rem 0' }}
          >
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{error.name}</div>
              <div style={{ fontSize: '0.9rem', opacity: 0.8 }}>{error.description}</div>
            </div>
          </button>
        ))}

        <button
          className="error-button secondary-button"
          onClick={() => navigate('/')}
          style={{ marginTop: '2rem' }}
        >
          Volver al Inicio
        </button>
      </div>
    </div>
  );
};

export default ErrorTestPage;
