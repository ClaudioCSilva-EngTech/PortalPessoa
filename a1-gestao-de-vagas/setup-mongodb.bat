@echo off
REM setup-mongodb.bat
REM Script para configurar o MongoDB com as credenciais necessárias

echo 🔧 Configurando MongoDB para o Portal Pessoas...
echo.

REM Verificar se o MongoDB está rodando
echo 1. Verificando se o MongoDB está rodando...
docker ps | findstr mongo > nul
if %errorlevel% neq 0 (
    echo    MongoDB não está rodando. Iniciando container...
    docker run -d --name mongodb -p 27017:27017 mongo:latest
    echo    Aguardando MongoDB inicializar...
    timeout /t 10 /nobreak > nul
) else (
    echo    ✅ MongoDB já está rodando
)

echo.
echo 2. Configurando usuário para desenvolvimento...

REM Criar usuário para desenvolvimento
docker exec -it mongodb mongosh --eval "use admin; db.createUser({user: 'portal_pessoa', pwd: 'P0rtalP3550as', roles: [{role: 'readWrite', db: 'portalPessoas_qualiconsig'}, {role: 'dbAdmin', db: 'portalPessoas_qualiconsig'}]}); use portalPessoas_qualiconsig; db.createUser({user: 'portal_pessoa', pwd: 'P0rtalP3550as', roles: [{role: 'readWrite', db: 'portalPessoas_qualiconsig'}, {role: 'dbAdmin', db: 'portalPessoas_qualiconsig'}]}); db.teste.insertOne({nome: 'teste', data: new Date()});"

echo.
echo 3. Testando conexão...
docker exec -it mongodb mongosh "mongodb://portal_pessoa:P0rtalP3550as@localhost:27017/portalPessoas_qualiconsig" --eval "db.teste.find();"

echo.
echo ✅ MongoDB configurado com sucesso!
echo.
echo 🔧 Configurações:
echo    Usuário: portal_pessoa
echo    Senha: P0rtalP3550as
echo    Database: portalPessoas_qualiconsig
echo    URI: mongodb://portal_pessoa:P0rtalP3550as@localhost:27017/portalPessoas_qualiconsig
echo.
echo 📋 Próximos passos:
echo    1. Teste a conexão: npm run test:mongo:dev
echo    2. Inicie a aplicação: npm run dev
echo.

pause
