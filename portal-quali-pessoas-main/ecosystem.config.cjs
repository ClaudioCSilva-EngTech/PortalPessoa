// ecosystem.config.js

// Determina qual arquivo .env carregar baseado no NODE_ENV ou ambiente PM2
const environment = process.env.NODE_ENV || process.env.PM2_ENV || 'development';
const envPath = `./.env.${environment}`;

console.log(`Carregando variáveis de ambiente do arquivo: ${envPath}`);
const config = require('dotenv').config({ path: envPath });

module.exports = {
  apps : [{
    name: "portal-quali-pessoas",
    namespace: "portal-quali-pessoas", // Namespace para organizar os apps no PM2
    script: "./server.js", // O PM2 vai executar seu arquivo server.js
    watch: false, // Geralmente não é necessário assistir em produção, mas pode ser true para dev
    instances: 1, // Ajustado para 1 instância para evitar conflitos de porta
    exec_mode: "fork", // ou "cluster" se quiser rodar várias instâncias e balancear carga
    autorestart: true, // Reinicia automaticamente se o processo falhar
    max_memory_restart: "1G", // Reinicia se usar mais de 1GB

    env_development: {
      NODE_ENV: config.parsed.VITE_NODE_ENV || "development",
      PM2_ENV: config.parsed.VITE_NODE_ENV || "development",
      VITE_NODE_ENV: config.parsed.VITE_NODE_ENV || "development",
      VITE_PORT: config.parsed.VITE_PORT,
      VITE_API_URL: config.parsed.VITE_API_URL,
      VITE_CLIENT_SECRET_KEY: "sua_chave_secreta_dev",
      VITE_CLIENT_PUBLIC_KEY: "sua_chave_publica_dev",
      VITE_BFF_URL: config.parsed.VITE_BFF_URL,
      
      VITE_TEXTO_REQUISITOS_VAGA: "Requisitos da vaga\n- Experiência em [INCLUA AQUI A ÁREA]\n- Maior de 18 anos\n- Habilidade de trabalho em equipe\n- Boa comunicação\n- Proatividade\n- Disponibilidade para trabalhar em [INCLUA AQUI O HORÁRIO]\n- Conhecimento em [INCLUA AQUI AS TECNOLOGIAS OU HABILIDADES NECESSÁRIAS]",
      VITE_TEXTO_BENEFICIOS_VAGA: "Benefícios da vaga\n- Salário compatível com o mercado\n- Vale transporte\n- Vale alimentação\n- Assistência médica\n- Seguro de vida\n- Oportunidade de crescimento profissional\n- Ambiente de trabalho colaborativo"
    },
    env_homologation: { // Ambiente de homologação
      NODE_ENV: "homologation",
      PM2_ENV: "homologation", 
      VITE_NODE_ENV: "homologation",
      VITE_PORT: 3001,
      VITE_API_URL: "http://192.168.4.117:8001/api",
      VITE_CLIENT_SECRET_KEY: "sua_chave_secreta_hom",
      VITE_CLIENT_PUBLIC_KEY: "sua_chave_publica_hom",
      VITE_BFF_URL: "http://192.168.4.117:3000/api",
      VITE_TEXTO_REQUISITOS_VAGA: "Requisitos da vaga\n- Experiência em [INCLUA AQUI A ÁREA]\n- Maior de 18 anos\n- Habilidade de trabalho em equipe\n- Boa comunicação\n- Proatividade\n- Disponibilidade para trabalhar em [INCLUA AQUI O HORÁRIO]\n- Conhecimento em [INCLUA AQUI AS TECNOLOGIAS OU HABILIDADES NECESSÁRIAS]",
      VITE_TEXTO_BENEFICIOS_VAGA: "Benefícios da vaga\n- Salário compatível com o mercado\n- Vale transporte\n- Vale alimentação\n- Assistência médica\n- Seguro de vida\n- Oportunidade de crescimento profissional\n- Ambiente de trabalho colaborativo"
    },
    env_production: { // Ambiente de produção
      NODE_ENV: "production",
      PM2_ENV: "production",
      VITE_NODE_ENV: "production",
      VITE_PORT: 16890,
      VITE_API_URL: "",//"https://portalpessoas.qualiconsig.com.br/api",
      VITE_CLIENT_SECRET_KEY: "sua_chave_secreta_prod",
      VITE_CLIENT_PUBLIC_KEY: "sua_chave_publica_prod",
      VITE_BFF_URL: "", //"https://portalpessoas.qualiconsig.com.br/api",
      VITE_TEXTO_REQUISITOS_VAGA: "Requisitos da vaga\n- Experiência em [INCLUA AQUI A ÁREA]\n- Maior de 18 anos\n- Habilidade de trabalho em equipe\n- Boa comunicação\n- Proatividade\n- Disponibilidade para trabalhar em [INCLUA AQUI O HORÁRIO]\n- Conhecimento em [INCLUA AQUI AS TECNOLOGIAS OU HABILIDADES NECESSÁRIAS]",
      VITE_TEXTO_BENEFICIOS_VAGA: "Benefícios da vaga\n- Salário compatível com o mercado\n- Vale transporte\n- Vale alimentação\n- Assistência médica\n- Seguro de vida\n- Oportunidade de crescimento profissional\n- Ambiente de trabalho colaborativo"
    }
  }]
};