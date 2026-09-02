const express = require('express');
const path = require('path');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do pool PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'salton_db',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Tipos de carne disponíveis
const meatTypes = [
  { id: 1, name: 'Bife', slug: 'bife' },
  { id: 2, name: 'Sassame', slug: 'sassame' },
  { id: 3, name: 'Peixe', slug: 'peixe' },
  { id: 4, name: 'Ovo', slug: 'ovo' },
  { id: 5, name: 'Porco', slug: 'porco' },
  { id: 6, name: 'Carne de panela', slug: 'carne_de_panela' }
];

const initialProducts = [
  { id: 1, name: 'Marmita', category: 'marmita', description: 'Marmita com sua escolha de carne', has_meat: true },
  { id: 2, name: 'Coca-Cola 2L', category: 'bebida', size: '2 litros', price: 16.0, description: 'Refrigerante Coca-Cola 2 litros.' },
  { id: 3, name: 'Fanta 2L', category: 'bebida', size: '2 litros', price: 16.0, description: 'Refrigerante Fanta 2 litros.' },
  { id: 4, name: 'Coca-Cola 350ml', category: 'bebida', size: '350 ml', price: 8.0, description: 'Lata de Coca-Cola 350ml.' },
  { id: 5, name: 'Fanta 350ml', category: 'bebida', size: '350 ml', price: 8.0, description: 'Lata de Fanta 350ml.' },
  { id: 6, name: 'Coca-Cola 200ml', category: 'bebida', size: '200 ml', price: 3.0, description: 'Garrafa de Coca-Cola 200ml.' },
  { id: 7, name: 'Coca-Cola Zero 200ml', category: 'bebida', size: '200 ml', price: 3.0, description: 'Garrafa de Coca-Cola Zero 200ml.' },
  { id: 8, name: 'Fanta 200ml', category: 'bebida', size: '200 ml', price: 3.0, description: 'Garrafa de Fanta 200ml.' }
];

// Variações das marmitas (tamanho + tipo de carne)
const initialVariants = [
  // Marmita P
  { product_id: 1, size: 'P', meat_type_id: 1, price: 22.0 },
  { product_id: 1, size: 'P', meat_type_id: 2, price: 20.0 },
  { product_id: 1, size: 'P', meat_type_id: 3, price: 18.0 },
  { product_id: 1, size: 'P', meat_type_id: 4, price: 18.0 },
  { product_id: 1, size: 'P', meat_type_id: 5, price: 20.0 },
  { product_id: 1, size: 'P', meat_type_id: 6, price: 24.0 },
  // Marmita M
  { product_id: 1, size: 'M', meat_type_id: 1, price: 28.0 },
  { product_id: 1, size: 'M', meat_type_id: 2, price: 26.0 },
  { product_id: 1, size: 'M', meat_type_id: 3, price: 24.0 },
  { product_id: 1, size: 'M', meat_type_id: 4, price: 24.0 },
  { product_id: 1, size: 'M', meat_type_id: 5, price: 26.0 },
  { product_id: 1, size: 'M', meat_type_id: 6, price: 30.0 },
  // Marmita G
  { product_id: 1, size: 'G', meat_type_id: 1, price: 35.0 },
  { product_id: 1, size: 'G', meat_type_id: 2, price: 33.0 },
  { product_id: 1, size: 'G', meat_type_id: 3, price: 31.0 },
  { product_id: 1, size: 'G', meat_type_id: 4, price: 31.0 },
  { product_id: 1, size: 'G', meat_type_id: 5, price: 33.0 },
  { product_id: 1, size: 'G', meat_type_id: 6, price: 38.0 }
];

