# 🍖 Seletor de Tipos de Carne - Guia de Uso

Esta documentação descreve como usar e customizar o sistema de seleção de tipos de carne no site Salton Buffet & Marmitaria.

## 📋 Tipos de Carne Disponíveis

Por padrão, o sistema oferece 4 tipos de carne:

1. **Carne Bovina (Bife)** - Preço Premium
2. **Carne Suína** - Preço Padrão
3. **Frango Milanesa** - Preço Reduzido
4. **Peixe** - Preço Premium

## 🎯 Como Funciona

### Fluxo do Cliente

1. O cliente navega até a aba **"Cardápio"**
2. Clica no botão **"Escolher"** na aba de **Marmitas**
3. Um modal aparece mostrando:
   - Seletor de **Tamanho** (P, M, G)
   - Seletor de **Tipo de Carne** (com preços)
4. O cliente escolhe tamanho e carne
5. Clica **"Adicionar ao Carrinho"**
6. O item aparece no carrinho com a escolha selecionada

### Exemplo de Carrinho

```
Marmita - P (Carne Bovina (Bife)) x1 → R$ 22,00
Marmita - M (Frango Milanesa) x2 → R$ 48,00
Coca-Cola 350ml x1 → R$ 8,00
Total: R$ 78,00
```

## 💾 Banco de Dados

### Tabelas Relacionadas

#### `meat_types`
```sql
id | name                  | slug
1  | Carne Bovina (Bife)  | bife
2  | Carne Suína          | suina
3  | Frango Milanesa      | frango_milanesa
4  | Peixe                | peixe
```

#### `products`
```sql
id | name    | category | description                      | has_meat
1  | Marmita | marmita  | Marmita com sua escolha de carne | true
2  | Coca-Cola 2L | bebida | ...                           | false
```

#### `product_variants`
Combina produto + tamanho + tipo de carne + preço:
```sql
id | product_id | size | meat_type_id | price
1  | 1          | P    | 1            | 22.00
2  | 1          | P    | 2            | 20.00
3  | 1          | P    | 3            | 18.00
4  | 1          | P    | 4            | 25.00
5  | 1          | M    | 1            | 28.00
...
```

#### `order_items`
Campos adicionados para rastrear a escolha de carne:
```sql
id | order_id | product_id | variant_id | meat_type_name | size | quantity | unit_price
1  | 1        | 1          | 1          | Carne Bovina (Bife) | P | 1 | 22.00
```

## 🔧 Customizar Tipos de Carne

### Adicionar um Novo Tipo de Carne

#### 1. No Backend (server.js)

Edite o array `meatTypes`:

```javascript
const meatTypes = [
  { id: 1, name: 'Carne Bovina (Bife)', slug: 'bife' },
  { id: 2, name: 'Carne Suína', slug: 'suina' },
  { id: 3, name: 'Frango Milanesa', slug: 'frango_milanesa' },
  { id: 4, name: 'Peixe', slug: 'peixe' },
  { id: 5, name: 'Tofu (Vegetariano)', slug: 'tofu' }  // Novo tipo
];
```

#### 2. Adicionar Variantes de Preço

Edite o array `initialVariants` para incluir preços do novo tipo:

```javascript
const initialVariants = [
  // ... outros dados ...
  // Marmita P - Tofu
  { product_id: 1, size: 'P', meat_type_id: 5, price: 16.0 },
  // Marmita M - Tofu
  { product_id: 1, size: 'M', meat_type_id: 5, price: 22.0 },
  // Marmita G - Tofu
  { product_id: 1, size: 'G', meat_type_id: 5, price: 29.0 }
];
```

#### 3. Reiniciar o Servidor

```bash
npm start
```

O banco de dados será atualizado automaticamente!

### Modificar Preços

Para alterar preços de uma variante existente, você pode:

#### Opção 1: Via SQL (Direto no PostgreSQL)
```sql
UPDATE product_variants 
SET price = 25.00 
WHERE product_id = 1 AND size = 'P' AND meat_type_id = 1;
```

