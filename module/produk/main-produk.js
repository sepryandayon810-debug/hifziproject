/**
 * WebPOS Produk Module
 * Product management functionality
 */

const Produk = {
  // State
  state: {
    products: [],
    categories: [],
    filteredProducts: [],
    currentPage: 1,
    perPage: 12,
    viewMode: 'grid',
    currentProduct: null,
    filters: {
      search: '',
      category: '',
      status: ''
    }
  },

  /**
   * Initialize Produk module
   */
  init: () => {
    if (!Auth.isAuthenticated()) {
      window.location.href = '../login.html';
      return;
    }

    if (!Auth.canAccess('produk')) {
      Utils.showToast('Anda tidak memiliki akses ke menu ini', 'error');
      window.location.href = '../index.html';
      return;
    }

    Produk.setupEventListeners();
    Produk.setupSidebar();
    Produk.loadUserData();
    Produk.loadCategories();
    Produk.loadProducts();

    console.log('✅ Produk module initialized');
  },

  /**
   * Setup event listeners
   */
  setupEventListeners: () => {
    // Search
    document.getElementById('searchProduk')?.addEventListener('input', 
      Utils.debounce((e) => {
        Produk.state.filters.search = e.target.value.toLowerCase();
        Produk.applyFilters();
      }, 300)
    );

    // Filters
    document.getElementById('filterKategori')?.addEventListener('change', (e) => {
      Produk.state.filters.category = e.target.value;
      Produk.applyFilters();
    });

    document.getElementById('filterStatus')?.addEventListener('change', (e) => {
      Produk.state.filters.status = e.target.value;
      Produk.applyFilters();
    });

    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        Produk.state.viewMode = btn.dataset.view;
        Produk.renderProducts();
      });
    });

    // Add product button
    document.getElementById('btnAddProduk')?.addEventListener('click', () => {
      Produk.showAddModal();
    });

    // Modal
    document.getElementById('closeProdukModal')?.addEventListener('click', Produk.closeModal);
    document.getElementById('btnCancelProduk')?.addEventListener('click', Produk.closeModal);
    document.getElementById('btnSaveProduk')?.addEventListener('click', Produk.saveProduct);

    // Image upload
    const imageUpload = document.getElementById('imageUpload');
    const produkImage = document.getElementById('produkImage');
    
    if (imageUpload && produkImage) {
      imageUpload.addEventListener('click', () => produkImage.click());
      
      imageUpload.addEventListener('dragover', (e) => {
        e.preventDefault();
        imageUpload.style.borderColor = 'var(--primary)';
      });
      
      imageUpload.addEventListener('dragleave', () => {
        imageUpload.style.borderColor = 'var(--border-color)';
      });
      
      imageUpload.addEventListener('drop', (e) => {
        e.preventDefault();
        imageUpload.style.borderColor = 'var(--border-color)';
        if (e.dataTransfer.files.length) {
          Produk.handleImageSelect(e.dataTransfer.files[0]);
        }
      });
      
      produkImage.addEventListener('change', (e) => {
        if (e.target.files.length) {
          Produk.handleImageSelect(e.target.files[0]);
        }
      });
    }

    // Import/Export
    document.getElementById('btnImport')?.addEventListener('click', Produk.importProducts);
    document.getElementById('btnExport')?.addEventListener('click', Produk.exportProducts);
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

    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    if (mobileMenuToggle) {
      mobileMenuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }

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
      
      Produk.state.categories = Object.entries(categories).map(([id, data]) => ({
        id,
        ...data
      }));

      // Populate filter dropdown
      const filterSelect = document.getElementById('filterKategori');
      const modalSelect = document.getElementById('produkKategori');
      
      const options = Produk.state.categories.map(cat => 
        `<option value="${cat.id}">${cat.name}</option>`
      ).join('');
      
      if (filterSelect) {
        filterSelect.innerHTML = '<option value="">Semua Kategori</option>' + options;
      }
      
      if (modalSelect) {
        modalSelect.innerHTML = '<option value="">Pilih Kategori</option>' + options;
      }

    } catch (error) {
      console.error('Error loading categories:', error);
    }
  },

  /**
   * Load products
   */
  loadProducts: async () => {
    try {
      Utils.showLoading('Memuat produk...');
      
      const snapshot = await database.ref('products').once('value');
      const products = snapshot.val() || {};
      
      Produk.state.products = Object.entries(products).map(([id, data]) => ({
        id,
        ...data
      }));

      Produk.state.filteredProducts = [...Produk.state.products];
      Produk.renderProducts();
      Produk.updatePagination();
      
      Utils.hideLoading();
    } catch (error) {
      console.error('Error loading products:', error);
      Utils.hideLoading();
      Utils.showToast('Gagal memuat produk', 'error');
    }
  },

  /**
   * Apply filters
   */
  applyFilters: () => {
    let filtered = [...Produk.state.products];

    // Search filter
    if (Produk.state.filters.search) {
      const query = Produk.state.filters.search;
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(query) ||
        (p.code && p.code.toLowerCase().includes(query))
      );
    }

    // Category filter
    if (Produk.state.filters.category) {
      filtered = filtered.filter(p => p.categoryId === Produk.state.filters.category);
    }

    // Status filter
    if (Produk.state.filters.status) {
      filtered = filtered.filter(p => p.status === Produk.state.filters.status);
    }

    Produk.state.filteredProducts = filtered;
    Produk.state.currentPage = 1;
    Produk.renderProducts();
    Produk.updatePagination();
  },

  /**
   * Render products
   */
  renderProducts: () => {
    const container = document.getElementById('produkGrid');
    if (!container) return;

    const start = (Produk.state.currentPage - 1) * Produk.state.perPage;
    const end = start + Produk.state.perPage;
    const products = Produk.state.filteredProducts.slice(start, end);

    if (products.length === 0) {
      container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
          <div class="empty-state">
            <div class="empty-state-icon">
              <i class="fas fa-box-open"></i>
            </div>
            <p class="empty-state-title">Tidak ada produk</p>
            <p class="empty-state-text">Belum ada produk yang ditambahkan</p>
          </div>
        </div>
      `;
      return;
    }

    container.innerHTML = products.map(product => Produk.renderProductCard(product)).join('');

    // Add event listeners to action buttons
    container.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const productId = btn.closest('.produk-card').dataset.id;
        Produk.editProduct(productId);
      });
    });

    container.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const productId = btn.closest('.produk-card').dataset.id;
        Produk.deleteProduct(productId);
      });
    });
  },

  /**
   * Render product card
   */
  renderProductCard: (product) => {
    const category = Produk.state.categories.find(c => c.id === product.categoryId);
    const statusClass = product.status === 'active' ? 'active' : 'inactive';
    const statusText = product.status === 'active' ? 'Aktif' : 'Nonaktif';
    
    return `
      <div class="produk-card" data-id="${product.id}">
        <div class="produk-image">
          ${product.image ? 
            `<img src="${product.image}" alt="${product.name}">` : 
            '<i class="fas fa-box"></i>'
          }
          <span class="produk-status ${statusClass}">${statusText}</span>
          <span class="produk-stock-badge">Stok: ${product.stock || 0}</span>
        </div>
        <div class="produk-info">
          <div class="produk-name">${product.name}</div>
          <div class="produk-code">${product.code || '-'} • ${category?.name || 'Uncategorized'}</div>
          <div class="produk-price">${Utils.formatRupiah(product.sellingPrice)}</div>
        </div>
        <div class="produk-actions">
          <button class="btn btn-secondary btn-edit">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn btn-danger btn-delete">
            <i class="fas fa-trash"></i> Hapus
          </button>
        </div>
      </div>
    `;
  },

  /**
   * Update pagination
   */
  updatePagination: () => {
    const total = Produk.state.filteredProducts.length;
    const totalPages = Math.ceil(total / Produk.state.perPage);
    
    document.getElementById('showingText').textContent = 
      `Menampilkan ${total} produk`;

    const pagination = document.getElementById('pagination');
    if (totalPages <= 1) {
      pagination.innerHTML = '';
      return;
    }

    let html = '';
    
    // Previous button
    html += `
      <button class="btn btn-sm btn-secondary" 
        ${Produk.state.currentPage === 1 ? 'disabled' : ''}
        onclick="Produk.goToPage(${Produk.state.currentPage - 1})">
        <i class="fas fa-chevron-left"></i>
      </button>
    `;

    // Page buttons
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= Produk.state.currentPage - 1 && i <= Produk.state.currentPage + 1)) {
        html += `
          <button class="btn btn-sm ${i === Produk.state.currentPage ? 'btn-primary' : 'btn-secondary'}"
            onclick="Produk.goToPage(${i})">
            ${i}
          </button>
        `;
      } else if (i === Produk.state.currentPage - 2 || i === Produk.state.currentPage + 2) {
        html += `<span class="btn btn-sm btn-ghost">...</span>`;
      }
    }

    // Next button
    html += `
      <button class="btn btn-sm btn-secondary"
        ${Produk.state.currentPage === totalPages ? 'disabled' : ''}
        onclick="Produk.goToPage(${Produk.state.currentPage + 1})">
        <i class="fas fa-chevron-right"></i>
      </button>
    `;

    pagination.innerHTML = html;
  },

  /**
   * Go to page
   */
  goToPage: (page) => {
    Produk.state.currentPage = page;
    Produk.renderProducts();
    Produk.updatePagination();
  },

  /**
   * Show add modal
   */
  showAddModal: () => {
    Produk.state.currentProduct = null;
    document.getElementById('modalTitle').textContent = 'Tambah Produk';
    document.getElementById('produkForm').reset();
    document.getElementById('produkId').value = '';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('produkCode').value = Produk.generateProductCode();
    
    document.getElementById('produkModal').classList.add('active');
  },

  /**
   * Edit product
   */
  editProduct: (productId) => {
    const product = Produk.state.products.find(p => p.id === productId);
    if (!product) return;

    Produk.state.currentProduct = product;
    document.getElementById('modalTitle').textContent = 'Edit Produk';
    document.getElementById('produkId').value = product.id;
    document.getElementById('produkName').value = product.name;
    document.getElementById('produkCode').value = product.code || '';
    document.getElementById('produkKategori').value = product.categoryId || '';
    document.getElementById('produkUnit').value = product.unit || 'pcs';
    document.getElementById('produkCost').value = product.costPrice || 0;
    document.getElementById('produkPrice').value = product.sellingPrice || 0;
    document.getElementById('produkStock').value = product.stock || 0;
    document.getElementById('produkMinStock').value = product.minStock || 5;
    document.getElementById('produkDesc').value = product.description || '';
    document.getElementById('produkStatus').checked = product.status !== 'inactive';

    if (product.image) {
      document.getElementById('imagePreview').src = product.image;
      document.getElementById('imagePreview').style.display = 'block';
    } else {
      document.getElementById('imagePreview').style.display = 'none';
    }

    document.getElementById('produkModal').classList.add('active');
  },

  /**
   * Delete product
   */
  deleteProduct: async (productId) => {
    Utils.confirm('Yakin ingin menghapus produk ini?', async () => {
      try {
        Utils.showLoading('Menghapus produk...');
        await database.ref(`products/${productId}`).remove();
        
        Produk.state.products = Produk.state.products.filter(p => p.id !== productId);
        Produk.applyFilters();
        
        Utils.hideLoading();
        Utils.showToast('Produk berhasil dihapus', 'success');
      } catch (error) {
        Utils.hideLoading();
        Utils.showToast('Gagal menghapus produk', 'error');
      }
    });
  },

  /**
   * Save product
   */
  saveProduct: async () => {
    const form = document.getElementById('produkForm');
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    try {
      Utils.showLoading('Menyimpan produk...');

      const productData = {
        name: document.getElementById('produkName').value,
        code: document.getElementById('produkCode').value,
        categoryId: document.getElementById('produkKategori').value,
        unit: document.getElementById('produkUnit').value,
        costPrice: parseInt(document.getElementById('produkCost').value) || 0,
        sellingPrice: parseInt(document.getElementById('produkPrice').value) || 0,
        stock: parseInt(document.getElementById('produkStock').value) || 0,
        minStock: parseInt(document.getElementById('produkMinStock').value) || 5,
        description: document.getElementById('produkDesc').value,
        status: document.getElementById('produkStatus').checked ? 'active' : 'inactive',
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      };

      // Handle image upload
      const imagePreview = document.getElementById('imagePreview');
      if (imagePreview.style.display !== 'none' && imagePreview.src.startsWith('data:')) {
        // Upload new image
        const imageFile = await fetch(imagePreview.src).then(r => r.blob());
        const imageRef = storage.ref(`products/${Date.now()}_${productData.name}`);
        await imageRef.put(imageFile);
        productData.image = await imageRef.getDownloadURL();
      } else if (Produk.state.currentProduct?.image) {
        productData.image = Produk.state.currentProduct.image;
      }

      let productId = document.getElementById('produkId').value;
      
      if (productId) {
        // Update existing
        await database.ref(`products/${productId}`).update(productData);
        Utils.showToast('Produk berhasil diupdate', 'success');
      } else {
        // Create new
        productId = Utils.generateId('PRD');
        productData.id = productId;
        productData.createdAt = firebase.database.ServerValue.TIMESTAMP;
        productData.soldCount = 0;
        
        await database.ref(`products/${productId}`).set(productData);
        Utils.showToast('Produk berhasil ditambahkan', 'success');
      }

      Produk.closeModal();
      Produk.loadProducts();
      
    } catch (error) {
      console.error('Error saving product:', error);
      Utils.hideLoading();
      Utils.showToast('Gagal menyimpan produk', 'error');
    }
  },

  /**
   * Handle image select
   */
  handleImageSelect: (file) => {
    if (!file.type.startsWith('image/')) {
      Utils.showToast('File harus berupa gambar', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.getElementById('imagePreview');
      preview.src = e.target.result;
      preview.style.display = 'block';
    };
    reader.readAsDataURL(file);
  },

  /**
   * Adjust stock
   */
  adjustStock: (delta) => {
    const input = document.getElementById('produkStock');
    const current = parseInt(input.value) || 0;
    input.value = Math.max(0, current + delta);
  },

  /**
   * Generate product code
   */
  generateProductCode: () => {
    const prefix = 'PRD';
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `${prefix}${Date.now().toString().slice(-4)}${random}`;
  },

  /**
   * Close modal
   */
  closeModal: () => {
    document.getElementById('produkModal').classList.remove('active');
  },

  /**
   * Export products
   */
  exportProducts: () => {
    const data = Produk.state.products.map(p => ({
      ID: p.id,
      Nama: p.name,
      Kode: p.code,
      Kategori: Produk.state.categories.find(c => c.id === p.categoryId)?.name || '',
      'Harga Modal': p.costPrice,
      'Harga Jual': p.sellingPrice,
      Stok: p.stock,
      Satuan: p.unit,
      Status: p.status
    }));

    Utils.exportToCsv(data, `produk_${Utils.getTodayString()}.csv`);
    Utils.showToast('Produk berhasil diexport', 'success');
  },

  /**
   * Import products
   */
  importProducts: () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      // Implementation for CSV parsing and import
      Utils.showToast('Fitur import akan segera tersedia', 'info');
    };
    input.click();
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Produk;
}
