const selectedItems = new Map();
let meatTypes = [];
let productVariants = {};

const formatCurrency = (value) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);

// Carregar tipos de carne e variantes ao iniciar
async function loadMeatTypesAndVariants() {
  try {
    const [meatRes, productsRes] = await Promise.all([
      fetch('/api/meat-types'),
      fetch('/api/products')
    ]);

    meatTypes = await meatRes.json();
    const products = await productsRes.json();

    // Agrupar variantes por produto
    products.forEach(product => {
      if (product.variants && product.variants.length > 0) {
        productVariants[product.id] = product.variants;
      }
    });
  } catch (err) {
    console.error('Erro ao carregar tipos de carne:', err);
  }
}

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
      const meatInfo = item.meatType ? ` (${item.meatType})` : '';
      const sizeInfo = item.size ? ` - ${item.size}` : '';
      return `
        <li>
          <span>${item.name}${sizeInfo}${meatInfo} x${item.quantity}</span>
          <strong>${formatCurrency(item.quantity * item.price)}</strong>
        </li>
      `;
    })
    .join('');

  totalPrice.textContent = formatCurrency(total);
};

const addItemToCart = (variantId, name, price, meatType, size, productId) => {
  // Usar variantId como chave única para marmitas, id para bebidas
  const cartKey = variantId || `product_${productId}`;

  if (selectedItems.has(cartKey)) {
    const current = selectedItems.get(cartKey);
    selectedItems.set(cartKey, { ...current, quantity: current.quantity + 1 });
  } else {
    selectedItems.set(cartKey, {
      variantId,
      productId,
      name,
      price,
      meatType,
      size,
      quantity: 1
    });
  }

  updateCart();
};

// Renderizar produtos com seletor de carne para marmitas
const renderMenu = (category = 'marmita') => {
  const menuGrid = document.getElementById('menuGrid');
  if (!menuGrid) return;

  const productCards = document.querySelectorAll('.product-card');
  let filteredCards = [];

  productCards.forEach((card) => {
    if (category === 'marmita' && card.dataset.category === 'marmita') {
      filteredCards.push(card);
      card.classList.remove('hidden');
    } else if (category === 'bebida' && card.dataset.category === 'bebida') {
      filteredCards.push(card);
      card.classList.remove('hidden');
    } else {
      card.classList.add('hidden');
    }
  });
};

// Evento para abas
document.querySelectorAll('.tab-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const target = button.dataset.tab;
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.toggle('active', btn === button));
    renderMenu(target);
  });
});

// Delegação de eventos para seletor de carne e botão de adicionar
document.addEventListener('click', (event) => {
  if (event.target.classList.contains('add-btn')) {
    const card = event.target.closest('.product-card');
    const productId = card.dataset.productId;
    const category = card.dataset.category;

    if (category === 'marmita') {
      // Mostrar modal/seletor para marmita
      showMeatAndSizeSelector(productId);
    } else {
      // Bebida - adicionar diretamente
      const { id, name, price } = event.target.dataset;
      addItemToCart(null, name, Number(price), null, event.target.dataset.size, Number(id));
    }
  }
});

// Mostrar seletor de tamanho e carne
function showMeatAndSizeSelector(productId) {
  const variants = productVariants[productId];
  if (!variants || variants.length === 0) return;

  // Agrupar por tamanho
  const sizeGroups = {};
  variants.forEach(v => {
    if (!sizeGroups[v.size]) sizeGroups[v.size] = [];
    sizeGroups[v.size].push(v);
  });

  const sizes = Object.keys(sizeGroups).sort();
  let currentSize = sizes[0];
  let currentMeatType = sizeGroups[currentSize][0];

  // Criar modal
  const modal = document.createElement('div');
  modal.className = 'meat-selector-modal';
  modal.innerHTML = `
    <div class="meat-selector-content">
      <h3>Escolha o Tamanho e Tipo de Carne</h3>
      
      <div class="size-selector">
        <label>Tamanho:</label>
        <select id="size-select">
          ${sizes.map(size => `<option value="${size}">${size}</option>`).join('')}
        </select>
      </div>

      <div class="meat-selector">
        <label>Tipo de Carne:</label>
        <select id="meat-select">
          ${sizeGroups[currentSize].map(v => `
            <option value="${v.id}" data-price="${v.price}" data-meat="${v.meat_type_name}">
              ${v.meat_type_name} - ${formatCurrency(v.price)}
            </option>
          `).join('')}
        </select>
      </div>

      <div class="modal-actions">
        <button id="confirm-btn" class="primary-btn">Adicionar ao Carrinho</button>
        <button id="cancel-btn" class="secondary-btn">Cancelar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Evento para mudar tamanho
  document.getElementById('size-select').addEventListener('change', (e) => {
    const selectedSize = e.target.value;
    const meatSelect = document.getElementById('meat-select');
    const variantsForSize = sizeGroups[selectedSize];

    meatSelect.innerHTML = variantsForSize.map(v => `
      <option value="${v.id}" data-price="${v.price}" data-meat="${v.meat_type_name}">
        ${v.meat_type_name} - ${formatCurrency(v.price)}
      </option>
    `).join('');
  });

  // Confirmar seleção
  document.getElementById('confirm-btn').addEventListener('click', () => {
    const sizeSelect = document.getElementById('size-select');
    const meatSelect = document.getElementById('meat-select');
    const selectedOption = meatSelect.options[meatSelect.selectedIndex];

    const variantId = Number(selectedOption.value);
    const price = Number(selectedOption.dataset.price);
    const meatType = selectedOption.dataset.meat;
    const size = sizeSelect.value;

    addItemToCart(variantId, 'Marmita', price, meatType, size, productId);
    modal.remove();
  });

  // Cancelar
  document.getElementById('cancel-btn').addEventListener('click', () => {
    modal.remove();
  });

  // Fechar ao clicar fora
  modal.addEventListener('click', (e) => {
    if (e.target === modal) modal.remove();
  });
}

// Enviar pedido
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
      productId: item.productId,
      variantId: item.variantId,
      productName: item.name,
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

// Inicializar
loadMeatTypesAndVariants().then(() => {
  renderMenu('marmita');
  updateCart();
});
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
