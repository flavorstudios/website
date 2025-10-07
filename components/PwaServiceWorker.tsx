'use client';

import { useEffect, useState } from 'react';
import { clientEnv } from '@/env.client';

export default function PwaServiceWorker() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    if (clientEnv.TEST_MODE === 'true') {
      return;
    }

    let refreshing = false;
    let newWorker: ServiceWorker | null = null;

    // Ensure service worker API is supported
    if ('serviceWorker' in navigator) {
      // Register the service worker after window 'load'
      const onLoad = () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then(registration => {
            // Listen for updates
            registration.onupdatefound = () => {
              newWorker = registration.installing;
              if (newWorker) {
                newWorker.onstatechange = () => {
                  if (newWorker?.state === 'installed') {
                    // Show prompt only if page is already controlled by a SW
                    if (navigator.serviceWorker.controller) {
                      setUpdateAvailable(true);
                    }
                  }
                };
              }
            };
          })
          .catch(error => {
            if (clientEnv.NODE_ENV === 'development') {
              // Only log in development
              console.error('Service worker registration failed:', error);
            }
          });
      };

      window.addEventListener('load', onLoad);

      // Listen for SW controller changes, and reload once after update
      const onControllerChange = () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      };
      navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

      // Cleanup on unmount
      return () => {
        window.removeEventListener('load', onLoad);
        navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
      };
    }
  }, [clientEnv.TEST_MODE]);

  // Trigger update by sending SKIP_WAITING to the waiting SW
  const handleUpdate = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistration().then(reg => {
        if (reg && reg.waiting) {
          reg.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
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
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}
          role="alert"
          aria-live="polite"
        >
          <span>
            🔄&nbsp;A new version of Flavor Studios is available.
          </span>
          <button
            style={{
              background: '#fbbf24',
              border: 'none',
              padding: '0.5em 1.2em',
              borderRadius: 8,
              cursor: 'pointer',
              color: '#222',
              fontWeight: 600,
              marginLeft: 8,
            }}
            onClick={handleUpdate}
            aria-label="Update and reload the website"
          >
            Update Now
          </button>
        </div>
      )}
    </>
  );
}
