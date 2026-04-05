/**
 * WebPOS Kasir Main Module
 * Main controller for kasir functionality
 */

const KasirModule = {
  // State
  state: {
    products: [],
    cart: [],
    categories: [],
    activeCategory: 'all',
    viewMode: 'grid', // 'grid' or 'list'
    searchQuery: '',
    isLoading: false,
    currentTransaction: null
  },

  // Configuration
  config: {
    itemsPerPage: 20,
    taxRate: 0,
    defaultPayment: 'cash'
  },

  /**
   * Initialize kasir module
   */
  init: async () => {
    Header.setPageTitle('Kasir');
    
    KasirModule.renderLayout();
    await KasirModule.loadCategories();
    await KasirModule.loadProducts();
    KasirModule.setupEventListeners();
    KeranjangModule.init();
    
    // Check if kasir is open
    if (!Header.state.kasirOpen) {
      KasirModule.showKasirClosedWarning();
    }
  },

  /**
   * Render main layout
   */
  renderLayout: () => {
    const container = document.getElementById('content-area');
    if (!container) return;

    container.innerHTML = `
      <div class="kasir-layout">
        <!-- Left: Product Area -->
        <div class="product-area">
          <!-- Toolbar -->
          <div class="kasir-toolbar">
            <div class="search-box">
              <i class="fas fa-search"></i>
              <input type="text" id="productSearch" placeholder="Cari produk (Ctrl+F)...">
              <button class="btn-scan" onclick="KasirModule.scanBarcode()" title="Scan Barcode">
                <i class="fas fa-barcode"></i>
              </button>
            </div>
            
            <div class="toolbar-actions">
              <div class="category-filter">
                <select id="categoryFilter">
                  <option value="all">Semua Kategori</option>
                </select>
              </div>
              
              <div class="view-toggle">
                <button class="${KasirModule.state.viewMode === 'grid' ? 'active' : ''}" 
                        onclick="KasirModule.setViewMode('grid')" title="Grid View">
                  <i class="fas fa-th-large"></i>
                </button>
                <button class="${KasirModule.state.viewMode === 'list' ? 'active' : ''}" 
                        onclick="KasirModule.setViewMode('list')" title="List View">
                  <i class="fas fa-list"></i>
                </button>
              </div>
              
              <button class="btn-manual" onclick="TransaksiManualModule.open()">
                <i class="fas fa-plus"></i> Manual
              </button>
            </div>
          </div>

          <!-- Products Container -->
          <div class="products-container" id="productsContainer">
            <div class="loading-state">
              <div class="spinner"></div>
              <p>Memuat produk...</p>
            </div>
          </div>

          <!-- Quick Actions -->
          <div class="quick-actions">
            <button class="btn-quick" onclick="TopUpModule.open()">
              <i class="fas fa-mobile-alt"></i>
              <span>Top Up</span>
            </button>
            <button class="btn-quick" onclick="TarikTunaiModule.open()">
              <i class="fas fa-hand-holding-usd"></i>
              <span>Tarik Tunai</span>
            </button>
            <button class="btn-quick" onclick="KasirModule.openHutang()">
              <i class="fas fa-handshake"></i>
              <span>Hutang</span>
            </button>
          </div>
        </div>

        <!-- Right: Cart Area -->
        <div class="cart-area" id="cartArea">
          <!-- Cart content rendered by KeranjangModule -->
        </div>
      </div>

      <!-- Mobile Cart Toggle -->
      <button class="mobile-cart-toggle" onclick="KasirModule.toggleMobileCart()">
        <i class="fas fa-shopping-cart"></i>
        <span class="cart-badge" id="mobileCartBadge">0</span>
      </button>
    `;
  },

  /**
   * Load categories from Firebase
   */
  loadCategories: async () => {
    try {
      const snapshot = await firebase.database().ref('kategori').once('value');
      const categories = [];
      
      snapshot.forEach(child => {
        categories.push({
          id: child.key,
          ...child.val()
        });
      });

      KasirModule.state.categories = categories;
      KasirModule.renderCategoryFilter();
      
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  },

  /**
   * Render category filter dropdown
   */
  renderCategoryFilter: () => {
    const select = document.getElementById('categoryFilter');
    if (!select) return;

    const options = ['<option value="all">Semua Kategori</option>'];
    
    KasirModule.state.categories.forEach(cat => {
      options.push(`<option value="${cat.id}">${cat.nama}</option>`);
    });
    
    select.innerHTML = options.join('');
    
    select.addEventListener('change', (e) => {
      KasirModule.state.activeCategory = e.target.value;
      KasirModule.filterProducts();
    });
  },

  /**
   * Load products from Firebase
   */
  loadProducts: async () => {
    KasirModule.state.isLoading = true;
    
    try {
      const snapshot = await firebase.database().ref('produk').once('value');
      const products = [];
      
      snapshot.forEach(child => {
        const product = {
          id: child.key,
          ...child.val()
        };
        
        // Only show active products with stock
        if (product.aktif !== false && product.stok > 0) {
          products.push(product);
        }
      });

      KasirModule.state.products = products;
      KasirModule.renderProducts();
      
    } catch (error) {
      console.error('Error loading products:', error);
      Utils.showToast('Gagal memuat produk', 'error');
    } finally {
      KasirModule.state.isLoading = false;
    }
  },

  /**
   * Render products based on view mode
   */
  renderProducts: () => {
    const container = document.getElementById('productsContainer');
    if (!container) return;

    const filtered = KasirModule.getFilteredProducts();

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <i class="fas fa-box-open"></i>
          <p>Tidak ada produk ditemukan</p>
        </div>
      `;
      return;
    }

    if (KasirModule.state.viewMode === 'grid') {
      ProdukGridModule.render(container, filtered, KasirModule.onProductSelect);
    } else {
      ProdukListModule.render(container, filtered, KasirModule.onProductSelect);
    }
  },

  /**
   * Get filtered products
   */
  getFilteredProducts: () => {
    let filtered = [...KasirModule.state.products];

    // Category filter
    if (KasirModule.state.activeCategory !== 'all') {
      filtered = filtered.filter(p => p.kategoriId === KasirModule.state.activeCategory);
    }

    // Search filter
    if (KasirModule.state.searchQuery) {
      const query = KasirModule.state.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.nama?.toLowerCase().includes(query) ||
        p.kode?.toLowerCase().includes(query) ||
        p.barcode?.includes(query)
      );
    }

    return filtered;
  },

  /**
   * Handle product selection
   */
  onProductSelect: (product) => {
    // Check if already in cart
    const existing = KeranjangModule.findItem(product.id);
    
    if (existing) {
      // Increment quantity
      KeranjangModule.updateQuantity(product.id, existing.qty + 1);
    } else {
      // Add new item
      KeranjangModule.addItem({
        id: product.id,
        nama: product.nama,
        hargaJual: product.harga_jual,
        hargaModal: product.harga_modal,
        qty: 1,
        stok: product.stok,
        gambar: product.gambar,
        kategori: product.kategoriNama
      });
    }

    Utils.showToast(`${product.nama} ditambahkan`, 'success');
  },

  /**
   * Set view mode
   */
  setViewMode: (mode) => {
    KasirModule.state.viewMode = mode;
    Utils.storage.set('kasirViewMode', mode);
    
    // Update button states
    document.querySelectorAll('.view-toggle button').forEach(btn => {
      btn.classList.remove('active');
    });
    event.target.closest('button').classList.add('active');
    
    KasirModule.renderProducts();
  },

  /**
   * Filter products
   */
  filterProducts: () => {
    KasirModule.renderProducts();
  },

  /**
   * Setup event listeners
   */
  setupEventListeners: () => {
    // Search input
    const searchInput = document.getElementById('productSearch');
    if (searchInput) {
      searchInput.addEventListener('input', Utils.debounce((e) => {
        KasirModule.state.searchQuery = e.target.value;
        KasirModule.filterProducts();
      }, 300));

      // Focus shortcut
      document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
          e.preventDefault();
          searchInput.focus();
        }
      });
    }

    // Keyboard shortcuts for quick actions
    document.addEventListener('keydown', (e) => {
      // F2 for Top Up
      if (e.key === 'F2') {
        e.preventDefault();
        TopUpModule.open();
      }
      // F3 for Tarik Tunai
      if (e.key === 'F3') {
        e.preventDefault();
        TarikTunaiModule.open();
      }
      // F4 for manual transaction
      if (e.key === 'F4') {
        e.preventDefault();
        TransaksiManualModule.open();
      }
    });
  },

  /**
   * Scan barcode
   */
  scanBarcode: async () => {
    // Check if BarcodeDetector is supported
    if ('BarcodeDetector' in window) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        
        // Show scanner modal
        const modal = Utils.createModal(`
          <div class="barcode-scanner">
            <video id="scannerVideo" autoplay playsinline></video>
            <div class="scanner-overlay">
              <div class="scanner-frame"></div>
              <p>Arahkan barcode ke dalam kotak</p>
            </div>
            <button onclick="this.closest('.modal-overlay').remove()" class="btn-close-scanner">
              <i class="fas fa-times"></i> Tutup
            </button>
          </div>
        `, { closable: false });

        const video = document.getElementById('scannerVideo');
        video.srcObject = stream;

        const detector = new BarcodeDetector({ formats: ['ean_13', 'ean_8', 'code_128', 'qr_code'] });
        
        const scanFrame = async () => {
          if (!video.readyState === video.HAVE_ENOUGH_DATA) {
            requestAnimationFrame(scanFrame);
            return;
          }

          try {
            const barcodes = await detector.detect(video);
            
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              KasirModule.searchByBarcode(code);
              
              // Stop stream and close modal
              stream.getTracks().forEach(track => track.stop());
              modal.close();
              return;
            }
          } catch (err) {
            console.error('Barcode detection error:', err);
          }

          requestAnimationFrame(scanFrame);
        };

        scanFrame();

      } catch (err) {
        console.error('Camera access error:', err);
        Utils.showToast('Tidak dapat mengakses kamera', 'error');
        
        // Fallback: manual input
        const code = prompt('Masukkan kode barcode:');
        if (code) KasirModule.searchByBarcode(code);
      }
    } else {
      // Fallback: manual input
      const code = prompt('Masukkan kode barcode:');
      if (code) KasirModule.searchByBarcode(code);
    }
  },

  /**
   * Search product by barcode
   */
  searchByBarcode: (code) => {
    const product = KasirModule.state.products.find(p => p.barcode === code || p.kode === code);
    
    if (product) {
      KasirModule.onProductSelect(product);
    } else {
      Utils.showToast('Produk tidak ditemukan', 'error');
    }
  },

  /**
   * Toggle mobile cart
   */
  toggleMobileCart: () => {
    const cartArea = document.getElementById('cartArea');
    cartArea?.classList.toggle('mobile-open');
  },

  /**
   * Show kasir closed warning
   */
  showKasirClosedWarning: () => {
    Utils.showToast('Kasir sedang tutup. Buka kasir terlebih dahulu.', 'warning');
  },

  /**
   * Open hutang/piutang quick entry
   */
  openHutang: () => {
    // Quick hutang entry or navigate to full module
    window.location.href = './hutang-piutang.html';
  },

  /**
   * Process checkout
   */
  checkout: async (paymentData) => {
    if (!Header.state.kasirOpen) {
      Utils.showToast('Kas
