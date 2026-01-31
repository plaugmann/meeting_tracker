'use client';

import { useEffect, useState } from 'react';

export default function PWARegister() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('SW registered:', registration);
          })
          .catch((error) => {
            console.log('SW registration failed:', error);
          });
      });
    }
  }, []);

  if (!mounted) return null;
  
  return null;
}
