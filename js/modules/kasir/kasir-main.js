/**
 * WebPOS Keranjang (Cart) Module
 * Shopping cart functionality
 */

const KeranjangModule = {
  // State
  items: [],
  discounts: [],
  tax: 0,
  serviceCharge: 0,

  /**
   * Initialize keranjang
   */
  init: () => {
    KeranjangModule.render();
    KeranjangModule.loadFromStorage();
  },

  /**
   * Render keranjang UI
   */
  render: () => {
    const container = document.getElementById('cartArea');
    if (!container) return;

    container.innerHTML = `
      <div class="cart-header">
        <h3><i class="fas fa-shopping-cart"></i> Keranjang</h3>
        <button class="btn-clear" onclick="KeranjangModule.confirmClear()" title="Kosongkan">
          <i class="fas fa-trash"></i>
        </button>
      </div>

      <div class="cart-items" id="cartItems">
        <div class="empty-cart">
          <i class="fas fa-cart-plus"></i>
          <p>Keranjang kosong</p>
          <span>Pilih produk untuk memulai</span>
        </div>
      </div>

      <div class="cart-summary">
        <div class="summary-row">
          <span>Subtotal</span>
          <span id="cartSubtotal">Rp 0</span>
        </div>
        
        <div class="summary-row discount-row" id="discountRow" style="display: none;">
          <span>Diskon</span>
          <span id="cartDiscount">-Rp 0</span>
        </div>
        
        <div class="summary-row tax-row" id="taxRow" style="display: none;">
          <span>Pajak</span>
          <span id="cartTax">Rp 0</span>
        </div>

        <div class="summary-row total">
          <span><strong>Total</strong></span>
          <span id="cartTotal"><strong>Rp 0</strong></span>
        </div>
      </div>

      <div class="cart-actions">
        <button class="btn-hold" onclick="KasirModule.holdTransaction()">
          <i class="fas fa-pause"></i> Tunda
        </button>
        
        <button class="btn-checkout" onclick="KeranjangModule.openPayment()">
          <span>Bayar</span>
          <span id="checkoutTotal">Rp 0</span>
        </button>
      </div>

      <!-- Quick discount buttons -->
      <div class="quick-discounts">
        <button onclick="KeranjangModule.applyDiscount(5000)">-5rb</button>
        <button onclick="KeranjangModule.applyDiscount(10000)">-10rb</button>
        <button onclick="KeranjangModule.applyDiscountPercent(10)">-10%</button>
        <button onclick="KeranjangModule.openDiscountModal()">
          <i class="fas fa-edit"></i>
        </button>
      </div>
    `;
  },

  /**
   * Add item to cart
   */
  addItem: (product) => {
    const existing = KeranjangModule.items.find(i => i.id === product.id);
    
    if (existing) {
      existing.qty += product.qty || 1;
    } else {
      KeranjangModule.items.push({
        ...product,
        qty: product.qty || 1,
        discount: 0,
        note: ''
      });
    }

    KeranjangModule.saveToStorage();
    KeranjangModule.renderItems();
    KeranjangModule.updateSummary();
  },

  /**
   * Remove item from cart
   */
  removeItem: (productId) => {
    KeranjangModule.items = KeranjangModule.items.filter(i => i.id !== productId);
    KeranjangModule.saveToStorage();
    KeranjangModule.renderItems();
    KeranjangModule.updateSummary();
  },

  /**
   * Update item quantity
   */
  updateQuantity: (productId, qty) => {
    const item = KeranjangModule.items.find(i => i.id === productId);
    if (!item) return;

    if (qty <= 0) {
      KeranjangModule.removeItem(productId);
      return;
    }

    // Check stock
    if (qty > item.stok) {
      Utils.showToast(`Stok tidak mencukupi. Maksimal ${item.stok}`, 'warning');
      qty = item.stok;
    }

    item.qty = qty;
    KeranjangModule.saveToStorage();
    KeranjangModule.renderItems();
    KeranjangModule.updateSummary();
  },

  /**
   * Edit item price
   */
  editPrice: (productId) => {
    const item = KeranjangModule.items.find(i => i.id === productId);
    if (!item) return;

    const modal = Utils.createModal(`
      <div style="padding: 20px;">
        <h3 style="margin-bottom: 16px;">Edit Harga - ${item.nama}</h3>
        
        <div class="form-group">
          <label>Harga Jual</label>
          <input type="number" id="editHarga" class="form-input" 
                 value="${item.hargaJual}" min="0" step="100">
        </div>
        
        <div class="form-group">
          <label>Catatan</label>
          <input type="text" id="editNote" class="form-input" 
                 value="${item.note}" placeholder="Catatan untuk item ini">
        </div>
        
        <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px;">
          <button onclick="this.closest('.modal-overlay').remove()" 
                  style="padding: 8px 16px; border: 1px solid #d1d5db; 
                         background: white; border-radius: 6px;">
            Batal
          </button>
          <button id="saveEditBtn" 
                  style="padding: 8px 16px; background: #4f46e5; color: white; 
                         border: none; border-radius: 6px;">
            Simpan
          </button>
        </div>
      </div>
    `, { closable: true });

    document.getElementById('saveEditBtn').addEventListener('click', () => {
      const newHarga = parseInt(document.getElementById('editHarga').value) || item.hargaJual;
      const newNote = document.getElementById('editNote').value;
      
      item.hargaJual = newHarga;
      item.note = newNote;
      item.isEdited = true;
      
      KeranjangModule.saveToStorage();
      KeranjangModule.renderItems();
      KeranjangModule.updateSummary();
      modal.close();
      
      Utils.showToast('Harga diperbarui', 'success');
    });
  },

  /**
   * Render cart items
   */
  renderItems: () => {
    const container = document.getElementById('cartItems');
    if (!container) return;

    if (KeranjangModule.items.length === 0) {
      container.innerHTML = `
        <div class="empty-cart">
          <i class="fas fa-cart-plus"></i>
          <p>Keranjang kosong</p>
          <span>Pilih produk untuk memulai</span>
        </div>
      `;
      return;
    }

    container.innerHTML = KeranjangModule.items.map(item => `
      <div class="cart-item" data-id="${item.id}">
        <div class="item-image">
          ${item.gambar ? 
            `<img src="${item.gambar}" alt="${item.nama}">` : 
            `<div class="placeholder"><i class="fas fa-box"></i></div>`
          }
        </div>
        
        <div class="item-details">
          <div class="item-name">${item.nama}</div>
          <div class="item-price">
            ${item.isEdited ? '<i class="fas fa-edit" title="Harga diedit"></i>' : ''}
            ${Utils.formatRupiah(item.hargaJual)}
          </div>
          ${item.note ? `<div class="item-note">${item.note}</div>` : ''}
        </div>
        
        <div class="item-actions">
          <div class="qty-control">
            <button onclick="KeranjangModule.updateQuantity('${item.id}', ${item.qty - 1})">
              <i class="fas fa-minus"></i>
            </button>
            <span>${item.qty}</span>
            <button onclick="KeranjangModule.updateQuantity('${item.id}', ${item.qty + 1})">
              <i class="fas fa-plus"></i>
            </button>
          </div>
          
          <div class="item-total">
            ${Utils.formatRupiah(item.hargaJual * item.qty)}
          </div>
          
          <button class="btn-edit" onclick="KeranjangModule.editPrice('${item.id}')" title="Edit">
            <i class="fas fa-pencil-alt"></i>
          </button>
          
          <button class="btn-remove" onclick="KeranjangModule.removeItem('${item.id}')" title="Hapus">
            <i class="fas fa-times"></i>
          </button>
        </div>
      </div>
    `).join('');
  },

  /**
   * Update summary totals
   */
  updateSummary: () => {
    const subtotal = KeranjangModule.items.reduce((sum, item) => 
      sum + (item.hargaJual * item.qty), 0);
    
    const totalDiscount = KeranjangModule.discounts.reduce((sum, d) => sum + d.amount, 0);
    const tax = KeranjangModule.tax;
    const total = subtotal - totalDiscount + tax;

    // Update UI
    const subtotalEl = document.getElementById('cartSubtotal');
    const discountEl = document.getElementById('cartDiscount');
    const discountRow = document.getElementById('discountRow');
    const taxEl = document.getElementById('cartTax');
    const taxRow = document.getElementById('taxRow');
    const totalEl = document.getElementById('cartTotal');
    const checkoutEl = document.getElementById('checkoutTotal');
    const mobileBadge = document.getElementById('mobileCartBadge');

    if (subtotalEl) subtotalEl.textContent = Utils.formatRupiah(subtotal);
    if (discountEl) discountEl.textContent = `-${Utils.formatRupiah(totalDiscount)}`;
    if (discountRow) discountRow.style.display = totalDiscount > 0 ? 'flex' : 'none';
    if (taxEl) taxEl.textContent = Utils.formatRupiah(tax);
    if (taxRow) taxRow.style.display = tax > 0 ? 'flex' : 'none';
    if (totalEl) totalEl.innerHTML = `<strong>${Utils.formatRupiah(total)}</strong>`;
    if (checkoutEl) checkoutEl.textContent = Utils.formatRupiah(total);
    if (mobileBadge) mobileBadge.textContent = KeranjangModule.items.length.toString();
  },

  /**
   * Apply fixed discount
   */
  applyDiscount: (amount) => {
    KeranjangModule.discounts.push({
      type: 'fixed',
      amount: amount,
      name: `Diskon ${Utils.formatRupiah(amount)}`
    });
    KeranjangModule.updateSummary();
    Utils.showToast(`Diskon ${Utils.formatRupiah(amount)} diterapkan`, 'success');
  },

  /**
   * Apply percentage discount
   */
  applyDiscountPercent: (percent) => {
    const subtotal = KeranjangModule.items.reduce((sum, item) => 
      sum + (item.hargaJual * item.qty), 0);
    const amount = Math.round(subtotal * percent / 100);
    
    KeranjangModule.discounts.push({
      type: 'percent',
      percent: percent,
      amount: amount,
      name: `Diskon ${percent}%`
    });
    
    KeranjangModule.updateSummary();
    Utils.showToast(`Diskon ${percent}% diterapkan`, 'success');
  },

  /**
   * Open discount modal
   */
  openDiscountModal: () => {
    const modal = Utils.createModal(`
      <div style="padding: 20px;">
        <h3 style="margin-bottom: 16px;">Tambah Diskon</h3>
        
        <div class="discount-tabs">
          <button class="tab-btn active" onclick="switchDiscountTab('fixed')">Nominal</button>
          <button class="tab-btn" onclick="switchDiscountTab('percent')">Persen</button>
        </div>
        
        <div id="fixedDiscount" class="tab-content">
          <input type="number" id="discountAmount" class="form-input" 
                 placeholder="Jumlah diskon" min="0" step="1000">
        </div>
        
        <div id="percentDiscount" class="tab-content" style="display: none;">
          <input type="number" id="discountPercent" class="form-input" 
                 placeholder="Persentase" min="0" max="100" step="1">
        </div>
        
        <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 20px;">
          <button onclick="this.closest('.modal-overlay').remove()" 
                  style="padding: 8px 16px; border: 1px solid #d1d5db; 
                         background: white; border-radius: 6px;">
            Batal
          </button>
          <button id="applyDiscountBtn" 
                  style="padding: 8px 16px; background: #4f46e5; color: white; 
                         border: none; border-radius: 6px;">
            Terapkan
          </button>
        </div>
      </div>
    `, { closable: true });

    // Tab switching
    window.switchDiscountTab = (tab) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      event.target.classList.add('active');
      
      document.getElementById('fixedDiscount').style.display = tab === 'fixed' ? 'block' : 'none';
      document.getElementById('percentDiscount').style.display = tab === 'percent' ? 'block' : 'none';
    };

    document.getElementById('applyDiscountBtn').addEventListener('click', () => {
      const activeTab = document.querySelector('.tab-btn.active').textContent;
      
      if (activeTab === 'Nominal') {
        const amount = parseInt(document.getElementById('discountAmount').value) || 0;
        if (amount > 0) KeranjangModule.applyDiscount(amount);
      } else {
        const percent = parseInt(document.getElementById('discountPercent').value) || 0;
        if (percent > 0) KeranjangModule.applyDiscountPercent(percent);
      }
      
      modal.close();
    });
  },

  /**
   * Open payment modal
   */
  openPayment: () => {
    if (KeranjangModule.items.length === 0) {
      Utils.showToast('Keranjang masih kosong', 'warning');
      return;
    }

    const total = KeranjangModule.getTotal();
    
    UangPasModule.open(total, (paymentData) => {
      KasirModule.checkout(paymentData);
    });
  },

  /**
   * Get cart total
   */
  getTotal: () => {
    const subtotal = KeranjangModule.items.reduce((sum, item) => 
      sum + (item.hargaJual * item.qty), 0);
    const totalDiscount = KeranjangModule.discounts.reduce((sum, d) => sum + d.amount, 0);
    return subtotal - totalDiscount + KeranjangModule.tax;
  },

  /**
   * Get cart items
   */
  getItems: () => {
    return [...KeranjangModule.items];
  },

  /**
   * Find item in cart
   */
  findItem: (productId) => {
    return KeranjangModule.items.find(i => i.id === productId);
  },

  /**
   * Clear cart
   */
  clear: () => {
    KeranjangModule.items = [];
    KeranjangModule.discounts = [];
    KeranjangModule.tax = 0;
    KeranjangModule.saveToStorage();
    KeranjangModule.renderItems();
    KeranjangModule.updateSummary();
  },

  /**
   * Confirm clear
   */
  confirmClear: () => {
    if (KeranjangModule.items.length === 0) return;
    
    Utils.confirm('Yakin ingin mengosongkan keranjang?', () => {
      KeranjangModule.clear();
    });
  },

  /**
   * Save to storage
   */
  saveToStorage: () => {
    Utils.session.set('cart', {
      items: KeranjangModule.items,
      discounts: KeranjangModule.discounts,
      tax: KeranjangModule.tax,
      savedAt: Date.now()
    });
  },

  /**
   * Load from storage
   */
  loadFromStorage: () => {
    const saved = Utils.session.get('cart');
    if (saved && Date.now() - saved.savedAt < 3600000) { // 1 hour expiry
      KeranjangModule.items = saved.items || [];
      KeranjangModule.discounts = saved.discounts || [];
      KeranjangModule.tax = saved.tax || 0;
      KeranjangModule.renderItems();
      KeranjangModule.updateSummary();
    }
  }
};
