import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register PWA service worker only in production for robust offline performance
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => console.log('PhysLab Service Worker registered successfully:', reg.scope))
      .catch((err) => console.warn('PhysLab Service Worker registration failed:', err));
  });
}

// Actively clean up stale service workers and caches in development to prevent layout/HMR issues
if (import.meta.env.DEV) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      let needsReload = false;
      const promises = registrations.map((r) => {
        console.log('Unregistering development service worker:', r.scope);
        needsReload = true;
        return r.unregister();
      });
      if (needsReload) {
        Promise.all(promises).then(() => {
          console.log('All service workers unregistered, reloading page...');
          window.location.reload();
        });
      }
    });
  }
  if ('caches' in window) {
    caches.keys().then((keys) => {
      keys.forEach((key) => {
        caches.delete(key).then(() => {
          console.log('Cleared development cache storage:', key);
        });
      });
    });
  }
}
