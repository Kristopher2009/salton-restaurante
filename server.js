const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'salton.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);

const initialProducts = [
  { id: 1, name: 'Marmita P', category: 'marmita', size: 'P', price: 20.0, description: 'Porção ideal para 1 pessoa.' },
  { id: 2, name: 'Marmita M', category: 'marmita', size: 'M', price: 24.0, description: 'Marmita de tamanho médio.' },
  { id: 3, name: 'Marmita G', category: 'marmita', size: 'G', price: 32.0, description: 'Marmita grande para quem quer mais volume.' },
  { id: 4, name: 'Coca-Cola 2L', category: 'bebida', size: '2 litros', price: 16.0, description: 'Refrigerante Coca-Cola 2 litros.' },
  { id: 5, name: 'Fanta 2L', category: 'bebida', size: '2 litros', price: 16.0, description: 'Refrigerante Fanta 2 litros.' },
  { id: 6, name: 'Coca-Cola 350ml', category: 'bebida', size: '350 ml', price: 8.0, description: 'Lata de Coca-Cola 350ml.' },
  { id: 7, name: 'Fanta 350ml', category: 'bebida', size: '350 ml', price: 8.0, description: 'Lata de Fanta 350ml.' },
  { id: 8, name: 'Coca-Cola 200ml', category: 'bebida', size: '200 ml', price: 3.0, description: 'Garrafa de Coca-Cola 200ml.' },
  { id: 9, name: 'Coca-Cola Zero 200ml', category: 'bebida', size: '200 ml', price: 3.0, description: 'Garrafa de Coca-Cola Zero 200ml.' },
  { id: 10, name: 'Fanta 200ml', category: 'bebida', size: '200 ml', price: 3.0, description: 'Garrafa de Fanta 200ml.' }
];

function initDatabase() {
  db.serialize(() => {
    db.run(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        size TEXT,
        price REAL NOT NULL,
        description TEXT
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        customer_phone TEXT,
        notes TEXT,
        total REAL NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `);

    db.run(`
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        unit_price REAL NOT NULL,
        FOREIGN KEY(order_id) REFERENCES orders(id),
        FOREIGN KEY(product_id) REFERENCES products(id)
      )
    `);

    const insertProduct = db.prepare(`
      INSERT OR IGNORE INTO products (id, name, category, size, price, description)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    initialProducts.forEach((product) => {
      insertProduct.run(
        product.id,
        product.name,
        product.category,
        product.size,
        product.price,
        product.description
      );
    });

    insertProduct.finalize();
  });
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', async (req, res) => {
  db.all('SELECT * FROM products ORDER BY category, id', (err, products) => {
    if (err) {
      console.error(err);
      return res.status(500).send('Erro ao carregar cardápio.');
    }

    const groupedProducts = {
      marmita: products.filter((item) => item.category === 'marmita'),
      bebida: products.filter((item) => item.category === 'bebida')
    };

    res.render('index', {
      title: 'Salton Buffet & Marmitaria',
      products: groupedProducts,
      whatsappNumber: '554792637239'
    });
  });
});

app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products ORDER BY category, id', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao consultar produtos.' });
    }
    res.json(rows);
  });
});

app.post('/api/orders', (req, res) => {
  const { customerName, customerPhone, notes, items } = req.body;

  if (!customerName || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'Preencha nome e escolha pelo menos um item.' });
  }

  let total = 0;
  const validatedItems = [];

  items.forEach((item) => {
    if (!item.productId || !item.quantity || item.quantity < 1) {
      return;
    }

    const { productId, quantity } = item;

    db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
      if (err || !product) {
        return;
      }

      total += Number(product.price) * Number(quantity);
      validatedItems.push({
        productId: Number(productId),
        quantity: Number(quantity),
        unitPrice: Number(product.price),
        productName: product.name
      });
    });
  });

  setTimeout(() => {
    if (validatedItems.length === 0) {
      return res.status(400).json({ success: false, message: 'Nenhum item válido foi selecionado.' });
    }

    db.run(
      `INSERT INTO orders (customer_name, customer_phone, notes, total) VALUES (?, ?, ?, ?)`,
      [customerName.trim(), (customerPhone || '').toString().trim(), notes || '', Number(total.toFixed(2))],
      function (err) {
        if (err) {
          console.error(err);
          return res.status(500).json({ success: false, message: 'Erro ao salvar o pedido no banco.' });
        }

        const orderId = this.lastID;
        const orderItemStmt = db.prepare(`
          INSERT INTO order_items (order_id, product_id, quantity, unit_price)
          VALUES (?, ?, ?, ?)
        `);

        validatedItems.forEach((item) => {
          orderItemStmt.run(orderId, item.productId, item.quantity, item.unitPrice);
        });

        orderItemStmt.finalize();

        const summary = validatedItems.map(item => `${item.productName} x${item.quantity}`).join(', ');
        const whatsappMessage = `Olá! Gostaria de fazer o seguinte pedido:\n\nCliente: ${customerName}\nItens: ${summary}\nTotal: R$ ${Number(total.toFixed(2)).toFixed(2)}\nObservações: ${notes || 'Nenhuma'}\n\nPedido nº ${orderId}`;

        const encodedMessage = encodeURIComponent(whatsappMessage);
        const whatsappUrl = `https://wa.me/554792637239?text=${encodedMessage}`;

        res.json({
          success: true,
          orderId,
          total: Number(total.toFixed(2)),
          whatsappUrl
        });
      }
    );
  }, 100);
});

app.listen(PORT, () => {
  initDatabase();
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
