import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // 127.0.0.1: acessível só da própria máquina (não da rede) e alcançável
    // pelo Cypress no Windows, que resolve "localhost" para IPv4.
    host: '127.0.0.1',
    // se a 5173 estiver ocupada, falha em vez de trocar de porta em silêncio
    strictPort: true,
  },
});
