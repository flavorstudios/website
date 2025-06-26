'use client';

import { useEffect } from 'react';

export default function PwaServiceWorker() {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then(reg => {
            console.log('PWA Service Worker registered:', reg);
          })
          .catch(err => {
            console.error('PWA SW registration failed:', err);
          });
      });
    }
  }, []);

  return null;
}