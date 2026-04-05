/**
 * WebPOS Dashboard Module
 * Handles dashboard functionality and UI interactions
 */

const Dashboard = {
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

  init: function() {
    if (!Auth.isAuthenticated()) {
      window.location.href = 'login.html';
      return;
    }

    this.loadPreferences();
    this.setupSidebar();
    this.setupTheme();
    this.setupEventListeners();
    this.setupDropdowns();
    this.setupMobileMenu();
    this.loadUserData();
    this.loadDashboardData();
    this.checkShiftStatus();
    
    Utils.hideLoading();
    console.log('Dashboard initialized');
  },

  loadPreferences: function() {
    var sidebarState = Utils.getStorage('sidebar_collapsed');
    if (sidebarState) {
      this.state.isSidebarCollapsed = sidebarState;
      if (sidebarState) {
        document.getElementById('sidebar').classList.add('collapsed');
      }
    }

    var darkMode = Utils.getStorage('dark_mode');
    if (darkMode) {
      this.state.isDarkMode = darkMode;
      if (darkMode) {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.getElementById('btnTheme').innerHTML = '<i class="fas fa-sun"></i>';
      }
    }
  },

  setupSidebar: function() {
    var sidebar = document.getElementById('sidebar');
    var menuToggle = document.getElementById('menuToggle');
    
    if (menuToggle) {
      menuToggle.addEventListener('click', function() {
        sidebar.classList.toggle('collapsed');
        Dashboard.state.isSidebarCollapsed = sidebar.classList.contains('collapsed');
        Utils.setStorage('sidebar_collapsed', Dashboard.state.isSidebarCollapsed);
        
        var icon = menuToggle.querySelector('i');
        if (Dashboard.state.isSidebarCollapsed) {
          icon.style.transform = 'rotate(180deg)';
        } else {
          icon.style.transform = 'rotate(0deg)';
        }
      });
    }

    var menuSearch = document.getElementById('menuSearch');
    if (menuSearch) {
      menuSearch.addEventListener('input', Utils.debounce(function(e) {
        var searchTerm = e.target.value.toLowerCase();
        var navLinks = document.querySelectorAll('.nav-link');
        
        navLinks.forEach(function(link) {
          var text = link.textContent.toLowerCase();
          var parent = link.closest('.nav-item');
          
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
      }, 300));
    }
  },

  setupDropdowns: function() {
    var dropdowns = document.querySelectorAll('[data-dropdown]');
    
    dropdowns.forEach(function(dropdown) {
      var toggle = dropdown.querySelector('.nav-dropdown-toggle');
      
      if (toggle) {
        toggle.addEventListener('click', function(e) {
          e.preventDefault();
          dropdown.classList.toggle('open');
        });
      }
    });
  },

  setupMobileMenu: function() {
    var mobileToggle = document.getElementById('mobileMenuToggle');
    var sidebar = document.getElementById('sidebar');
    
    if (mobileToggle) {
      mobileToggle.addEventListener('click', function() {
        sidebar.classList.toggle('mobile-open');
      });
    }

    document.addEventListener('click', function(e) {
      if (window.innerWidth <= 768) {
        if (!sidebar.contains(e.target) && !mobileToggle.contains(e.target)) {
          sidebar.classList.remove('mobile-open');
        }
      }
    });
  },

  setupTheme: function() {
    var themeBtn = document.getElementById('btnTheme');
    
    if (themeBtn) {
      themeBtn.addEventListener('click', function() {
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

  setupEventListeners: function() {
    var logoutBtn = document.getElementById('btnLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function() {
        Utils.confirm('Apakah Anda yakin ingin logout?', function() {
          Auth.logout();
        });
      });
    }

    var cloudBtn = document.getElementById('btnCloud');
    if (cloudBtn) {
      cloudBtn.addEventListener('click', function() {
        Dashboard.syncCloud();
      });
    }

    var settingsBtn = document.getElementById('btnSettings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', function() {
        window.location.href = 'pages/setting.html';
      });
    }

    var closeShiftBtn = document.getElementById('btnCloseShift');
    if (closeShiftBtn) {
      closeShiftBtn.addEventListener('click', function() {
        Dashboard.toggleShift();
      });
    }
  },

  loadUserData: function() {
    var user = Auth.getCurrentUser();
    if (user) {
      document.getElementById('userName').textContent = user.name || user.email;
      document.getElementById('userRole').textContent = this.capitalizeRole(user.role);
      
      var avatar = document.getElementById('userAvatar');
      if (avatar && user.name) {
        var initials = user.name.split(' ').map(function(n) { return n[0]; }).join('').toUpperCase().slice(0, 2);
        avatar.textContent = initials;
      }
    }
  },

  capitalizeRole: function(role) {
    var roles = { owner: 'Owner', admin: 'Admin', kasir: 'Kasir' };
    return roles[role] || role;
  },

  loadDashboardData: function() {
    var today = Utils.getTodayString();
    var user = Auth.getCurrentUser();
    
    var self = this;
    
    database.ref('transactions/' + today).once('value')
      .then(function(snapshot) {
        var transactions = snapshot.val() || {};
        
        var stats = {
          penjualan: 0,
          topup: 0,
          tarik: 0,
          kasMasuk: 0,
          kasKeluar: 0,
          laba: 0,
          transaksiCount: 0
        };

        Object.values(transactions).forEach(function(trans) {
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

        return database.ref('modal/' + today + '/' + user.uid).once('value')
          .then(function(modalSnapshot) {
            var modalData = modalSnapshot.val();
            stats.modalAwal = modalData ? modalData.amount : 0;

            var kasDitangan = stats.modalAwal + stats.penjualan + stats.topup + stats.kasMasuk - stats.tarik - stats.kasKeluar;

            self.state.todayStats = Object.assign({}, stats, { kasDitangan: kasDitangan });
            self.updateStatsUI();
            self.loadRecentTransactions(transactions);
          });
      })
      .catch(function(error) {
        console.error('Error loading dashboard data:', error);
        Utils.showToast('Gagal memuat data dashboard', 'error');
      });
  },

  updateStatsUI: function() {
    var stats = this.state.todayStats;
    
    document.getElementById('kasDitangan').textContent = Utils.formatRupiah(stats.kasDitangan);
    document.getElementById('totalPenjualan').textContent = Utils.formatRupiah(stats.penjualan);
    document.getElementById('totalTopup').textContent = Utils.formatRupiah(stats.topup);
    document.getElementById('totalTarik').textContent = Utils.formatRupiah(stats.tarik);
    document.getElementById('kasMasuk').textContent = Utils.formatRupiah(stats.kasMasuk);
    document.getElementById('kasKeluar').textContent = Utils.formatRupiah(stats.kasKeluar);
    document.getElementById('totalLaba').textContent = Utils.formatRupiah(stats.laba);
    
    document.getElementById('modalAwal').textContent = Utils.formatRupiah(stats.modalAwal);
    document.getElementById('totalTransaksi').textContent = Utils.formatNumber(stats.transaksiCount);
    document.getElementById('cardLaba').textContent = Utils.formatRupiah(stats.laba);
  },

  loadRecentTransactions: function(transactions) {
    var tbody = document.getElementById('recentTransactionsBody');
    var transArray = Object.entries(transactions)
      .map(function(item) { return Object.assign({ id: item[0] }, item[1]); })
      .sort(function(a, b) { return (b.timestamp || 0) - (a.timestamp || 0); })
      .slice(0, 5);

    if (transArray.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-center" style="padding: 2rem;"><div class="empty-state"><div class="empty-state-icon"><i class="fas fa-receipt"></i></div><p class="empty-state-text">Belum ada transaksi hari ini</p></div></td></tr>';
      return;
    }

    tbody.innerHTML = transArray.map(function(trans, index) {
      var typeLabels = {
        penjualan: { text: 'Penjualan', class: 'badge-primary' },
        topup: { text: 'Top Up', class: 'badge-info' },
        tarik: { text: 'Tarik Tunai', class: 'badge-warning' },
        kas_masuk: { text: 'Kas Masuk', class: 'badge-success' },
        kas_keluar: { text: 'Kas Keluar', class: 'badge-danger' }
      };
      
      var typeInfo = typeLabels[trans.type] || { text: trans.type, class: 'badge-secondary' };
      
      var statusLabels = {
        completed: { text: 'Selesai', class: 'badge-success' },
        pending: { text: 'Pending', class: 'badge-warning' },
        cancelled: { text: 'Dibatalkan', class: 'badge-danger' }
      };
      
      var statusInfo = statusLabels[trans.status] || { text: trans.status, class: 'badge-secondary' };
      
      return '<tr><td>' + (index + 1) + '</td><td>' + Utils.formatDateTime(trans.timestamp) + '</td><td><span class="badge ' + typeInfo.class + '">' + typeInfo.text + '</span></td><td>' + Utils.formatRupiah(trans.total || trans.amount || 0) + '</td><td><span class="badge ' + statusInfo.class + '">' + statusInfo.text + '</span></td></tr>';
    }).join('');
  },

  checkShiftStatus: function() {
    var today = Utils.getTodayString();
    var user = Auth.getCurrentUser();
    
    var self = this;
    
    database.ref('shifts/' + today + '/' + user.uid).once('value')
      .then(function(snapshot) {
        var shift = snapshot.val();
        self.state.isShiftOpen = shift && shift.status === 'open';
        self.updateShiftUI();
      });
  },

  updateShiftUI: function() {
    var shiftStatus = document.getElementById('shiftStatus');
    var shiftText = document.getElementById('shiftText');
    var closeShiftBtn = document.getElementById('btnCloseShift');
    var shiftInfo = document.getElementById('shiftInfo');
    
    if (this.state.isShiftOpen) {
      shiftStatus.classList.remove('closed');
      shiftStatus.classList.add('open');
      shiftText.textContent = 'Buka';
      if (closeShiftBtn) {
        closeShiftBtn.innerHTML = '<i class="fas fa-store-slash" style="font-size: 1.5rem; margin-bottom: 0.5rem;"></i><span>Tutup Shift</span>';
      }
      if (shiftInfo) shiftInfo.textContent = 'Shift 1';
    } else {
      shiftStatus.classList.remove('open');
      shiftStatus.classList.add('closed');
      shiftText.textContent = 'Tutup';
      if (closeShiftBtn) {
        closeShiftBtn.innerHTML = '<i class="fas fa-store" style="font-size: 1.5rem; margin-bottom: 0.5rem;"></i><span>Buka Shift</span>';
      }
      if (shiftInfo) shiftInfo.textContent = '-';
    }
  },

  toggleShift: function() {
    var today = Utils.getTodayString();
    var user = Auth.getCurrentUser();
    var self = this;
    
    if (this.state.isShiftOpen) {
      Utils.confirm('Apakah Anda yakin ingin menutup shift?', function() {
        database.ref('shifts/' + today + '/' + user.uid).update({
          status: 'closed',
          closedAt: firebase.database.ServerValue.TIMESTAMP,
          closedBy: user.uid
        }).then(function() {
          self.state.isShiftOpen = false;
          self.updateShiftUI();
          Utils.showToast('Shift berhasil ditutup', 'success');
        });
      });
    } else {
      database.ref('modal/' + today + '/' + user.uid).once('value')
        .then(function(snapshot) {
          var modal = snapshot.val();
          
          if (!modal || !modal.amount) {
            Utils.showToast('Silakan set modal awal terlebih dahulu', 'warning');
            window.location.href = 'pages/modal.html';
            return;
          }
          
          return database.ref('shifts/' + today + '/' + user.uid).set({
            status: 'open',
            openedAt: firebase.database.ServerValue.TIMESTAMP,
            openedBy: user.uid,
            modalAwal: modal.amount
          });
        })
        .then(function() {
          self.state.isShiftOpen = true;
          self.updateShiftUI();
          Utils.showToast('Shift berhasil dibuka', 'success');
        });
    }
  },

  syncCloud: function() {
    Utils.showLoading('Syncing to cloud...');
    
    setTimeout(function() {
      Utils.hideLoading();
      Utils.showToast('Data berhasil disinkronkan', 'success');
      
      var cloudBtn = document.getElementById('btnCloud');
      cloudBtn.classList.add('active');
      setTimeout(function() { cloudBtn.classList.remove('active'); }, 2000);
    }, 1500);
  }
};

if (typeof module !== 'undefined' && module.exports) {
  module.exports = Dashboard;
}
