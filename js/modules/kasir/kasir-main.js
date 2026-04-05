/**
 * WebPOS Kasir Module
 * Main cashier functionality
 */

const Kasir = {
  // State
  state: {
    cart: [],
    products: [],
    categories: [],
    currentCategory: 'all',
    viewMode: 'grid',
    paymentMethod: 'cash',
    discount: 0,
    tax: 0.11,
    note: '',
    searchQuery: ''
  },

  // DOM Elements cache
  elements: {},

  /**
   * Initialize Kasir module
   */
  init: () => {
    if (!Auth.isAuthenticated()) {
      window.location.href = '../login.html';
      return;
    }

    // Check if user has access
    if (!Auth.canAccess('kasir')) {
      Utils.showToast('Anda tidak memiliki akses ke menu ini', 'error');
      window.location.href = '../index.html';
      return;
    }

    Kasir.cacheElements();
    Kasir.setupEventListeners();
    Kasir.setupSidebar();
    Kasir.loadUserData();
    Kasir.loadCategories();
    Kasir.loadProducts();
    Kasir.loadCartFromStorage();
    
    // Keyboard shortcuts
    Kasir.setupKeyboardShortcuts();
    
    console.log('✅ Kasir initialized');
  },

  /**
   * Cache DOM elements
   */
  cacheElements: () => {
    Kasir.elements = {
      // Products
      productsGrid: document.getElementById('productsGrid'),
      categoryPills: document.getElementById('categoryPills'),
      productSearch: document.getElementById('productSearch'),
      viewBtns: document.querySelectorAll('.view-btn'),
      
      // Cart
      cartItems: document.getElementById('cartItems'),
      cartCount: document.getElementById('cartCount'),
      subtotal: document.getElementById('subtotal'),
      discount: document.getElementById('discount'),
      tax: document.getElementById('tax'),
      total: document.getElementById('total'),
      btnClearCart: document.getElementById('btnClearCart'),
      
      // Payment
      paymentModal: document.getElementById('paymentModal'),
      paymentTotal: document.getElementById('paymentTotal'),
      paymentAmount: document.getElementById('paymentAmount'),
      paymentChange: document.getElementById('paymentChange'),
      
      // Manual input
      manualModal: document.getElementById('manualModal'),
      
      // Mobile
      cartSection: document.getElementById('cartSection'),
      cartToggle: document.getElementById('cartToggle')
    };
  },

  /**
   * Setup event listeners
   */
  setupEventListeners: () => {
    // Search
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        Kasir.state.searchQuery = e.target.value.toLowerCase();
        Kasir.renderProducts();
      }, 300));
    }

    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Kasir.state.viewMode = btn.dataset.view;
        Kasir.renderProducts();
      });
    });

    // Clear cart
    const btnClearCart = document.getElementById('btnClearCart');
    if (btnClearCart) {
      btnClearCart.addEventListener('click', () => {
        Utils.confirm('Yakin ingin mengosongkan keranjang?', () => {
          Kasir.clearCart();
        });
      });
    }

    // Quick actions
    document.getElementById('btnTopup')?.addEventListener('click', Kasir.showTopupModal);
    document.getElementById('btnTarik')?.addEventListener('click', Kasir.showTarikModal);
    document.getElementById('btnManual')?.addEventListener('click', Kasir.showManualModal);
    document.getElementById('btnHold')?.addEventListener('click', Kasir.holdTransaction);
    document.getElementById('btnDiskon')?.addEventListener('click', Kasir.showDiscountModal);
    document.getElementById('btnCatatan')?.addEventListener('click', Kasir.showNoteModal);
    document.getElementById('btnBayar')?.addEventListener('click', Kasir.showPaymentModal);

    // Payment modal
    document.getElementById('closePaymentModal')?.addEventListener('click', Kasir.closePaymentModal);
    document.getElementById('btnCancelPayment')?.addEventListener('click', Kasir.closePaymentModal);
    document.getElementById('btnConfirmPayment')?.addEventListener('click', Kasir.processPayment);

    // Payment methods
    document.querySelectorAll('.payment-method').forEach(method => {
      method.addEventListener('click', () => {
        document.querySelectorAll('.payment-method').forEach(m => m.classList.remove('active'));
        method.classList.add('active');
        Kasir.state.paymentMethod = method.dataset.method;
      });
    });

    // Numpad
    document.querySelectorAll('.numpad-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const num = btn.dataset.num;
        const action = btn.dataset.action;
        
        if (num !== undefined) {
          Kasir.addToPaymentAmount(num);
        } else if (action === 'clear') {
          Kasir.clearPaymentAmount();
        } else if (action === 'backspace') {
          Kasir.backspacePaymentAmount();
        }
      });
    });

    // Quick amounts
    document.querySelectorAll('.quick-amount').forEach(btn => {
      btn.addEventListener('click', () => {
        const amount = btn.dataset.amount;
        if (amount === 'exact') {
          const total = Kasir.calculateTotal();
          Kasir.setPaymentAmount(total);
        } else {
          Kasir.setPaymentAmount(parseInt(amount));
        }
      });
    });

    // Manual modal
    document.getElementById('closeManualModal')?.addEventListener('click', Kasir.closeManualModal);
    document.getElementById('btnCancelManual')?.addEventListener('click', Kasir.closeManualModal);
    document.getElementById('btnAddManual')?.addEventListener('click', Kasir.addManualProduct);

    // Mobile cart toggle
    const cartToggle = document.getElementById('cartToggle');
    const cartSection = document.getElementById('cartSection');
    if (cartToggle && cartSection) {
      cartToggle.addEventListener('click', () => {
        cartSection.classList.toggle('open');
      });
    }

    // Logout
    document.getElementById('btnLogout')?.addEventListener('click', () => {
      Utils.confirm('Yakin ingin logout?', () => Auth.logout());
    });

    // Theme toggle
    document.getElementById('btnTheme')?.addEventListener('click', Kasir.toggleTheme);
  },

  /**
   * Setup sidebar
   */
  setupSidebar: () => {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
      });
    }

    // Mobile menu
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }

    // Dropdowns
    document.querySelectorAll('[data-dropdown]').forEach(dropdown => {
      const toggle = dropdown.querySelector('.nav-dropdown-toggle');
      if (toggle) {
        toggle.addEventListener('click', (e) => {
          e.preventDefault();
          dropdown.classList.toggle('open');
        });
      }
    });
  },

  /**
   * Setup keyboard shortcuts
   */
  setupKeyboardShortcuts: () => {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K for search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('productSearch')?.focus();
      }
      
      // F2 for payment
      if (e.key === 'F2') {
        e.preventDefault();
        if (Kasir.state.cart.length > 0) {
          Kasir.showPaymentModal();
        }
      }
      
      // Escape to close modals
      if (e.key === 'Escape') {
        Kasir.closePaymentModal();
        Kasir.closeManualModal();
      }
    });
  },

  /**
   * Load user data
   */
  loadUserData: () => {
    const user = Auth.getCurrentUser();
    if (user) {
      document.getElementById('userName').textContent = user.name || user.email;
      document.getElementById('userRole').textContent = 
        user.role.charAt(0).toUpperCase() + user.role.slice(1);
      
      const avatar = document.getElementById('userAvatar');
      if (avatar && user.name) {
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        avatar.textContent = initials;
      }
    }
  },

  /**
   * Load categories
   */
  loadCategories: async () => {
    try {
      const snapshot = await database.ref('categories').once('value');
      const categories = snapshot.val() || {};
      
      Kasir.state.categories = Object.entries(categories).map(([id, data]) => ({
        id,
        ...data
      }));

      Kasir.renderCategories();
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  },

  /**
   * Render categories
   */
  renderCategories: () => {
    const container = document.getElementById('categoryPills');
    if (!container) return;

    const pills = Kasir.state.categories.map(cat => `
      <button class="category-pill" data-category="${cat.id}">${cat.name}</button>
    `).join('');

    container.innerHTML = `<button class="category-pill active" data-category="all">Semua</button>${pills}`;

    // Add click handlers
    container.querySelectorAll('.category-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        container.querySelectorAll('.category-pill').forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        Kasir.state.currentCategory = pill.dataset.category;
        Kasir.renderProducts();
      });
    });
  },

  /**
   * Load products
   */
  loadProducts: async () => {
    try {
      const snapshot = await database.ref('products').once('value');
      const products = snapshot.val() || {};
      
      Kasir.state.products = Object.entries(products).map(([id, data]) => ({
        id,
        ...data
      })).filter(p => p.status !== 'inactive');

      Kasir.renderProducts();
    } catch (error) {
      console.error('Error loading products:', error);
      Utils.showToast('Gagal memuat produk', 'error');
    }
  },

  /**
   * Render products
   */
  renderProducts: () => {
    const container = document.getElementById('productsGrid');
    if (!container) return;

    let filtered = Kasir.state.products;

    // Filter by category
    if (Kasir.state.currentCategory !== 'all') {
      filtered = filtered.filter(p => p.categoryId === Kasir.state.currentCategory);
    }

    // Filter by search
    if (Kasir.state.searchQuery) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(Kasir.state.searchQuery) ||
        (p.code && p.code.toLowerCase().includes(Kasir.state.searchQuery))
      );
    }

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--text-muted);">
          <i class="fas fa-search" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
          <p>Produk tidak ditemukan</p>
        </div>
      `;
      return;
    }

    if (Kasir.state.viewMode === 'grid') {
      container.className = 'products-grid';
      container.innerHTML = filtered.map(product => Kasir.renderProductCard(product)).join('');
    } else {
      container.className = 'products-list';
      container.innerHTML = filtered.map(product => Kasir.renderProductListItem(product)).join('');
    }

    // Add click handlers
    container.querySelectorAll('.product-card, .product-list-item').forEach(el => {
      el.addEventListener('click', () => {
        const productId = el.dataset.id;
        const product = Kasir.state.products.find(p => p.id === productId);
        if (product) Kasir.addToCart(product);
      });
    });
  },

  /**
   * Render product card (grid view)
   */
  renderProductCard: (product) => {
    const stockClass = product.stock <= 0 ? 'empty' : product.stock <= 5 ? 'low' : '';
    const stockText = product.stock <= 0 ? 'Habis' : product.stock <= 5 ? `${product.stock} left` : product.stock;
    
    return `
      <div class="product-card" data-id="${product.id}">
        <div class="product-card-image">
          ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '<i class="fas fa-box"></i>'}
          <span class="product-stock-badge ${stockClass}">${stockText}</span>
        </div>
        <div class="product-card-info">
          <div class="product-card-name">${product.name}</div>
          <div class="product-card-price">${Utils.formatRupiah(product.sellingPrice)}</div>
          ${product.code ? `<div class="product-card-code">${product.code}</div>` : ''}
        </div>
      </div>
    `;
  },

  /**
   * Render product list item
   */
  renderProductListItem: (product) => {
    return `
      <div class="product-list-item" data-id="${product.id}">
        <div class="product-list-image">
          ${product.image ? `<img src="${product.image}" alt="${product.name}">` : '<i class="fas fa-box"></i>'}
        </div>
        <div class="product-list-info">
          <div class="product-list-name">${product.name}</div>
          <div class="product-list-meta">
            ${product.code ? `Kode: ${product.code} • ` : ''}
            Stok: ${product.stock} ${product.unit || 'pcs'}
          </div>
        </div>
        <div class="product-list-price">${Utils.formatRupiah(product.sellingPrice)}</div>
      </div>
    `;
  },

  /**
   * Add product to cart
   */
  addToCart: (product, qty = 1) => {
    if (product.stock <= 0) {
      Utils.showToast('Produk habis', 'warning');
      return;
    }

    const existingItem = Kasir.state.cart.find(item => item.productId === product.id);

    if (existingItem) {
      if (existingItem.quantity + qty > product.stock) {
        Utils.showToast('Stok tidak mencukupi', 'warning');
        return;
      }
      existingItem.quantity += qty;
      existingItem.total = existingItem.quantity * existingItem.price;
    } else {
      Kasir.state.cart.push({
        productId: product.id,
        name: product.name,
        price: product.sellingPrice,
        cost: product.costPrice || 0,
        quantity: qty,
        total: product.sellingPrice * qty,
        image: product.image || null
      });
    }

    Kasir.saveCartToStorage();
    Kasir.renderCart();
    Kasir.updateCartSummary();
    
    Utils.showToast(`${product.name} ditambahkan ke keranjang`, 'success');
  },

  /**
   * Remove from cart
   */
  removeFromCart: (productId) => {
    Kasir.state.cart = Kasir.state.cart.filter(item => item.productId !== productId);
    Kasir.saveCartToStorage();
    Kasir.renderCart();
    Kasir.updateCartSummary();
  },

  /**
   * Update cart item quantity
   */
  updateCartItemQty: (productId, delta) => {
    const item = Kasir.state.cart.find(i => i.productId === productId);
    if (!item) return;

    const product = Kasir.state.products.find(p => p.id === productId);
    const newQty = item.quantity + delta;

    if (newQty <= 0) {
      Kasir.removeFromCart(productId);
      return;
    }

    if (product && newQty > product.stock) {
      Utils.showToast('Stok tidak mencukupi', 'warning');
      return;
    }

    item.quantity = newQty;
    item.total = item.quantity * item.price;

    Kasir.saveCartToStorage();
    Kasir.renderCart();
    Kasir.updateCartSummary();
  },

  /**
   * Update cart item price
   */
  updateCartItemPrice: (productId, newPrice) => {
    const item = Kasir.state.cart.find(i => i.productId === productId);
    if (!item) return;

    item.price = newPrice;
    item.total = item.quantity * item.price;

    Kasir.saveCartToStorage();
    Kasir.renderCart();
    Kasir.updateCartSummary();
  },

  /**
   * Clear cart
   */
  clearCart: () => {
    Kasir.state.cart = [];
    Kasir.state.discount = 0;
    Kasir.state.note = '';
    Kasir.saveCartToStorage();
    Kasir.renderCart();
    Kasir.updateCartSummary();
    Utils.showToast('Keranjang dikosongkan', 'info');
  },

  /**
   * Render cart
   */
  renderCart: () => {
    const container = document.getElementById('cartItems');
    const countBadge = document.getElementById('cartCount');
    
    if (!container) return;

    // Update count
    const totalItems = Kasir.state.cart.reduce((sum, item) => sum + item.quantity, 0);
    if (countBadge) countBadge.textContent = totalItems;

    if (Kasir.state.cart.length === 0) {
      container.innerHTML = `
        <div class="cart-empty">
          <i class="fas fa-shopping-basket"></i>
          <p>Keranjang masih kosong</p>
          <p style="font-size: 0.75rem; margin-top: 0.5rem;">Klik produk untuk menambahkan</p>
        </div>
      `;
      return;
    }

    container.innerHTML = Kasir.state.cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-image">
          ${item.image ? `<img src="${item.image}" alt="${item.name}">` : '<i class="fas fa-box"></i>'}
        </div>
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${Utils.formatRupiah(item.price)}</div>
          <div class="cart-item-actions">
            <button class="qty-btn" onclick="Kasir.updateCartItemQty('${item.productId}', -1)">-</button>
            <input type="text" class="qty-input" value="${item.quantity}" readonly>
            <button class="qty-btn" onclick="Kasir.updateCartItemQty('${item.productId}', 1)">+</button>
          </div>
        </div>
        <div class="cart-item-total">${Utils.formatRupiah(item.total)}</div>
        <button class="cart-item-remove" onclick="Kasir.removeFromCart('${item.productId}')">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `).join('');
  },

  /**
   * Update cart summary
   */
  updateCartSummary: () => {
    const subtotal = Kasir.state.cart.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * Kasir.state.tax;
    const total = subtotal + tax - Kasir.state.discount;

    document.getElementById('subtotal').textContent = Utils.formatRupiah(subtotal);
    document.getElementById('discount').textContent = Utils.formatRupiah(Kasir.state.discount);
    document.getElementById('tax').textContent = Utils.formatRupiah(tax);
    document.getElementById('total').textContent = Utils.formatRupiah(total);
  },

  /**
   * Calculate total
   */
  calculateTotal: () => {
    const subtotal = Kasir.state.cart.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * Kasir.state.tax;
    return subtotal + tax - Kasir.state.discount;
  },

  /**
   * Save cart to storage
   */
  saveCartToStorage: () => {
    Utils.setStorage('kasir_cart', Kasir.state.cart);
    Utils.setStorage('kasir_discount', Kasir.state.discount);
    Utils.setStorage('kasir_note', Kasir.state.note);
  },

  /**
   * Load cart from storage
   */
  loadCartFromStorage: () => {
    const cart = Utils.getStorage('kasir_cart');
    const discount = Utils.getStorage('kasir_discount');
    const note = Utils.getStorage('kasir_note');

    if (cart) Kasir.state.cart = cart;
    if (discount) Kasir.state.discount = discount;
    if (note) Kasir.state.note = note;

    Kasir.renderCart();
    Kasir.updateCartSummary();
  },

  /**
   * Show payment modal
   */
  showPaymentModal: () => {
    if (Kasir.state.cart.length === 0) {
      Utils.showToast('Keranjang masih kosong', 'warning');
      return;
    }

    const total = Kasir.calculateTotal();
    document.getElementById('paymentTotal').textContent = Utils.formatRupiah(total);
    Kasir.clearPaymentAmount();
    
    document.getElementById('paymentModal').classList.add('active');
  },

  /**
   * Close payment modal
   */
  closePaymentModal: () => {
    document.getElementById('paymentModal').classList.remove('active');
  },

  /**
   * Add to payment amount
   */
  addToPaymentAmount: (num) => {
    const input = document.getElementById('paymentAmount');
    let current = input.value.replace(/[^0-9]/g, '');
    current = current === '0' ? num : current + num;
    
    const amount = parseInt(current);
    input.value = Utils.formatRupiah(amount);
    Kasir.calculateChange(amount);
  },

  /**
   * Set payment amount
   */
  setPaymentAmount: (amount) => {
    const input = document.getElementById('paymentAmount');
    input.value = Utils.formatRupiah(amount);
    Kasir.calculateChange(amount);
  },

  /**
   * Clear payment amount
   */
  clearPaymentAmount: () => {
    document.getElementById('paymentAmount').value = '';
    document.getElementById('paymentChange').textContent = 'Rp 0';
  },

  /**
   * Backspace payment amount
   */
  backspacePaymentAmount: () => {
    const input = document.getElementById('paymentAmount');
    let current = input.value.replace(/[^0-9]/g, '');
    current = current.slice(0, -1);
    
    if (current === '') {
      input.value = '';
      document.getElementById('paymentChange').textContent = 'Rp 0';
    } else {
      const amount = parseInt(current);
      input.value = Utils.formatRupiah(amount);
      Kasir.calculateChange(amount);
    }
  },

  /**
   * Calculate change
   */
  calculateChange: (amount) => {
    const total = Kasir.calculateTotal();
    const change = amount - total;
    document.getElementById('paymentChange').textContent = Utils.formatRupiah(change > 0 ? change : 0);
  },

  /**
   * Process payment
   */
  processPayment: async () => {
    const amountStr = document.getElementById('paymentAmount').value;
    const amount = parseInt(amountStr.replace(/[^0-9]/g, '')) || 0;
    const total = Kasir.calculateTotal();

    if (amount < total) {
      Utils.showToast('Jumlah bayar kurang dari total', 'error');
      return;
    }

    try {
      Utils.showLoading('Memproses transaksi...');

      const user = Auth.getCurrentUser();
      const transactionId = Utils.generateId('TRX');
      const timestamp = Date.now();

      // Calculate profit
      const profit = Kasir.state.cart.reduce((sum, item) => 
        sum + ((item.price - item.cost) * item.quantity), 0
      );

      const transaction = {
        id: transactionId,
        type: 'penjualan',
        items: Kasir.state.cart,
        subtotal: Kasir.state.cart.reduce((sum, item) => sum + item.total, 0),
        tax: total * Kasir.state.tax,
        discount: Kasir.state.discount,
        total: total,
        profit: profit,
        paymentMethod: Kasir.state.paymentMethod,
        paymentAmount: amount,
        change: amount - total,
        cashierId: user.uid,
        cashierName: user.name,
        timestamp: timestamp,
        status: 'completed',
        note: Kasir.state.note
      };

      // Save transaction
      const today = Utils.getTodayString();
      await database.ref(`transactions/${today}/${transactionId}`).set(transaction);

      // Update product stocks
      for (const item of Kasir.state.cart) {
        const productRef = database.ref(`products/${item.productId}`);
        const snapshot = await productRef.once('value');
        const product = snapshot.val();
        
        if (product) {
          await productRef.update({
            stock: Math.max(0, (product.stock || 0) - item.quantity),
            soldCount: (product.soldCount || 0) + item.quantity
          });
        }
      }

      // Clear cart
      Kasir.clearCart();
      Kasir.closePaymentModal();
      Utils.hideLoading();

      Utils.showToast('Transaksi berhasil!', 'success');
      
      // Print receipt (if printer configured)
      Kasir.printReceipt(transaction);

    } catch (error) {
      console.error('Payment error:', error);
      Utils.hideLoading();
      Utils.showToast('Gagal memproses transaksi', 'error');
    }
  },

  /**
   * Show manual input modal
   */
  showManualModal: () => {
    document.getElementById('manualModal').classList.add('active');
    document.getElementById('manualName').focus();
  },

  /**
   * Close manual modal
   */
  closeManualModal: () => {
    document.getElementById('manualModal').classList.remove('active');
    // Clear inputs
    document.getElementById('manualName').value = '';
    document.getElementById('manualPrice').value = '';
    document.getElementById('manualCost').value = '';
    document.getElementById('manualQty').value = '1';
  },

  /**
   * Add manual product
   */
  addManualProduct: () => {
    const name = document.getElementById('manualName').value.trim();
    const price = parseInt(document.getElementById('manualPrice').value) || 0;
    const cost = parseInt(document.getElementById('manualCost').value) || 0;
    const qty = parseInt(document.getElementById('manualQty').value) || 1;

    if (!name || price <= 0) {
      Utils.showToast('Nama dan harga wajib diisi', 'warning');
      return;
    }

    const manualProduct = {
      id: 'manual_' + Date.now(),
      name: name,
      sellingPrice: price,
      costPrice: cost,
      stock: 9999
    };

    Kasir.addToCart(manualProduct, qty);
    Kasir.closeManualModal();
  },

  /**
   * Show discount modal
   */
  showDiscountModal: () => {
    const discount = prompt('Masukkan jumlah diskon (Rp):', Kasir.state.discount);
    if (discount !== null) {
      Kasir.state.discount = parseInt(discount) || 0;
      Kasir.saveCartToStorage();
      Kasir.updateCartSummary();
    }
  },

  /**
   * Show note modal
   */
  showNoteModal: () => {
    const note = prompt('Catatan untuk transaksi:', Kasir.state.note);
    if (note !== null) {
      Kasir.state.note = note;
      Kasir.saveCartToStorage();
    }
  },

  /**
   * Show topup modal
   */
  showTopupModal: () => {
    window.location.href = 'kas-topup.html';
  },

  /**
   * Show tarik modal
   */
  showTarikModal: () => {
    window.location.href = 'kas-tarik.html';
  },

  /**
   * Hold transaction
   */
  holdTransaction: () => {
    if (Kasir.state.cart.length === 0) {
      Utils.showToast('Keranjang masih kosong', 'warning');
      return;
    }

    const holdId = Utils.generateId('HOLD');
    const holdData = {
      id: holdId,
      cart: Kasir.state.cart,
      discount: Kasir.state.discount,
      note: Kasir.state.note,
      timestamp: Date.now()
    };

    // Save to held transactions
    const held = Utils.getStorage('held_transactions') || [];
    held.push(holdData);
    Utils.setStorage('held_transactions', held);

    Kasir.clearCart();
    Utils.showToast('Transaksi ditahan', 'success');
  },

  /**
   * Print receipt
   */
  printReceipt: (transaction) => {
    // Implementation depends on printer configuration
    console.log('Printing receipt:', transaction);
  },

  /**
   * Toggle theme
   */
  toggleTheme: () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    document.documentElement.setAttribute('data-theme', isDark ? 'light' : 'dark');
    Utils.setStorage('dark_mode', !isDark);
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Kasir;
}
