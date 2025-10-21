import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isProduction = mode === 'production'
  
  return {
    plugins: [react()],
    server: {
      port: 5173,
      host: true
    },
    build: {
      outDir: 'dist',
      sourcemap: !isProduction,
      minify: isProduction ? 'esbuild' : false,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom'],
            router: ['react-router-dom'],
            ui: ['axios']
          }
        }
      }
    },
    define: {
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
    }
  }
})
