/**
 * WebPOS Header Component
 * Dynamic header with kasir status, cash summary, and controls
 */

const Header = {
  // State
  state: {
    kasirOpen: false,
    summaryData: {
      kasDiTangan: 0,
      modalAwal: 0,
      totalPenjualan: 0,
      topUp: 0,
      tarikTunai: 0,
      kasMasuk: 0,
      kasKeluar: 0,
      totalTransaksi: 0,
      shift: 1,
      laba: 0
    },
    lastUpdate: null,
    isSyncing: false
  },

  // Configuration
  config: {
    updateInterval: 30000, // 30 seconds
    refreshInterval: null
  },

  /**
   * Initialize header
   */
  init: async () => {
    Header.render();
    await Header.loadData();
    Header.setupEventListeners();
    Header.startAutoUpdate();
    Header.setupRealtimeListeners();
  },

  /**
   * Render header HTML
   */
  render: () => {
    const header = document.getElementById('mainHeader');
    if (!header) return;

    header.innerHTML = `
      <div class="header-left">
        <button class="menu-toggle" onclick="Sidebar.toggle()" title="Toggle Menu (Ctrl+B)">
          <i class="fas fa-bars"></i>
        </button>
        
        <div class="page-title">
          <h1 id="pageTitle">Dashboard</h1>
          <p id="currentDate">Memuat...</p>
        </div>
      </div>

      <div class="header-center">
        <div class="kasir-status ${Header.state.kasirOpen ? 'open' : 'closed'}" id="kasirStatus">
          <span class="status-dot"></span>
          <span class="status-text">${Header.state.kasirOpen ? 'KASIR BUKA' : 'KASIR TUTUP'}</span>
          <button class="toggle-kasir" onclick="Header.toggleKasir()" id="toggleKasirBtn">
            <i class="fas ${Header.state.kasirOpen ? 'fa-lock' : 'fa-lock-open'}"></i>
          </button>
        </div>

        <div class="header-summary" id="headerSummary">
          <div class="summary-item kas-ditangan" title="Kas di Tangan">
            <i class="fas fa-wallet"></i>
            <span id="kasDiTangan">Rp 0</span>
          </div>
          
          <div class="summary-item modal-kecil" title="Modal Awal">
            <i class="fas fa-coins"></i>
            <span id="modalAwal">Rp 0</span>
          </div>
          
          <div class="summary-item transaksi-count" title="Total Transaksi">
            <i class="fas fa-receipt"></i>
            <span id="totalTransaksi">0</span>
          </div>
          
          <div class="summary-item shift-info" title="Shift">
            <i class="fas fa-clock"></i>
            <span id="shiftInfo">Shift 1</span>
          </div>
          
          <div class="summary-item laba-kecil ${Header.state.summaryData.laba >= 0 ? 'positive' : 'negative'}" title="Laba">
            <i class="fas fa-chart-line"></i>
            <span id="labaKecil">Rp 0</span>
          </div>
        </div>
      </div>

      <div class="header-right">
        <div class="header-actions">
          <button class="btn-icon cloud-sync ${Header.state.isSyncing ? 'syncing' : ''}" 
                  onclick="Header.syncData()" title="Sync Data">
            <i class="fas fa-cloud"></i>
            <span class="sync-status" id="syncStatus"></span>
          </button>
          
          <button class="btn-darkmode" onclick="Header.toggleDarkMode()" title="Toggle Dark Mode">
            <i class="fas fa-moon"></i>
            <i class="fas fa-sun"></i>
          </button>
          
          <button class="btn-icon" onclick="Header.openSettings()" title="Quick Settings">
            <i class="fas fa-cog"></i>
          </button>
          
          <button class="btn-icon btn-refresh" onclick="Header.refreshData()" title="Refresh Data">
            <i class="fas fa-sync-alt"></i>
          </button>
        </div>
      </div>

      <!-- Expanded Summary Panel (Dropdown) -->
      <div class="summary-panel" id="summaryPanel" style="display: none;">
        <div class="panel-header">
          <h4>Ringkasan Kas Hari Ini</h4>
          <button onclick="Header.toggleSummaryPanel()">
            <i class="fas fa-chevron-up"></i>
          </button>
        </div>
        <div class="panel-content">
          <div class="detail-grid">
            <div class="detail-item">
              <span class="label">Modal Awal</span>
              <span class="value" id="detailModal">Rp 0</span>
            </div>
            <div class="detail-item">
              <span class="label">Total Penjualan</span>
              <span class="value positive" id="detailPenjualan">Rp 0</span>
            </div>
            <div class="detail-item">
              <span class="label">Top Up</span>
              <span class="value positive" id="detailTopUp">Rp 0</span>
            </div>
            <div class="detail-item">
              <span class="label">Tarik Tunai</span>
              <span class="value negative" id="detailTarik">Rp 0</span>
            </div>
            <div class="detail-item">
              <span class="label">Kas Masuk (Non-Transaksi)</span>
              <span class="value positive" id="detailKasMasuk">Rp 0</span>
            </div>
            <div class="detail-item">
              <span class="label">Kas Keluar (Non-Transaksi)</span>
              <span class="value negative" id="detailKasKeluar">Rp 0</span>
            </div>
          </div>
          
          <div class="kas-formula">
            <div class="formula-row">
              <span>Modal Awal</span>
              <span id="formulaModal">Rp 0</span>
            </div>
            <div class="formula-row operator">+</div>
            <div class="formula-row">
              <span>Penjualan + Top Up + Kas Masuk</span>
              <span id="formulaMasuk">Rp 0</span>
            </div>
            <div class="formula-row operator">-</div>
            <div class="formula-row">
              <span>Tarik Tunai + Kas Keluar</span>
              <span id="formulaKeluar">Rp 0</span>
            </div>
            <div class="formula-row total">
              <span><strong>Kas di Tangan</strong></span>
              <span id="formulaTotal"><strong>Rp 0</strong></span>
            </div>
          </div>
        </div>
      </div>
    `;

    Header.updateDate();
  },

  /**
   * Setup event listeners
   */
  setupEventListeners: () => {
    // Click outside to close summary panel
    document.addEventListener('click', (e) => {
      const panel = document.getElementById('summaryPanel');
      const summary = document.getElementById('headerSummary');
      
      if (panel && !panel.contains(e.target) && !summary?.contains(e.target)) {
        panel.style.display = 'none';
      }
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // F5 or Ctrl+R for refresh
      if (e.key === 'F5' || (e.ctrlKey && e.key === 'r')) {
        e.preventDefault();
        Header.refreshData();
      }
      
      // Ctrl+Shift+S for sync
      if (e.ctrlKey && e.shiftKey && e.key === 'S') {
        e.preventDefault();
        Header.syncData();
      }
    });

    // Daily reset listener
    document.addEventListener('dailyReset', () => {
      Header.resetDailyData();
    });
  },

  /**
   * Load header data from Firebase
   */
  loadData: async () => {
    if (!Auth.currentUser) return;

    const today = new Date().toISOString().split('T')[0];
    const userId = Auth.currentUser.uid;

    try {
      // Load kasir status
      const statusSnap = await firebase.database()
        .ref(`kasir_status/${userId}`)
        .once('value');
      const status = statusSnap.val() || {};
      Header.state.kasirOpen = status.isOpen || false;

      // Load daily summary
      const summarySnap = await firebase.database()
        .ref(`daily_summary/${userId}/${today}`)
        .once('value');
      const summary = summarySnap.val() || {};

      // Load modal harian
      const modalSnap = await firebase.database()
        .ref(`modal_harian/${today}/${userId}`)
        .once('value');
      const modal = modalSnap.val() || {};

      // Calculate totals
      Header.state.summaryData = {
        modalAwal: modal.jumlah || 0,
        totalPenjualan: summary.penjualan || 0,
        topUp: summary.topup || 0,
        tarikTunai: summary.tarik_tunai || 0,
        kasMasuk: summary.kas_masuk || 0,
        kasKeluar: summary.kas_keluar || 0,
        totalTransaksi: summary.total_transaksi || 0,
        shift: status.shift || 1,
        laba: summary.laba || 0,
        kasDiTangan: 0 // Will calculate
      };

      // Calculate kas di tangan
      const masuk = Header.state.summaryData.totalPenjualan + 
                    Header.state.summaryData.topUp + 
                    Header.state.summaryData.kasMasuk;
      const keluar = Header.state.summaryData.tarikTunai + 
                     Header.state.summaryData.kasKeluar;
      
      Header.state.summaryData.kasDiTangan = 
        Header.state.summaryData.modalAwal + masuk - keluar;

      Header.updateUI();
      Header.state.lastUpdate = new Date();

    } catch (error) {
      console.error('Error loading header data:', error);
    }
  },

  /**
   * Update UI with current data
   */
  updateUI: () => {
    const data = Header.state.summaryData;

    // Update kasir status
    const statusEl = document.getElementById('kasirStatus');
    if (statusEl) {
      statusEl.className = `kasir-status ${Header.state.kasirOpen ? 'open' : 'closed'}`;
      statusEl.querySelector('.status-text').textContent = 
        Header.state.kasirOpen ? 'KASIR BUKA' : 'KASIR TUTUP';
    }

    // Update summary items
    Header.setText('kasDiTangan', Utils.formatRupiah(data.kasDiTangan));
    Header.setText('modalAwal', Utils.formatRupiah(data.modalAwal));
    Header.setText('totalTransaksi', data.totalTransaksi.toString());
    Header.setText('shiftInfo', `Shift ${data.shift}`);
    Header.setText('labaKecil', Utils.formatRupiah(data.laba));

    // Update detail panel
    Header.setText('detailModal', Utils.formatRupiah(data.modalAwal));
    Header.setText('detailPenjualan', Utils.formatRupiah(data.totalPenjualan));
    Header.setText('detailTopUp', Utils.formatRupiah(data.topUp));
    Header.setText('detailTarik', Utils.formatRupiah(data.tarikTunai));
    Header.setText('detailKasMasuk', Utils.formatRupiah(data.kasMasuk));
    Header.setText('detailKasKeluar', Utils.formatRupiah(data.kasKeluar));

    // Update formula
    const totalMasuk = data.totalPenjualan + data.topUp + data.kasMasuk;
    const totalKeluar = data.tarikTunai + data.kasKeluar;
    
    Header.setText('formulaModal', Utils.formatRupiah(data.modalAwal));
    Header.setText('formulaMasuk', Utils.formatRupiah(totalMasuk));
    Header.setText('formulaKeluar', Utils.formatRupiah(totalKeluar));
    Header.setText('formulaTotal', Utils.formatRupiah(data.kasDiTangan));
  },

  /**
   * Helper to safely set text content
   */
  setText: (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  },

  /**
   * Update current date display
   */
  updateDate: () => {
    const dateEl = document.getElementById('currentDate');
    if (dateEl) {
      const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      dateEl.textContent = new Date().toLocaleDateString('id-ID', options);
    }
  },

  /**
   * Toggle kasir open/closed
   */
  toggleKasir: async () => {
    if (!Auth.currentUser) return;

    const newStatus = !Header.state.kasirOpen;
    const userId = Auth.currentUser.uid;

    try {
      // Check if modal is set for kasir
      if (newStatus) {
        const today = new Date().toISOString().split('T')[0];
        const modalSnap = await firebase.database()
          .ref(`modal_harian/${today}/${userId}`)
          .once('value');
        
        if (!modalSnap.exists()) {
          // Show modal input dialog
          const modal = Utils.createModal(`
            <div style="padding: 20px;">
              <h3 style="margin-bottom: 16px;">Masukkan Modal Awal</h3>
              <input type="number" id="modalInput" class="form-input" 
                     placeholder="Jumlah modal" style="margin-bottom: 16px;">
              <div style="display: flex; gap: 8px; justify-content: flex-end;">
                <button onclick="this.closest('.modal-overlay').remove()" 
                        style="padding: 8px 16px; border: 1px solid #d1d5db; 
                               background: white; border-radius: 6px; cursor: pointer;">
                  Batal
                </button>
                <button id="saveModalBtn" 
                        style="padding: 8px 16px; background: #4f46e5; color: white; 
                               border: none; border-radius: 6px; cursor: pointer;">
                  Simpan & Buka Kasir
                </button>
              </div>
            </div>
          `, { closable: true });

          document.getElementById('saveModalBtn')?.addEventListener('click', async () => {
            const jumlah = parseInt(document.getElementById('modalInput').value) || 0;
            
            await firebase.database().ref(`modal_harian/${today}/${userId}`).set({
              jumlah,
              waktu: firebase.database.ServerValue.TIMESTAMP,
              dibuatOleh: userId
            });

            await Header.setKasirStatus(true);
            modal.close();
          });

          return;
        }
      }

      await Header.setKasirStatus(newStatus);

    } catch (error) {
      console.error('Error toggling kasir:', error);
      Utils.showToast('Gagal mengubah status kasir', 'error');
    }
  },

  /**
   * Set kasir status
   */
  setKasirStatus: async (isOpen) => {
    if (!Auth.currentUser) return;

    const userId = Auth.currentUser.uid;
    const updates = {
      isOpen,
      lastUpdated: firebase.database.ServerValue.TIMESTAMP
    };

    if (isOpen) {
      updates.openedAt = firebase.database.ServerValue.TIMESTAMP;
      updates.openedBy = userId;
    } else {
      updates.closedAt = firebase.database.ServerValue.TIMESTAMP;
      updates.closedBy = userId;
    }

    await firebase.database().ref(`kasir_status/${userId}`).update(updates);

    Header.state.kasirOpen = isOpen;
    Header.updateUI();

    Utils.showToast(`Kasir ${isOpen ? 'dibuka' : 'ditutup'}`, 'success');
    
    // Reload data
    await Header.loadData();
  },

  /**
   * Toggle summary panel
   */
  toggleSummaryPanel: () => {
    const panel = document.getElementById('summaryPanel');
    if (panel) {
      const isVisible = panel.style.display !== 'none';
      panel.style.display = isVisible ? 'none' : 'block';
      
      if (!isVisible) {
        Header.loadData(); // Refresh when opening
      }
    }
  },

  /**
   * Sync data with cloud
   */
  syncData: async () => {
    if (Header.state.isSyncing) return;

    Header.state.isSyncing = true;
    const syncBtn = document.querySelector('.cloud-sync');
    syncBtn?.classList.add('syncing');

    try {
      // Check connection
      const isOnline = await firebaseApp.checkConnection();
      
      if (!isOnline) {
        Utils.showToast('Tidak ada koneksi internet', 'warning');
        return;
      }

      // Force data refresh
      await Header.loadData();
      
      // Sync any pending transactions
      await Header.syncPendingTransactions();

      Utils.showToast('Data berhasil disinkronkan', 'success');
      
    } catch (error) {
      console.error('Sync error:', error);
      Utils.showToast('Gagal sinkronisasi data', 'error');
    } finally {
      Header.state.isSyncing = false;
      syncBtn?.classList.remove('syncing');
    }
  },

  /**
   * Sync pending offline transactions
   */
  syncPendingTransactions: async () => {
    const pending = Utils.storage.get('pendingTransactions', []);
    
    if (pending.length === 0) return;

    for (const transaction of pending) {
      try {
        await firebase.database().ref('transaksi').push(transaction);
      } catch (error) {
        console.error('Failed to sync transaction:', error);
      }
    }

    Utils.storage.set('pendingTransactions', []);
  },

  /**
   * Refresh all data
   */
  refreshData: async () => {
    const refreshBtn = document.querySelector('.btn-refresh i');
    refreshBtn?.classList.add('fa-spin');

    await Header.loadData();
    Header.updateDate();

    setTimeout(() => {
      refreshBtn?.classList.remove('fa-spin');
    }, 500);

    Utils.showToast('Data diperbarui', 'success');
  },

  /**
   * Toggle dark mode
   */
  toggleDarkMode: () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', next);
    Utils.storage.set('webpos-theme', next);
    
    // Update meta theme-color
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute('content', next === 'dark' ? '#0f172a' : '#6366f1');
    }
  },

  /**
   * Open quick settings
   */
  openSettings: () => {
    // Navigate to settings or open quick settings panel
    window.location.href = './pages/setting.html';
  },

  /**
   * Start auto-update timer
   */
  startAutoUpdate: () => {
    // Update every 30 seconds
    Header.config.refreshInterval = setInterval(() => {
      Header.loadData();
    }, Header.config.updateInterval);

    // Update date every minute
    setInterval(Header.updateDate, 60000);
  },

  /**
   * Setup realtime listeners
   */
  setupRealtimeListeners: () => {
    if (!Auth.currentUser) return;

    const userId = Auth.currentUser.uid;
    const today = new Date().toISOString().split('T')[0];

    // Listen to kasir status changes
    firebase.database()
      .ref(`kasir_status/${userId}`)
      .on('value', (snap) => {
        const status = snap.val() || {};
        if (status.isOpen !== Header.state.kasirOpen) {
          Header.state.kasirOpen = status.isOpen || false;
          Header.updateUI();
        }
      });

    // Listen to transaction updates
    firebase.database()
      .ref(`daily_summary/${userId}/${today}`)
      .on('value', () => {
        Header.loadData();
      });
  },

  /**
   * Reset daily data (called at midnight)
   */
  resetDailyData: () => {
    Header.state.summaryData = {
      kasDiTangan: 0,
      modalAwal: 0,
      totalPenjualan: 0,
      topUp: 0,
      tarikTunai: 0,
      kasMasuk: 0,
      kasKeluar: 0,
      totalTransaksi: 0,
      shift: 1,
      laba: 0
    };
    
    Header.state.kasirOpen = false;
    Header.updateUI();
    
    Utils.showToast('Data harian telah direset', 'info');
  },

  /**
   * Set page title
   */
  setPageTitle: (title) => {
    const titleEl = document.getElementById('pageTitle');
    if (titleEl) titleEl.textContent = title;
    document.title = `${title} - WebPOS`;
  },

  /**
   * Get current summary data
   */
  getSummaryData: () => {
    return { ...Header.state.summaryData };
  },

  /**
   * Update specific field (for real-time updates)
   */
  updateField: (field, value) => {
    if (Header.state.summaryData.hasOwnProperty(field)) {
      Header.state.summaryData[field] = value;
      Header.updateUI();
    }
  },

  /**
   * Destroy header (cleanup)
   */
  destroy: () => {
    if (Header.config.refreshInterval) {
      clearInterval(Header.config.refreshInterval);
    }
  }
};
