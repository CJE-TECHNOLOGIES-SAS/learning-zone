import { useNavigate } from 'react-router-dom';

export const useErrorHandler = () => {
  const navigate = useNavigate();

  const handleError = (error: any, fallbackPath: string = '/500') => {
    console.error('Error handled by useErrorHandler:', error);

    // Determinar el tipo de error basado en el código de estado HTTP
    if (error?.response?.status) {
      const status = error.response.status;

      switch (status) {
        case 401:
          navigate('/401');
          return;
        case 403:
          navigate('/403');
          return;
        case 404:
          navigate('/404');
          return;
        case 500:
          navigate('/500');
          return;
        case 503:
          navigate('/503');
          return;
        default:
          if (status >= 500) {
            navigate('/500');
            return;
          } else if (status >= 400) {
            navigate('/404');
            return;
          }
      }
    }

    // Si no hay código de estado, verificar el mensaje de error
    if (error?.message) {
      const message = error.message.toLowerCase();

      if (message.includes('unauthorized') || message.includes('401')) {
        navigate('/401');
        return;
      }

      if (message.includes('forbidden') || message.includes('403')) {
        navigate('/403');
        return;
      }

      if (message.includes('not found') || message.includes('404')) {
        navigate('/404');
        return;
      }

      if (message.includes('server error') || message.includes('500')) {
        navigate('/500');
        return;
      }

      if (message.includes('maintenance') || message.includes('503')) {
        navigate('/503');
        return;
      }
    }

    // Fallback a la ruta especificada o a error 500
    navigate(fallbackPath);
  };

  const handleNetworkError = () => {
    navigate('/500');
  };

  const handleAuthError = () => {
    navigate('/401');
  };

  const handlePermissionError = () => {
    navigate('/403');
  };

  const handleNotFoundError = () => {
    navigate('/404');
  };

  const handleServerError = () => {
    navigate('/500');
  };

  const handleMaintenanceError = () => {
    navigate('/503');
  };

  return {
    handleError,
    handleNetworkError,
    handleAuthError,
    handlePermissionError,
    handleNotFoundError,
    handleServerError,
    handleMaintenanceError
  };
};
