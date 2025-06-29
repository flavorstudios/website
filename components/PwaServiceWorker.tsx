'use client';

import { useEffect, useState } from 'react';

export default function PwaServiceWorker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'serviceWorker' in navigator
    ) {
      let newWorker: ServiceWorker | null = null;

      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then(registration => {
            // Listen for updates to the service worker
            registration.onupdatefound = () => {
              newWorker = registration.installing;
              if (newWorker) {
                newWorker.onstatechange = () => {
                  if (newWorker?.state === 'installed') {
                    // New update available!
                    if (navigator.serviceWorker.controller) {
                      setUpdateAvailable(true);
                    }
                  }
                };
              }
            };
          })
          .catch(error => {
            // Optional: You can log or display errors here
            console.error('Service worker registration failed:', error);
          });
      });

      // Optional: Listen for skipWaiting messages for instant updates
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }, []);

  // Optional: Show a notification/toast to user for update
  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        reg?.waiting?.postMessage({ type: 'SKIP_WAITING' });
      });
    }
  };

  return (
    <>
      {updateAvailable && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: '#2d3748',
            color: '#fff',
            padding: '1em 2em',
            borderRadius: 12,
            zIndex: 1000,
            boxShadow: '0 4px 24px rgba(0,0,0,0.15)',
          }}
        >
          <span>
            🔄&nbsp;A new version of Flavor Studios is available.
          </span>
          <button
            style={{
              marginLeft: 16,
              background: '#fbbf24',
              border: 'none',
              padding: '0.5em 1.2em',
              borderRadius: 8,
              cursor: 'pointer',
              color: '#222',
              fontWeight: 600,
            }}
            onClick={handleUpdate}
          >
            Update Now
          </button>
        </div>
      )}
    </>
  );
}
