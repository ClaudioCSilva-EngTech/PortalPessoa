// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'a1-gestao-de-vagas', // Nome do seu aplicativo
      script: './src/server.js', // Caminho para o seu arquivo principal
      watch: false, // Desative o 'watch' em produção para evitar reinícios desnecessários
      instances: 'max', // Inicia o número máximo de instâncias com base na CPU
      exec_mode: 'cluster', // Modo cluster para balanceamento de carga
      env_development: {
        NODE_ENV: 'development',
      },
      env_homologation: {
        NODE_ENV: 'homologation',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
};