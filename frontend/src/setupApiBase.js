import axios from 'axios';

// Normalize API base from Vite env (e.g., https://health-nexus-wnq1.onrender.com)
const DEV_LOCAL = 'http://localhost:8000';
const rawBase = (import.meta.env && import.meta.env.VITE_API_BASE_URL) || '';
const API_BASE = typeof rawBase === 'string' ? rawBase.replace(/\/$/, '') : '';

function rewriteUrl(u) {
  try {
    if (!API_BASE) return u;
    if (typeof u !== 'string') return u;
    if (u.startsWith(DEV_LOCAL)) {
      const path = u.slice(DEV_LOCAL.length);
      return API_BASE + (path.startsWith('/') ? path : `/${path}`);
    }
    return u;
  } catch {
    return u;
  }
}

// Patch window.fetch so code that hardcodes localhost gets rewritten in prod
if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
  const origFetch = window.fetch.bind(window);
  window.fetch = (input, init) => {
    try {
      if (typeof input === 'string') {
        return origFetch(rewriteUrl(input), init);
      }
      // If a Request object is passed, best-effort clone with rewritten URL
      if (input && typeof input === 'object' && 'url' in input) {
        const req = input;
        const newUrl = rewriteUrl(req.url);
        try {
          const RequestCtor = (typeof Request !== 'undefined') ? Request : null;
          if (RequestCtor) {
            const cloned = new RequestCtor(newUrl, req);
            return origFetch(cloned, init);
          }
        } catch {}
        return origFetch(newUrl, init);
      }
      return origFetch(input, init);
    } catch {
      return origFetch(input, init);
    }
  };
}

// Configure axios baseURL and a request interceptor to rewrite hardcoded URLs
try {
  if (API_BASE) {
    axios.defaults.baseURL = API_BASE;
  }
  axios.interceptors.request.use((config) => {
    if (config && typeof config.url === 'string') {
      config.url = rewriteUrl(config.url);
    }
    return config;
  });
} catch {}

// Expose for debugging
if (typeof window !== 'undefined') {
  window.__API_BASE__ = API_BASE;
}

// Utility function to construct image URLs with proper base URL
export function getImageUrl(imagePath) {
  if (!imagePath) return null;
  
  // If already a full URL, return as is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Extract filename from path (handles both forward and backslashes)
  const parts = imagePath.split(/[\\\/]+/);
  const filename = parts[parts.length - 1];
  if (!filename) return null;
  
  // Use production API base if available, otherwise localhost
  const base = API_BASE || DEV_LOCAL;
  return `${base}/uploads/${filename}`;
}

// Export API_BASE for use in other components
export const API_BASE_URL = API_BASE || DEV_LOCAL;
