@echo off
echo 🔍 Verificando se o MongoDB está rodando...

REM Verificar se o MongoDB está rodando via Docker
echo 📋 Verificando containers Docker do MongoDB:
docker ps --filter "name=mongo" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo.
echo 📋 Verificando se a porta 27017 está aberta:
netstat -an | findstr :27017

echo.
echo 📋 Tentando conectar ao MongoDB:
echo Use os seguintes comandos para testar:
echo.
echo Para desenvolvimento:
echo   npm run test:mongo:dev
echo.
echo Para homologação:
echo   npm run test:mongo:hom
echo.
echo Para produção:
echo   npm run test:mongo:prod
echo.
echo 💡 Se o MongoDB não estiver rodando, use:
echo   docker run -d --name mongodb -p 27017:27017 mongo:latest
echo.
echo 💡 Para MongoDB com autenticação (como no .env):
echo   docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=portal_pessoa -e MONGO_INITDB_ROOT_PASSWORD=P0rtalP3550as mongo:latest

pause
