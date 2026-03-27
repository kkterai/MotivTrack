import React, { useState, useEffect } from 'react';
import { showInstallPrompt, isInstalled } from '../../utils/pwa';
import './PWAInstallPrompt.css';

/**
 * PWA Install Prompt Component
 * Shows a banner prompting users to install the app
 * Privacy: Only shows if not already installed and user hasn't dismissed
 */
export default function PWAInstallPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (isInstalled()) {
      return;
    }

    // Check if user has previously dismissed
    const dismissed = localStorage.getItem('pwa-install-dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show prompt after a short delay
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleInstall = async () => {
    const accepted = await showInstallPrompt();
    if (accepted) {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
    // Remember dismissal for 30 days
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 30);
    localStorage.setItem('pwa-install-dismissed', expiryDate.toISOString());
  };

  if (!showPrompt || isDismissed) {
    return null;
  }

  return (
    <div className="pwa-install-prompt">
      <div className="pwa-install-prompt__content">
        <div className="pwa-install-prompt__icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" fill="currentColor"/>
          </svg>
        </div>
        <div className="pwa-install-prompt__text">
          <h3 className="pwa-install-prompt__title">Install MotivTrack</h3>
          <p className="pwa-install-prompt__description">
            Install our app for quick access and offline use
          </p>
        </div>
        <div className="pwa-install-prompt__actions">
          <button 
            className="pwa-install-prompt__button pwa-install-prompt__button--primary"
            onClick={handleInstall}
          >
            Install
          </button>
          <button 
            className="pwa-install-prompt__button pwa-install-prompt__button--secondary"
            onClick={handleDismiss}
          >
            Not now
          </button>
        </div>
      </div>
    </div>
  );
}
