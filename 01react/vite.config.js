import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // local vendor backend in dev
        changeOrigin: true,
        secure: false,
        // Cookie configuration for local development
        cookieDomainRewrite: {
          '*': ''
        },
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            const setCookieHeader = proxyRes.headers['set-cookie'];
            if (setCookieHeader) {
              proxyRes.headers['set-cookie'] = setCookieHeader.map((cookie) =>
                cookie
                  .replace(/;\s*Secure/gi, '')           // remove Secure flag (http localhost)
                  .replace(/;\s*SameSite=\w+/gi, '')     // remove SameSite=None/Strict
                  .replace(/;\s*Path=[^;]*/gi, '')       // remove restricted path
                  .concat('; SameSite=Lax; Path=/')      // force path=/ so cookie sent everywhere
              );
            }
          });
        },
      }
    }
  }
})

