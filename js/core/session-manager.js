/**
 * WebPOS Session Manager
 * Advanced session handling with multi-tab support
 */

const SessionManager = {
  // Session configuration
  config: {
    sessionTimeout: 30 * 60 * 1000, // 30 minutes
    warningTime: 5 * 60 * 1000, // 5 minutes before timeout
    heartbeatInterval: 60 * 1000, // 1 minute
    syncAcrossTabs: true
  },
  
  // Session state
  state: {
    lastActivity: Date.now(),
    isActive: true,
    warningShown: false,
    heartbeatTimer: null,
    timeoutTimer: null,
    warningTimer: null
  },
  
  // Broadcast channel for cross-tab communication
  channel: null,
  
  // Initialize session manager
  init: (options = {}) => {
    Object.assign(SessionManager.config, options);
    
    // Setup broadcast channel
    if (SessionManager.config.syncAcrossTabs && 'BroadcastChannel' in window) {
      SessionManager.channel = new BroadcastChannel('webpos_session');
      SessionManager.channel.onmessage = SessionManager.handleChannelMessage;
    }
    
    // Setup activity listeners
    SessionManager.setupActivityListeners();
    
    // Start heartbeat
    SessionManager.startHeartbeat();
    
    // Setup visibility change handler
    document.addEventListener('visibilitychange', SessionManager.handleVisibilityChange);
    
    // Check for existing session
    SessionManager.checkSession();
  },
  
  // Setup activity listeners
  setupActivityListeners: () => {
    const events = ['mousedown', 'keydown', 'touchstart', 'scroll'];
    
    events.forEach(event => {
      document.addEventListener(event, SessionManager.recordActivity, true);
    });
  },
  
  // Record user activity
  recordActivity: () => {
    SessionManager.state.lastActivity = Date.now();
    SessionManager.state.isActive = true;
    
    // Broadcast to other tabs
    SessionManager.broadcast({
      type: 'activity',
      timestamp: Date.now()
    });
    
    // Reset timers
    SessionManager.resetTimers();
  },
  
  // Handle visibility change
  handleVisibilityChange: () => {
    if (document.visibilityState === 'visible') {
      SessionManager.checkSession();
    }
  },
  
  // Start heartbeat
  startHeartbeat: () => {
    SessionManager.state.heartbeatTimer = setInterval(() => {
      SessionManager.broadcast({
        type: 'heartbeat',
        timestamp: Date.now()
      });
    }, SessionManager.config.heartbeatInterval);
  },
  
  // Reset timers
  resetTimers: () => {
    // Clear existing timers
    clearTimeout(SessionManager.state.timeoutTimer);
    clearTimeout(SessionManager.state.warningTimer);
    
    SessionManager.state.warningShown = false;
    
    // Set warning timer
    const warningDelay = SessionManager.config.sessionTimeout - SessionManager.config.warningTime;
    SessionManager.state.warningTimer = setTimeout(() => {
      SessionManager.showWarning();
    }, warningDelay);
    
    // Set timeout timer
    SessionManager.state.timeoutTimer = setTimeout(() => {
      SessionManager.expireSession();
    }, SessionManager.config.sessionTimeout);
  },
  
  // Show session expiration warning
  showWarning: () => {
    if (SessionManager.state.warningShown) return;
    
    SessionManager.state.warningShown = true;
    
    const modal = Utils.createModal(`
      <div class="text-center">
        <div class="text-5xl mb-4">⏰</div>
        <h3 class="text-xl font-bold mb-2">Sesi Akan Berakhir</h3>
        <p class="text-gray-600 mb-4">Anda telah tidak aktif selama beberapa waktu. Sesi akan berakhir dalam 5 menit.</p>
        <button onclick="SessionManager.extendSession()" class="btn btn-primary">
          Perpanjang Sesi
        </button>
      </div>
    `, { closable: false });
  },
  
  // Extend session
  extendSession: () => {
    SessionManager.recordActivity();
    Utils.showToast('Sesi diperpanjang', 'success');
  },
  
  // Expire session
  expireSession: () => {
    SessionManager.broadcast({ type: 'expire' });
    SessionManager.clearSession();
    
    // Show expired modal
    Utils.createModal(`
      <div class="text-center">
        <div class="text-5xl mb-4">🔒</div>
        <h3 class="text-xl font-bold mb-2">Sesi Berakhir</h3>
        <p class="text-gray-600 mb-4">Sesi Anda telah berakhir karena tidak aktif.</p>
        <a href="login.html" class="btn btn-primary">Login Kembali</a>
      </div>
    `, { closable: false });
    
    // Logout after delay
    setTimeout(() => {
      Auth.logout();
    }, 5000);
  },
  
  // Clear session
  clearSession: () => {
    clearTimeout(SessionManager.state.timeoutTimer);
    clearTimeout(SessionManager.state.warningTimer);
    clearInterval(SessionManager.state.heartbeatTimer);
    
    SessionManager.state.isActive = false;
  },
  
  // Check session validity
  checkSession: () => {
    const inactive = Date.now() - SessionManager.state.lastActivity;
    
    if (inactive > SessionManager.config.sessionTimeout) {
      SessionManager.expireSession();
    } else if (inactive > SessionManager.config.sessionTimeout - SessionManager.config.warningTime) {
      SessionManager.showWarning();
    }
  },
  
  // Broadcast message to other tabs
  broadcast: (message) => {
    if (SessionManager.channel) {
      SessionManager.channel.postMessage(message);
    }
    
    // Fallback to localStorage
    if (SessionManager.config.syncAcrossTabs) {
      localStorage.setItem('webpos_session_sync', JSON.stringify({
        ...message,
        timestamp: Date.now()
      }));
    }
  },
  
  // Handle broadcast channel message
  handleChannelMessage: (event) => {
    const message = event.data;
    
    switch (message.type) {
      case 'activity':
        SessionManager.state.lastActivity = message.timestamp;
        break;
      case 'heartbeat':
        // Update last known activity from other tab
        break;
      case 'expire':
        SessionManager.clearSession();
        break;
      case 'logout':
        SessionManager.clearSession();
        window.location.href = 'login.html';
        break;
    }
  },
  
  // Handle storage event (fallback for cross-tab)
  handleStorageEvent: (event) => {
    if (event.key === 'webpos_session_sync') {
      const message = JSON.parse(event.newValue);
      SessionManager.handleChannelMessage({ data: message });
    }
  },
  
  // Get session info
  getSessionInfo: () => ({
    lastActivity: SessionManager.state.lastActivity,
    isActive: SessionManager.state.isActive,
    timeUntilExpiry: Math.max(0, SessionManager.config.sessionTimeout - (Date.now() - SessionManager.state.lastActivity))
  }),
  
  // Force logout all tabs
  logoutAllTabs: () => {
    SessionManager.broadcast({ type: 'logout' });
    Auth.logout();
  },
  
  // Cleanup
  destroy: () => {
    SessionManager.clearSession();
    
    if (SessionManager.channel) {
      SessionManager.channel.close();
    }
    
    document.removeEventListener('visibilitychange', SessionManager.handleVisibilityChange);
  }
};

// Listen for storage events (cross-tab fallback)
window.addEventListener('storage', SessionManager.handleStorageEvent);

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  SessionManager.init();
});
