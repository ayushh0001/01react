// api.js
import axios from "axios";

// Determine base URL based on environment
const getBaseURL = () => {
  // In production (Vite build), use the production backend
  if (import.meta.env.PROD) {
    return 'https://www.zpinshop.com/api/v1';
  }
  // In development, use Vite's proxy to avoid CORS
  return '/api/v1';
};

// Uses Vite's dev proxy in development → avoids CORS issues entirely.
// In production, directly calls the production backend.
const API = axios.create({
  baseURL: getBaseURL(),
  withCredentials: true, // sends auth cookie automatically (when stored correctly)
  // NOTE: Do NOT set a default Content-Type here.
  // Axios automatically sets:
  //   - "application/json"        for plain objects
  //   - "multipart/form-data; boundary=…" for FormData (file uploads)
  // A hardcoded default would break multipart file uploads.
});

// ── Helper: scan all readable cookies for a JWT ──────────────────────────────
// A JWT always starts with "eyJ" (base64 of '{"'). If ANY non-HttpOnly cookie
// looks like a JWT, use it as the Bearer token.
function findJwtInCookies() {
  if (!document.cookie) return null;
  const pairs = document.cookie.split(';');
  for (const pair of pairs) {
    const val = pair.split('=').slice(1).join('=').trim();
    if (val.startsWith('eyJ') && val.split('.').length === 3) {
      return decodeURIComponent(val);
    }
  }
  return null;
}

// ── Response interceptor ─────────────────────────────────────────────────────
// Captures auth token from every response — checks body fields AND headers.
API.interceptors.response.use(
  (response) => {
    // Try every known field name / location for the Bearer token
    const token =
      response.data?.token        ||
      response.data?.data?.token  ||
      response.data?.accessToken  ||
      response.data?.jwtToken     ||
      response.data?.jwt          ||
      response.data?.bearerToken  ||
      // Some backends return token in the Authorization response header
      response.headers?.['authorization']?.replace(/^Bearer\s+/i, '') ||
      response.headers?.['x-auth-token']  ||
      response.headers?.['x-access-token'];

    if (token && token !== localStorage.getItem('authToken')) {
      localStorage.setItem('authToken', token);
      console.log('[API] ✅ Token captured:', token.substring(0, 30) + '...');
      // Also try to decode userId from JWT payload
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const uid = payload.id || payload.userId || payload._id || payload.sub;
        if (uid) localStorage.setItem('userId', String(uid));
      } catch { /* non-JWT token, ignore */ }
    }

    // Capture userId from response body even without a token
    const uid =
      response.data?.user?.id   || response.data?.user?._id   ||
      response.data?.data?.id   || response.data?.data?._id   ||
      response.data?._id        || response.data?.id;
    if (uid && !localStorage.getItem('userId')) {
      localStorage.setItem('userId', String(uid));
    }

    return response;
  },
  (error) => {
    console.warn(
      `[API] ${error.config?.method?.toUpperCase()} ${error.config?.url} → ${error.response?.status}`,
      error.response?.data
    );
    
    // Handle critical errors - redirect to error page
    if (error.response) {
      const status = error.response.status;
      const url = error.config?.url || '';
      
      // Don't redirect to error page for orders/dashboard/categories endpoints - let component handle it
      const skipErrorPageRedirect = url.includes('/orders') || url.includes('/dashboard') || url.includes('/categories');
      
      // Server errors (500+) - redirect to error page (except for orders/dashboard)
      if (status >= 500 && !skipErrorPageRedirect) {
        window.location.href = `/error?code=${status}&message=${encodeURIComponent('Server error occurred. Please try again later.')}`;
      }
      
      // Unauthorized (401) - redirect to login (skip for public endpoints like categories)
      const skipAuthRedirect = url.includes('/categories');
      if (status === 401 && !skipAuthRedirect && !window.location.pathname.includes('/login')) {
        // Only redirect if not already on login page
        const currentPath = window.location.pathname;
        if (!['/login', '/signup', '/'].includes(currentPath)) {
          console.log('[API] 401 Unauthorized - redirecting to login');
          localStorage.removeItem('authToken');
          localStorage.removeItem('userId');
          window.location.href = '/login';
        }
      }
    } else if (error.request) {
      // Network error - no response received
      console.error('[API] Network error - no response from server');
    }
    
    return Promise.reject(error);
  }
);

// ── Request interceptor ──────────────────────────────────────────────────────
// Sends Bearer token from localStorage if available.
// Falls back to scanning document.cookie for a JWT-shaped cookie value.
API.interceptors.request.use((config) => {
  let token = localStorage.getItem('authToken');

  // Fallback: try to find a JWT in readable (non-HttpOnly) cookies
  if (!token) {
    token = findJwtInCookies();
    if (token) {
      localStorage.setItem('authToken', token); // cache it for next time
      console.log('[API] ✅ Token found in browser cookies, cached to localStorage.');
    }
  }

  if (token) {
    config.headers = config.headers ?? {};
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Always log what we're sending
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url} | Token: ${token ? 'YES' : 'NO (using cookies)'} | Credentials: ${config.withCredentials}`);

  return config;
});

export default API;