// Inicializar banco de dados
async function initDatabase() {
  try {
    // Criar tabela de produtos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category VARCHAR(100) NOT NULL,
        size VARCHAR(100),
        price DECIMAL(10, 2),
        description TEXT,
        has_meat BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de tipos de carne
    await pool.query(`
      CREATE TABLE IF NOT EXISTS meat_types (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        slug VARCHAR(100) UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de variações de produtos (tamanho + tipo de carne)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_variants (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        size VARCHAR(50),
        meat_type_id INTEGER REFERENCES meat_types(id),
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de pedidos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(20),
        notes TEXT,
        total DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de itens do pedido
    await pool.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
        product_id INTEGER NOT NULL REFERENCES products(id),
        variant_id INTEGER REFERENCES product_variants(id),
        quantity INTEGER NOT NULL,
        unit_price DECIMAL(10, 2) NOT NULL,
        meat_type_name VARCHAR(255),
        size VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Atualizar slugs antigos antes de aplicar os novos tipos
    await pool.query(`
      UPDATE meat_types
      SET slug = 'legacy-' || id
      WHERE id BETWEEN 1 AND 6
    `);

    // Inserir ou atualizar tipos de carne
    for (const meat of meatTypes) {
      await pool.query(
        `INSERT INTO meat_types (id, name, slug) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, slug = EXCLUDED.slug`,
        [meat.id, meat.name, meat.slug]
      );
    }

    // Inserir produtos iniciais se não existirem
    for (const product of initialProducts) {
      await pool.query(
        `INSERT INTO products (id, name, category, size, price, description, has_meat) 
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         ON CONFLICT (id) DO NOTHING`,
        [product.id, product.name, product.category, product.size || null, product.price || null, product.description, product.has_meat || false]
      );
    }

    // Inserir variantes de marmitas se não existirem
    for (const variant of initialVariants) {
      await pool.query(
        `INSERT INTO product_variants (product_id, size, meat_type_id, price) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT DO NOTHING`,
        [variant.product_id, variant.size, variant.meat_type_id, variant.price]
      );
    }

    console.log('✓ Banco de dados inicializado com sucesso');
  } catch (err) {
    console.error('Erro ao inicializar banco de dados:', err);
    process.exit(1);
  }
}

// Configurar view engine e middlewares
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'img')));

// Verificar conexão com banco de dados
app.use(async (req, res, next) => {
  try {
    const result = await pool.query('SELECT NOW()');
    next();
  } catch (err) {
    console.error('Erro de conexão com banco de dados:', err.message);
    res.status(503).send('Erro: Banco de dados indisponível. Verifique sua conexão PostgreSQL.');
  }
});

// Rota principal
app.get('/', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, 
             json_agg(json_build_object(
               'id', pv.id, 
               'size', pv.size, 
               'meat_type_id', pv.meat_type_id,
               'meat_type_name', mt.name,
               'price', pv.price
             )) FILTER (WHERE pv.id IS NOT NULL) as variants
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      LEFT JOIN meat_types mt ON pv.meat_type_id = mt.id
      GROUP BY p.id
      ORDER BY p.category, p.id
    `);
    const products = result.rows;

    const groupedProducts = {
      marmita: products.filter((item) => item.category === 'marmita'),
      bebida: products.filter((item) => item.category === 'bebida')
    };

    res.render('index', {
      title: 'Salton Buffet & Marmitaria',
      products: groupedProducts,
      whatsappNumber: '554792637239',
      meatTypes: meatTypes
    });
  } catch (err) {
    console.error('Erro ao carregar cardápio:', err);
    res.status(500).send('Erro ao carregar cardápio. Tente novamente mais tarde.');
  }
});

// API: Obter produtos
app.get('/api/products', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.*, 
             json_agg(json_build_object(
               'id', pv.id, 
               'size', pv.size, 
               'meat_type_id', pv.meat_type_id,
               'meat_type_name', mt.name,
               'price', pv.price
             )) FILTER (WHERE pv.id IS NOT NULL) as variants
      FROM products p
      LEFT JOIN product_variants pv ON p.id = pv.product_id
      LEFT JOIN meat_types mt ON pv.meat_type_id = mt.id
      GROUP BY p.id
      ORDER BY p.category, p.id
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao consultar produtos:', err);
    res.status(500).json({ error: 'Erro ao consultar produtos.' });
  }
});

// API: Obter variantes de um produto
app.get('/api/products/:productId/variants', async (req, res) => {
  try {
    const { productId } = req.params;
    const result = await pool.query(`
      SELECT pv.id, pv.size, pv.meat_type_id, mt.name as meat_type_name, pv.price
      FROM product_variants pv
      LEFT JOIN meat_types mt ON pv.meat_type_id = mt.id
      WHERE pv.product_id = $1
      ORDER BY pv.size, pv.meat_type_id
    `, [productId]);
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao consultar variantes:', err);
    res.status(500).json({ error: 'Erro ao consultar variantes.' });
  }
});

