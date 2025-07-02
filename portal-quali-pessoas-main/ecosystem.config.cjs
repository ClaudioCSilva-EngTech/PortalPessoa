// ecosystem.config.js

require('dotenv').config({ path: './.env.production' })

module.exports = {
  apps : [{
    name: "portal-quali-pessoas",
    namespace: "portal-quali-pessoas-prd", // Namespace para organizar os apps no PM2
    script: "./server.js", // O PM2 vai executar seu arquivo server.js
    watch: false, // Geralmente não é necessário assistir em produção, mas pode ser true para dev
    instances: 2, // Número de instâncias. Pode ser "max" para utilizar todos os cores
    exec_mode: "fork", // ou "cluster" se quiser rodar várias instâncias e balancear carga
    autorestart: true, // Reinicia automaticamente se o processo falhar
    max_memory_restart: "1G", // Reinicia se usar mais de 1GB

    env_development: {
      VITE_NODE_ENV: process.env.VITE_NODE_ENV || "development",
      VITE_PORT: process.env.VITE_PORT || 3030,
      VITE_API_URL: process.env.VITE_API_URL,
      VITE_BFF_URL: process.env.VITE_BFF_URL || "http://localhost:3000/api"
    },
    env_homologation: { // Ambiente de homologação
      VITE_NODE_ENV: process.env.VITE_NODE_ENV || "homologation",
      VITE_PORT: process.env.VITE_PORT || 3002,
      VITE_API_URL: process.env.VITE_API_URL,
      VITE_BFF_URL: process.env.VITE_BFF_URL
    },
    env_production: { // Ambiente de produção
      VITE_NODE_ENV: process.env.VITE_NODE_ENV || "production",
      VITE_PORT: process.env.VITE_PORT || 16890,
      VITE_API_URL: process.env.VITE_API_URL,
      VITE_BFF_URL: process.env.VITE_BFF_URL || "https://portalpessoas.qualiconsig.com.br/api"
    }
  }]
};