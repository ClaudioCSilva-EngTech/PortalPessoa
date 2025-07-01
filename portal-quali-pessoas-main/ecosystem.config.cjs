// ecosystem.config.js
module.exports = {
  apps : [{
    name: "portal-quali-pessoas", // Nome do seu aplicativo no PM2
    script: "./src/server.js",                 // O seu script do servidor Node.js
    watch: false,                          // Não monitorar arquivos para reinício automático (para produção)
    ignore_watch: ["node_modules", "dist"], // O que ignorar se watch for true
    instances: "max",                      // Ou um número específico de instâncias
    exec_mode: "cluster",                  // Usa o modo cluster do PM2 para aproveitar múltiplos cores da CPU
    env_homologation: {                                 // Variáveis de ambiente padrão
      NODE_ENV: "homologation",
      PORT: 3001,
      VITE_PORT: 5174
    },
    env_production: {                      // Variáveis de ambiente específicas para produção
      NODE_ENV: "production"
    }
  }]
};