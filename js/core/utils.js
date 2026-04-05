/**
 * WebPOS Utilities Module
 * Helper functions and utilities
 */

const Utils = {
  // Format currency to Rupiah
  formatRupiah: (amount) => {
    if (amount === null || amount === undefined || isNaN(amount)) return 'Rp 0';
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  },

  // Format number with thousand separator
  formatNumber: (num) => {
    if (num === null || num === undefined || isNaN(num)) return '0';
    return new Intl.NumberFormat('id-ID').format(num);
  },

  // Format date to Indonesian format
  formatDate: (date, options = {}) => {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '-';
    
    const defaultOptions = {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      ...options
    };
    return d.toLocaleDateString('id-ID', defaultOptions);
  },

  // Format datetime
  formatDateTime: (date) => {
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  },

  // Get current timestamp
  getTimestamp: () => {
    return firebase.database.ServerValue.TIMESTAMP;
  },

  // Generate unique ID
  generateId: (prefix = '') => {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 9);
    return `${prefix}${timestamp}${random}`.toUpperCase();
  },

  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },

  // Throttle function
  throttle: (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Deep clone object
  deepClone: (obj) => {
    return JSON.parse(JSON.stringify(obj));
  },

  // Sanitize string for HTML
  sanitizeHtml: (str) => {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // Parse query parameters from URL
  getQueryParam: (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
  },

  // Set local storage with expiry
  setStorage: (key, value, expiryHours = null) => {
    const item = {
      value: value,
      timestamp: Date.now()
    };
    if (expiryHours) {
      item.expiry = expiryHours * 60 * 60 * 1000;
    }
    localStorage.setItem(key, JSON.stringify(item));
  },

  // Get local storage with expiry check
  getStorage: (key) => {
    const item = localStorage.getItem(key);
    if (!item) return null;
    
    try {
      const parsed = JSON.parse(item);
      if (parsed.expiry && Date.now() - parsed.timestamp > parsed.expiry) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.value;
    } catch {
      return item;
    }
  },

  // Remove from local storage
  removeStorage: (key) => {
    localStorage.removeItem(key);
  },

  // Clear all storage
  clearStorage: () => {
    localStorage.clear();
    sessionStorage.clear();
  },

  // Calculate percentage
  calculatePercentage: (value, total) => {
    if (!total) return 0;
    return Math.round((value / total) * 100);
  },

  // Calculate profit
  calculateProfit: (sellingPrice, costPrice, quantity = 1) => {
    return (sellingPrice - costPrice) * quantity;
  },

  // Calculate margin percentage
  calculateMargin: (sellingPrice, costPrice) => {
    if (!sellingPrice) return 0;
    return ((sellingPrice - costPrice) / sellingPrice) * 100;
  },

  // Group array by key
  groupBy: (array, key) => {
    return array.reduce((result, item) => {
      const group = item[key];
      if (!result[group]) result[group] = [];
      result[group].push(item);
      return result;
    }, {});
  },

  // Sort array by key
  sortBy: (array, key, order = 'asc') => {
    return [...array].sort((a, b) => {
      if (order === 'desc') {
        return a[key] > b[key] ? -1 : 1;
      }
      return a[key] > b[key] ? 1 : -1;
    });
  },

  // Filter array by search term
  filterArray: (array, searchTerm, keys) => {
    if (!searchTerm) return array;
    const term = searchTerm.toLowerCase();
    return array.filter(item => 
      keys.some(key => 
        String(item[key]).toLowerCase().includes(term)
      )
    );
  },

  // Paginate array
  paginate: (array, page, perPage) => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return {
      data: array.slice(start, end),
      total: array.length,
      page,
      perPage,
      totalPages: Math.ceil(array.length / perPage)
    };
  },

  // Validate email
  isValidEmail: (email) => {
    return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
  },

  // Validate phone number (Indonesia)
  isValidPhone: (phone) => {
    return /^[0-9]{10,13}$/.test(phone.replace(/[^0-9]/g, ''));
  },

  // Mask phone number
  maskPhone: (phone) => {
    const cleaned = phone.replace(/[^0-9]/g, '');
    if (cleaned.length < 4) return cleaned;
    return cleaned.slice(0, 2) + '****' + cleaned.slice(-4);
  },

  // Get device info
  getDeviceInfo: () => {
    const ua = navigator.userAgent;
    return {
      isMobile: /Mobile|Android|iPhone|iPad|iPod/.test(ua),
      isAndroid: /Android/.test(ua),
      isIOS: /iPhone|iPad|iPod/.test(ua),
      browser: ua.match(/(chrome|safari|firefox|edge|opera)/i)?.[0] || 'unknown'
    };
  },

  // Generate random color
  getRandomColor: () => {
    const colors = [
      '#6366f1', '#ec4899', '#10b981', '#f59e0b', 
      '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6'
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  },

  // Convert to slug
  slugify: (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  },

  // Capitalize first letter
  capitalize: (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Export to CSV
  exportToCsv: (data, filename) => {
    const csv = data.map(row => Object.values(row).join(',')).join('\\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },

  // Show loading overlay
  showLoading: (message = 'Loading...') => {
    let overlay = document.getElementById('global-loading');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'global-loading';
      overlay.className = 'loading-overlay';
      overlay.innerHTML = `
        <div class="spinner"></div>
        <p class="loading-text">${message}</p>
      `;
      document.body.appendChild(overlay);
    }
    overlay.style.display = 'flex';
  },

  // Hide loading overlay
  hideLoading: () => {
    const overlay = document.getElementById('global-loading');
    if (overlay) overlay.style.display = 'none';
  },

  // Show toast notification
  showToast: (message, type = 'info', duration = 3000) => {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const icons = {
      success: 'check-circle',
      error: 'times-circle',
      warning: 'exclamation-triangle',
      info: 'info-circle'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-icon">
        <i class="fas fa-${icons[type]}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // Confirm dialog
  confirm: (message, onConfirm, onCancel = null) => {
    if (confirm(message)) {
      onConfirm();
    } else if (onCancel) {
      onCancel();
    }
  },

  // Get current date string (YYYY-MM-DD)
  getTodayString: () => {
    return new Date().toISOString().split('T')[0];
  },

  // Check if same day
  isSameDay: (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  },

  // Get start of day
  startOfDay: (date = new Date()) => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d;
  },

  // Get end of day
  endOfDay: (date = new Date()) => {
    const d = new Date(date);
    d.setHours(23, 59, 59, 999);
    return d;
  },

  // Add days to date
  addDays: (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
  },

  // Format relative time
  timeAgo: (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    
    const intervals = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
      second: 1
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval > 1 ? 's' : ''} ago`;
      }
    }
    return 'Just now';
  }
};

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}
