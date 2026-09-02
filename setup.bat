@echo off
REM Script de inicialização do Salton Buffet & Marmitaria para Windows

echo.
echo 🚀 Iniciando setup do Salton Buffet 6 Marmitaria...
echo.

REM Verificar se .env existe
if not exist .env (
  echo 📝 Criando arquivo .env a partir de .env.example...
  copy .env.example .env >nul
  echo ✓ Arquivo .env criado. Edite com suas configurações PostgreSQL.
  echo.
)

REM Verificar Node.js
where node >nul 2>nul
if %errorlevel% neq 0 (
  echo ❌ Node.js não encontrado. Por favor, instale Node.js v14.0.0 ou superior
  pause
  exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js encontrado: %NODE_VERSION%

REM Verificar npm
where npm >nul 2>nul
if %errorlevel% neq 0 (
  echo ❌ npm não encontrado.
  pause
  exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✓ npm encontrado: %NPM_VERSION%
echo.

REM Instalar dependências
echo 📦 Instalando dependências...
call npm install
if %errorlevel% neq 0 (
  echo ❌ Erro ao instalar dependências
  pause
  exit /b 1
)
echo ✓ Dependências instaladas
echo.

echo ✅ Setup concluído com sucesso!
echo.
echo 📋 Próximos passos:
echo   1. Configure o arquivo .env com seus dados PostgreSQL
echo   2. Certifique-se de que PostgreSQL está rodando
echo   3. Crie o banco de dados: CREATE DATABASE salton_db;
echo   4. Inicie o servidor: npm start
echo.
echo 🌐 O servidor estará disponível em: http://localhost:3000
echo.
pause
