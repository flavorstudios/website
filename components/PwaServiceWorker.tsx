'use client';

import { useEffect, useState } from 'react';

export default function PwaServiceWorker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    let refreshing = false;
    let newWorker: ServiceWorker | null = null;

    if ('serviceWorker' in navigator) {
      // Register service worker on page load
      const onLoad = () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then(registration => {
            // Listen for updates to the service worker
            registration.onupdatefound = () => {
              newWorker = registration.installing;
              if (newWorker) {
                newWorker.onstatechange = () => {
                  if (newWorker?.state === 'installed') {
                    // If there is already a controlling service worker, a new update is available.
                    if (navigator.serviceWorker.controller) {
                      setUpdateAvailable(true);
                    }
                  }
                };
              }
            };
          })
          .catch(error => {
            if (process.env.NODE_ENV === 'development') {
              // Only log in development to avoid exposing errors in production
              console.error('Service worker registration failed:', error);
            }
          });
      };

      window.addEventListener('load', onLoad);

      // Listen for controllerchange and reload ONCE when a new SW activates
      const onControllerChange = () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      };
      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

      // Cleanup to prevent memory leaks
      return () => {
        window.removeEventListener('load', onLoad);
        navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      };
    }
  }, []);

  // Handles update prompt
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
