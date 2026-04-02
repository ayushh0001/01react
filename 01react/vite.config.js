import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        // Required for SSE (Server-Sent Events) — disable response buffering
        selfHandleResponse: false,
        cookieDomainRewrite: { '*': '' },
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq, req) => {
            // Tell the backend not to buffer SSE responses
            if (req.url?.includes('/notifications/stream')) {
              proxyReq.setHeader('Accept', 'text/event-stream');
              proxyReq.setHeader('Cache-Control', 'no-cache');
            }
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            // For SSE: flush headers immediately so browser gets events in real time
            if (req.url?.includes('/notifications/stream')) {
              proxyRes.headers['x-accel-buffering'] = 'no';
              proxyRes.headers['cache-control'] = 'no-cache';
            }
            const setCookieHeader = proxyRes.headers['set-cookie'];
            if (setCookieHeader) {
              proxyRes.headers['set-cookie'] = setCookieHeader.map((cookie) =>
                cookie
                  .replace(/;\s*Secure/gi, '')
                  .replace(/;\s*SameSite=\w+/gi, '')
                  .replace(/;\s*Path=[^;]*/gi, '')
                  .concat('; SameSite=Lax; Path=/')
              );
            }
          });
        },
      }
    }
  }
})

