import { useEffect } from 'react';
import './App.css' // Asegúrate de que este archivo contenga el CSS de "Quantum Notification"
import AppRouter from './routers'
import { Toaster } from 'react-hot-toast'
import { useLocation } from 'react-router-dom';
import { ThemeProvider } from './shared/context/ThemeContext';
import './shared/theme/Colors.css';

function App() {
  const location = useLocation();

  useEffect(() => {
    // Si NO estamos en una ruta de comentarios, elimina las claves
    if (!location.pathname.includes("/comments")) {
      localStorage.removeItem("comment");
      localStorage.removeItem("allStudents");
    }
  }, [location.pathname]);

  return (
    <ThemeProvider>
      <Toaster
        position="top-center"
        reverseOrder={false}
        containerStyle={{
          top: '130px', // Ajusta este valor (ej. 50px, 80px, 100px) para moverlo más abajo
        }}
        toastOptions={{
          // Duración por defecto para todos los toasts (4 segundos para que se aprecie el diseño)
          duration: 4000,

          // Estilos base que se aplicarán a todos los toasts.
          // El resto de los estilos complejos (backdrop-filter, border-image, box-shadow)
          // se manejan mejor con las clases CSS definidas en App.css.
          style: {
            // Usamos los valores RGB directos de tus variables para asegurar que se apliquen
            // si la librería prioriza los estilos inline sobre las clases para estas propiedades.
            background: 'rgba(26, 33, 56, 0.85)', // Equivalente a rgba(var(--color-primary-dark-bg), 0.85)
            color: '#FFFFFF', // Equivalente a var(--color-text-light-alt)
            borderRadius: '8px', // Bordes redondeados definidos en el CSS
            padding: '14px 22px', // Padding definido en el CSS
            // box-shadow y backdrop-filter son manejados por la clase CSS
          },


          // Configuración específica para cada tipo de toast
          // Aquí aplicamos las clases CSS específicas y los temas de íconos
          success: {
            className: 'quantum-notification-toast toast--success',
            iconTheme: {
              primary: 'var(--color-mint-green)', // Verde menta para el ícono de éxito
              secondary: 'var(--color-primary-dark-bg)', // Fondo del ícono (oscuro)
            },
          },
          error: {
            className: 'quantum-notification-toast toast--error',
            iconTheme: {
              primary: 'var(--color-vibrant-red-orange)', // Rojo vibrante para el ícono de error
              secondary: 'var(--color-primary-dark-bg)',
            },
          },
          // Para toasts sin tipo específico (llamados con `toast('Mensaje')`),
          // react-hot-toast usa el tipo 'blank'.
          blank: {
            className: 'quantum-notification-toast toast--blank',
            iconTheme: {
              primary: 'var(--color-accent-blue-light)', // Azul claro acento para íconos de información
              secondary: 'var(--color-primary-dark-bg)',
            },
          },
          loading: {
            className: 'quantum-notification-toast toast--loading',
            iconTheme: {
              primary: 'var(--color-accent-yellow)', // Amarillo acento para el ícono de carga
              secondary: 'var(--color-primary-dark-bg)',
            },
          },
          custom: {
            // Para toasts personalizados, puedes aplicar la clase base
            // y luego controlar el contenido y los estilos internos de forma manual
            className: 'quantum-notification-toast toast--custom',
            // iconTheme no suele aplicarse aquí ya que el ícono es parte del contenido custom
          }
        }}
      />
      <AppRouter />
    </ThemeProvider>
  )
}

export default App
