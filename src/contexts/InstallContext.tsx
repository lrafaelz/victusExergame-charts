import React, { createContext, useContext, useEffect, useState } from 'react';
import { InstallContextType, BeforeInstallPromptEvent } from './installContextTypes';

const InstallContext = createContext<InstallContextType | undefined>(undefined);

export const InstallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallButton(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        console.info('Usuário aceitou o prompt de instalação');
      } else {
        console.info('Usuário rejeitou o prompt de instalação');
      }
      setDeferredPrompt(null);
      setShowInstallButton(false);
    }
  };

  return (
    <InstallContext.Provider value={{ showInstallButton, handleInstallClick }}>
      {children}
    </InstallContext.Provider>
  );
};

export const useInstall = () => {
  const context = useContext(InstallContext);
  if (!context) {
    throw new Error('useInstall must be used within an InstallProvider');
  }
  return context;
};
