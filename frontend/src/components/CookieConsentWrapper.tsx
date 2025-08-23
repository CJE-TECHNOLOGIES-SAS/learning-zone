import React from 'react';
import type { ReactNode } from 'react';
import { useCookieConsent } from '../contexts/CookieConsentContext';
import CardCookies from '../shared/animations/CardCookies';

interface CookieConsentWrapperProps {
  children: ReactNode;
}

const CookieConsentWrapper: React.FC<CookieConsentWrapperProps> = ({ children }) => {
  const { hasConsent, isLoading } = useCookieConsent();

  // Mientras se está cargando, mostrar un loading o nada
  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px',
        color: '#666'
      }}>
        Cargando...
      </div>
    );
  }

  // Si no hay consentimiento, mostrar solo el banner de cookies
  if (!hasConsent) {
    return (
      <>
        {/* Overlay que bloquea toda la aplicación */}
        <div
          className="cookie-consent-overlay"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex:1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '20px'
          }}
        >
          <CardCookies />
        </div>

        {/* Aplicación bloqueada en segundo plano */}
        <div style={{
          filter: 'blur(.3px)',
          zIndex: -1
        }}>
          {children}
        </div>

        {/* CSS para bloquear completamente */}
        <style>{`
          body {
          }
          body * {
          }
        `}</style>
      </>
    );
  }

  // Si hay consentimiento, mostrar la aplicación normal
  return <>{children}</>;
};

export default CookieConsentWrapper;
