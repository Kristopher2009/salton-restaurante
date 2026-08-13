const selectedItems = new Map();

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);

const updateCart = () => {
  const cartList = document.getElementById('cart-items');
  const totalPrice = document.getElementById('total-price');

  if (!cartList || !totalPrice) return;

  const items = Array.from(selectedItems.entries());

  if (items.length === 0) {
    cartList.innerHTML = '<li class="empty-cart">Nenhum item adicionado ainda.</li>';
    totalPrice.textContent = 'R$ 0,00';
    return;
  }

  let total = 0;

  cartList.innerHTML = items
    .map(([id, item]) => {
      total += item.quantity * item.price;
      return `
        <li>
          <span>${item.name} x${item.quantity}</span>
          <strong>${formatCurrency(item.quantity * item.price)}</strong>
        </li>
      `;
    })
    .join('');

  totalPrice.textContent = formatCurrency(total);
};

const addItemToCart = (id, name, price) => {
  if (selectedItems.has(id)) {
    const current = selectedItems.get(id);
    selectedItems.set(id, { ...current, quantity: current.quantity + 1 });
  } else {
    selectedItems.set(id, { id, name, price, quantity: 1 });
  }

  updateCart();
};

document.querySelectorAll('.add-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const { id, name, price } = button.dataset;
    addItemToCart(Number(id), name, Number(price));
  });
});

const tabButtons = document.querySelectorAll('.tab-btn');
const productCards = document.querySelectorAll('.product-card');

tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.tab;

    tabButtons.forEach((btn) => btn.classList.toggle('active', btn === button));
    productCards.forEach((card) => {
      const category = card.dataset.category;
      const shouldShow = target === 'marmita' ? category === 'marmita' : category === 'bebida';
      card.classList.toggle('hidden', !shouldShow);
    });
  });
});

document.getElementById('order-form')?.addEventListener('submit', async (event) => {
  event.preventDefault();

  const customerName = document.getElementById('customerName').value.trim();
  const notes = document.getElementById('notes').value.trim();

  if (selectedItems.size === 0) {
    alert('Adicione pelo menos um item ao pedido antes de finalizar.');
    return;
  }

  const payload = {
    customerName,
    notes,
    items: Array.from(selectedItems.values()).map((item) => ({
      productId: item.id,
      quantity: item.quantity
    }))
  };

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Não foi possível registrar o pedido.');
    }

    alert('Pedido salvo e encaminhado para o WhatsApp do restaurante!');
    window.open(data.whatsappUrl, '_blank');

    selectedItems.clear();
    updateCart();
    event.target.reset();
  } catch (error) {
    alert(error.message || 'Erro ao finalizar pedido.');
  }
});

updateCart();
