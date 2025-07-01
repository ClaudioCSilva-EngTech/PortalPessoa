import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174, // Defina a porta que deseja para o desenvolvimento
    open: true // Abre o navegador automaticamente
  },
  build: {
    // Configurações do build do Vite
    rollupOptions: {
      // Configurações específicas do Rollup
      output: {
        // Força a saída para um único arquivo
        manualChunks: undefined,
        entryFileNames: `[name].js`,
        chunkFileNames: `[name].js`,
        assetFileNames: `[name].[ext]`,
      },
      // Para garantir que todas as dependências estejam no bundle, se necessário
      // external: ['react', 'react-dom'] // Remover se quiser tudo no bundle
    },
    // Define a pasta de saída
    outDir: 'dist'
  }
})
