import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authStorage } from '../shared/Utils/authStorage';
import type { TStudentConsent } from '../modules/types/User';

interface CookieConsentContextType {
  hasConsent: boolean;
  setConsent: (consent: TStudentConsent) => void;
  isLoading: boolean;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(undefined);

export const useCookieConsent = () => {
  const context = useContext(CookieConsentContext);
  if (context === undefined) {
    throw new Error('useCookieConsent must be used within a CookieConsentProvider');
  }
  return context;
};

interface CookieConsentProviderProps {
  children: ReactNode;
}

export const CookieConsentProvider: React.FC<CookieConsentProviderProps> = ({ children }) => {
  const [hasConsent, setHasConsent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkConsent = () => {
      try {
        const consentData = authStorage.getCookieConsentGiven();
        setHasConsent(consentData && consentData.accepted);
      } catch (error) {
        console.error('Error checking cookie consent:', error);
        setHasConsent(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkConsent();
  }, []);

  const setConsent = (consent: TStudentConsent) => {
    try {
      authStorage.setCookieConsentGiven(consent);
      setHasConsent(consent.accepted);
    } catch (error) {
      console.error('Error setting cookie consent:', error);
    }
  };

  return (
    <CookieConsentContext.Provider value={{ hasConsent, setConsent, isLoading }}>
      {children}
    </CookieConsentContext.Provider>
  );
};
