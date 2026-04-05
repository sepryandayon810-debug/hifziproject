/**
 * WebPOS Sidebar Component
 * Responsive sidebar with dropdown menus and search
 */

const Sidebar = {
  // Menu structure
  menuStructure: [
    {
      id: 'utama',
      title: 'Utama',
      icon: 'fa-th-large',
      color: 'blue',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: 'fa-home', href: './dashboard.html' },
        { id: 'kasir', label: 'Kasir', icon: 'fa-cash-register', href: './pages/kasir.html' },
        { id: 'produk', label: 'Produk', icon: 'fa-box', href: './pages/produk.html' },
        { id: 'pembelian', label: 'Pembelian', icon: 'fa-shopping-cart', href: './pages/pembelian.html' }
      ]
    },
    {
      id: 'transaksi',
      title: 'Transaksi',
      icon: 'fa-exchange-alt',
      color: 'emerald',
      items: [
        { id: 'riwayat-transaksi', label: 'Riwayat Transaksi', icon: 'fa-history', href: './pages/riwayat-transaksi.html' },
        { id: 'modal-harian', label: 'Modal Harian', icon: 'fa-money-bill-wave', href: './pages/modal-harian.html' },
        { id: 'kas-management', label: 'Kas Management', icon: 'fa-wallet', href: './pages/kas-management.html' },
        { id: 'hutang-piutang', label: 'Hutang Piutang', icon: 'fa-hand-holding-usd', href: './pages/hutang-piutang.html' }
      ]
    },
    {
      id: 'lainnya',
      title: 'Lainnya',
      icon: 'fa-ellipsis-h',
      color: 'pink',
      items: [
        { id: 'laporan', label: 'Laporan', icon: 'fa-chart-bar', href: './pages/laporan.html' },
        { id: 'data-pelanggan', label: 'Data Pelanggan', icon: 'fa-users', href: './pages/data-pelanggan.html' },
        { id: 'telegram', label: 'Telegram', icon: 'fa-paper-plane', href: './pages/telegram.html' }
      ]
    },
    {
      id: 'pengaturan',
      title: 'Pengaturan',
      icon: 'fa-cog',
      color: 'purple',
      items: [
        { id: 'setting', label: 'Setting', icon: 'fa-sliders-h', href: './pages/setting.html' },
        { id: 'printer', label: 'Printer', icon: 'fa-print', href: './pages/printer.html' },
        { id: 'user', label: 'User', icon: 'fa-user-cog', href: './pages/user.html' },
        { id: 'reset', label: 'Reset Data', icon: 'fa-redo', href: './pages/reset.html', ownerOnly: true }
      ]
    }
  ],

  // State
  state: {
    isOpen: false,
    searchQuery: '',
    activeDropdowns: new Set(),
    hiddenMenus: new Set()
  },

  /**
   * Initialize sidebar
   */
  init: () => {
    Sidebar.render();
    Sidebar.setupEventListeners();
    Sidebar.restoreState();
    Sidebar.checkPermissions();
  },

  /**
   * Render sidebar HTML
   */
  render: () => {
    const sidebar = document.getElementById('sidebar');
    if (!sidebar) return;

    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';

    sidebar.innerHTML = `
      <div class="sidebar-header">
        <div class="logo">
          <i class="fas fa-cash-register"></i>
        </div>
        <h3>WebPOS</h3>
        <button class="sidebar-close" onclick="Sidebar.toggle()">
          <i class="fas fa-times"></i>
        </button>
      </div>

      <div class="sidebar-search">
        <i class="fas fa-search"></i>
        <input type="text" id="menuSearch" placeholder="Cari menu..." autocomplete="off">
        <button class="clear-search" id="clearSearch" style="display: none;">
          <i class="fas fa-times-circle"></i>
        </button>
      </div>

      <nav class="sidebar-nav" id="sidebarNav">
        ${Sidebar.renderMenu(currentPage)}
      </nav>

      <div class="sidebar-footer">
        <div class="user-card">
          <div class="user-avatar" id="userAvatar">U</div>
          <div class="user-info">
            <div class="user-name" id="userName">Loading...</div>
            <div class="user-role" id="userRole">-</div>
          </div>
          <button class="logout-btn" onclick="Auth.logout()" title="Logout">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    `;

    Sidebar.updateUserInfo();
  },

  /**
   * Render menu structure
   */
  renderMenu: (currentPage) => {
    const query = Sidebar.state.searchQuery.toLowerCase();

    return Sidebar.menuStructure.map(section => {
      // Filter items based on search and permissions
      const visibleItems = section.items.filter(item => {
        // Check search
        if (query && !item.label.toLowerCase().includes(query)) return false;
        
        // Check permissions
        if (!Auth.canAccess(item.id)) return false;
        
        // Check owner-only
        if (item.ownerOnly && Auth.userRole !== 'owner') return false;
        
        // Check if hidden
        if (Sidebar.state.hiddenMenus.has(item.id)) return false;
        
        return true;
      });

      if (visibleItems.length === 0 && !query) return '';

      const isOpen = Sidebar.state.activeDropdowns.has(section.id);
      const hasVisibleItems = visibleItems.length > 0;

      return `
        <div class="nav-section ${section.id} ${hasVisibleItems ? '' : 'hidden'}">
          <div class="nav-section-header ${isOpen ? 'active' : ''}" 
               onclick="Sidebar.toggleDropdown('${section.id}')"
               data-section="${section.id}">
            <div class="nav-section-title-group">
              <div class="nav-section-icon ${section.color}">
                <i class="fas ${section.icon}"></i>
              </div>
              <span class="nav-section-title">${section.title}</span>
            </div>
            <div class="dropdown-arrow ${isOpen ? 'rotate' : ''}" id="arrow-${section.id}">
              <i class="fas fa-chevron-down"></i>
            </div>
          </div>
          <div class="nav-dropdown ${isOpen ? 'open' : ''}" id="dropdown-${section.id}">
            <ul>
              ${visibleItems.map(item => `
                <li>
                  <a href="${item.href}" 
                     class="${currentPage === item.id ? 'active' : ''}"
                     data-menu-id="${item.id}">
                    <i class="fas ${item.icon}"></i>
                    ${item.label}
                  </a>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Setup event listeners
   */
  setupEventListeners: () => {
    // Search input
    const searchInput = document.getElementById('menuSearch');
    const clearBtn = document.getElementById('clearSearch');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        Sidebar.state.searchQuery = e.target.value;
        clearBtn.style.display = e.target.value ? 'flex' : 'none';
        Sidebar.refreshMenu();
      });
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        Sidebar.state.searchQuery = '';
        clearBtn.style.display = 'none';
        Sidebar.refreshMenu();
        searchInput.focus();
      });
    }

    // Keyboard shortcut (Ctrl/Cmd + B)
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        Sidebar.toggle();
      }
    });

    // Close on overlay click
    const overlay = document.getElementById('overlay');
    if (overlay) {
      overlay.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          Sidebar.close();
        }
      });
    }

    // Handle resize
    window.addEventListener('resize', () => {
      if (window.innerWidth > 768) {
        Sidebar.open();
      } else {
        Sidebar.close();
      }
    });
  },

  /**
   * Toggle sidebar visibility
   */
  toggle: () => {
    Sidebar.state.isOpen = !Sidebar.state.isOpen;
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    if (sidebar) {
      sidebar.classList.toggle('open', Sidebar.state.isOpen);
    }
    
    if (overlay) {
      overlay.classList.toggle('active', Sidebar.state.isOpen && window.innerWidth <= 768);
    }

    Utils.storage.set('sidebarOpen', Sidebar.state.isOpen);
  },

  /**
   * Open sidebar
   */
  open: () => {
    Sidebar.state.isOpen = true;
    const sidebar = document.getElementById('sidebar');
    if (sidebar) sidebar.classList.add('open');
  },

  /**
   * Close sidebar
   */
  close: () => {
    Sidebar.state.isOpen = false;
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    
    if (sidebar) sidebar.classList.remove('open');
    if (overlay) overlay.classList.remove('active');
  },

  /**
   * Toggle dropdown section
   */
  toggleDropdown: (sectionId) => {
    const dropdown = document.getElementById(`dropdown-${sectionId}`);
    const arrow = document.getElementById(`arrow-${sectionId}`);
    const header = dropdown?.previousElementSibling;

    if (Sidebar.state.activeDropdowns.has(sectionId)) {
      Sidebar.state.activeDropdowns.delete(sectionId);
      dropdown?.classList.remove('open');
      arrow?.classList.remove('rotate');
      header?.classList.remove('active');
    } else {
      Sidebar.state.activeDropdowns.add(sectionId);
      dropdown?.classList.add('open');
      arrow?.classList.add('rotate');
      header?.classList.add('active');
    }

    Sidebar.saveState();
  },

  /**
   * Refresh menu (after search)
   */
  refreshMenu: () => {
    const nav = document.getElementById('sidebarNav');
    const currentPage = window.location.pathname.split('/').pop().replace('.html', '') || 'dashboard';
    
    if (nav) {
      nav.innerHTML = Sidebar.renderMenu(currentPage);
    }
  },

  /**
   * Update user info in sidebar
   */
  updateUserInfo: () => {
    const user = Auth.currentUser;
    if (!user) return;

    const avatar = document.getElementById('userAvatar');
    const name = document.getElementById('userName');
    const role = document.getElementById('userRole');

    if (avatar) {
      avatar.textContent = (user.name || user.email || 'U').charAt(0).toUpperCase();
    }
    
    if (name) {
      name.textContent = user.name || user.email?.split('@')[0] || 'User';
    }
    
    if (role) {
      role.textContent = Auth.getRoleDisplayName();
    }
  },

  /**
   * Check and apply permissions
   */
  checkPermissions: () => {
    // Hide menu items based on permissions
    document.querySelectorAll('[data-menu-id]').forEach(link => {
      const menuId = link.dataset.menuId;
      if (!Auth.canAccess(menuId)) {
        link.closest('li').style.display = 'none';
      }
    });
  },

  /**
   * Save sidebar state
   */
  saveState: () => {
    Utils.storage.set('sidebarDropdowns', Array.from(Sidebar.state.activeDropdowns));
    Utils.storage.set('hiddenMenus', Array.from(Sidebar.state.hiddenMenus));
  },

  /**
   * Restore sidebar state
   */
  restoreState: () => {
    // Restore dropdowns
    const savedDropdowns = Utils.storage.get('sidebarDropdowns', []);
    savedDropdowns.forEach(id => Sidebar.state.activeDropdowns.add(id));

    // Restore hidden menus
    const hiddenMenus = Utils.storage.get('hiddenMenus', []);
    hiddenMenus.forEach(id => Sidebar.state.hiddenMenus.add(id));

    // Restore sidebar open state
    const isOpen = Utils.storage.get('sidebarOpen', window.innerWidth > 768);
    Sidebar.state.isOpen = isOpen;
    
    if (isOpen && window.innerWidth > 768) {
      Sidebar.open();
    }

    // Apply restored state
    Sidebar.refreshMenu();
  },

  /**
   * Hide a menu item
   */
  hideMenu: (menuId) => {
    Sidebar.state.hiddenMenus.add(menuId);
    Sidebar.saveState();
    Sidebar.refreshMenu();
  },

  /**
   * Show a menu item
   */
  showMenu: (menuId) => {
    Sidebar.state.hiddenMenus.delete(menuId);
    Sidebar.saveState();
    Sidebar.refreshMenu();
  },

  /**
   * Get all menu items (for search/autocomplete)
   */
  getAllMenuItems: () => {
    const items = [];
    Sidebar.menuStructure.forEach(section => {
      section.items.forEach(item => {
        items.push({
          ...item,
          section: section.title,
          sectionId: section.id
        });
      });
    });
    return items;
  },

  /**
   * Quick navigation to menu
   */
  quickNavigate: (menuId) => {
    const item = Sidebar.getAllMenuItems().find(i => i.id === menuId);
    if (item && Auth.canAccess(menuId)) {
      window.location.href = item.href;
    } else {
      Utils.showToast('Menu tidak tersedia atau Anda tidak memiliki akses', 'warning');
    }
  }
};
