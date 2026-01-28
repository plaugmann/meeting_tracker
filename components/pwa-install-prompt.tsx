'use client';

import { useEffect, useState } from 'react';

export default function PWAInstallPrompt() {
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if device is iOS
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(ios);

    // Check if app is already installed (standalone mode)
    const standalone = window.matchMedia('(display-mode: standalone)').matches;
    setIsStandalone(standalone);

    // Show prompt only if on iOS, not standalone, and not dismissed before
    const dismissed = localStorage.getItem('pwa-prompt-dismissed');
    if (ios && !standalone && !dismissed) {
      // Show after a short delay
      setTimeout(() => setShowPrompt(true), 2000);
    }
  }, []);

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  if (!showPrompt || !isIOS || isStandalone) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 shadow-lg z-50 animate-slide-up">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Install EY Meeting Tracker</h3>
            <p className="text-sm text-blue-100 mb-2">
              Add this app to your home screen for quick access!
            </p>
            <p className="text-xs text-blue-200">
              Tap <span className="inline-block w-4 h-4 align-middle">📤</span> then "Add to Home Screen"
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="text-white hover:text-blue-100 text-2xl leading-none"
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}
