import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

class ErrorBoundaryClass extends Component<Props & { navigate: (path: string) => void }, State> {
  constructor(props: Props & { navigate: (path: string) => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Determinar el tipo de error y redirigir apropiadamente
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      this.props.navigate('/401');
    } else if (error.message.includes('403') || error.message.includes('Forbidden')) {
      this.props.navigate('/403');
    } else if (error.message.includes('500') || error.message.includes('Server')) {
      this.props.navigate('/500');
    } else {
      this.props.navigate('/404');
    }
  }

  render() {
    if (this.state.hasError) {
      // Mostrar un mensaje de error temporal mientras se redirige
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          padding: '2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          fontFamily: 'Arial, sans-serif'
        }}>
          <h1>Algo salió mal</h1>
          <p>Estamos redirigiendo a la página de error apropiada...</p>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginTop: '1rem'
          }}></div>
          <style>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper para usar hooks dentro del Error Boundary
const ErrorBoundary: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <ErrorBoundaryClass navigate={navigate}>
      {children}
    </ErrorBoundaryClass>
  );
};

export default ErrorBoundary;
