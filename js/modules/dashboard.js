/**
 * WebPOS Dashboard Module
 * Handles dashboard functionality and UI interactions
 */

const Dashboard = {
  // State
  state: {
    isSidebarCollapsed: false,
    isDarkMode: false,
    isShiftOpen: false,
    todayStats: {
      modalAwal: 0,
      penjualan: 0,
      topup: 0,
      tarik: 0,
      kasMasuk: 0,
      kasKeluar: 0,
      laba: 0,
      transaksiCount: 0
    }
  },

  /**
   * Initialize dashboard
   */
  init: () => {
    // Check authentication
    if (!Auth.isAuthenticated()) {
      window.location.href = 'login.html';
      return;
    }

    // Load saved preferences
    Dashboard.loadPreferences();
    
    // Setup UI
    Dashboard.setupSidebar();
    Dashboard.setupTheme();
    Dashboard.setupEventListeners();
    Dashboard.setupDropdowns();
    Dashboard.setupMobileMenu();
    
    // Load user data
    Dashboard.loadUserData();
    
    // Load dashboard data
    Dashboard.loadDashboardData();
    
    // Check shift status
    Dashboard.checkShiftStatus();
    
    // Hide loading
    Utils.hideLoading();
    
    console.log('✅ Dashboard initialized');
  },

  /**
   * Load user preferences from storage
   */
  loadPreferences: () => {
    const sidebarState = Utils.getStorage('sidebar_collapsed');
    if (sidebarState) {
      Dashboard.state.isSidebarCollapsed = sidebarState;
      if (sidebarState) {
        document.getElementById('sidebar').classList.add('collapsed');
      }
    }

    const darkMode = Utils.getStorage('dark_mode');
    if (darkMode) {
      Dashboard.state.isDarkMode = darkMode;
      if (darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('btnTheme').innerHTML = '<i class="fas fa-sun"></i>';
      }
    }
  },

  /**
   * Setup sidebar functionality
   */
  setupSidebar: () => {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    
    if (menuToggle) {
      menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('collapsed');
        Dashboard.state.isSidebarCollapsed = sidebar.classList.contains('collapsed');
        Utils.setStorage('sidebar_collapsed', Dashboard.state.isSidebarCollapsed);
        
        // Rotate icon
        const icon = menuToggle.querySelector('i');
        if (Dashboard.state.isSidebarCollapsed) {
          icon.style.transform = 'rotate(180deg)';
        } else {
          icon.style.transform = 'rotate(0deg)';
        }
      });
    }

    // Menu search
    const menuSearch = document.getElementById('menuSearch');
    if (menuSearch) {
      menuSearch.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
          const text = link.textContent.toLowerCase();
          const parent = link.closest('.nav-item');
          
          if (text.includes(searchTerm)) {
            link.style.display = 'flex';
            if (parent) parent.style.display = 'block';
          } else {
            link.style.display = 'none';
            if (parent && !parent.querySelector('.nav-submenu')) {
              parent.style.display = 'none';
            }
          }
        });
      });
    }
  },

  /**
   * Setup dropdown menus
   */
  setupDropdowns: () => {
    const dropdowns = document.querySelectorAll('[data-dropdown]');
    
    dropdowns.forEach(dropdown => {
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
   * Setup mobile menu
   */
  setupMobileMenu: () => {
    const mobileToggle = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (mobileToggle) {
      mobileToggle.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }

    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', (e) => {
      if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
          sidebar.classList.remove('mobile-open');
        }
      }
    });
  },

  /**
   * Setup theme toggle
   */
  setupTheme: () => {
    const themeBtn = document.getElementById('btnTheme');
    
    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        Dashboard.state.isDarkMode = !Dashboard.state.isDarkMode;
        
        if (Dashboard.state.isDarkMode) {
          document.documentElement.setAttribute('data-theme', 'dark');
          themeBtn.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
          document.documentElement.setAttribute('data-theme', 'light');
          themeBtn.innerHTML = '<i class="fas fa-moon"></i>';
        }
        
        Utils.setStorage('dark_mode', Dashboard.state.isDarkMode);
      });
    }
  },

  /**
   * Setup event listeners
   */
  setupEventListeners: () => {
    // Logout button
    const logoutBtn = document.getElementById('btnLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        Utils.confirm('Apakah Anda yakin ingin logout?', () => {
          Auth.logout();
        });
      });
    }

    // Cloud sync button
    const cloudBtn = document.getElementById('btnCloud');
    if (cloudBtn) {
      cloudBtn.addEventListener('click', () => {
        Dashboard.syncCloud();
      });
    }

    // Settings button
    const settingsBtn = document.getElementById('btnSettings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => {
        window.location.href = 'pages/setting.html';
      });
    }

    // Close shift button
    const closeShiftBtn = document.getElementById('btnCloseShift');
    if (closeShiftBtn) {
      closeShiftBtn.addEventListener('click', () => {
        Dashboard.toggleShift();
      });
    }

    // Mobile stats toggle
    const mobileStatsBtn = document.getElementById('btnMobileStats');
    if (mobileStatsBtn) {
      mobileStatsBtn.addEventListener('click', () => {
        document.getElementById('mobileStats').classList.toggle('hidden');
      });
    }
  },

  /**
   * Load user data
   */
  loadUserData: () => {
    const user = Auth.getCurrentUser();
    if (user) {
      document.getElementById('userName').textContent = user.name || user.email;
      document.getElementById('userRole').textContent = Dashboard.capitalizeRole(user.role);
      
      // Set avatar initials
      const avatar = document.getElementById('userAvatar');
      if (avatar && user.name) {
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        avatar.textContent = initials;
      }
    }
  },

  /**
   * Capitalize role name
   */
  capitalizeRole: (role) => {
    const roles = {
      owner: 'Owner',
      admin: 'Admin',
      kasir: 'Kasir'
    };
    return roles[role] || role;
  },

  /**
   * Load dashboard data
   */
  loadDashboardData: async () => {
    try {
      const today = Utils.getTodayString();
      const user = Auth.getCurrentUser();
      
      // Load today's transactions
      const transSnapshot = await database.ref(`transactions/${today}`).once('value');
      const transactions = transSnapshot.val() || {};
      
      // Calculate stats
      let stats = {
        penjualan: 0,
        topup: 0,
        tarik: 0,
        kasMasuk: 0,
        kasKeluar: 0,
        laba: 0,
        transaksiCount: 0
      };

      Object.values(transactions).forEach(trans => {
        if (trans.status !== 'cancelled') {
          switch (trans.type) {
            case 'penjualan':
              stats.penjualan += trans.total || 0;
              stats.laba += trans.profit || 0;
              break;
            case 'topup':
              stats.topup += trans.total || 0;
              break;
            case 'tarik':
              stats.tarik += trans.total || 0;
              break;
            case 'kas_masuk':
              stats.kasMasuk += trans.amount || 0;
              break;
            case 'kas_keluar':
              stats.kasKeluar += trans.amount || 0;
              break;
          }
          stats.transaksiCount++;
        }
      });

      // Load modal awal
      const modalSnapshot = await database.ref(`modal/${today}/${user.uid}`).once('value');
      const modalData = modalSnapshot.val();
      stats.modalAwal = modalData ? modalData.amount : 0;

      // Calculate kas ditangan
      const kasDitangan = stats.modalAwal + stats.penjualan + stats.topup + stats.kasMasuk 
                        - stats.tarik - stats.kasKeluar;

      // Update state
      Dashboard.state.todayStats = { ...stats, kasDitangan };

      // Update UI
      Dashboard.updateStatsUI();
      
      // Load recent transactions
      Dashboard.loadRecentTransactions(transactions);
      
      // Load low stock
      Dashboard.loadLowStock();
      
      // Load top products
      Dashboard.loadTopProducts();

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      Utils.showToast('Gagal memuat data dashboard', 'error');
    }
  },

  /**
   * Update stats in UI
   */
  updateStatsUI: () => {
    const stats = Dashboard.state.todayStats;
    
    // Update header stats
    document.getElementById('kasDitangan').textContent = Utils.formatRupiah(stats.kasDitangan);
    document.getElementById('totalPenjualan').textContent = Utils.formatRupiah(stats.penjualan);
    document.getElementById('totalTopup').textContent = Utils.formatRupiah(stats.topup);
    document.getElementById('totalTarik').textContent = Utils.formatRupiah(stats.tarik);
    document.getElementById('kasMasuk').textContent = Utils.formatRupiah(stats.kasMasuk);
    document.getElementById('kasKeluar').textContent = Utils.formatRupiah(stats.kasKeluar);
    document.getElementById('totalLaba').textContent = Utils.formatRupiah(stats.laba);
    
    // Update card stats
    document.getElementById('modalAwal').textContent = Utils.formatRupiah(stats.modalAwal);
    document.getElementById('totalTransaksi').textContent = Utils.formatNumber(stats.transaksiCount);
    document.getElementById('cardLaba').textContent = Utils.formatRupiah(stats.laba);
  },

  /**
   * Load recent transactions
   */
  loadRecentTransactions: (transactions) => {
    const tbody = document.getElementById('recentTransactionsBody');
    const transArray = Object.entries(transactions)
      .map(([id, data]) => ({ id, ...data }))
      .sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0))
      .slice(0, 5);

    if (transArray.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="5" class="text-center" style="padding: 2rem;">
            <div class="empty-state">
              <div class="empty-state-icon">
                <i class="fas fa-receipt"></i>
              </div>
              <p class="empty-state-text">Belum ada transaksi hari ini</p>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = transArray.map((trans, index) => {
      const typeLabels = {
        penjualan: { text: 'Penjualan', class: 'badge-primary' },
        topup: { text: 'Top Up', class: 'badge-info' },
        tarik: { text: 'Tarik Tunai', class: 'badge-warning' },
        kas_masuk: { text: 'Kas Masuk', class: 'badge-success' },
        kas_keluar: { text: 'Kas Keluar', class: 'badge-danger' }
      };
      
      const typeInfo = typeLabels[trans.type] || { text: trans.type, class: 'badge-secondary' };
      
      const statusLabels = {
        completed: { text: 'Selesai', class: 'badge-success' },
        pending: { text: 'Pending', class: 'badge-warning' },
        cancelled: { text: 'Dibatalkan', class: 'badge-danger' }
      };
      
      const statusInfo = statusLabels[trans.status] || { text: trans.status, class: 'badge-secondary' };
      
      return `
        <tr>
          <td>${index + 1}</td>
          <td>${Utils.formatDateTime(trans.timestamp)}</td>
          <td><span class="badge ${typeInfo.class}">${typeInfo.text}</span></td>
          <td>${Utils.formatRupiah(trans.total || trans.amount || 0)}</td>
          <td><span class="badge ${statusInfo.class}">${statusInfo.text}</span></td>
        </tr>
      `;
    }).join('');
  },

  /**
   * Load low stock products
   */
  loadLowStock: async () => {
    try {
      const snapshot = await database.ref('products').once('value');
      const products = snapshot.val() || {};
      
      const lowStock = Object.entries(products)
        .map(([id, data]) => ({ id, ...data }))
        .filter(p => p.stock <= (p.minStock || 5))
        .slice(0, 5);

      const container = document.getElementById('lowStockList');
      
      if (lowStock.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon" style="width: 60px; height: 60px; font-size: 1.5rem;">
              <i class="fas fa-check-circle" style="color: var(--success);"></i>
            </div>
            <p class="empty-state-text">Semua stok aman</p>
          </div>
        `;
        return;
      }

      container.innerHTML = lowStock.map(product => `
        <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: var(--bg-secondary); border-radius: var(--radius-lg); margin-bottom: 0.5rem;">
          <div style="width: 40px; height: 40px; background: var(--warning); border-radius: var(--radius-md); display: flex; align-items: center; justify-content: center; color: white;">
            <i class="fas fa-exclamation"></i>
          </div>
          <div style="flex: 1; min-width: 0;">
            <p style="font-weight: 600; font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${product.name}</p>
            <p style="font-size: 0.75rem; color: var(--text-muted);">Stok: ${product.stock} ${product.unit || 'pcs'}</p>
          </div>
          <a href="pages/produk.html?id=${product.id}" class="btn btn-sm btn-primary">
            <i class="fas fa-plus"></i>
          </a>
        </div>
      `).join('');

    } catch (error) {
      console.error('Error loading low stock:', error);
    }
  },

  /**
   * Load top products
   */
  loadTopProducts: async () => {
    try {
      const today = Utils.getTodayString();
      const snapshot = await database.ref(`transactions/${today}`).once('value');
      const transactions = snapshot.val() || {};
      
      // Aggregate product sales
      const productSales = {};
      
      Object.values(transactions).forEach(trans => {
        if (trans.type === 'penjualan' && trans.items) {
          trans.items.forEach(item => {
            if (!productSales[item.productId]) {
              productSales[item.productId] = {
                name: item.name,
                quantity: 0,
                total: 0
              };
            }
            productSales[item.productId].quantity += item.quantity;
            productSales[item.productId].total += item.total;
          });
        }
      });

      const topProducts = Object.entries(productSales)
        .sort((a, b) => b[1].quantity - a[1].quantity)
        .slice(0, 5);

      const container = document.getElementById('topProductsList');
      
      if (topProducts.length === 0) {
        container.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon" style="width: 60px; height: 60px; font-size: 1.5rem;">
              <i class="fas fa-trophy"></i>
            </div>
            <p class="empty-state-text">Belum ada data penjualan</p>
          </div>
        `;
        return;
      }

      container.innerHTML = topProducts.map(([id, data], index) => `
        <div style="display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: var(--bg-secondary); border-radius: var(--radius-lg); margin-bottom: 0.5rem;">
          <div style="width: 32px; height: 32px; background: ${index < 3 ? 'linear-gradient(135deg, #fbbf24, #f59e0b)' : 'var(--bg-primary)'}; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: ${index < 3 ? 'white' : 'var(--text-muted)'}; font-weight: 700; font-size: 0.875rem;">
            ${index + 1}
          </div>
          <div style="flex: 1; min-width: 0;">
            <p style="font-weight: 600; font-size: 0.875rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${data.name}</p>
            <p style="font-size: 0.75rem; color: var(--text-muted);">${data.quantity} terjual • ${Utils.formatRupiah(data.total)}</p>
          </div>
        </div>
      `).join('');

    } catch (error) {
      console.error('Error loading top products:', error);
    }
  },

  /**
   * Check shift status
   */
  checkShiftStatus: async () => {
    try {
      const today = Utils.getTodayString();
      const user = Auth.getCurrentUser();
      
      const shiftSnapshot = await database.ref(`shifts/${today}/${user.uid}`).once('value');
      const shift = shiftSnapshot.val();
      
      Dashboard.state.isShiftOpen = shift && shift.status === 'open';
      Dashboard.updateShiftUI();
      
    } catch (error) {
      console.error('Error checking shift:', error);
    }
  },

  /**
   * Update shift UI
   */
  updateShiftUI: () => {
    const shiftStatus = document.getElementById('shiftStatus');
    const shiftText = document.getElementById('shiftText');
    const closeShiftBtn = document.getElementById('btnCloseShift');
    const shiftInfo = document.getElementById('shiftInfo');
    
    if (Dashboard.state.isShiftOpen) {
      shiftStatus.classList.remove('closed');
      shiftStatus.classList.add('open');
      shiftText.textContent = 'Buka';
      if (closeShiftBtn) {
        closeShiftBtn.innerHTML = `
          <i class="fas fa-store-slash" style="font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
          <span>Tutup Shift</span>
        `;
      }
      if (shiftInfo) shiftInfo.textContent = 'Shift 1';
    } else {
      shiftStatus.classList.remove('open');
      shiftStatus.classList.add('closed');
      shiftText.textContent = 'Tutup';
      if (closeShiftBtn) {
        closeShiftBtn.innerHTML = `
          <i class="fas fa-store" style="font-size: 1.5rem; margin-bottom: 0.5rem;"></i>
          <span>Buka Shift</span>
        `;
      }
      if (shiftInfo) shiftInfo.textContent = '-';
    }
  },

  /**
   * Toggle shift open/close
   */
  toggleShift: async () => {
    try {
      const today = Utils.getTodayString();
      const user = Auth.getCurrentUser();
      
      if (Dashboard.state.isShiftOpen) {
        // Close shift
        Utils.confirm('Apakah Anda yakin ingin menutup shift? Pastikan semua transaksi sudah tercatat.', async () => {
          await database.ref(`shifts/${today}/${user.uid}`).update({
            status: 'closed',
            closedAt: firebase.database.ServerValue.TIMESTAMP,
            closedBy: user.uid
          });
          
          Dashboard.state.isShiftOpen = false;
          Dashboard.updateShiftUI();
          Utils.showToast('Shift berhasil ditutup', 'success');
        });
      } else {
        // Open shift - check if modal is set
        const modalSnapshot = await database.ref(`modal/${today}/${user.uid}`).once('value');
        const modal = modalSnapshot.val();
        
        if (!modal || !modal.amount) {
          Utils.showToast('Silakan set modal awal terlebih dahulu', 'warning');
          window.location.href = 'pages/modal.html';
          return;
        }
        
        await database.ref(`shifts/${today}/${user.uid}`).set({
          status: 'open',
          openedAt: firebase.database.ServerValue.TIMESTAMP,
          openedBy: user.uid,
          modalAwal: modal.amount
        });
        
        Dashboard.state.isShiftOpen = true;
        Dashboard.updateShiftUI();
        Utils.showToast('Shift berhasil dibuka', 'success');
      }
    } catch (error) {
      console.error('Error toggling shift:', error);
      Utils.showToast('Gagal mengubah status shift', 'error');
    }
  },

  /**
   * Sync data to cloud
   */
  syncCloud: async () => {
    try {
      Utils.showLoading('Syncing to cloud...');
      
      // Simulate sync (in production, this would sync local data to Firebase)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Utils.hideLoading();
      Utils.showToast('Data berhasil disinkronkan', 'success');
      
      // Update cloud button
      const cloudBtn = document.getElementById('btnCloud');
      cloudBtn.classList.add('active');
      setTimeout(() => cloudBtn.classList.remove('active'), 2000);
      
    } catch (error) {
      Utils.hideLoading();
      Utils.showToast('Gagal sinkronisasi', 'error');
    }
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Dashboard;
}
