const products = [
  { id: 1, name: 'Marmita P', category: 'marmita', size: 'P', price: 20.00, description: 'Porção ideal para 1 pessoa.' },
  { id: 2, name: 'Marmita M', category: 'marmita', size: 'M', price: 24.00, description: 'Marmita de tamanho médio.' },
  { id: 3, name: 'Marmita G', category: 'marmita', size: 'G', price: 32.00, description: 'Marmita grande para quem quer mais volume.' },
  { id: 4, name: 'Coca-Cola 2L', category: 'bebida', size: '2 litros', price: 16.00, description: 'Refrigerante Coca-Cola 2 litros.' },
  { id: 5, name: 'Fanta 2L', category: 'bebida', size: '2 litros', price: 16.00, description: 'Refrigerante Fanta 2 litros.' },
  { id: 6, name: 'Coca-Cola 350ml', category: 'bebida', size: '350 ml', price: 8.00, description: 'Lata de Coca-Cola 350ml.' },
  { id: 7, name: 'Fanta 350ml', category: 'bebida', size: '350 ml', price: 8.00, description: 'Lata de Fanta 350ml.' },
  { id: 8, name: 'Coca-Cola 200ml', category: 'bebida', size: '200 ml', price: 3.00, description: 'Garrafa de Coca-Cola 200ml.' },
  { id: 9, name: 'Coca-Cola Zero 200ml', category: 'bebida', size: '200 ml', price: 3.00, description: 'Garrafa de Coca-Cola Zero 200ml.' },
  { id: 10, name: 'Fanta 200ml', category: 'bebida', size: '200 ml', price: 3.00, description: 'Garrafa de Fanta 200ml.' }
];

const cart = new Map();

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

const renderMenu = (category = 'marmita') => {
  const menuGrid = document.getElementById('menuGrid');
  if (!menuGrid) return;

  const filtered = products.filter(item => item.category === category);

  menuGrid.innerHTML = filtered.map(item => `
    <article class="product-card">
      <div class="product-top">
        <span class="tag ${item.category === 'bebida' ? 'bebida' : ''}">${item.category === 'bebida' ? 'Bebida' : 'Marmita'}</span>
        <span class="size">${item.size}</span>
      </div>
      <h3>${item.name}</h3>
      <p>${item.description}</p>
      <div class="product-footer">
        <strong>${formatCurrency(item.price)}</strong>
        <button type="button" class="add-btn" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}">Adicionar</button>
      </div>
    </article>
  `).join('');

  attachAddButtons();
};

const updateCart = () => {
  const cartList = document.getElementById('cart-items');
  const totalPrice = document.getElementById('total-price');

  if (!cartList || !totalPrice) return;

  const items = Array.from(cart.values());

  if (items.length === 0) {
    cartList.innerHTML = '<li class="empty-cart">Nenhum item adicionado ainda.</li>';
    totalPrice.textContent = 'R$ 0,00';
    return;
  }

  let total = 0;
  cartList.innerHTML = items.map(item => {
    const subtotal = item.quantity * item.price;
    total += subtotal;
    return `
      <li>
        <span>${item.name} x${item.quantity}</span>
        <strong>${formatCurrency(subtotal)}</strong>
      </li>
    `;
  }).join('');

  totalPrice.textContent = formatCurrency(total);
};

const attachAddButtons = () => {
  document.querySelectorAll('.add-btn').forEach(button => {
    button.addEventListener('click', () => {
      const { id, name, price } = button.dataset;
      const key = Number(id);

      if (cart.has(key)) {
        const current = cart.get(key);
        cart.set(key, { ...current, quantity: current.quantity + 1 });
      } else {
        cart.set(key, { id: key, name, price: Number(price), quantity: 1 });
      }

      updateCart();
    });
  });
};

document.querySelectorAll('.tab-btn').forEach(button => {
  button.addEventListener('click', () => {
    const target = button.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn === button));
    renderMenu(target);
  });
});

document.getElementById('order-form')?.addEventListener('submit', (event) => {
  event.preventDefault();

  if (cart.size === 0) {
    alert('Adicione pelo menos um item para fazer o pedido.');
    return;
  }

  const customerName = document.getElementById('customerName').value.trim();
  const notes = document.getElementById('notes').value.trim();

  if (!customerName) {
    alert('Preencha o nome para continuar.');
    return;
  }

  const itemsText = Array.from(cart.values()).map(item => `${item.name} x${item.quantity}`).join(', ');
  let total = 0;
  Array.from(cart.values()).forEach(item => {
    total += item.quantity * item.price;
  });

  const message = `Olá! Gostaria de fazer o seguinte pedido:\n\nCliente: ${customerName}\nItens: ${itemsText}\nTotal: ${formatCurrency(total)}\nObservações: ${notes || 'Nenhuma'}\n\nPedido via site Salton Buffet & Marmitaria.`;

  const whatsappUrl = `https://wa.me/554792637239?text=${encodeURIComponent(message)}`;
  window.open(whatsappUrl, '_blank');

  cart.clear();
  updateCart();
  event.target.reset();
});

renderMenu('marmita');
updateCart();
