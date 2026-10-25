'use client';

import { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export function PwaRegister() {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // 1. Service Worker Registration
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('Atlas ServiceWorker registered with scope:', registration.scope);
          })
          .catch((err) => {
            console.warn('Atlas ServiceWorker registration failed:', err);
          });
      });
    }

    // 2. Connectivity Listeners
    const handleOnline = () => {
      setIsOffline(false);
      // Refresh authoritative data from server on reconnect
      window.dispatchEvent(new CustomEvent('atlas:reconnect'));
    };

    const handleOffline = () => {
      setIsOffline(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    if (!navigator.onLine) {
      setIsOffline(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="alert"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-96 z-50 bg-[#2f2f2f] border border-[#ff5a7a] text-white p-3 rounded-lg shadow-2xl flex items-center gap-3 animate-fade-in"
    >
      <WifiOff className="w-5 h-5 text-[#ff5a7a] shrink-0" />
      <div className="text-xs">
        <p className="font-semibold text-white">Connection Lost</p>
        <p className="text-[#c4bfd0]">Financial and gameplay actions are disabled until reconnected.</p>
      </div>
    </div>
  );
}