#### Opção 2: Deletar e Reinserir via server.js
Altere o preço em `initialVariants` e reinicie.

## 📱 Frontend (JavaScript)

### Arquivo: `public/app.js`

A função `showMeatAndSizeSelector()` é responsável por:
- Buscar as variantes do servidor
- Agrupar por tamanho
- Renderizar o modal
- Validar seleção

### Buscar Tipos de Carne no Frontend

```javascript
const meatRes = await fetch('/api/meat-types');
const meatTypes = await meatRes.json();
```

## 🔌 API Endpoints

### GET `/api/meat-types`
Retorna lista de tipos de carne:
```json
[
  { "id": 1, "name": "Carne Bovina (Bife)", "slug": "bife" },
  { "id": 2, "name": "Carne Suína", "slug": "suina" },
  { "id": 3, "name": "Frango Milanesa", "slug": "frango_milanesa" },
  { "id": 4, "name": "Peixe", "slug": "peixe" }
]
```

### GET `/api/products/:productId/variants`
Retorna variantes de um produto específico:
```json
[
  {
    "id": 1,
    "size": "P",
    "meat_type_id": 1,
    "meat_type_name": "Carne Bovina (Bife)",
    "price": 22.00
  },
  ...
]
```

### POST `/api/orders`
Exemplo de payload com variantes:
```json
{
  "customerName": "João Silva",
  "customerPhone": "47999999999",
  "notes": "Bem passado",
  "items": [
    {
      "productId": 1,
      "variantId": 1,
      "productName": "Marmita",
      "quantity": 2
    }
  ]
}
```

Resposta:
```json
{
  "success": true,
  "orderId": 1,
  "total": 44.00,
  "whatsappUrl": "https://wa.me/554792637239?text=..."
}
```

## 📊 Relatórios e Análises

### Ver Vendas por Tipo de Carne

```sql
SELECT mt.name, COUNT(*) as quantity, SUM(oi.quantity) as total_items
FROM order_items oi
JOIN meat_types mt ON oi.meat_type_name = mt.name
GROUP BY mt.id, mt.name
ORDER BY total_items DESC;
```

### Receita por Tipo de Carne

```sql
SELECT mt.name, SUM(oi.unit_price * oi.quantity) as revenue
FROM order_items oi
JOIN meat_types mt ON oi.meat_type_name = mt.name
WHERE oi.meat_type_name IS NOT NULL
GROUP BY mt.id, mt.name
ORDER BY revenue DESC;
```

## 🎨 Customizar Visual do Modal

Edite o arquivo `public/styles.css` na seção `.meat-selector-*`:

```css
.meat-selector-content {
  background: var(--white);
  border-radius: 24px;
  padding: 32px;
  max-width: 400px;
  /* ... customize aqui ... */
}
```

## ⚠️ Notas Importantes

1. **IDs Únicos**: Cada tipo de carne deve ter um ID único na tabela `meat_types`
2. **Variantes Completas**: Certifique-se de que cada tamanho (P, M, G) tenha todas os tipos de carne
3. **Preços Corretos**: O preço é armazenado em `product_variants`, não em `meat_types`
4. **Mensagem WhatsApp**: Inclui o tipo de carne selecionado para o restaurante saber exatamente o que foi pedido

## 🐛 Troubleshooting

### Modal não aparece ao clicar

- Verifique se JavaScript está ativado
- Verifique se há variantes para o produto no banco
- Abra o console do navegador (F12) para ver erros

### Preço não é mostrado

- Certifique-se de que as variantes foram inseridas no banco
- Verifique se os `meat_type_id` estão corretos
- Reinicie o servidor

### Pedido não inclui tipo de carne

- Verifique se `variantId` está sendo enviado na requisição POST
- Confirme se o banco tem a variante com esse ID

## 📞 Suporte

Para problemas ou sugestões, entre em contato via WhatsApp: (47) 9263-7239

---

**Salton Buffet & Marmitaria** © 2026
