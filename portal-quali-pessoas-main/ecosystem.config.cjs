// ecosystem.config.js
module.exports = {
  apps : [{
    name: "portal-quali-pessoas",
    script: "./server.js", // O PM2 vai executar seu arquivo server.js
    watch: false, // Geralmente não é necessário assistir em produção, mas pode ser true para dev
    instances: 2, // Número de instâncias. Pode ser "max" para utilizar todos os cores
    exec_mode: "fork", // ou "cluster" se quiser rodar várias instâncias e balancear carga
    env: { // Variáveis padrão, que serão sobrescritas por env_XYZ
      VITE_NODE_ENV: "development",
      PORT: 3000
    },
    env_development: {
      VITE_NODE_ENV: "development",
      VITE_PORT: 3000 // Porta padrão para desenvolvimento
    },
    env_homologation: { // Ambiente de homologação
      VITE_NODE_ENV: "homologation",
      VITE_PORT: 8002 // Exemplo de porta para homologação
    },
    env_production: { // Ambiente de produção
      VITE_NODE_ENV: "production",
      VITE_PORT: 16890 // Porta padrão para produção (HTTP)
    }
  }]
};