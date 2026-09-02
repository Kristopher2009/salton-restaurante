# Salton Buffet & Marmitaria

Site do restaurante Salton Buffet & Marmitaria com pedidos por WhatsApp e banco de dados PostgreSQL.

## 🎯 Funcionalidades

- **Cardápio Interativo**: Visualize marmitas e bebidas com filtros por categoria
- **Carrinho de Compras**: Adicione itens ao carrinho e finalize o pedido
- **Integração WhatsApp**: Pedidos são enviados diretamente para o WhatsApp do restaurante
- **Banco de Dados PostgreSQL**: Armazene produtos, pedidos e histórico
- **Interface Responsiva**: Design moderno e adaptável para todos os dispositivos

## 📋 Pré-requisitos

- **Node.js** (v14.0.0 ou superior)
- **PostgreSQL** (v12 ou superior)
- **npm** ou **yarn**

## 🚀 Instalação e Configuração

### 1. Clonar ou baixar o repositório
```bash
cd salton-restaurante
```

### 2. Instalar dependências
```bash
npm install
```

### 3. Configurar variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto. Use `.env.example` como referência:

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações do PostgreSQL:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_USER=seu_usuario_postgres
DB_PASSWORD=sua_senha_postgres
DB_NAME=salton_db
NODE_ENV=development
```

### 4. Criar banco de dados PostgreSQL

```sql
CREATE DATABASE salton_db;
```

### 5. Iniciar o servidor

```bash
npm start
```

O servidor estará disponível em: **http://localhost:3000**

## 📁 Estrutura do Projeto

```
salton-restaurante/
├── server.js              # Servidor Express principal
├── package.json           # Dependências do projeto
├── .env.example           # Exemplo de configuração
├── index.html             # Página principal HTML
├── public/
│   ├── styles.css         # Estilos CSS
│   ├── script.js          # Lógica frontend (versão simplificada)
│   └── app.js             # Lógica frontend (versão completa)
├── views/
│   └── index.ejs          # Template EJS da página
├── img/                   # Imagens do site
└── README.md              # Este arquivo
```

## 🗄️ Estrutura do Banco de Dados

### Tabelas

#### `products`
- `id` (SERIAL PRIMARY KEY)
- `name` (VARCHAR)
- `category` (VARCHAR)
- `size` (VARCHAR)
- `price` (DECIMAL)
- `description` (TEXT)
- `created_at` (TIMESTAMP)

#### `orders`
- `id` (SERIAL PRIMARY KEY)
- `customer_name` (VARCHAR)
- `customer_phone` (VARCHAR)
- `notes` (TEXT)
- `total` (DECIMAL)
- `created_at` (TIMESTAMP)

#### `order_items`
- `id` (SERIAL PRIMARY KEY)
- `order_id` (INTEGER - FK)
- `product_id` (INTEGER - FK)
- `quantity` (INTEGER)
- `unit_price` (DECIMAL)
- `created_at` (TIMESTAMP)

## 🔧 API Endpoints

### GET `/`
Retorna a página principal com o cardápio

### GET `/api/products`
Retorna lista de todos os produtos em JSON
```json
[
  {
    "id": 1,
    "name": "Marmita P",
    "category": "marmita",
    "size": "P",
    "price": "20.00",
    "description": "Porção ideal para 1 pessoa."
  }
]
```

### POST `/api/orders`
Cria um novo pedido
**Request Body:**
```json
{
  "customerName": "João Silva",
  "customerPhone": "47999999999",
  "notes": "Sem cebola",
  "items": [
    {
      "productId": 1,
      "quantity": 2
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "orderId": 1,
  "total": 40.00,
  "whatsappUrl": "https://wa.me/554792637239?text=..."
}
```

## 🎨 Abas do Site

1. **Cardápio**: Visualize todos os produtos com filtros por categoria
   - Marmitas (P, M, G)
   - Bebidas (latas e garrafas)

2. **Pedidos**: Gerencie seu carrinho de compras
   - Adicione itens
   - Visualize total
   - Finalize o pedido

3. **Sobre**: Informações sobre o restaurante

## 🚀 Deploy (Sem Render)

Para fazer deploy em outro serviço, configure as variáveis de ambiente com seus dados PostgreSQL:

### Opções de Hospedagem:
- **Heroku** (com addon PostgreSQL)
- **Railway.app**
- **Cyclic.sh**
- **Fly.io**
- **Azure App Service** (com Azure Database for PostgreSQL)
- **AWS EC2 + RDS**

## 📝 Notas

- O banco de dados é inicializado automaticamente na primeira execução
- Produtos padrão são inseridos se não existirem
- Pedidos são salvos no banco de dados e enviados para WhatsApp

## 👥 Suporte

Para dúvidas ou sugestões, entre em contato através do WhatsApp: (47) 9263-7239

---

**Salton Buffet & Marmitaria** © 2026