// API: Obter tipos de carne
app.get('/api/meat-types', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM meat_types ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao consultar tipos de carne:', err);
    res.status(500).json({ error: 'Erro ao consultar tipos de carne.' });
  }
});

// API: Criar pedido
app.post('/api/orders', async (req, res) => {
  const { customerName, customerPhone, notes, items } = req.body;

  if (!customerName || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Preencha nome e escolha pelo menos um item.' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Validar e calcular total
    let total = 0;
    const validatedItems = [];

    for (const item of items) {
      if (!item.productId || !item.quantity || item.quantity < 1) {
        continue;
      }

      let productResult, variantId, meatTypeName, size, price;

      // Se for variante de marmita (com carne)
      if (item.variantId) {
        const variantResult = await client.query(`
          SELECT pv.id, pv.size, pv.price, pv.meat_type_id, mt.name as meat_type_name
          FROM product_variants pv
          LEFT JOIN meat_types mt ON pv.meat_type_id = mt.id
          WHERE pv.id = $1
        `, [item.variantId]);

        if (variantResult.rows.length === 0) {
          continue;
        }

        const variant = variantResult.rows[0];
        variantId = variant.id;
        meatTypeName = variant.meat_type_name;
        size = variant.size;
        price = variant.price;
      } else {
        // Produto comum (bebida)
        productResult = await client.query('SELECT * FROM products WHERE id = $1', [item.productId]);

        if (productResult.rows.length === 0) {
          continue;
        }

        const product = productResult.rows[0];
        variantId = null;
        meatTypeName = null;
        size = product.size;
        price = product.price;
      }

      total += Number(price) * Number(item.quantity);
      validatedItems.push({
        productId: Number(item.productId),
        variantId: variantId,
        quantity: Number(item.quantity),
        unitPrice: Number(price),
        productName: item.productName,
        meatTypeName: meatTypeName,
        size: size
      });
    }

    if (validatedItems.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ success: false, message: 'Nenhum item válido foi selecionado.' });
    }

    // Inserir pedido
    const orderResult = await client.query(
      `INSERT INTO orders (customer_name, customer_phone, notes, total) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      [
        customerName.trim(),
        (customerPhone || '').toString().trim(),
        notes || '',
        Number(total.toFixed(2))
      ]
    );

    const orderId = orderResult.rows[0].id;

    // Inserir itens do pedido
    for (const item of validatedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, variant_id, quantity, unit_price, meat_type_name, size) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [orderId, item.productId, item.variantId, item.quantity, item.unitPrice, item.meatTypeName, item.size]
      );
    }

    await client.query('COMMIT');

    // Preparar mensagem WhatsApp
    const summary = validatedItems.map(item => {
      if (item.meatTypeName) {
        return `${item.productName} ${item.size} (${item.meatTypeName}) x${item.quantity}`;
      }
      return `${item.productName} x${item.quantity}`;
    }).join(', ');
    
    const whatsappMessage = `Olá! Gostaria de fazer o seguinte pedido:\n\nCliente: ${customerName}\nItens: ${summary}\nTotal: R$ ${Number(total.toFixed(2)).toFixed(2)}\nObservações: ${notes || 'Nenhuma'}\n\nPedido nº ${orderId}`;

    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/554792637239?text=${encodedMessage}`;

    res.json({
      success: true,
      orderId,
      total: Number(total.toFixed(2)),
      whatsappUrl
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Erro ao criar pedido:', err);
    res.status(500).json({ success: false, message: 'Erro ao salvar o pedido no banco.' });
  } finally {
    client.release();
  }
});

// Iniciar servidor
async function startServer() {
  await initDatabase();

  app.listen(PORT, () => {
    console.log(`✓ Servidor rodando em http://localhost:${PORT}`);
    console.log(`✓ Configuração PostgreSQL: ${process.env.DB_USER}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`);
  });
}

startServer().catch(err => {
  console.error('Erro ao iniciar servidor:', err);
  process.exit(1);
});

// Tratamento de erros não capturados
process.on('unhandledRejection', (err) => {
  console.error('Rejeição não tratada:', err);
  process.exit(1);
});
