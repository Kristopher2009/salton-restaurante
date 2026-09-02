#!/bin/bash
# Script de inicialização do Salton Buffet & Marmitaria

echo "🚀 Iniciando setup do Salton Buffet & Marmitaria..."
echo ""

# Verificar se .env existe
if [ ! -f .env ]; then
  echo "📝 Criando arquivo .env a partir de .env.example..."
  cp .env.example .env
  echo "✓ Arquivo .env criado. Edite com suas configurações PostgreSQL."
  echo ""
fi

# Verificar Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Node.js não encontrado. Por favor, instale Node.js v14.0.0 ou superior"
  exit 1
fi

echo "✓ Node.js encontrado: $(node --version)"

# Verificar npm
if ! command -v npm &> /dev/null; then
  echo "❌ npm não encontrado."
  exit 1
fi

echo "✓ npm encontrado: $(npm --version)"
echo ""

# Instalar dependências
echo "📦 Instalando dependências..."
npm install
echo "✓ Dependências instaladas"
echo ""

echo "✅ Setup concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "  1. Configure o arquivo .env com seus dados PostgreSQL"
echo "  2. Certifique-se de que PostgreSQL está rodando"
echo "  3. Crie o banco de dados: CREATE DATABASE salton_db;"
echo "  4. Inicie o servidor: npm start"
echo ""
echo "🌐 O servidor estará disponível em: http://localhost:3000"
