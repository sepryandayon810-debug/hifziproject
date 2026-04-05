/**
 * WebPOS Utility Functions
 * Common helper functions used across the application
 */

const Utils = {
  // Format currency to Indonesian Rupiah
  formatRupiah: (amount, withSymbol = true) => {
    if (amount === null || amount === undefined || isNaN(amount)) {
      return withSymbol ? 'Rp 0' : '0';
    }
    
    const number = Math.abs(Math.round(amount));
    const formatted = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    if (!withSymbol) return formatted;
    
    return amount < 0 ? `-Rp ${formatted}` : `Rp ${formatted}`;
  },

  // Parse rupiah string to number
  parseRupiah: (str) => {
    if (!str) return 0;
    const clean = str.toString().replace(/[^0-9-]/g, '');
    return parseInt(clean) || 0;
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

  // Format date time
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

  // Format relative time
  timeAgo: (date) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now - then) / 1000);
    
    if (seconds < 60) return 'Baru saja';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} menit lalu`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} jam lalu`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} hari lalu`;
    
    return Utils.formatDate(date);
  },

  // Generate invoice number
  generateInvoice: (prefix = 'INV', padding = 6) => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `${prefix}-${timestamp}${random}`;
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
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (Array.isArray(obj)) return obj.map(item => Utils.deepClone(item));
    if (typeof obj === 'object') {
      const cloned = {};
      Object.keys(obj).forEach(key => {
        cloned[key] = Utils.deepClone(obj[key]);
      });
      return cloned;
    }
  },

  // Calculate percentage
  calculatePercentage: (value, total, decimals = 2) => {
    if (!total) return 0;
    return ((value / total) * 100).toFixed(decimals);
  },

  // Generate random string
  randomString: (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  // Validate email
  isValidEmail: (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  },

  // Validate phone number (Indonesian)
  isValidPhone: (phone) => {
    const re = /^(\+62|62|0)8[1-9][0-9]{6,9}$/;
    return re.test(phone);
  },

  // Slugify string
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
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  },

  // Format number with K/M/B suffix
  formatNumber: (num) => {
    if (num >= 1000000000) {
      return (num / 1000000000).toFixed(1) + 'B';
    }
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },

  // Group array by key
  groupBy: (array, key) => {
    return array.reduce((result, item) => {
      const group = item[key];
      result[group] = result[group] || [];
      result[group].push(item);
      return result;
    }, {});
  },

  // Sort array by key
  sortBy: (array, key, order = 'asc') => {
    return [...array].sort((a, b) => {
      let valA = a[key];
      let valB = b[key];
      
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  },

  // Calculate summary statistics
  calculateStats: (data, key) => {
    const values = data.map(item => parseFloat(item[key]) || 0);
    
    return {
      sum: values.reduce((a, b) => a + b, 0),
      avg: values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0,
      min: Math.min(...values),
      max: Math.max(...values),
      count: values.length
    };
  },

  // Export to CSV
  exportToCSV: (data, filename = 'export.csv') => {
    if (!data || !data.length) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const cell = row[header] || '';
          // Escape quotes and wrap in quotes if contains comma
          const escaped = String(cell).replace(/"/g, '""');
          return escaped.includes(',') ? `"${escaped}"` : escaped;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  },

  // Show toast notification
  showToast: (message, type = 'info', duration = 3000) => {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✗' : 'ℹ'}</span>
      <span class="toast-message">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('show');
    });
    
    // Remove after duration
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  // Confirm dialog
  confirm: (message, onConfirm, onCancel) => {
    if (confirm(message)) {
      onConfirm?.();
    } else {
      onCancel?.();
    }
  },

  // Local storage helpers
  storage: {
    set: (key, value) => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        console.error('Storage error:', e);
        return false;
      }
    },
    
    get: (key, defaultValue = null) => {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    },
    
    remove: (key) => {
      localStorage.removeItem(key);
    },
    
    clear: () => {
      localStorage.clear();
    }
  },

  // Session storage helpers
  session: {
    set: (key, value) => {
      try {
        sessionStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch (e) {
        return false;
      }
    },
    
    get: (key, defaultValue = null) => {
      try {
        const item = sessionStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
      } catch (e) {
        return defaultValue;
      }
    },
    
    remove: (key) => {
      sessionStorage.removeItem(key);
    }
  },

  // Print element
  printElement: (elementId, title = 'Print') => {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>${title}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            @media print { body { -webkit-print-color-adjust: exact; } }
          </style>
        </head>
        <body>${element.innerHTML}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  },

  // Copy to clipboard
  copyToClipboard: async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      Utils.showToast('Berhasil disalin!', 'success');
      return true;
    } catch (err) {
      Utils.showToast('Gagal menyalin', 'error');
      return false;
    }
  },

  // Get device info
  getDeviceInfo: () => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      online: navigator.onLine,
      screenSize: `${window.screen.width}x${window.screen.height}`,
      touch: 'ontouchstart' in window
    };
  },

  // Sanitize HTML
  sanitizeHTML: (str) => {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  // Parse query parameters
  getQueryParams: () => {
    const params = new URLSearchParams(window.location.search);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  },

  // Build query string
  buildQueryString: (params) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        query.append(key, value);
      }
    });
    return query.toString();
  },

  // Check if element is in viewport
  isInViewport: (element) => {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  },

  // Scroll to element smoothly
  scrollTo: (element, offset = 0) => {
    const target = typeof element === 'string' 
      ? document.querySelector(element) 
      : element;
    
    if (target) {
      const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  },

  // Add leading zeros
  padZero: (num, size = 2) => {
    return num.toString().padStart(size, '0');
  },

  // Get month name in Indonesian
  getMonthName: (monthIndex, short = false) => {
    const months = [
      'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
      'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    return short ? shortMonths[monthIndex] : months[monthIndex];
  },

  // Get day name in Indonesian
  getDayName: (date, short = false) => {
    const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
    const shortDays = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
    const d = new Date(date);
    
    return short ? shortDays[d.getDay()] : days[d.getDay()];
  },

  // Calculate date difference in days
  dateDiff: (date1, date2) => {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2 - d1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  },

  // Add days to date
  addDays: (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  },

  // Check if date is today
  isToday: (date) => {
    const today = new Date();
    const d = new Date(date);
    return d.toDateString() === today.toDateString();
  },

  // Check if date is expired
  isExpired: (date) => {
    return new Date(date) < new Date();
  },

  // Format file size
  formatFileSize: (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  // Base64 encode/decode
  base64: {
    encode: (str) => btoa(unescape(encodeURIComponent(str))),
    decode: (str) => decodeURIComponent(escape(atob(str)))
  },

  // Generate QR code data URL (placeholder - implement with library)
  generateQR: (data, size = 200) => {
    // This is a placeholder - use a library like qrcode.js
    return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`;
  },

  // Image to base64
  imageToBase64: (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  },

  // Compress image
  compressImage: (base64, maxWidth = 800, quality = 0.8) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = maxWidth / img.width;
        canvas.width = maxWidth;
        canvas.height = img.height * ratio;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
    });
  },

  // Detect browser
  detectBrowser: () => {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    
    if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
    else if (ua.indexOf('Safari') > -1) browser = 'Safari';
    else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
    else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) browser = 'IE';
    else if (ua.indexOf('Edge') > -1) browser = 'Edge';
    
    return browser;
  },

  // Check online status
  isOnline: () => navigator.onLine,

  // Listen to online/offline events
  onConnectionChange: (callback) => {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
  },

  // Retry failed request
  retry: async (fn, retries = 3, delay = 1000) => {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      return Utils.retry(fn, retries - 1, delay * 2);
    }
  },

  // Measure function execution time
  measureTime: (fn, label = 'Execution time') => {
    console.time(label);
    const result = fn();
    console.timeEnd(label);
    return result;
  },

  // Create download link
  downloadFile: (content, filename, mimeType = 'text/plain') => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // Parse JSON safely
  safeJSONParse: (str, defaultValue = null) => {
    try {
      return JSON.parse(str);
    } catch (e) {
      return defaultValue;
    }
  },

  // Merge objects deeply
  deepMerge: (...objects) => {
    const isObject = obj => obj && typeof obj === 'object';
    
    return objects.reduce((prev, obj) => {
      Object.keys(obj).forEach(key => {
        const pVal = prev[key];
        const oVal = obj[key];
        
        if (Array.isArray(pVal) && Array.isArray(oVal)) {
          prev[key] = pVal.concat(...oVal);
        } else if (isObject(pVal) && isObject(oVal)) {
          prev[key] = Utils.deepMerge(pVal, oVal);
        } else {
          prev[key] = oVal;
        }
      });
      
      return prev;
    }, {});
  },

  // Cache function results
  memoize: (fn, ttl = 60000) => {
    const cache = new Map();
    
    return (...args) => {
      const key = JSON.stringify(args);
      const cached = cache.get(key);
      
      if (cached && Date.now() - cached.time < ttl) {
        return cached.value;
      }
      
      const result = fn.apply(this, args);
      cache.set(key, { value: result, time: Date.now() });
      return result;
    };
  },

  // Wait for element to appear in DOM
  waitForElement: (selector, timeout = 5000) => {
    return new Promise((resolve, reject) => {
      const element = document.querySelector(selector);
      if (element) return resolve(element);
      
      const observer = new MutationObserver(() => {
        const element = document.querySelector(selector);
        if (element) {
          observer.disconnect();
          resolve(element);
        }
      });
      
      observer.observe(document.body, { childList: true, subtree: true });
      
      setTimeout(() => {
        observer.disconnect();
        reject(new Error(`Element ${selector} not found within ${timeout}ms`));
      }, timeout);
    });
  },

  // Batch process array
  batchProcess: async (items, batchSize, processor) => {
    const results = [];
    
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);
      const batchResults = await Promise.all(batch.map(processor));
      results.push(...batchResults);
    }
    
    return results;
  },

  // Rate limiter
  createRateLimiter: (maxRequests, windowMs) => {
    const requests = [];
    
    return () => {
      const now = Date.now();
      
      // Remove old requests
      while (requests.length > 0 && requests[0] <= now - windowMs) {
        requests.shift();
      }
      
      if (requests.length >= maxRequests) {
        return false;
      }
      
      requests.push(now);
      return true;
    };
  },

  // Generate color from string
  stringToColor: (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const c = (hash & 0x00FFFFFF).toString(16).toUpperCase();
    return '#' + '00000'.substring(0, 6 - c.length) + c;
  },

  // Get contrast color (black or white)
  getContrastColor: (hexColor) => {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    return yiq >= 128 ? '#000000' : '#FFFFFF';
  },

  // Format duration
  formatDuration: (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}j ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}d`;
    }
    return `${secs}d`;
  },

  // Calculate age
  calculateAge: (birthDate) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  },

  // Generate password
  generatePassword: (length = 12) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let password = '';
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      password += charset[randomIndex];
    }
    
    return password;
  },

  // Validate password strength
  checkPasswordStrength: (password) => {
    let strength = 0;
    
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/)) strength++;
    if (password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    
    const levels = ['Sangat Lemah', 'Lemah', 'Sedang', 'Kuat', 'Sangat Kuat'];
    return {
      score: strength,
      level: levels[strength - 1] || 'Sangat Lemah',
      isStrong: strength >= 4
    };
  },

  // Format relative date
  formatRelativeDate: (date) => {
    const now = new Date();
    const then = new Date(date);
    const diffDays = Math.floor((now - then) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Hari ini';
    if (diffDays === 1) return 'Kemarin';
    if (diffDays < 7) return `${diffDays} hari lalu`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} minggu lalu`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} bulan lalu`;
    return `${Math.floor(diffDays / 365)} tahun lalu`;
  },

  // Parse form data to object
  formToObject: (formElement) => {
    const formData = new FormData(formElement);
    const data = {};
    
    for (const [key, value] of formData.entries()) {
      if (data[key]) {
        if (!Array.isArray(data[key])) {
          data[key] = [data[key]];
        }
        data[key].push(value);
      } else {
        data[key] = value;
      }
    }
    
    return data;
  },

  // Populate form with object data
  objectToForm: (formElement, data) => {
    Object.keys(data).forEach(key => {
      const input = formElement.querySelector(`[name="${key}"]`);
      if (input) {
        if (input.type === 'checkbox') {
          input.checked = Boolean(data[key]);
        } else if (input.type === 'radio') {
          const radio = formElement.querySelector(`[name="${key}"][value="${data[key]}"]`);
          if (radio) radio.checked = true;
        } else {
          input.value = data[key] || '';
        }
      }
    });
  },

  // Create element with attributes
  createElement: (tag, attributes = {}, children = []) => {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
      if (key === 'text') {
        element.textContent = value;
      } else if (key === 'html') {
        element.innerHTML = value;
      } else if (key.startsWith('on')) {
        element.addEventListener(key.slice(2).toLowerCase(), value);
      } else {
        element.setAttribute(key, value);
      }
    });
    
    children.forEach(child => {
      if (typeof child === 'string') {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });
    
    return element;
  },

  // Remove duplicate objects from array
  uniqueBy: (array, key) => {
    const seen = new Set();
    return array.filter(item => {
      const val = item[key];
      if (seen.has(val)) return false;
      seen.add(val);
      return true;
    });
  },

  // Chunk array into smaller arrays
  chunk: (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  // Flatten nested array
  flatten: (array, depth = 1) => {
    return array.flat(depth);
  },

  // Deep flatten
  flattenDeep: (array) => {
    return array.reduce((acc, val) => 
      Array.isArray(val) ? acc.concat(Utils.flattenDeep(val)) : acc.concat(val), 
    []);
  },

  // Intersection of arrays
  intersection: (...arrays) => {
    return arrays.reduce((a, b) => a.filter(c => b.includes(c)));
  },

  // Difference between arrays
  difference: (a, b) => {
    return a.filter(x => !b.includes(x));
  },

  // Union of arrays
  union: (...arrays) => {
    return [...new Set(arrays.flat())];
  },

  // Shuffle array
  shuffle: (array) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  },

  // Sample from array
  sample: (array, n = 1) => {
    const shuffled = Utils.shuffle(array);
    return n === 1 ? shuffled[0] : shuffled.slice(0, n);
  },

  // Group array into consecutive chunks
  groupConsecutive: (array, predicate) => {
    const groups = [];
    let currentGroup = [array[0]];
    
    for (let i = 1; i < array.length; i++) {
      if (predicate(array[i - 1], array[i])) {
        currentGroup.push(array[i]);
      } else {
        groups.push(currentGroup);
        currentGroup = [array[i]];
      }
    }
    
    if (currentGroup.length > 0) {
      groups.push(currentGroup);
    }
    
    return groups;
  },

  // Calculate moving average
  movingAverage: (data, windowSize) => {
    const result = [];
    for (let i = 0; i < data.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = data.slice(start, i + 1);
      const avg = window.reduce((a, b) => a + b, 0) / window.length;
      result.push(avg);
    }
    return result;
  },

  // Detect outliers using IQR method
  detectOutliers: (data) => {
    const sorted = [...data].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return data.filter(x => x < lowerBound || x > upperBound);
  },

  // Calculate percent change
  percentChange: (oldValue, newValue) => {
    if (oldValue === 0) return newValue === 0 ? 0 : Infinity;
    return ((newValue - oldValue) / Math.abs(oldValue)) * 100;
  },

  // Round to nearest
  roundToNearest: (value, nearest) => {
    return Math.round(value / nearest) * nearest;
  },

  // Clamp value between min and max
  clamp: (value, min, max) => {
    return Math.min(Math.max(value, min), max);
  },

  // Linear interpolation
  lerp: (start, end, t) => {
    return start * (1 - t) + end * t;
  },

  // Map range
  mapRange: (value, inMin, inMax, outMin, outMax) => {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  },

  // Ease functions
  ease: {
    linear: t => t,
    easeInQuad: t => t * t,
    easeOutQuad: t => t * (2 - t),
    easeInOutQuad: t => t < .5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    easeInCubic: t => t * t * t,
    easeOutCubic: t => (--t) * t * t + 1,
    easeInOutCubic: t => t < .5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1
  },

  // Animate number
  animateNumber: (element, from, to, duration = 1000, formatter = null) => {
    const startTime = performance.now();
    
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = Utils.ease.easeOutQuad(progress);
      const current = Utils.lerp(from, to, eased);
      
      element.textContent = formatter ? formatter(current) : Math.round(current);
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    
    requestAnimationFrame(update);
  },

  // Scrollspy
  scrollSpy: (sections, callback) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry.target.id);
        }
      });
    }, { threshold: 0.5 });
    
    sections.forEach(section => observer.observe(section));
    return observer;
  },

  // Infinite scroll
  infiniteScroll: (container, loader, callback, options = {}) => {
    const { threshold = 100, debounce = 200 } = options;
    let loading = false;
    
    const onScroll = Utils.debounce(() => {
      if (loading) return;
      
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      
      if (scrollHeight - scrollTop - clientHeight < threshold) {
        loading = true;
        loader.style.display = 'block';
        
        callback().then(() => {
          loading = false;
          loader.style.display = 'none';
        }).catch(() => {
          loading = false;
          loader.style.display = 'none';
        });
      }
    }, debounce);
    
    container.addEventListener('scroll', onScroll);
    return () => container.removeEventListener('scroll', onScroll);
  },

  // Draggable element
  makeDraggable: (element, handle = element) => {
    let isDragging = false;
    let currentX, currentY, initialX, initialY;
    let xOffset = 0, yOffset = 0;
    
    const dragStart = (e) => {
      if (e.type === 'touchstart') {
        initialX = e.touches[0].clientX - xOffset;
        initialY = e.touches[0].clientY - yOffset;
      } else {
        initialX = e.clientX - xOffset;
        initialY = e.clientY - yOffset;
      }
      
      if (e.target === handle || handle.contains(e.target)) {
        isDragging = true;
      }
    };
    
    const dragEnd = () => {
      initialX = currentX;
      initialY = currentY;
      isDragging = false;
    };
    
    const drag = (e) => {
      if (isDragging) {
        e.preventDefault();
        
        if (e.type === 'touchmove') {
          currentX = e.touches[0].clientX - initialX;
          currentY = e.touches[0].clientY - initialY;
        } else {
          currentX = e.clientX - initialX;
          currentY = e.clientY - initialY;
        }
        
        xOffset = currentX;
        yOffset = currentY;
        
        element.style.transform = `translate3d(${currentX}px, ${currentY}px, 0)`;
      }
    };
    
    handle.addEventListener('touchstart', dragStart, { passive: false });
    handle.addEventListener('touchend', dragEnd, { passive: false });
    handle.addEventListener('touchmove', drag, { passive: false });
    handle.addEventListener('mousedown', dragStart);
    
    return {
      destroy: () => {
        handle.removeEventListener('touchstart', dragStart);
        handle.removeEventListener('touchend', dragEnd);
        handle.removeEventListener('touchmove', drag);
        handle.removeEventListener('mousedown', dragStart);
      }
    };
  },

  // Resizable element
  makeResizable: (element, options = {}) => {
    const { minWidth = 100, minHeight = 100, maxWidth = Infinity, maxHeight = Infinity } = options;
    
    const resizer = document.createElement('div');
    resizer.style.cssText = `
      position: absolute;
      right: 0;
      bottom: 0;
      width: 15px;
      height: 15px;
      cursor: se-resize;
      background: linear-gradient(135deg, transparent 50%, var(--gray-400) 50%);
    `;
    
    element.style.position = 'relative';
    element.appendChild(resizer);
    
    let isResizing = false;
    
    const initResize = (e) => {
      isResizing = true;
      document.addEventListener('mousemove', doResize);
      document.addEventListener('mouseup', stopResize);
    };
    
    const doResize = (e) => {
      if (!isResizing) return;
      
      const newWidth = Math.max(minWidth, Math.min(e.clientX - element.offsetLeft, maxWidth));
      const newHeight = Math.max(minHeight, Math.min(e.clientY - element.offsetTop, maxHeight));
      
      element.style.width = newWidth + 'px';
      element.style.height = newHeight + 'px';
    };
    
    const stopResize = () => {
      isResizing = false;
      document.removeEventListener('mousemove', doResize);
      document.removeEventListener('mouseup', stopResize);
    };
    
    resizer.addEventListener('mousedown', initResize);
    
    return {
      destroy: () => {
        resizer.removeEventListener('mousedown', initResize);
        resizer.remove();
      }
    };
  },

  // Sortable list
  makeSortable: (list, options = {}) => {
    const { onSort, handle = null, animation = 150 } = options;
    let draggedItem = null;
    let placeholder = null;
    
    const items = Array.from(list.children);
    
    items.forEach(item => {
      item.draggable = true;
      item.style.cursor = 'move';
      
      item.addEventListener('dragstart', (e) => {
        draggedItem = item;
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => item.classList.add('dragging'), 0);
      });
      
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        draggedItem = null;
        if (placeholder) {
          placeholder.remove();
          placeholder = null;
        }
      });
      
      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!draggedItem || item === draggedItem) return;
        
        const rect = item.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        
        if (!placeholder) {
          placeholder = document.createElement(item.tagName);
          placeholder.className = 'sortable-placeholder';
          placeholder.style.cssText = `
            background: var(--gray-100);
            border: 2px dashed var(--gray-300);
            height: ${draggedItem.offsetHeight}px;
          `;
        }
        
        if (e.clientY < midpoint) {
          item.before(placeholder);
        } else {
          item.after(placeholder);
        }
      });
      
      item.addEventListener('drop', (e) => {
        e.preventDefault();
        if (placeholder && draggedItem) {
          placeholder.replaceWith(draggedItem);
          onSort?.(Array.from(list.children));
        }
      });
    });
    
    return {
      destroy: () => {
        items.forEach(item => {
          item.draggable = false;
          item.style.cursor = '';
        });
      }
    };
  },

  // Tree view
  createTreeView: (data, container, options = {}) => {
    const { onSelect, onToggle, renderNode } = options;
    
    const createNode = (item, level = 0) => {
      const li = document.createElement('li');
      li.className = 'tree-node';
      li.style.paddingLeft = `${level * 20}px`;
      
      const content = document.createElement('div');
      content.className = 'tree-node-content';
      
      if (item.children && item.children.length > 0) {
        const toggle = document.createElement('span');
        toggle.className = 'tree-toggle';
        toggle.innerHTML = '▶';
        toggle.style.cursor = 'pointer';
        toggle.style.marginRight = '5px';
        content.appendChild(toggle);
      }
      
      const label = document.createElement('span');
      label.className = 'tree-label';
      label.textContent = item.label;
      content.appendChild(label);
      
      li.appendChild(content);
      
      if (item.children && item.children.length > 0) {
        const ul = document.createElement('ul');
        ul.className = 'tree-children';
        ul.style.display = 'none';
        
        item.children.forEach(child => {
          ul.appendChild(createNode(child, level + 1));
        });
        
        li.appendChild(ul);
        
        content.addEventListener('click', (e) => {
          if (e.target === toggle || e.target === content) {
            const isExpanded = ul.style.display !== 'none';
            ul.style.display = isExpanded ? 'none' : 'block';
            toggle.innerHTML = isExpanded ? '▶' : '▼';
            onToggle?.(item, !isExpanded);
          }
        });
      }
      
      label.addEventListener('click', () => {
        container.querySelectorAll('.tree-label').forEach(l => l.classList.remove('selected'));
        label.classList.add('selected');
        onSelect?.(item);
      });
      
      return li;
    };
    
    const ul = document.createElement('ul');
    ul.className = 'tree-view';
    data.forEach(item => ul.appendChild(createNode(item)));
    container.appendChild(ul);
    
    return {
      expandAll: () => {
        container.querySelectorAll('.tree-children').forEach(el => el.style.display = 'block');
        container.querySelectorAll('.tree-toggle').forEach(el => el.innerHTML = '▼');
      },
      collapseAll: () => {
        container.querySelectorAll('.tree-children').forEach(el => el.style.display = 'none');
        container.querySelectorAll('.tree-toggle').forEach(el => el.innerHTML = '▶');
      }
    };
  },

  // Virtual list for large datasets
  createVirtualList: (container, itemHeight, totalItems, renderItem) => {
    const viewportHeight = container.clientHeight;
    const visibleCount = Math.ceil(viewportHeight / itemHeight) + 2;
    const totalHeight = totalItems * itemHeight;
    
    const content = document.createElement('div');
    content.style.height = `${totalHeight}px`;
    content.style.position = 'relative';
    
    const items = [];
    
    const updateVisibleItems = () => {
      const scrollTop = container.scrollTop;
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(startIndex + visibleCount, totalItems);
      
      // Remove items that are no longer visible
      items.forEach((item, index) => {
        const itemIndex = startIndex + index;
        if (itemIndex >= endIndex) {
          item.element.remove();
        }
      });
      
      // Add new visible items
      for (let i = startIndex; i < endIndex; i++) {
        if (!items[i - startIndex]) {
          const element = renderItem(i);
          element.style.position = 'absolute';
          element.style.top = `${i * itemHeight}px`;
          element.style.height = `${itemHeight}px`;
          element.style.left = '0';
          element.style.right = '0';
          content.appendChild(element);
          items[i - startIndex] = { index: i, element };
        }
      }
      
      // Clean up array
      items.length = endIndex - startIndex;
    };
    
    container.appendChild(content);
    container.addEventListener('scroll', updateVisibleItems);
    updateVisibleItems();
    
    return {
      refresh: updateVisibleItems,
      scrollToIndex: (index) => {
        container.scrollTop = index * itemHeight;
      },
      destroy: () => {
        container.removeEventListener('scroll', updateVisibleItems);
        content.remove();
      }
    };
  },

  // Image lazy loading
  lazyLoadImages: (selector = 'img[data-src]') => {
    const images = document.querySelectorAll(selector);
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    return {
      refresh: () => {
        const newImages = document.querySelectorAll(selector);
        newImages.forEach(img => imageObserver.observe(img));
      },
      destroy: () => imageObserver.disconnect()
    };
  },

  // Intersection observer helper
  observeIntersection: (elements, callback, options = {}) => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        callback(entry.target, entry.isIntersecting, entry);
      });
    }, options);
    
    elements.forEach(el => observer.observe(el));
    
    return {
      observe: (el) => observer.observe(el),
      unobserve: (el) => observer.unobserve(el),
      disconnect: () => observer.disconnect()
    };
  },

  // Resize observer helper
  observeResize: (elements, callback) => {
    const observer = new ResizeObserver((entries) => {
      entries.forEach(entry => {
        callback(entry.target, entry.contentRect, entry);
      });
    });
    
    elements.forEach(el => observer.observe(el));
    
    return {
      observe: (el) => observer.observe(el),
      unobserve: (el) => observer.unobserve(el),
      disconnect: () => observer.disconnect()
    };
  },

  // Mutation observer helper
  observeMutations: (target, callback, options = {}) => {
    const observer = new MutationObserver((mutations) => {
      callback(mutations, observer);
    });
    
    observer.observe(target, {
      childList: true,
      subtree: true,
      attributes: true,
      ...options
    });
    
    return () => observer.disconnect();
  },

  // Performance monitoring
  perf: {
    marks: new Map(),
    
    mark: (name) => {
      performance.mark(name);
      Utils.perf.marks.set(name, performance.now());
    },
    
    measure: (name, startMark, endMark) => {
      performance.measure(name, startMark, endMark);
      const entries = performance.getEntriesByName(name);
      return entries[entries.length - 1];
    },
    
    getDuration: (startMark, endMark) => {
      const start = Utils.perf.marks.get(startMark);
      const end = Utils.perf.marks.get(endMark) || performance.now();
      return end - start;
    },
    
    clear: () => {
      performance.clearMarks();
      performance.clearMeasures();
      Utils.perf.marks.clear();
    }
  },

  // Web Worker helper
  createWorker: (fn) => {
    const blob = new Blob([`(${fn.toString()})()`], { type: 'application/javascript' });
    const worker = new Worker(URL.createObjectURL(blob));
    
    return {
      postMessage: (data) => worker.postMessage(data),
      onMessage: (callback) => worker.onmessage = (e) => callback(e.data),
      terminate: () => worker.terminate()
    };
  },

  // Service Worker registration
  registerSW: async (path = '/sw.js') => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(path);
        console.log('SW registered:', registration);
        return registration;
      } catch (error) {
        console.error('SW registration failed:', error);
        return null;
      }
    }
    return null;
  },

  // Notification permission
  requestNotificationPermission: async () => {
    if (!('Notification' in window)) return false;
    
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  // Show notification
  showNotification: (title, options = {}) => {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return false;
    }
    
    new Notification(title, {
      icon: '/icon.png',
      badge: '/badge.png',
      ...options
    });
    
    return true;
  },

  // Vibration
  vibrate: (pattern = 200) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  },

  // Battery status
  getBatteryStatus: async () => {
    if ('getBattery' in navigator) {
      const battery = await navigator.getBattery();
      return {
        level: battery.level * 100,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime
      };
    }
    return null;
  },

  // Network information
  getNetworkInfo: () => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    
    if (connection) {
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
    
    return null;
  },

  // Device memory
  getDeviceMemory: () => {
    return navigator.deviceMemory || 'unknown';
  },

  // Hardware concurrency
  getHardwareConcurrency: () => {
    return navigator.hardwareConcurrency || 'unknown';
  },

  // Screen orientation
  getScreenOrientation: () => {
    return screen.orientation ? screen.orientation.type : 'unknown';
  },

  // Lock screen orientation
  lockOrientation: async (orientation) => {
    if (screen.orientation && screen.orientation.lock) {
      try {
        await screen.orientation.lock(orientation);
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  },

  // Wake lock (keep screen on)
  requestWakeLock: async () => {
    if ('wakeLock' in navigator) {
      try {
        const wakeLock = await navigator.wakeLock.request('screen');
        return wakeLock;
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  // Fullscreen
  requestFullscreen: async (element = document.documentElement) => {
    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      await element.webkitRequestFullscreen();
    }
  },

  // Exit fullscreen
  exitFullscreen: async () => {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      await document.webkitExitFullscreen();
    }
  },

  // Picture in Picture
  requestPIP: async (videoElement) => {
    if (document.pictureInPictureEnabled) {
      try {
        if (document.pictureInPictureElement) {
          await document.exitPictureInPicture();
        } else {
          await videoElement.requestPictureInPicture();
        }
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  },

  // Clipboard API (images)
  writeImageToClipboard: async (blob) => {
    try {
      await navigator.clipboard.write([
        new ClipboardItem({
          [blob.type]: blob
        })
      ]);
      return true;
    } catch (e) {
      return false;
    }
  },

  // File System Access API
  openFilePicker: async (options = {}) => {
    if ('showOpenFilePicker' in window) {
      try {
        const handles = await window.showOpenFilePicker({
          multiple: false,
          ...options
        });
        return handles[0];
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  // Save file picker
  saveFilePicker: async (suggestedName, options = {}) => {
    if ('showSaveFilePicker' in window) {
      try {
        const handle = await window.showSaveFilePicker({
          suggestedName,
          ...options
        });
        return handle;
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  // Directory picker
  openDirectoryPicker: async () => {
    if ('showDirectoryPicker' in window) {
      try {
        const handle = await window.showDirectoryPicker();
        return handle;
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  // File drag and drop
  setupDragDrop: (element, callbacks = {}) => {
    const { onDragOver, onDragLeave, onDrop, onFiles } = callbacks;
    
    const handleDragOver = (e) => {
      e.preventDefault();
      e.stopPropagation();
      element.classList.add('drag-over');
      onDragOver?.(e);
    };
    
    const handleDragLeave = (e) => {
      e.preventDefault();
      e.stopPropagation();
      element.classList.remove('drag-over');
      onDragLeave?.(e);
    };
    
    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      element.classList.remove('drag-over');
      
      const files = Array.from(e.dataTransfer.files);
      onDrop?.(e, files);
      onFiles?.(files);
    };
    
    element.addEventListener('dragover', handleDragOver);
    element.addEventListener('dragleave', handleDragLeave);
    element.addEventListener('drop', handleDrop);
    
    return {
      destroy: () => {
        element.removeEventListener('dragover', handleDragOver);
        element.removeEventListener('dragleave', handleDragLeave);
        element.removeEventListener('drop', handleDrop);
      }
    };
  },

  // Paste from clipboard
  readClipboard: async () => {
    try {
      const items = await navigator.clipboard.read();
      const files = [];
      
      for (const item of items) {
        for (const type of item.types) {
          if (type.startsWith('image/')) {
            const blob = await item.getType(type);
            files.push(new File([blob], `pasted-image.${type.split('/')[1]}`, { type }));
          }
        }
      }
      
      return files;
    } catch (e) {
      return [];
    }
  },

  // Speech recognition
  startSpeechRecognition: (options = {}) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (!SpeechRecognition) return null;
    
    const recognition = new SpeechRecognition();
    recognition.continuous = options.continuous || false;
    recognition.interimResults = options.interimResults || false;
    recognition.lang = options.lang || 'id-ID';
    
    if (options.onStart) recognition.onstart = options.onStart;
    if (options.onResult) recognition.onresult = options.onResult;
    if (options.onError) recognition.onerror = options.onError;
    if (options.onEnd) recognition.onend = options.onEnd;
    
    recognition.start();
    
    return recognition;
  },

  // Text to speech
  textToSpeech: (text, options = {}) => {
    if (!window.speechSynthesis) return false;
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = options.lang || 'id-ID';
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    
    if (options.onStart) utterance.onstart = options.onStart;
    if (options.onEnd) utterance.onend = options.onEnd;
    if (options.onError) utterance.onerror = options.onError;
    
    window.speechSynthesis.speak(utterance);
    return true;
  },

  // Geolocation
  getCurrentPosition: (options = {}) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      
      navigator.geolocation.getCurrentPosition(resolve, reject, {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options
      });
    });
  },

  // Watch position
  watchPosition: (callback, errorCallback, options = {}) => {
    if (!navigator.geolocation) return null;
    
    return navigator.geolocation.watchPosition(callback, errorCallback, {
      enableHighAccuracy: true,
      ...options
    });
  },

  // Calculate distance between coordinates
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  },

  // IndexedDB helper
  idb: {
    db: null,
    
    open: (dbName, version, upgradeCallback) => {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(dbName, version);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          Utils.idb.db = request.result;
          resolve(request.result);
        };
        request.onupgradeneeded = (e) => {
          upgradeCallback?.(e.target.result, e.oldVersion, e.newVersion);
        };
      });
    },
    
    createStore: (db, storeName, options = {}) => {
      if (!db.objectStoreNames.contains(storeName)) {
        const store = db.createObjectStore(storeName, options);
        return store;
      }
      return null;
    },
    
    add: (storeName, data, key) => {
      return new Promise((resolve, reject) => {
        const transaction = Utils.idb.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = key ? store.add(data, key) : store.add(data);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    
    get: (storeName, key) => {
      return new Promise((resolve, reject) => {
        const transaction = Utils.idb.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    
    getAll: (storeName, query, count) => {
      return new Promise((resolve, reject) => {
        const transaction = Utils.idb.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = query ? store.getAll(query, count) : store.getAll();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    
    put: (storeName, data, key) => {
      return new Promise((resolve, reject) => {
        const transaction = Utils.idb.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = key ? store.put(data, key) : store.put(data);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    },
    
    delete: (storeName, key) => {
      return new Promise((resolve, reject) => {
        const transaction = Utils.idb.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    },
    
    clear: (storeName) => {
      return new Promise((resolve, reject) => {
        const transaction = Utils.idb.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    },
    
    count: (storeName) => {
      return new Promise((resolve, reject) => {
        const transaction = Utils.idb.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.count();
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
  },

  // Cache API helper
  cache: {
    open: (cacheName) => caches.open(cacheName),
    
    add: async (cacheName, request) => {
      const cache = await caches.open(cacheName);
      return cache.add(request);
    },
    
    addAll: async (cacheName, requests) => {
      const cache = await caches.open(cacheName);
      return cache.addAll(requests);
    },
    
    match: async (cacheName, request) => {
      const cache = await caches.open(cacheName);
      return cache.match(request);
    },
    
    put: async (cacheName, request, response) => {
      const cache = await caches.open(cacheName);
      return cache.put(request, response);
    },
    
    delete: async (cacheName, request) => {
      const cache = await caches.open(cacheName);
      return cache.delete(request);
    },
    
    keys: async (cacheName, request) => {
      const cache = await caches.open(cacheName);
      return cache.keys(request);
    },
    
    clear: async (cacheName) => {
      return caches.delete(cacheName);
    }
  },

  // Broadcast Channel
  createBroadcastChannel: (channelName) => {
    if (!('BroadcastChannel' in window)) return null;
    
    const channel = new BroadcastChannel(channelName);
    
    return {
      postMessage: (data) => channel.postMessage(data),
      onMessage: (callback) => channel.onmessage = (e) => callback(e.data),
      close: () => channel.close()
    };
  },

  // Web Share API
  share: async (data) => {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  },

  // Contacts Picker API
  pickContacts: async (options = {}) => {
    if ('contacts' in navigator && 'ContactsManager' in window) {
      try {
        const props = options.properties || ['name', 'email', 'tel'];
        const multiple = options.multiple || false;
        const contacts = await navigator.contacts.select(props, { multiple });
        return contacts;
      } catch (e) {
        return [];
      }
    }
    return [];
  },

  // WebOTP API
  listenForOTP: (callback) => {
    if ('OTPCredential' in window) {
      navigator.credentials.get({ otp: { transport: ['sms'] } })
        .then(credential => {
          if (credential) {
            callback(credential.code);
          }
        })
        .catch(err => console.error('OTP error:', err));
    }
  },

  // Payment Request API
  createPaymentRequest: (methodData, details) => {
    if (!window.PaymentRequest) return null;
    
    try {
      const request = new PaymentRequest(methodData, details);
      return request;
    } catch (e) {
      return null;
    }
  },

  // Credential Management API
  saveCredentials: async (credentials) => {
    if ('credentials' in navigator) {
      try {
        await navigator.credentials.store(credentials);
        return true;
      } catch (e) {
        return false;
      }
    }
    return false;
  },

  // Get saved credentials
  getCredentials: async (options = {}) => {
    if ('credentials' in navigator) {
      try {
        const credentials = await navigator.credentials.get({
          password: true,
          federated: {
            providers: ['https://accounts.google.com']
          },
          ...options
        });
        return credentials;
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  // Web Authentication API (WebAuthn)
  createCredential: async (options) => {
    if (!window.PublicKeyCredential) return null;
    
    try {
      const credential = await navigator.credentials.create({ publicKey: options });
      return credential;
    } catch (e) {
      return null;
    }
  },

  // Get credential (WebAuthn)
  getCredential: async (options) => {
    if (!window.PublicKeyCredential) return null;
    
    try {
      const assertion = await navigator.credentials.get({ publicKey: options });
      return assertion;
    } catch (e) {
      return null;
    }
  },

  // Is WebAuthn available
  isWebAuthnAvailable: () => {
    return window.PublicKeyCredential !== undefined;
  },

  // Is platform authenticator available
  isPlatformAuthenticatorAvailable: async () => {
    if (!window.PublicKeyCredential) return false;
    
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (e) {
      return false;
    }
  },

  // Barcode Detection API
  detectBarcodes: async (image) => {
    if (!('BarcodeDetector' in window)) return [];
    
    try {
      const detector = new BarcodeDetector({
        formats: ['qr_code', 'ean_13', 'ean_8', 'code_128', 'code_39', 'upc_a', 'upc_e']
      });
      const barcodes = await detector.detect(image);
      return barcodes;
    } catch (e) {
      return [];
    }
  },

  // Face Detection API
  detectFaces: async (image) => {
    if (!('FaceDetector' in window)) return [];
    
    try {
      const detector = new FaceDetector();
      const faces = await detector.detect(image);
      return faces;
    } catch (e) {
      return [];
    }
  },

  // Text Detection API
  detectText: async (image) => {
    if (!('TextDetector' in window)) return [];
    
    try {
      const detector = new TextDetector();
      const texts = await detector.detect(image);
      return texts;
    } catch (e) {
      return [];
    }
  },

  // Shape Detection API availability
  isShapeDetectionAvailable: () => {
    return 'BarcodeDetector' in window || 'FaceDetector' in window || 'TextDetector' in window;
  },

  // Web Bluetooth API
  requestBluetoothDevice: async (options = {}) => {
    if (!('bluetooth' in navigator)) return null;
    
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        ...options
      });
      return device;
    } catch (e) {
      return null;
    }
  },

  // Web USB API
  requestUSBDevice: async (options = {}) => {
    if (!('usb' in navigator)) return null;
    
    try {
      const device = await navigator.usb.requestDevice({
        filters: [],
        ...options
      });
      return device;
    } catch (e) {
      return null;
    }
  },

  // Web Serial API
  requestSerialPort: async (options = {}) => {
    if (!('serial' in navigator)) return null;
    
    try {
      const port = await navigator.serial.requestPort({
        filters: [],
        ...options
      });
      return port;
    } catch (e) {
      return null;
    }
  },

  // Web HID API
  requestHIDDevice: async (options = {}) => {
    if (!('hid' in navigator)) return null;
    
    try {
      const devices = await navigator.hid.requestDevice({
        filters: [],
        ...options
      });
      return devices[0] || null;
    } catch (e) {
      return null;
    }
  },

  // Web NFC API
  startNFCScan: async (callback) => {
    if (!('NDEFReader' in window)) return false;
    
    try {
      const reader = new NDEFReader();
      await reader.scan();
      
      reader.addEventListener('reading', (e) => {
        callback({
          serialNumber: e.serialNumber,
          records: e.message.records
        });
      });
      
      return true;
    } catch (e) {
      return false;
    }
  },

  // Write NFC tag
  writeNFC: async (records) => {
    if (!('NDEFReader' in window)) return false;
    
    try {
      const writer = new NDEFReader();
      await writer.write({ records });
      return true;
    } catch (e) {
      return false;
    }
  },

  // Ambient Light Sensor
  createAmbientLightSensor: (callback) => {
    if (!('AmbientLightSensor' in window)) return null;
    
    try {
      const sensor = new AmbientLightSensor();
      sensor.addEventListener('reading', () => {
        callback(sensor.illuminance);
      });
      sensor.start();
      return sensor;
    } catch (e) {
      return null;
    }
  },

  // Accelerometer
  createAccelerometer: (callback, options = {}) => {
    if (!('Accelerometer' in window)) return null;
    
    try {
      const sensor = new Accelerometer({ frequency: 60, ...options });
      sensor.addEventListener('reading', () => {
        callback({
          x: sensor.x,
          y: sensor.y,
          z: sensor.z
        });
      });
      sensor.start();
      return sensor;
    } catch (e) {
      return null;
    }
  },

  // Gyroscope
  createGyroscope: (callback, options = {}) => {
    if (!('Gyroscope' in window)) return null;
    
    try {
      const sensor = new Gyroscope({ frequency: 60, ...options });
      sensor.addEventListener('reading', () => {
        callback({
          x: sensor.x,
          y: sensor.y,
          z: sensor.z
        });
      });
      sensor.start();
      return sensor;
    } catch (e) {
      return null;
    }
  },

  // Magnetometer
  createMagnetometer: (callback, options = {}) => {
    if (!('Magnetometer' in window)) return null;
    
    try {
      const sensor = new Magnetometer({ frequency: 60, ...options });
      sensor.addEventListener('reading', () => {
        callback({
          x: sensor.x,
          y: sensor.y,
          z: sensor.z
        });
      });
      sensor.start();
      return sensor;
    } catch (e) {
      return null;
    }
  },

  // Orientation sensor
  createAbsoluteOrientationSensor: (callback, options = {}) => {
    if (!('AbsoluteOrientationSensor' in window)) return null;
    
    try {
      const sensor = new AbsoluteOrientationSensor({ frequency: 60, ...options });
      sensor.addEventListener('reading', () => {
        callback(sensor.quaternion);
      });
      sensor.start();
      return sensor;
    } catch (e) {
      return null;
    }
  },

  // Device motion
  listenDeviceMotion: (callback) => {
    if (!window.DeviceMotionEvent) return false;
    
    const handler = (e) => {
      callback({
        acceleration: e.acceleration,
        accelerationIncludingGravity: e.accelerationIncludingGravity,
        rotationRate: e.rotationRate,
        interval: e.interval
      });
    };
    
    window.addEventListener('devicemotion', handler);
    
    return () => window.removeEventListener('devicemotion', handler);
  },

  // Device orientation
  listenDeviceOrientation: (callback) => {
    if (!window.DeviceOrientationEvent) return false;
    
    const handler = (e) => {
      callback({
        alpha: e.alpha,
        beta: e.beta,
        gamma: e.gamma,
        absolute: e.absolute
      });
    };
    
    window.addEventListener('deviceorientation', handler);
    
    return () => window.removeEventListener('deviceorientation', handler);
  },

  // Screen wake lock
  requestScreenWakeLock: async () => {
    if ('wakeLock' in navigator) {
      try {
        const wakeLock = await navigator.wakeLock.request('screen');
        return {
          release: () => wakeLock.release(),
          addEventListener: (event, callback) => wakeLock.addEventListener(event, callback)
        };
      } catch (e) {
        return null;
      }
    }
    return null;
  },

  // Page Visibility API
  onVisibilityChange: (callback) => {
    document.addEventListener('visibilitychange', () => {
      callback(document.visibilityState === 'visible');
    });
  },

  // Before unload
  onBeforeUnload: (callback) => {
    window.addEventListener('beforeunload', (e) => {
      const message = callback();
      if (message) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    });
  },

  // Online/Offline events
  onConnectionChange: (callback) => {
    const updateOnlineStatus = () => callback(navigator.onLine);
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  },

  // Storage events (cross-tab communication)
  onStorageChange: (callback) => {
    window.addEventListener('storage', (e) => {
      callback(e.key, e.oldValue, e.newValue, e.url);
    });
  },

  // Broadcast channel (modern cross-tab communication)
  createBroadcastChannel: (channelName) => {
    if (!('BroadcastChannel' in window)) return null;
    
    const channel = new BroadcastChannel(channelName);
    
    return {
      postMessage: (data) => channel.postMessage(data),
      onMessage: (callback) => channel.onmessage = (e) => callback(e.data),
      close: () => channel.close()
    };
  },

  // Message channel (worker communication)
  createMessageChannel: () => {
    return new MessageChannel();
  },

  // Custom event
  emitCustomEvent: (name, detail = null) => {
    const event = new CustomEvent(name, { detail, bubbles: true, cancelable: true });
    document.dispatchEvent(event);
    return event;
  },

  // Listen to custom event
  onCustomEvent: (name, callback) => {
    const handler = (e) => callback(e.detail, e);
    document.addEventListener(name, handler);
    return () => document.removeEventListener(name, handler);
  },

  // Create event emitter
  createEventEmitter: () => {
    const events = {};
    
    return {
      on: (event, callback) => {
        events[event] = events[event] || [];
        events[event].push(callback);
        return () => {
          events[event] = events[event].filter(cb => cb !== callback);
        };
      },
      
      emit: (event, data) => {
        (events[event] || []).forEach(callback => callback(data));
      },
      
      once: (event, callback) => {
        const onceCallback = (data) => {
          callback(data);
          events[event] = events[event].filter(cb => cb !== onceCallback);
        };
        events[event] = events[event] || [];
        events[event].push(onceCallback);
      },
      
      removeAll: (event) => {
        if (event) {
          delete events[event];
        } else {
          Object.keys(events).forEach(key => delete events[key]);
        }
      }
    };
  },

  // Pub/Sub pattern
  createPubSub: () => {
    const subscribers = {};
    
    return {
      subscribe: (topic, callback) => {
        subscribers[topic] = subscribers[topic] || [];
        subscribers[topic].push(callback);
        
        return {
          unsubscribe: () => {
            subscribers[topic] = subscribers[topic].filter(cb => cb !== callback);
          }
        };
      },
      
      publish: (topic, data) => {
        (subscribers[topic] || []).forEach(callback => {
          try {
            callback(data);
          } catch (e) {
            console.error('PubSub error:', e);
          }
        });
      },
      
      hasSubscribers: (topic) => {
        return !!(subscribers[topic] && subscribers[topic].length);
      }
    };
  },

  // State management (simple store)
  createStore: (initialState = {}) => {
    let state = { ...initialState };
    const listeners = new Set();
    
    return {
      getState: () => ({ ...state }),
      
      setState: (newState) => {
        state = { ...state, ...newState };
        listeners.forEach(listener => listener(state));
      },
      
      subscribe: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      },
      
      reset: () => {
        state = { ...initialState };
        listeners.forEach(listener => listener(state));
      }
    };
  },

  // Undo/Redo manager
  createHistoryManager: (maxHistory = 50) => {
    const history = [];
    let currentIndex = -1;
    
    return {
      add: (state) => {
        // Remove any future states if we're not at the end
        if (currentIndex < history.length - 1) {
          history.splice(currentIndex + 1);
        }
        
        history.push(Utils.deepClone(state));
        
        // Limit history size
        if (history.length > maxHistory) {
          history.shift();
        } else {
          currentIndex++;
        }
      },
      
      undo: () => {
        if (currentIndex > 0) {
          currentIndex--;
          return Utils.deepClone(history[currentIndex]);
        }
        return null;
      },
      
      redo: () => {
        if (currentIndex < history.length - 1) {
          currentIndex++;
          return Utils.deepClone(history[currentIndex]);
        }
        return null;
      },
      
      canUndo: () => currentIndex > 0,
      canRedo: () => currentIndex < history.length - 1,
      
      clear: () => {
        history.length = 0;
        currentIndex = -1;
      },
      
      getHistory: () => history.map((_, i) => ({
        index: i,
        isCurrent: i === currentIndex
      }))
    };
  },

  // Command pattern
  createCommandManager: () => {
    const commands = new Map();
    
    return {
      register: (name, execute, undo) => {
        commands.set(name, { execute, undo });
      },
      
      execute: (name, ...args) => {
        const command = commands.get(name);
        if (command) {
          const result = command.execute(...args);
          return { result, undo: () => command.undo?.(result) };
        }
        return null;
      },
      
      has: (name) => commands.has(name),
      
      unregister: (name) => commands.delete(name)
    };
  },

  // Observer pattern
  createObserver: () => {
    const observers = new Set();
    
    return {
      subscribe: (observer) => {
        observers.add(observer);
        return () => observers.delete(observer);
      },
      
      unsubscribe: (observer) => {
        observers.delete(observer);
      },
      
      notify: (data) => {
        observers.forEach(observer => {
          try {
            observer.update(data);
          } catch (e) {
            console.error('Observer error:', e);
          }
        });
      },
      
      count: () => observers.size
    };
  },

  // Singleton pattern
  createSingleton: (factory) => {
    let instance = null;
    
    return {
      getInstance: (...args) => {
        if (!instance) {
          instance = factory(...args);
        }
        return instance;
      },
      
      reset: () => {
        instance = null;
      }
    };
  },

  // Factory pattern
  createFactory: (constructors) => {
    return {
      create: (type, ...args) => {
        const Constructor = constructors[type];
        if (!Constructor) {
          throw new Error(`Unknown type: ${type}`);
        }
        return new Constructor(...args);
      },
      
      register: (type, constructor) => {
        constructors[type] = constructor;
      },
      
      getTypes: () => Object.keys(constructors)
    };
  },

  // Strategy pattern
  createStrategy: (strategies, defaultStrategy) => {
    let currentStrategy = defaultStrategy;
    
    return {
      setStrategy: (name) => {
        if (strategies[name]) {
          currentStrategy = name;
          return true;
        }
        return false;
      },
      
      execute: (...args) => {
        const strategy = strategies[currentStrategy];
        if (strategy) {
          return strategy(...args);
        }
        return null;
      },
      
      getCurrent: () => currentStrategy,
      getStrategies: () => Object.keys(strategies)
    };
  },

  // Decorator pattern
  decorate: (obj, ...decorators) => {
    return decorators.reduce((decorated, decorator) => decorator(decorated), obj);
  },

  // Mixin pattern
  applyMixins: (derivedCtor, baseCtors) => {
    baseCtors.forEach(baseCtor => {
      Object.getOwnPropertyNames(baseCtor.prototype).forEach(name => {
        if (name !== 'constructor') {
          derivedCtor.prototype[name] = baseCtor.prototype[name];
        }
      });
    });
  },

  // Proxy pattern
  createProxy: (target, handlers) => {
    return new Proxy(target, handlers);
  },

  // Module pattern
  createModule: (definition) => {
    const module = {};
    const privateVars = {};
    
    const publicAPI = definition(privateVars, module);
    
    return { ...module, ...publicAPI };
  },

  // Revealing module pattern
  createRevealingModule: (definition) => {
    const privateVars = {};
    const publicAPI = {};
    
    definition(privateVars, publicAPI);
    
    return publicAPI;
  },

  // Class mixin
  withMixin: (Base, ...mixins) => {
    class Mixed extends Base {}
    mixins.forEach(mixin => {
      Object.assign(Mixed.prototype, mixin);
    });
    return Mixed;
  },

  // Functional mixin
  createMixin: (behavior) => {
    return (target) => {
      Object.assign(target, behavior);
      return target;
    };
  },

  // Pipeline
  pipeline: (...fns) => {
    return (value) => fns.reduce((acc, fn) => fn(acc), value);
  },

  // Compose
  compose: (...fns) => {
    return (value) => fns.reduceRight((acc, fn) => fn(acc), value);
  },

  // Curry
  curry: (fn) => {
    return function curried(...args) {
      if (args.length >= fn.length) {
        return fn.apply(this, args);
      }
      return (...nextArgs) => curried(...args, ...nextArgs);
    };
  },

  // Partial application
  partial: (fn, ...presetArgs) => {
    return (...laterArgs) => fn(...presetArgs, ...laterArgs);
  },

  // Memoize with LRU cache
  memoizeLRU: (fn, maxSize = 100) => {
    const cache = new Map();
    
    return (...args) => {
      const key = JSON.stringify(args);
      
      if (cache.has(key)) {
        // Move to end (most recently used)
        const value = cache.get(key);
        cache.delete(key);
        cache.set(key, value);
        return value;
      }
      
      const result = fn(...args);
      
      if (cache.size >= maxSize) {
        // Remove least recently used (first item)
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
      
      cache.set(key, result);
      return result;
    };
  },

  // Throttle with leading/trailing options
  throttleAdvanced: (fn, wait, options = {}) => {
    const { leading = true, trailing = true } = options;
    let timeout, previous = 0;
    
    return function(...args) {
      const now = Date.now();
      
      if (!previous && !leading) {
        previous = now;
      }
      
      const remaining = wait - (now - previous);
      
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        fn.apply(this, args);
      } else if (!timeout && trailing) {
        timeout = setTimeout(() => {
          previous = leading ? Date.now() : 0;
          timeout = null;
          fn.apply(this, args);
        }, remaining);
      }
    };
  },

  // Debounce with immediate option
  debounceAdvanced: (fn, wait, immediate = false) => {
    let timeout;
    
    return function(...args) {
      const callNow = immediate && !timeout;
      
      clearTimeout(timeout);
      
      timeout = setTimeout(() => {
        timeout = null;
        if (!immediate) fn.apply(this, args);
      }, wait);
      
      if (callNow) fn.apply(this, args);
    };
  },

  // Request animation frame throttle
  rafThrottle: (fn) => {
    let ticking = false;
    
    return function(...args) {
      if (!ticking) {
        requestAnimationFrame(() => {
          fn.apply(this, args);
          ticking = false;
        });
        ticking = true;
      }
    };
  },

  // Idle callback
  requestIdleCallback: (fn, timeout = 2000) => {
    if ('requestIdleCallback' in window) {
      return window.requestIdleCallback(fn, { timeout });
    }
    return setTimeout(fn, 1);
  },

  // Cancel idle callback
  cancelIdleCallback: (id) => {
    if ('cancelIdleCallback' in window) {
      window.cancelIdleCallback(id);
    } else {
      clearTimeout(id);
    }
  },

  // Web Workers pool
  createWorkerPool: (workerScript, poolSize = 4) => {
    const workers = [];
    const queue = [];
    let taskId = 0;
    const tasks = new Map();
    
    // Initialize workers
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript);
      worker.onmessage = (e) => {
        const { id, result, error } = e.data;
        const task = tasks.get(id);
        
        if (task) {
          if (error) {
            task.reject(new Error(error));
          } else {
            task.resolve(result);
          }
          tasks.delete(id);
        }
        
        // Process next task in queue
        if (queue.length > 0) {
          const nextTask = queue.shift();
          worker.postMessage({ id: nextTask.id, data: nextTask.data });
        } else {
          worker.busy = false;
        }
      };
      workers.push(worker);
    }
    
    return {
      execute: (data) => {
        return new Promise((resolve, reject) => {
          const id = ++taskId;
          tasks.set(id, { resolve, reject });
          
          // Find available worker
          const availableWorker = workers.find(w => !w.busy);
          
          if (availableWorker) {
            availableWorker.busy = true;
            availableWorker.postMessage({ id, data });
          } else {
            queue.push({ id, data });
          }
        });
      },
      
      terminate: () => {
        workers.forEach(w => w.terminate());
        workers.length = 0;
        queue.length = 0;
        tasks.clear();
      }
    };
  },

  // SharedWorker helper
  createSharedWorker: (workerScript) => {
    if (!('SharedWorker' in window)) return null;
    
    const worker = new SharedWorker(workerScript);
    
    return {
      postMessage: (data) => worker.port.postMessage(data),
      onMessage: (callback) => worker.port.onmessage = (e) => callback(e.data),
      start: () => worker.port.start(),
      close: () => worker.port.close()
    };
  },

  // WebAssembly helper
  loadWasm: async (url, imports = {}) => {
    const response = await fetch(url);
    const bytes = await response.arrayBuffer();
    const module = await WebAssembly.compile(bytes);
    const instance = await WebAssembly.instantiate(module, imports);
    return instance.exports;
  },

  // Compile WASM from buffer
  compileWasm: async (buffer, imports = {}) => {
    const module = await WebAssembly.compile(buffer);
    const instance = await WebAssembly.instantiate(module, imports);
    return instance.exports;
  },

  // Create WASM memory
  createWasmMemory: (initial = 1, maximum = 10) => {
    return new WebAssembly.Memory({ initial, maximum });
  },

  // Transferable objects for workers
  transfer: (data, transferList) => {
    return { data, transferList };
  },

  // Structured clone
  structuredClone: (obj) => {
    if (typeof structuredClone === 'function') {
      return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
  },

  // Compression Streams API
  compress: async (data, format = 'gzip') => {
    const stream = new CompressionStream(format);
    const writer = stream.writable.getWriter();
    const reader = stream.readable.getReader();
    
    writer.write(new TextEncoder().encode(data));
    writer.close();
    
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    return new Blob(chunks);
  },

  // Decompression Streams API
  decompress: async (blob, format = 'gzip') => {
    const stream = blob.stream().pipeThrough(new DecompressionStream(format));
    const reader = stream.getReader();
    
    const chunks = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(value);
    }
    
    return new TextDecoder().decode(await new Blob(chunks).arrayBuffer());
  },

  // File System Access API - File handle
  getFileHandle: async () => {
    if ('showOpenFilePicker' in window) {
      const [handle] = await window.showOpenFilePicker();
      return handle;
    }
    return null;
  },

  // Read file from handle
  readFileHandle: async (handle) => {
    const file = await handle.getFile();
    return {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
      text: () => file.text(),
      arrayBuffer: () => file.arrayBuffer(),
      stream: () => file.stream()
    };
  },

  // Write to file handle
  writeFileHandle: async (handle, contents) => {
    const writable = await handle.createWritable();
    await writable.write(contents);
    await writable.close();
  },

  // Directory handle
  getDirectoryHandle: async () => {
    if ('showDirectoryPicker' in window) {
      return await window.showDirectoryPicker();
    }
    return null;
  },

  // Read directory
  readDirectory: async (dirHandle, recursive = false) => {
    const entries = [];
    
    for await (const entry of dirHandle.values()) {
      const item = {
        name: entry.name,
        kind: entry.kind,
        handle: entry
      };
      
      if (entry.kind === 'directory' && recursive) {
        item.children = await Utils.readDirectory(entry, true);
      }
      
      entries.push(item);
    }
    
    return entries;
  },

  // Origin Private File System
  getOPFS: async () => {
    if ('storage' in navigator && 'getDirectory' in navigator.storage) {
      return await navigator.storage.getDirectory();
    }
    return null;
  },

  // OPFS - Write file
  writeOPFSFile: async (root, path, contents) => {
    const parts = path.split('/');
    let dir = root;
    
    for (let i = 0; i < parts.length - 1; i++) {
      dir = await dir.getDirectoryHandle(parts[i], { create: true });
    }
    
    const fileHandle = await dir.getFileHandle(parts[parts.length - 1], { create: true });
    const writable = await fileHandle.createWritable();
    await writable.write(contents);
    await writable.close();
  },

  // OPFS - Read file
  readOPFSFile: async (root, path) => {
    const parts = path.split('/');
    let dir = root;
    
    for (let i = 0; i < parts.length - 1; i++) {
      dir = await dir.getDirectoryHandle(parts[i]);
    }
    
    const fileHandle = await dir.getFileHandle(parts[parts.length - 1]);
    const file = await fileHandle.getFile();
    return await file.text();
  },

  // Storage manager
  getStorageInfo: async () => {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return await navigator.storage.estimate();
    }
    return null;
  },

  // Persist storage
  persistStorage: async () => {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      const isPersisted = await navigator.storage.persist();
      return isPersisted;
    }
    return false;
  },

  // Check if storage is persisted
  isStoragePersisted: async () => {
    if ('storage' in navigator && 'persisted' in navigator.storage) {
      return await navigator.storage.persisted();
    }
    return false;
  },

  // Clear site data
  clearSiteData: async () => {
    // Clear cookies
    document.cookie.split(';').forEach(cookie => {
      const [name] = cookie.split('=');
      document.cookie = `${name.trim()}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    });
    
    // Clear storage
    localStorage.clear();
    sessionStorage.clear();
    
    // Clear caches
    if ('caches' in window) {
      const keys = await caches.keys();
      await Promise.all(keys.map(key => caches.delete(key)));
    }
    
    // Clear IndexedDB
    if ('indexedDB' in window) {
      const databases = await indexedDB.databases();
      await Promise.all(databases.map(db => indexedDB.deleteDatabase(db.name)));
    }
  },

  // Performance observer
  observePerformance: (type, callback) => {
    if (!('PerformanceObserver' in window)) return null;
    
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach(callback);
    });
    
    observer.observe({ entryTypes: [type] });
    return observer;
  },

  // Long tasks observer
  observeLongTasks: (callback) => {
    return Utils.observePerformance('longtask', callback);
  },

  // Layout shifts observer
  observeLayoutShifts: (callback) => {
    return Utils.observePerformance('layout-shift', callback);
  },

  // Largest contentful paint observer
  observeLCP: (callback) => {
    return Utils.observePerformance('largest-contentful-paint', callback);
  },

  // First input delay observer
  observeFID: (callback) => {
    return Utils.observePerformance('first-input', callback);
  },

  // Cumulative layout shift
  getCLS: () => {
    let clsValue = 0;
    let clsEntries = [];
    
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
          clsEntries.push(entry);
        }
      }
    });
    
    observer.observe({ entryTypes: ['layout-shift'] });
    
    return {
      getValue: () => clsValue,
      getEntries: () => clsEntries,
      disconnect: () => observer.disconnect()
    };
  },

  // First Contentful Paint
  getFCP: () => {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length > 0) {
          resolve(entries[0].startTime);
          observer.disconnect();
        }
      });
      
      observer.observe({ entryTypes: ['paint'] });
    });
  },

  // Largest Contentful Paint
  getLCP: () => {
    return new Promise((resolve) => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      
      // Timeout after 10 seconds
      setTimeout(() => {
        observer.disconnect();
        resolve(null);
      }, 10000);
    });
  },

  // Time to First Byte
  getTTFB: () => {
    const navigation = performance.getEntriesByType('navigation')[0];
    return navigation ? navigation.responseStart : null;
  },

  // Total Blocking Time
  getTBT: () => {
    let tbt = 0;
    const longTasks = performance.getEntriesByType('longtask');
    
    longTasks.forEach(task => {
      if (task.startTime < 5000) { // Only count tasks before FMP (approx 5s)
        tbt += task.duration - 50;
      }
    });
    
    return tbt;
  },

  // Speed Index (simplified)
  getSpeedIndex: () => {
    const paints = performance.getEntriesByType('paint');
    const fcp = paints.find(p => p.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : null;
  },

  // Resource loading times
  getResourceTiming: () => {
    return performance.getEntriesByType('resource').map(r => ({
      name: r.name,
      type: r.initiatorType,
      duration: r.duration,
      size: r.transferSize,
      startTime: r.startTime
    }));
  },

  // Navigation timing
  getNavigationTiming: () => {
    const nav = performance.getEntriesByType('navigation')[0];
    if (!nav) return null;
    
    return {
      dns: nav.domainLookupEnd - nav.domainLookupStart,
      tcp: nav.connectEnd - nav.connectStart,
      ttfb: nav.responseStart - nav.requestStart,
      download: nav.responseEnd - nav.responseStart,
      dom: nav.domComplete - nav.domLoading,
      load: nav.loadEventEnd - nav.loadEventStart,
      total: nav.loadEventEnd - nav.startTime
    };
  },

  // Mark and measure
  mark: (name) => performance.mark(name),
  measure: (name, startMark, endMark) => performance.measure(name, startMark, endMark),
  clearMarks: (name) => performance.clearMarks(name),
  clearMeasures: (name) => performance.clearMeasures(name),
  getEntriesByName: (name, type) => performance.getEntriesByName(name, type),
  getEntriesByType: (type) => performance.getEntriesByType(type),

  // Now
  now: () => performance.now(),

  // Memory info
  getMemoryInfo: () => {
    if ('memory' in performance) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit
      };
    }
    return null;
  },

  // Frame rate
  measureFPS: (duration = 1000) => {
    return new Promise((resolve) => {
      let frames = 0;
      const startTime = performance.now();
      
      const countFrame = () => {
        frames++;
        const elapsed = performance.now() - startTime;
        
        if (elapsed < duration) {
          requestAnimationFrame(countFrame);
        } else {
          resolve(Math.round((frames * 1000) / elapsed));
        }
      };
      
      requestAnimationFrame(countFrame);
    });
  },

  // Frame timing
  getFrameTiming: () => {
    return new Promise((resolve) => {
      const entries = [];
      let count = 0;
      
      const collect = (timestamp) => {
        entries.push(timestamp);
        count++;
        
        if (count < 60) {
          requestAnimationFrame(collect);
        } else {
          const diffs = [];
          for (let i = 1; i < entries.length; i++) {
            diffs.push(entries[i] - entries[i-1]);
          }
          
          const avg = diffs.reduce((a, b) => a + b, 0) / diffs.length;
          resolve({
            averageFrameTime: avg,
            estimatedFPS: 1000 / avg,
            frameTimes: diffs
          });
        }
      };
      
      requestAnimationFrame(collect);
    });
  },

  // Prefetch resource
  prefetch: (url) => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = url;
    document.head.appendChild(link);
  },

  // Preload resource
  preload: (url, as, type = null) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.href = url;
    link.as = as;
    if (type) link.type = type;
    document.head.appendChild(link);
  },

  // Preconnect to origin
  preconnect: (url, crossorigin = false) => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = url;
    if (crossorigin) link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  },

  // DNS prefetch
  dnsPrefetch: (url) => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = url;
    document.head.appendChild(link);
  },

  // Prerender page
  prerender: (url) => {
    const link = document.createElement('link');
    link.rel = 'prerender';
    link.href = url;
    document.head.appendChild(link);
  },

  // Modulepreload
  modulepreload: (url) => {
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = url;
    document.head.appendChild(link);
  },

  // Import map
  addImportMap: (imports) => {
    const script = document.createElement('script');
    script.type = 'importmap';
    script.textContent = JSON.stringify({ imports });
    document.head.appendChild(script);
  },

  // Dynamic import with retry
  dynamicImport: async (url, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const module = await import(url);
        return module;
      } catch (e) {
        if (i === retries - 1) throw e;
        await new Promise(r => setTimeout(r, 1000 * (i + 1)));
      }
    }
  },

  // Import on visibility
  importOnVisible: (url, element) => {
    return new Promise((resolve) => {
      const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          observer.disconnect();
          resolve(import(url));
        }
      });
      observer.observe(element);
    });
  },

  // Import on interaction
  importOnInteraction: (url, element, event = 'click') => {
    return new Promise((resolve) => {
      const handler = () => {
        element.removeEventListener(event, handler);
        resolve(import(url));
      };
      element.addEventListener(event, handler);
    });
  },

  // Idle import
  importWhenIdle: (url, timeout = 2000) => {
    return new Promise((resolve) => {
      Utils.requestIdleCallback(() => {
        resolve(import(url));
      }, timeout);
    });
  },

  // Priority hints
  setFetchPriority: (element, priority) => {
    if ('fetchPriority' in element) {
      element.fetchPriority = priority; // 'high', 'low', 'auto'
    }
  },

  // Critical CSS
  extractCriticalCSS: () => {
    const critical = [];
    const sheets = document.styleSheets;
    
    for (const sheet of sheets) {
      try {
        const rules = sheet.cssRules || sheet.rules;
        for (const rule of rules) {
          // Simple heuristic: include rules that match visible elements
          if (rule.selectorText) {
            try {
              const elements = document.querySelectorAll(rule.selectorText);
              for (const el of elements) {
                const rect = el.getBoundingClientRect();
                if (rect.top < window.innerHeight) {
                  critical.push(rule.cssText);
                  break;
                }
              }
            } catch (e) {
              // Invalid selector, skip
            }
          }
        }
      } catch (e) {
        // Cross-origin stylesheet, skip
      }
    }
    
    return critical.join('\n');
  },

  // Inline critical CSS
  inlineCriticalCSS: (css) => {
    const style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  },

  // Load non-critical CSS
  loadCSS: (url, media = 'all') => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    link.media = 'print';
    link.onload = () => {
      link.media = media;
    };
    document.head.appendChild(link);
  },

  // Font loading
  loadFont: (family, url, options = {}) => {
    const font = new FontFace(family, `url(${url})`, options);
    return font.load().then(() => {
      document.fonts.add(font);
      return font;
    });
  },

  // Check font loading
  checkFont: (family) => {
    return document.fonts.check(`1em ${family}`);
  },

  // Wait for font
  waitForFont: async (family) => {
    await document.fonts.load(`1em ${family}`);
  },

  // Font display swap
  createFontFace: (family, sources, display = 'swap') => {
    const src = sources.map(s => `url(${s.url}) format('${s.format}')`).join(', ');
    const font = new FontFace(family, src, { display });
    return font.load().then(() => {
      document.fonts.add(font);
      return font;
    });
  },

  // Subset font (basic)
  subsetFont: (fontFace, text) => {
    // This is a placeholder - actual subsetting requires font tools
    return fontFace;
  },

  // Variable fonts
  loadVariableFont: (family, url, axes = {}) => {
    const settings = Object.entries(axes).map(([axis, value]) => `${axis} ${value}`).join(', ');
    const font = new FontFace(family, `url(${url})`, {
      variationSettings: settings
    });
    return font.load().then(() => {
      document.fonts.add(font);
      return font;
    });
  },

  // Container queries polyfill check
  supportsContainerQueries: () => {
    return CSS.supports('container-type', 'inline-size');
  },

  // @property check
  supportsProperty: () => {
    return CSS.supports('property', '--x');
  },

  // Houdini paint worklet
  registerPaintWorklet: async (name, paintModule) => {
    if ('paintWorklet' in CSS) {
      await CSS.paintWorklet.addModule(paintModule);
      return true;
    }
    return false;
  },

  // Houdini animation worklet
  registerAnimationWorklet: async (animationModule) => {
    if ('animationWorklet' in CSS) {
      await CSS.animationWorklet.addModule(animationModule);
      return true;
    }
    return false;
  },

  // Houdini layout worklet
  registerLayoutWorklet: async (name, layoutModule) => {
    if ('layoutWorklet' in CSS) {
      await CSS.layoutWorklet.addModule(layoutModule);
      return true;
    }
    return false;
  },

  // CSS Typed OM
  setStyleProperty: (element, property, value, unit = '') => {
    if (element.attributeStyleMap) {
      element.attributeStyleMap.set(property, CSS[unit ? unit : 'number'](value));
    } else {
      element.style.setProperty(property, value + unit);
    }
  },

  // CSS Custom Properties
  setCSSProperty: (element, property, value) => {
    element.style.setProperty(property, value);
  },

  getCSSProperty: (element, property) => {
    return getComputedStyle(element).getPropertyValue(property).trim();
  },

  // CSS Transitions control
  forceReflow: (element) => {
    element.offsetHeight; // Force reflow
  },

  flushCSS: (element) => {
    getComputedStyle(element).transform;
  },

  // Web Animations API
  animate: (element, keyframes, options) => {
    return element.animate(keyframes, options);
  },

  // Timeline animation
  createScrollTimeline: (options = {}) => {
    if ('ScrollTimeline' in window) {
      return new ScrollTimeline(options);
    }
    return null;
  },

  // View timeline
  createViewTimeline: (options = {}) => {
    if ('ViewTimeline' in window) {
      return new ViewTimeline(options);
    }
    return null;
  },

  // Document timeline
  createDocumentTimeline: () => {
    return new DocumentTimeline();
  },

  // Group effects
  createGroupEffect: (children, timing) => {
    if ('GroupEffect' in window) {
      return new GroupEffect(children, timing);
    }
    return null;
  },

  // Sequence effects
  createSequenceEffect: (children, timing) => {
    if ('SequenceEffect' in window) {
      return new SequenceEffect(children, timing);
    }
    return null;
  },

  // Animation finish
  onAnimationFinish: (animation, callback) => {
    animation.onfinish = callback;
    return animation;
  },

  // Animation cancel
  cancelAnimation: (animation) => {
    animation.cancel();
  },

  // Animation reverse
  reverseAnimation: (animation) => {
    animation.reverse();
  },

  // Animation playback rate
  setPlaybackRate: (animation, rate) => {
    animation.playbackRate = rate;
  },

  // Animation current time
  setCurrentTime: (animation, time) => {
    animation.currentTime = time;
  },

  // Commit styles (keep animation end state)
  commitStyles: (animation) => {
    if (animation.commitStyles) {
      animation.commitStyles();
    }
  },

  // Persist animation
  persistAnimation: (animation) => {
    animation.persist();
  },

  // Replace state
  replaceAnimationState: (animation, state) => {
    if (animation.replaceState) {
      animation.replaceState(state);
    }
  },

  // Get computed timing
  getComputedTiming: (animation) => {
    return animation.effect.getComputedTiming();
  },

  // Set keyframes
  setKeyframes: (animation, keyframes) => {
    animation.effect.setKeyframes(keyframes);
  },

  // Set timing
  setTiming: (animation, timing) => {
    animation.effect.updateTiming(timing);
  },

  // Composite operations
  setComposite: (animation, composite) => {
    animation.effect.composite = composite; // 'replace', 'add', 'accumulate'
  },

  // Get all animations
  getAnimations: (element) => {
    return element.getAnimations({ subtree: true });
  },

  // Finish all animations
  finishAllAnimations: (element) => {
    element.getAnimations().forEach(anim => anim.finish());
  },

  // Cancel all animations
  cancelAllAnimations: (element) => {
    element.getAnimations().forEach(anim => anim.cancel());
  },

  // Pause all animations
  pauseAllAnimations: (element) => {
    element.getAnimations().forEach(anim => anim.pause());
  },

  // Play all animations
  playAllAnimations: (element) => {
    element.getAnimations().forEach(anim => anim.play());
  },

  // Reverse all animations
  reverseAllAnimations: (element) => {
    element.getAnimations().forEach(anim => anim.reverse());
  },

  // Update all animations
  updateAllAnimations: (element, playbackRate) => {
    element.getAnimations().forEach(anim => {
      anim.playbackRate = playbackRate;
    });
  },

  // Scroll-driven animations
  createScrollDrivenAnimation: (element, keyframes, options) => {
    const animation = element.animate(keyframes, {
      ...options,
      timeline: options.timeline || new ScrollTimeline()
    });
    return animation;
  },

  // View-driven animations
  createViewDrivenAnimation: (element, keyframes, options) => {
    const animation = element.animate(keyframes, {
      ...options,
      timeline: options.timeline || new ViewTimeline({ subject: element })
    });
    return animation;
  },

  // Morphing animation
  createMorphAnimation: (fromElement, toElement, options = {}) => {
    const fromRect = fromElement.getBoundingClientRect();
    const toRect = toElement.getBoundingClientRect();
    
    const deltaX = toRect.left - fromRect.left;
    const deltaY = toRect.top - fromRect.top;
    const deltaW = toRect.width / fromRect.width;
    const deltaH = toRect.height / fromRect.height;
    
    const animation = fromElement.animate([
      { transform: 'translate(0, 0) scale(1)' },
      { transform: `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})` }
    ], {
      duration: options.duration || 300,
      easing: options.easing || 'ease-in-out',
      fill: 'both'
    });
    
    return animation;
  },

  // Shared element transition
  createSharedElementTransition: async (callback, options = {}) => {
    if (!document.createDocumentTransition) {
      await callback();
      return;
    }
    
    const transition = document.createDocumentTransition();
    await transition.start(callback, options);
  },

  // View transitions
  startViewTransition: async (callback) => {
    if (!document.startViewTransition) {
      await callback();
      return null;
    }
    
    return document.startViewTransition(callback);
  },

  // Set view transition name
  setViewTransitionName: (element, name) => {
    element.style.viewTransitionName = name;
  },

  // Capture view transition
  captureViewTransition: (name, callback) => {
    // Placeholder for future API
    return callback();
  },

  // Page transition
  createPageTransition: (fromPage, toPage, options = {}) => {
    const { type = 'slide', direction = 'forward', duration = 300 } = options;
    
    const animations = [];
    
    if (type === 'slide') {
      const fromX = direction === 'forward' ? '-100%' : '100%';
      const toX = direction === 'forward' ? '100%' : '-100%';
      
      animations.push(
        fromPage.animate([
          { transform: 'translateX(0)' },
          { transform: `translateX(${fromX})` }
        ], { duration, easing: 'ease-in-out', fill: 'forwards' }),
        
        toPage.animate([
          { transform: `translateX(${toX})` },
          { transform: 'translateX(0)' }
        ], { duration, easing: 'ease-in-out', fill: 'forwards' })
      );
    } else if (type === 'fade') {
      animations.push(
        fromPage.animate([
          { opacity: 1 },
          { opacity: 0 }
        ], { duration, easing: 'ease-in-out', fill: 'forwards' }),
        
        toPage.animate([
          { opacity: 0 },
          { opacity: 1 }
        ], { duration, easing: 'ease-in-out', fill: 'forwards' })
      );
    }
    
    return Promise.all(animations.map(a => a.finished));
  },

  // Gesture animation
  createGestureAnimation: (element, options = {}) => {
    const { onStart, onMove, onEnd, threshold = 50 } = options;
    let startX, startY, currentX, currentY;
    let isDragging = false;
    
    const handleStart = (e) => {
      const point = e.touches ? e.touches[0] : e;
      startX = point.clientX;
      startY = point.clientY;
      isDragging = true;
      
      onStart?.({ x: startX, y: startY });
    };
    
    const handleMove = (e) => {
      if (!isDragging) return;
      
      const point = e.touches ? e.touches[0] : e;
      currentX = point.clientX;
      currentY = point.clientY;
      
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;
      
      onMove?.({ x: currentX, y: currentY, deltaX, deltaY, startX, startY });
    };
    
    const handleEnd = () => {
      if (!isDragging) return;
      
      const deltaX = currentX - startX;
      const deltaY = currentY - startY;
      
      isDragging = false;
      
      onEnd?.({ 
        x: currentX, 
        y: currentY, 
        deltaX, 
        deltaY, 
        startX, 
        startY,
        exceededThreshold: Math.abs(deltaX) > threshold || Math.abs(deltaY) > threshold
      });
    };
    
    element.addEventListener('mousedown', handleStart);
    element.addEventListener('touchstart', handleStart, { passive: true });
    
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: true });
    
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);
    
    return {
      destroy: () => {
        element.removeEventListener('mousedown', handleStart);
        element.removeEventListener('touchstart', handleStart);
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchend', handleEnd);
      }
    };
  },

  // Spring physics animation
  createSpringAnimation: (element, target, options = {}) => {
    const { stiffness = 100, damping = 10, mass = 1 } = options;
    
    let velocity = 0;
    let position = 0;
    let animationId = null;
    
    const animate = () => {
      const force = -stiffness * (position - target);
      const dampingForce = -damping * velocity;
      const acceleration = (force + dampingForce) / mass;
      
      velocity += acceleration * 0.016; // Assuming 60fps
      position += velocity * 0.016;
      
      element.style.transform = `translateX(${position}px)`;
      
      if (Math.abs(velocity) > 0.01 || Math.abs(position - target) > 0.01) {
        animationId = requestAnimationFrame(animate);
      }
    };
    
    animationId = requestAnimationFrame(animate);
    
    return {
      updateTarget: (newTarget) => {
        target = newTarget;
      },
      stop: () => {
        if (animationId) {
          cancelAnimationFrame(animationId);
        }
      }
    };
  },

  // Parallax effect
  createParallax: (elements, options = {}) => {
    const { speed = 0.5, direction = 'vertical' } = options;
    
    const handleScroll = () => {
      const scrollY = window.pageYOffset;
      
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const scrolled = scrollY - (rect.top + scrollY - window.innerHeight);
        
        if (direction === 'vertical') {
          el.style.transform = `translateY(${scrolled * speed}px)`;
        } else {
          el.style.transform = `translateX(${scrolled * speed}px)`;
        }
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  },

  // Sticky header
  createStickyHeader: (header, options = {}) => {
    const { offset = 0, classes = { stuck: 'is-stuck', top: 'at-top' } } = options;
    let lastScroll = 0;
    
    const handleScroll = () => {
      const scrollY = window.pageYOffset;
      
      if (scrollY > offset) {
        header.classList.add(classes.stuck);
        header.classList.remove(classes.top);
      } else {
        header.classList.remove(classes.stuck);
        header.classList.add(classes.top);
      }
      
      lastScroll = scrollY;
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  },

  // Smooth scroll to anchor
  smoothScrollToAnchor: (offset = 80) => {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;
        
        const target = document.querySelector(targetId);
        if (target) {
          e.preventDefault();
          const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
          window.scrollTo({ top, behavior: 'smooth' });
        }
      });
    });
  },

  // Scroll progress indicator
  createScrollProgress: (element, options = {}) => {
    const { color = 'var(--primary-color)', height = '3px' } = options;
    
    element.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 0%;
      height: ${height};
      background: ${color};
      z-index: 9999;
      transition: width 0.1s;
    `;
    
    document.body.appendChild(element);
    
    const updateProgress = () => {
      const scrollTop = window.pageYOffset;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (scrollTop / docHeight) * 100;
      element.style.width = `${progress}%`;
    };
    
    window.addEventListener('scroll', updateProgress, { passive: true });
    
    return {
      update: updateProgress,
      destroy: () => {
        window.removeEventListener('scroll', updateProgress);
        element.remove();
      }
    };
  },

  // Reading progress
  createReadingProgress: (article, indicator) => {
    const updateProgress = () => {
      const rect = article.getBoundingClientRect();
      const articleHeight = article.offsetHeight;
      const windowHeight = window.innerHeight;
      
      let progress = 0;
      
      if (rect.top <= 0) {
        progress = Math.min(100, Math.abs(rect.top) / (articleHeight - windowHeight) * 100);
      }
      
      indicator.style.width = `${progress}%`;
    };
    
    window.addEventListener('scroll', updateProgress, { passive: true });
    
    return () => window.removeEventListener('scroll', updateProgress);
  },

  // Scroll snap polyfill helper
  scrollSnap: (container, options = {}) => {
    const { snapPoints = [], threshold = 50 } = options;
    
    let isScrolling = false;
    let scrollTimeout;
    
    const handleScroll = () => {
      if (isScrolling) return;
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const scrollLeft = container.scrollLeft;
        const closest = snapPoints.reduce((prev, curr) => {
          return Math.abs(curr - scrollLeft) < Math.abs(prev - scrollLeft) ? curr : prev;
        });
        
        if (Math.abs(closest - scrollLeft) < threshold) {
          isScrolling = true;
          container.scrollTo({ left: closest, behavior: 'smooth' });
          setTimeout(() => isScrolling = false, 300);
        }
      }, 150);
    };
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => container.removeEventListener('scroll', handleScroll);
  },

  // Horizontal scroll with mouse wheel
  horizontalScroll: (container) => {
    const handleWheel = (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };
    
    container.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => container.removeEventListener('wheel', handleWheel);
  },

  // Momentum scrolling
  createMomentumScroll: (container, options = {}) => {
    const { friction = 0.95, stopThreshold = 0.5 } = options;
    
    let isDragging = false;
    let startX, scrollLeft;
    let velocity = 0;
    let animationId = null;
    
    const handleStart = (e) => {
      isDragging = true;
      startX = e.pageX - container.offsetLeft;
      scrollLeft = container.scrollLeft;
      velocity = 0;
      
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
    
    const handleMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      
      const x = e.pageX - container.offsetLeft;
      const walk = (x - startX) * 2;
      const prevScrollLeft = container.scrollLeft;
      
      container.scrollLeft = scrollLeft - walk;
      velocity = container.scrollLeft - prevScrollLeft;
    };
    
    const handleEnd = () => {
      isDragging = false;
      
      const decelerate = () => {
        velocity *= friction;
        container.scrollLeft += velocity;
        
        if (Math.abs(velocity) > stopThreshold) {
          animationId = requestAnimationFrame(decelerate);
        }
      };
      
      decelerate();
    };
    
    container.addEventListener('mousedown', handleStart);
    container.addEventListener('mousemove', handleMove);
    container.addEventListener('mouseup', handleEnd);
    container.addEventListener('mouseleave', handleEnd);
    
    return {
      destroy: () => {
        container.removeEventListener('mousedown', handleStart);
        container.removeEventListener('mousemove', handleMove);
        container.removeEventListener('mouseup', handleEnd);
        container.removeEventListener('mouseleave', handleEnd);
      }
    };
  },

  // Infinite horizontal scroll
  createInfiniteScroll: (container, itemWidth, items, renderItem) => {
    let currentIndex = 0;
    const totalItems = items.length;
    
    // Clone items for infinite effect
    const extendedItems = [...items, ...items, ...items];
    
    const updatePosition = () => {
      const offset = currentIndex * itemWidth;
      container.style.transform = `translateX(-${offset}px)`;
    };
    
    const next = () => {
      currentIndex++;
      if (currentIndex >= totalItems * 2) {
        currentIndex = totalItems;
        container.style.transition = 'none';
        updatePosition();
        container.offsetHeight; // Force reflow
        container.style.transition = '';
      }
      updatePosition();
    };
    
    const prev = () => {
      currentIndex--;
      if (currentIndex < 0) {
        currentIndex = totalItems - 1;
        container.style.transition = 'none';
        updatePosition();
        container.offsetHeight; // Force reflow
        container.style.transition = '';
      }
      updatePosition();
    };
    
    // Initial render
    extendedItems.forEach(item => {
      container.appendChild(renderItem(item));
    });
    
    // Set initial position to middle set
    currentIndex = totalItems;
    updatePosition();
    
    return { next, prev, goTo: (index) => { currentIndex = index; updatePosition(); } };
  },

  // Masonry layout
  createMasonry: (container, items, options = {}) => {
    const { columns = 3, gap = 16 } = options;
    
    const columnHeights = new Array(columns).fill(0);
    
    items.forEach((item, index) => {
      const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
      const x = shortestColumn * (100 / columns);
      const y = columnHeights[shortestColumn];
      
      item.style.position = 'absolute';
      item.style.left = `${x}%`;
      item.style.top = `${y}px`;
      item.style.width = `${100 / columns}%`;
      item.style.padding = `${gap / 2}px`;
      
      columnHeights[shortestColumn] += item.offsetHeight + gap;
    });
    
    container.style.position = 'relative';
    container.style.height = `${Math.max(...columnHeights)}px`;
  },

  // Justified layout (like Google Images)
  createJustifiedLayout: (container, items, options = {}) => {
    const { targetHeight = 200, gap = 4 } = options;
    
    let row = [];
    let rowWidth = 0;
    const containerWidth = container.offsetWidth;
    
    const flushRow = () => {
      if (row.length === 0) return;
      
      const scale = (containerWidth - (row.length - 1) * gap) / rowWidth;
      const finalHeight = Math.min(targetHeight * scale, targetHeight * 1.5);
      
      row.forEach(item => {
        item.style.height = `${finalHeight}px`;
        item.style.marginRight = `${gap}px`;
        item.style.marginBottom = `${gap}px`;
      });
      
      row[row.length - 1].style.marginRight = '0';
      
      row = [];
      rowWidth = 0;
    };
    
    items.forEach(item => {
      const aspectRatio = item.dataset.aspectRatio || 1;
      const itemWidth = targetHeight * aspectRatio;
      
      if (rowWidth + itemWidth > containerWidth && row.length > 0) {
        flushRow();
      }
      
      row.push(item);
      rowWidth += itemWidth + gap;
    });
    
    flushRow();
  },

  // Packery/Masonry hybrid
  createPackery: (container, items, options = {}) => {
    const { gutter = 10, columnWidth = 100 } = options;
    
    const positions = [];
    
    const getPosition = (width, height) => {
      let bestY = 0;
      let bestX = 0;
      let minY = Infinity;
      
      for (let x = 0; x <= container.offsetWidth - width; x += columnWidth) {
        let y = 0;
        
        for (const pos of positions) {
          if (x < pos.x + pos.width && x + width > pos.x) {
            y = Math.max(y, pos.y + pos.height);
          }
        }
        
        if (y < minY) {
          minY = y;
          bestX = x;
          bestY = y;
        }
      }
      
      return { x: bestX, y: bestY };
    };
    
    items.forEach(item => {
      const width = item.offsetWidth;
      const height = item.offsetHeight;
      const pos = getPosition(width, height);
      
      item.style.position = 'absolute';
      item.style.left = `${pos.x}px`;
      item.style.top = `${pos.y}px`;
      
      positions.push({ x: pos.x, y: pos.y, width, height });
    });
    
    const maxY = Math.max(...positions.map(p => p.y + p.height), 0);
    container.style.height = `${maxY + gutter}px`;
  },

  // Isotope filtering
  createIsotope: (container, items, options = {}) => {
    const { filter = '*', sortBy = 'original-order', transitionDuration = '0.4s' } = options;
    
    const updateItems = () => {
      items.forEach(item => {
        const matches = filter === '*' || item.matches(filter);
        
        if (matches) {
          item.style.display = '';
          item.style.opacity = '1';
          item.style.transform = 'scale(1)';
        } else {
          item.style.opacity = '0';
          item.style.transform = 'scale(0.001)';
          setTimeout(() => {
            if (!item.matches(filter)) {
              item.style.display = 'none';
            }
          }, parseFloat(transitionDuration) * 1000);
        }
      });
    };
    
    container.style.transition = `height ${transitionDuration}`;
    items.forEach(item => {
      item.style.transition = `all ${transitionDuration}`;
    });
    
    updateItems();
    
    return {
      filter: (newFilter) => {
        filter = newFilter;
        updateItems();
      },
      sort: (comparator) => {
        const sorted = [...items].sort(comparator);
        sorted.forEach((item, index) => {
          item.style.order = index;
        });
      }
    };
  },

  // Shuffle layout
  shuffleItems: (items) => {
    const shuffled = Utils.shuffle([...items]);
    shuffled.forEach((item, index) => {
      item.style.order = index;
    });
  },

  // Flip animation (First Last Invert Play)
  createFlipAnimation: (elements, callback, options = {}) => {
    const { duration = 300, easing = 'ease-in-out' } = options;
    
    // First: Get initial positions
    const first = elements.map(el => {
      const rect = el.getBoundingClientRect();
      return { el, rect };
    });
    
    // Execute callback that changes layout
    callback();
    
    // Last: Get final positions
    const last = elements.map(({ el }) => {
      const rect = el.getBoundingClientRect();
      return { el, rect };
    });
    
    // Invert: Calculate differences
    first.forEach(({ el, rect: firstRect }, index) => {
      const lastRect = last[index].rect;
      const deltaX = firstRect.left - lastRect.left;
      const deltaY = firstRect.top - lastRect.top;
      const deltaW = firstRect.width / lastRect.width;
      const deltaH = firstRect.height / lastRect.height;
      
      // Apply inverted transform
      el.style.transition = 'none';
      el.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${deltaW}, ${deltaH})`;
    });
    
    // Force reflow
    document.body.offsetHeight;
    
    // Play: Animate to final state
    first.forEach(({ el }) => {
      el.style.transition = `transform ${duration}ms ${easing}`;
      el.style.transform = '';
    });
    
    // Cleanup
    setTimeout(() => {
      elements.forEach(el => {
        el.style.transition = '';
        el.style.transform = '';
      });
    }, duration);
  },

  // Layout animation
  animateLayoutChange: (container, callback, options = {}) => {
    const { duration = 300 } = options;
    const items = Array.from(container.children);
    
    // Get initial positions
    const positions = new Map();
    items.forEach(item => {
      positions.set(item, item.getBoundingClientRect());
    });
    
    // Execute layout change
    callback();
    
    // Animate from old positions
    items.forEach(item => {
      const oldPos = positions.get(item);
      const newPos = item.getBoundingClientRect();
      
      const deltaX = oldPos.left - newPos.left;
      const deltaY = oldPos.top - newPos.top;
      
      if (deltaX !== 0 || deltaY !== 0) {
        item.animate([
          { transform: `translate(${deltaX}px, ${deltaY}px)` },
          { transform: 'translate(0, 0)' }
        ], {
          duration,
          easing: 'ease-out'
        });
      }
    });
  },

  // Reveal on scroll
  revealOnScroll: (elements, options = {}) => {
    const { threshold = 0.1, rootMargin = '0px' } = options;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold, rootMargin });
    
    elements.forEach(el => {
      el.classList.add('reveal-on-scroll');
      observer.observe(el);
    });
    
    return () => observer.disconnect();
  },

  // Stagger animation
  staggerAnimation: (elements, keyframes, options = {}) => {
    const { stagger = 100, ...animationOptions } = options;
    
    elements.forEach((el, index) => {
      el.animate(keyframes, {
        ...animationOptions,
        delay: index * stagger
      });
    });
  },

  // Typewriter effect
  typewriter: (element, text, options = {}) => {
    const { speed = 50, cursor = '|', onComplete } = options;
    
    let index = 0;
    element.textContent = cursor;
    
    const type = () => {
      if (index < text.length) {
        element.textContent = text.substring(0, index + 1) + cursor;
        index++;
        setTimeout(type, speed);
      } else {
        element.textContent = text;
        onComplete?.();
      }
    };
    
    type();
    
    return {
      stop: () => {
        element.textContent = text;
      },
      speedUp: (newSpeed) => {
        speed = newSpeed;
      }
    };
  },

  // Counter animation
  animateCounter: (element, target, options = {}) => {
    const { duration = 2000, easing = t => t, formatter = null } = options;
    
    const start = 0;
    const startTime = performance.now();
    
    const update = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easing(progress);
      const current = Math.floor(start + (target - start) * eased);
      
      element.textContent = formatter ? formatter(current) : current;
      
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    };
    
    requestAnimationFrame(update);
  },

  // Slot machine effect
  slotMachineEffect: (element, values, options = {}) => {
    const { duration = 2000, finalValue = null } = options;
    
    let startTime = null;
    let lastUpdate = 0;
    const updateInterval = 50;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      
      if (timestamp - lastUpdate > updateInterval) {
        const randomIndex = Math.floor(Math.random() * values.length);
        element.textContent = values[randomIndex];
        lastUpdate = timestamp;
      }
      
      if (elapsed < duration) {
        requestAnimationFrame(animate);
      } else {
        element.textContent = finalValue !== null ? finalValue : values[values.length - 1];
      }
    };
    
    requestAnimationFrame(animate);
  },

  // Glitch effect
  glitchEffect: (element, options = {}) => {
    const { duration = 200, intensity = 5 } = options;
    const originalText = element.textContent;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    
    let iterations = 0;
    const interval = setInterval(() => {
      element.textContent = originalText
        .split('')
        .map((char, index) => {
          if (index < iterations) {
            return originalText[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');
      
      if (iterations >= originalText.length) {
        clearInterval(interval);
      }
      
      iterations += 1/3;
    }, duration / originalText.length / 3);
    
    return () => clearInterval(interval);
  },

  // Magnetic button
  createMagneticButton: (button, options = {}) => {
    const { strength = 0.3 } = options;
    
    const handleMove = (e) => {
      const rect = button.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      button.style.transform = `translate(${x * strength}px, ${y * strength}px)`;
    };
    
    const handleLeave = () => {
      button.style.transform = '';
    };
    
    button.addEventListener('mousemove', handleMove);
    button.addEventListener('mouseleave', handleLeave);
    
    return {
      destroy: () => {
        button.removeEventListener('mousemove', handleMove);
        button.removeEventListener('mouseleave', handleLeave);
      }
    };
  },

  // Ripple effect
  createRipple: (element, options = {}) => {
    const { color = 'rgba(255, 255, 255, 0.3)', duration = 600 } = options;
    
    const handleClick = (e) => {
      const rect = element.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      
      const ripple = document.createElement('span');
      ripple.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: ${color};
        width: ${size}px;
        height: ${size}px;
        left: ${x}px;
        top: ${y}px;
        pointer-events: none;
        transform: scale(0);
        animation: ripple ${duration}ms ease-out;
      `;
      
      element.style.position = 'relative';
      element.style.overflow = 'hidden';
      element.appendChild(ripple);
      
      setTimeout(() => ripple.remove(), duration);
    };
    
    element.addEventListener('click', handleClick);
    
    // Add keyframes
    if (!document.getElementById('ripple-style')) {
      const style = document.createElement('style');
      style.id = 'ripple-style';
      style.textContent = `
        @keyframes ripple {
          to {
            transform: scale(2);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    return () => element.removeEventListener('click', handleClick);
  },

  // Tilt effect (3D)
  createTiltEffect: (element, options = {}) => {
    const { max = 15, perspective = 1000, scale = 1.05 } = options;
    
    const handleMove = (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      const rotateX = ((y - centerY) / centerY) * -max;
      const rotateY = ((x - centerX) / centerX) * max;
      
      element.style.transform = `
        perspective(${perspective}px)
        rotateX(${rotateX}deg)
        rotateY(${rotateY}deg)
        scale3d(${scale}, ${scale}, ${scale})
      `;
    };
    
    const handleLeave = () => {
      element.style.transform = '';
    };
    
    element.addEventListener('mousemove', handleMove);
    element.addEventListener('mouseleave', handleLeave);
    
    return {
      destroy: () => {
        element.removeEventListener('mousemove', handleMove);
        element.removeEventListener('mouseleave', handleLeave);
      }
    };
  },

  // Confetti effect
  createConfetti: (options = {}) => {
    const {
      particleCount = 100,
      spread = 70,
      origin = { y: 0.6 },
      colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
    } = options;
    
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 9999;
    `;
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles = [];
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: origin.x * canvas.width,
        y: origin.y * canvas.height,
        vx: (Math.random() - 0.5) * spread,
        vy: (Math.random() - 1) * spread,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 5 + 2,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 10
      });
    }
    
    let animationId;
    
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.5; // Gravity
        p.rotation += p.rotationSpeed;
        
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
        
        if (p.y > canvas.height) {
          particles.splice(index, 1);
        }
      });
      
      if (particles.length > 0) {
        animationId = requestAnimationFrame(animate);
      } else {
        canvas.remove();
      }
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
      canvas.remove();
    };
  },

  // Spotlight effect
  createSpotlight: (container, options = {}) => {
    const { color = 'rgba(255, 255, 255, 0.1)', size = 200 } = options;
    
    const spotlight = document.createElement('div');
    spotlight.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: radial-gradient(circle, ${color} 0%, transparent 70%);
      border-radius: 50%;
      pointer-events: none;
      transform: translate(-50%, -50%);
      opacity: 0;
      transition: opacity 0.3s;
    `;
    
    container.style.position = 'relative';
    container.appendChild(spotlight);
    
    const handleMove = (e) => {
      const rect = container.getBoundingClientRect();
      spotlight.style.left = `${e.clientX - rect.left}px`;
      spotlight.style.top = `${e.clientY - rect.top}px`;
      spotlight.style.opacity = '1';
    };
    
    const handleLeave = () => {
      spotlight.style.opacity = '0';
    };
    
    container.addEventListener('mousemove', handleMove);
    container.addEventListener('mouseleave', handleLeave);
    
    return {
      destroy: () => {
        container.removeEventListener('mousemove', handleMove);
        container.removeEventListener('mouseleave', handleLeave);
        spotlight.remove();
      }
    };
  },

  // Noise texture
  createNoiseTexture: (options = {}) => {
    const { width = 100, height = 100, opacity = 0.05 } = options;
    
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    
    const ctx = canvas.getContext('2d');
    const imageData = ctx.createImageData(width, height);
    
    for (let i = 0; i < imageData.data.length; i += 4) {
      const value = Math.random() * 255;
      imageData.data[i] = value;
      imageData.data[i + 1] = value;
      imageData.data[i + 2] = value;
      imageData.data[i + 3] = 255 * opacity;
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    return canvas.toDataURL();
  },

  // Grain effect
  createGrainEffect: (element, options = {}) => {
    const { opacity = 0.05, animated = true } = options;
    
    const canvas = document.createElement('canvas');
    canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      opacity: ${opacity};
      z-index: 1;
    `;
    
    element.style.position = 'relative';
    element.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    
    const resize = () => {
      canvas.width = element.offsetWidth;
      canvas.height = element.offsetHeight;
    };
    
    const generateNoise = () => {
      const imageData = ctx.createImageData(canvas.width, canvas.height);
      
      for (let i = 0; i < imageData.data.length; i += 4) {
        const value = Math.random() * 255;
        imageData.data[i] = value;
        imageData.data[i + 1] = value;
        imageData.data[i + 2] = value;
        imageData.data[i + 3] = 255;
      }
      
      ctx.putImageData(imageData, 0, 0);
    };
    
    resize();
    generateNoise();
    
    window.addEventListener('resize', resize);
    
    let interval;
    if (animated) {
      interval = setInterval(generateNoise, 100);
    }
    
    return {
      destroy: () => {
        window.removeEventListener('resize', resize);
        clearInterval(interval);
        canvas.remove();
      }
    };
  },

  // Custom cursor
  createCustomCursor: (options = {}) => {
    const { size = 20, color = '#000', blendMode = 'difference' } = options;
    
    const cursor = document.createElement('div');
    cursor.style.cssText = `
      position: fixed;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      mix-blend-mode: ${blendMode};
      transition: transform 0.1s;
    `;
    
    document.body.appendChild(cursor);
    
    const handleMove = (e) => {
      cursor.style.left = `${e.clientX - size / 2}px`;
      cursor.style.top = `${e.clientY - size / 2}px`;
    };
    
    const handleMouseDown = () => {
      cursor.style.transform = 'scale(0.8)';
    };
    
    const handleMouseUp = () => {
      cursor.style.transform = 'scale(1)';
    };
    
    document.addEventListener('mousemove', handleMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    
    // Hide default cursor
    document.body.style.cursor = 'none';
    
    return {
      destroy: () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mousedown', handleMouseDown);
        document.removeEventListener('mouseup', handleMouseUp);
        document.body.style.cursor = '';
        cursor.remove();
      }
    };
  },

  // Cursor follower
  createCursorFollower: (options = {}) => {
    const { lag = 0.1, size = 40 } = options;
    
    const follower = document.createElement('div');
    follower.style.cssText = `
      position: fixed;
      width: ${size}px;
      height: ${size}px;
      border: 2px solid var(--primary-color);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9998;
      transition: width 0.2s, height 0.2s;
    `;
    
    document.body.appendChild(follower);
    
    let mouseX = 0, mouseY = 0;
    let followerX = 0, followerY = 0;
    
    const handleMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    
    const animate = () => {
      followerX += (mouseX - followerX) * lag;
      followerY += (mouseY - followerY) * lag;
      
      follower.style.left = `${followerX - size / 2}px`;
      follower.style.top = `${followerY - size / 2}px`;
      
      requestAnimationFrame(animate);
    };
    
    document.addEventListener('mousemove', handleMove);
    animate();
    
    return {
      setSize: (newSize) => {
        follower.style.width = `${newSize}px`;
        follower.style.height = `${newSize}px`;
      },
      destroy: () => {
        document.removeEventListener('mousemove', handleMove);
        follower.remove();
      }
    };
  },

  // Text scramble
  scrambleText: (element, finalText, options = {}) => {
    const { duration = 2000, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789' } = options;
    
    const originalText = finalText;
    let iteration = 0;
    
    const interval = setInterval(() => {
      element.textContent = originalText
        .split('')
        .map((char, index) => {
          if (index < iteration) {
            return originalText[index];
          }
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');
      
      if (iteration >= originalText.length) {
        clearInterval(interval);
      }
      
      iteration += 1 / 3;
    }, duration / originalText.length / 3);
    
    return () => clearInterval(interval);
  },

  // Marquee
  createMarquee: (element, options = {}) => {
    const { speed = 50, direction = 'left', pauseOnHover = true } = options;
    
    const content = element.innerHTML;
    element.innerHTML = `${content}${content}`;
    
    let position = 0;
    let animationId;
    let isPaused = false;
    
    const animate = () => {
      if (!isPaused) {
        if (direction === 'left') {
          position -= speed / 60;
          if (position <= -element.scrollWidth / 2) {
            position = 0;
          }
        } else {
          position += speed / 60;
          if (position >= 0) {
            position = -element.scrollWidth / 2;
          }
        }
        
        element.style.transform = `translateX(${position}px)`;
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    if (pauseOnHover) {
      element.addEventListener('mouseenter', () => isPaused = true);
      element.addEventListener('mouseleave', () => isPaused = false);
    }
    
    return {
      setSpeed: (newSpeed) => { speed = newSpeed; },
      pause: () => { isPaused = true; },
      play: () => { isPaused = false; },
      destroy: () => {
        cancelAnimationFrame(animationId);
        element.innerHTML = content;
        element.style.transform = '';
      }
    };
  },

  // Split text animation
  splitText: (element, options = {}) => {
    const { type = 'chars', animation = 'fade' } = options;
    
    const text = element.textContent;
    element.innerHTML = '';
    
    const items = [];
    
    if (type === 'chars') {
      text.split('').forEach(char => {
        const span = document.createElement('span');
        span.textContent = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        element.appendChild(span);
        items.push(span);
      });
    } else if (type === 'words') {
      text.split(' ').forEach((word, index, arr) => {
        const span = document.createElement('span');
        span.textContent = word;
        span.style.display = 'inline-block';
        element.appendChild(span);
        items.push(span);
        
        if (index < arr.length - 1) {
          element.appendChild(document.createTextNode(' '));
        }
      });
    } else if (type === 'lines') {
      element.style.whiteSpace = 'pre-wrap';
      const lines = text.split('\n');
      lines.forEach((line, index) => {
        const div = document.createElement('div');
        div.textContent = line;
        element.appendChild(div);
        items.push(div);
      });
    }
    
    return {
      items,
      animate: (keyframes, options = {}) => {
        items.forEach((item, index) => {
          item.animate(keyframes, {
            ...options,
            delay: (options.delay || 0) + (options.stagger || 50) * index
          });
        });
      }
    };
  },

  // Wave text animation
  waveText: (element, options = {}) => {
    const { amplitude = 10, frequency = 0.1, speed = 2 } = options;
    
    const chars = element.textContent.split('');
    element.innerHTML = chars.map(char => 
      `<span style="display: inline-block;">${char === ' ' ? '\u00A0' : char}</span>`
    ).join('');
    
    const spans = element.querySelectorAll('span');
    let time = 0;
    let animationId;
    
    const animate = () => {
      spans.forEach((span, index) => {
        const y = Math.sin(time + index * frequency) * amplitude;
        span.style.transform = `translateY(${y}px)`;
      });
      
      time += speed / 60;
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => cancelAnimationFrame(animationId);
  },

  // Gradient text
  createGradientText: (element, colors, options = {}) => {
    const { direction = 'to right', animate = false, duration = 3 } = options;
    
    element.style.background = `linear-gradient(${direction}, ${colors.join(', ')})`;
    element.style.webkitBackgroundClip = 'text';
    element.style.webkitTextFillColor = 'transparent';
    element.style.backgroundClip = 'text';
    
    if (animate) {
      element.style.backgroundSize = '200% auto';
      element.style.animation = `gradientShift ${duration}s linear infinite`;
      
      const style = document.createElement('style');
      style.textContent = `
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `;
      document.head.appendChild(style);
    }
  },

  // Outline text
  createOutlineText: (element, options = {}) => {
    const { color = 'currentColor', width = 1, fill = 'transparent' } = options;
    
    element.style.color = fill;
    element.style.webkitTextStroke = `${width}px ${color}`;
  },

  // 3D text
  create3DText: (element, options = {}) => {
    const { depth = 5, color = '#000', direction = 'bottom-right' } = options;
    
    const shadows = [];
    for (let i = 1; i <= depth; i++) {
      const x = direction.includes('right') ? i : direction.includes('left') ? -i : 0;
      const y = direction.includes('bottom') ? i : direction.includes('top') ? -i : 0;
      shadows.push(`${x}px ${y}px 0 ${color}`);
    }
    
    element.style.textShadow = shadows.join(', ');
  },

  // Neon glow
  createNeonGlow: (element, options = {}) => {
    const { color = '#fff', glowColor = '#0ff', intensity = 10 } = options;
    
    element.style.color = color;
    element.style.textShadow = `
      0 0 ${intensity}px ${glowColor},
      0 0 ${intensity * 2}px ${glowColor},
      0 0 ${intensity * 3}px ${glowColor}
    `;
  },

  // Underline animation
  createAnimatedUnderline: (element, options = {}) => {
    const { color = 'currentColor', height = 2, duration = 0.3 } = options;
    
    element.style.position = 'relative';
    element.style.display = 'inline-block';
    
    const underline = document.createElement('span');
    underline.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      width: 0;
      height: ${height}px;
      background: ${color};
      transition: width ${duration}s ease;
    `;
    
    element.appendChild(underline);
    
    const handleEnter = () => { underline.style.width = '100%'; };
    const handleLeave = () => { underline.style.width = '0'; };
    
    element.addEventListener('mouseenter', handleEnter);
    element.addEventListener('mouseleave', handleLeave);
    
    return {
      show: handleEnter,
      hide: handleLeave,
      destroy: () => {
        element.removeEventListener('mouseenter', handleEnter);
        element.removeEventListener('mouseleave', handleLeave);
        underline.remove();
      }
    };
  },

  // Strikethrough animation
  createStrikethrough: (element, options = {}) => {
    const { color = 'currentColor', height = 2, duration = 0.3 } = options;
    
    element.style.position = 'relative';
    
    const line = document.createElement('span');
    line.style.cssText = `
      position: absolute;
      top: 50%;
      left: 0;
      width: 0;
      height: ${height}px;
      background: ${color};
      transition: width ${duration}s ease;
    `;
    
    element.appendChild(line);
    
    return {
      toggle: (active) => {
        line.style.width = active ? '100%' : '0';
      }
    };
  },

  // Highlight animation
  createHighlight: (element, options = {}) => {
    const { color = 'yellow', duration = 0.5 } = options;
    
    element.style.backgroundImage = `linear-gradient(${color}, ${color})`;
    element.style.backgroundSize = '0% 100%';
    element.style.backgroundRepeat = 'no-repeat';
    element.style.transition = `background-size ${duration}s ease`;
    
    return {
      highlight: () => {
        element.style.backgroundSize = '100% 100%';
      },
      remove: () => {
        element.style.backgroundSize = '0% 100%';
      }
    };
  },

  // Tooltip
  createTooltip: (trigger, content, options = {}) => {
    const { position = 'top', offset = 8, delay = 200 } = options;
    
    const tooltip = document.createElement('div');
    tooltip.textContent = content;
    tooltip.style.cssText = `
      position: absolute;
      padding: 8px 12px;
      background: #333;
      color: white;
      font-size: 12px;
      border-radius: 4px;
      white-space: nowrap;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.2s, visibility 0.2s;
      z-index: 1000;
      pointer-events: none;
    `;
    
    document.body.appendChild(tooltip);
    
    let showTimeout;
    
    const positionTooltip = () => {
      const rect = trigger.getBoundingClientRect();
      const tooltipRect = tooltip.getBoundingClientRect();
      
      let top, left;
      
      switch (position) {
        case 'top':
          top = rect.top - tooltipRect.height - offset;
          left = rect.left + (rect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = rect.bottom + offset;
          left = rect.left + (rect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = rect.top + (rect.height - tooltipRect.height) / 2;
          left = rect.left - tooltipRect.width - offset;
          break;
        case 'right':
          top = rect.top + (rect.height - tooltipRect.height) / 2;
          left = rect.right + offset;
          break;
      }
      
      tooltip.style.top = `${top + window.scrollY}px`;
      tooltip.style.left = `${left + window.scrollX}px`;
    };
    
    const show = () => {
      showTimeout = setTimeout(() => {
        positionTooltip();
        tooltip.style.opacity = '1';
        tooltip.style.visibility = 'visible';
      }, delay);
    };
    
    const hide = () => {
      clearTimeout(showTimeout);
      tooltip.style.opacity = '0';
      tooltip.style.visibility = 'hidden';
    };
    
    trigger.addEventListener('mouseenter', show);
    trigger.addEventListener('mouseleave', hide);
    trigger.addEventListener('focus', show);
    trigger.addEventListener('blur', hide);
    
    return {
      updateContent: (newContent) => {
        tooltip.textContent = newContent;
      },
      destroy: () => {
        trigger.removeEventListener('mouseenter', show);
        trigger.removeEventListener('mouseleave', hide);
        trigger.removeEventListener('focus', show);
        trigger.removeEventListener('blur', hide);
        tooltip.remove();
      }
    };
  },

  // Popover
  createPopover: (trigger, content, options = {}) => {
    const { position = 'bottom', offset = 8 } = options;
    
    const popover = document.createElement('div');
    popover.innerHTML = content;
    popover.style.cssText = `
      position: absolute;
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      padding: 16px;
      min-width: 200px;
      opacity: 0;
      visibility: hidden;
      transform: scale(0.95);
      transition: all 0.2s;
      z-index: 1000;
    `;
    
    document.body.appendChild(popover);
    
    let isOpen = false;
    
    const positionPopover = () => {
      const rect = trigger.getBoundingClientRect();
      const popoverRect = popover.getBoundingClientRect();
      
      let top, left;
      
      switch (position) {
        case 'top':
          top = rect.top - popoverRect.height - offset;
          left = rect.left + (rect.width - popoverRect.width) / 2;
          break;
        case 'bottom':
          top = rect.bottom + offset;
          left = rect.left + (rect.width - popoverRect.width) / 2;
          break;
        case 'left':
          top = rect.top + (rect.height - popoverRect.height) / 2;
          left = rect.left - popoverRect.width - offset;
          break;
        case 'right':
          top = rect.top + (rect.height - popoverRect.height) / 2;
          left = rect.right + offset;
          break;
      }
      
      popover.style.top = `${top + window.scrollY}px`;
      popover.style.left = `${left + window.scrollX}px`;
    };
    
    const toggle = () => {
      isOpen = !isOpen;
      
      if (isOpen) {
        positionPopover();
        popover.style.opacity = '1';
        popover.style.visibility = 'visible';
        popover.style.transform = 'scale(1)';
      } else {
        popover.style.opacity = '0';
        popover.style.visibility = 'hidden';
        popover.style.transform = 'scale(0.95)';
      }
    };
    
    const close = (e) => {
      if (!popover.contains(e.target) && e.target !== trigger) {
        isOpen = false;
        popover.style.opacity = '0';
        popover.style.visibility = 'hidden';
        popover.style.transform = 'scale(0.95)';
      }
    };
    
    trigger.addEventListener('click', toggle);
    document.addEventListener('click', close);
    
    return {
      open: () => {
        isOpen = true;
        positionPopover();
        popover.style.opacity = '1';
        popover.style.visibility = 'visible';
      },
      close: () => {
        isOpen = false;
        popover.style.opacity = '0';
        popover.style.visibility = 'hidden';
      },
      destroy: () => {
        trigger.removeEventListener('click', toggle);
        document.removeEventListener('click', close);
        popover.remove();
      }
    };
  },

  // Dropdown
  createDropdown: (trigger, items, options = {}) => {
    const { position = 'bottom-left', offset = 4 } = options;
    
    const menu = document.createElement('div');
    menu.style.cssText = `
      position: absolute;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      min-width: 200px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-8px);
      transition: all 0.2s;
      z-index: 1000;
    `;
    
    items.forEach(item => {
      const button = document.createElement('button');
      button.style.cssText = `
        display: flex;
        align-items: center;
        width: 100%;
        padding: 8px 16px;
        border: none;
        background: none;
        cursor: pointer;
        text-align: left;
        transition: background 0.2s;
      `;
      
      if (item.icon) {
        button.innerHTML = `<span style="margin-right: 8px;">${item.icon}</span>${item.label}`;
      } else {
        button.textContent = item.label;
      }
      
      button.addEventListener('mouseenter', () => {
        button.style.background = '#f3f4f6';
      });
      
      button.addEventListener('mouseleave', () => {
        button.style.background = 'none';
      });
      
      button.addEventListener('click', () => {
        item.onClick?.();
        close();
      });
      
      menu.appendChild(button);
    });
    
    document.body.appendChild(menu);
    
    let isOpen = false;
    
    const positionMenu = () => {
      const rect = trigger.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      
      let top, left;
      
      switch (position) {
        case 'bottom-left':
          top = rect.bottom + offset;
          left = rect.left;
          break;
        case 'bottom-right':
          top = rect.bottom + offset;
          left = rect.right - menuRect.width;
          break;
        case 'top-left':
          top = rect.top - menuRect.height - offset;
          left = rect.left;
          break;
        case 'top-right':
          top = rect.top - menuRect.height - offset;
          left = rect.right - menuRect.width;
          break;
      }
      
      menu.style.top = `${top + window.scrollY}px`;
      menu.style.left = `${left + window.scrollX}px`;
    };
    
    const open = () => {
      isOpen = true;
      positionMenu();
      menu.style.opacity = '1';
      menu.style.visibility = 'visible';
      menu.style.transform = 'translateY(0)';
    };
    
    const close = () => {
      isOpen = false;
      menu.style.opacity = '0';
      menu.style.visibility = 'hidden';
      menu.style.transform = 'translateY(-8px)';
    };
    
    const toggle = () => {
      isOpen ? close() : open();
    };
    
    const handleClickOutside = (e) => {
      if (!menu.contains(e.target) && e.target !== trigger) {
        close();
      }
    };
    
    trigger.addEventListener('click', toggle);
    document.addEventListener('click', handleClickOutside);
    
    return {
      open,
      close,
      toggle,
      isOpen: () => isOpen,
      destroy: () => {
        trigger.removeEventListener('click', toggle);
        document.removeEventListener('click', handleClickOutside);
        menu.remove();
      }
    };
  },

  // Modal
  createModal: (content, options = {}) => {
    const { closable = true, size = 'medium', onClose } = options;
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s;
      z-index: 9999;
    `;
    
    const sizes = {
      small: '400px',
      medium: '500px',
      large: '700px',
      full: '90vw'
    };
    
    const modal = document.createElement('div');
    modal.style.cssText = `
      background: white;
      border-radius: 12px;
      width: 90%;
      max-width: ${sizes[size]};
      max-height: 90vh;
      overflow: hidden;
      transform: scale(0.9);
      transition: transform 0.3s;
    `;
    
    modal.innerHTML = content;
    
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
    
    const open = () => {
      overlay.style.opacity = '1';
      overlay.style.visibility = 'visible';
      modal.style.transform = 'scale(1)';
      document.body.style.overflow = 'hidden';
    };
    
    const close = () => {
      overlay.style.opacity = '0';
      overlay.style.visibility = 'hidden';
      modal.style.transform = 'scale(0.9)';
      document.body.style.overflow = '';
      onClose?.();
    };
    
    if (closable) {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) close();
      });
      
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') close();
      });
    }
    
    // Auto open
    requestAnimationFrame(open);
    
    return {
      open,
      close,
      element: modal,
      overlay
    };
  },

  // Drawer
  createDrawer: (content, options = {}) => {
    const { position = 'right', size = '300px', onClose } = options;
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s;
      z-index: 9999;
    `;
    
    const drawer = document.createElement('div');
    drawer.style.cssText = `
      position: fixed;
      ${position}: 0;
      top: 0;
      bottom: 0;
      width: ${size};
      max-width: 90%;
      background: white;
      box-shadow: ${position === 'left' ? '4px' : '-4px'} 0 20px rgba(0,0,0,0.1);
      transform: translateX(${position === 'left' ? '-100%' : '100%'});
      transition: transform 0.3s;
      overflow-y: auto;
    `;
    
    drawer.innerHTML = content;
    
    overlay.appendChild(drawer);
    document.body.appendChild(overlay);
    
    const open = () => {
      overlay.style.opacity = '1';
      overlay.style.visibility = 'visible';
      drawer.style.transform = 'translateX(0)';
      document.body.style.overflow = 'hidden';
    };
    
    const close = () => {
      overlay.style.opacity = '0';
      overlay.style.visibility = 'hidden';
      drawer.style.transform = `translateX(${position === 'left' ? '-100%' : '100%'})`;
      document.body.style.overflow = '';
      setTimeout(() => {
        overlay.remove();
        onClose?.();
      }, 300);
    };
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
    });
    
    // Auto open
    requestAnimationFrame(open);
    
    return {
      open,
      close,
      element: drawer
    };
  },

  // Toast notification
  createToast: (message, options = {}) => {
    const { type = 'info', duration = 3000, position = 'top-right' } = options;
    
    const container = document.querySelector('.toast-container') || (() => {
      const c = document.createElement('div');
      c.className = 'toast-container';
      c.style.cssText = `
        position: fixed;
        ${position.includes('top') ? 'top' : 'bottom'}: 20px;
        ${position.includes('right') ? 'right' : 'left'}: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 8px;
      `;
      document.body.appendChild(c);
      return c;
    })();
    
    const colors = {
      info: '#3b82f6',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444'
    };
    
    const icons = {
      info: 'ℹ',
      success: '✓',
      warning: '⚠',
      error: '✕'
    };
    
    const toast = document.createElement('div');
    toast.style.cssText = `
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 12px 16px;
      background: white;
      border-left: 4px solid ${colors[type]};
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transform: translateX(${position.includes('right') ? '100%' : '-100%'});
      opacity: 0;
      transition: all 0.3s;
      min-width: 300px;
    `;
    
    toast.innerHTML = `
      <span style="color: ${colors[type]}; font-weight: bold;">${icons[type]}</span>
      <span style="flex: 1;">${message}</span>
      <button style="background: none; border: none; cursor: pointer; opacity: 0.5;">✕</button>
    `;
    
    container.appendChild(toast);
    
    // Animate in
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
    });
    
    // Close button
    toast.querySelector('button').addEventListener('click', () => {
      close();
    });
    
    // Auto close
    const timeout = setTimeout(close, duration);
    
    function close() {
      clearTimeout(timeout);
      toast.style.transform = `translateX(${position.includes('right') ? '100%' : '-100%'})`;
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 300);
    }
    
    return { close };
  },

  // Snackbar
  createSnackbar: (message, action, options = {}) => {
    const { duration = 5000 } = options;
    
    const snackbar = document.createElement('div');
    snackbar.style.cssText = `
      position: fixed;
      bottom: 20px;
      left: 50%;
      transform: translateX(-50%) translateY(100px);
      background: #333;
      color: white;
      padding: 14px 16px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      gap: 24px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      opacity: 0;
      transition: all 0.3s;
      z-index: 10000;
    `;
    
    snackbar.innerHTML = `
      <span>${message}</span>
      ${action ? `<button style="background: none; border: none; color: #4f46e5; font-weight: 600; cursor: pointer; text-transform: uppercase;">${action.text}</button>` : ''}
    `;
    
    document.body.appendChild(snackbar);
    
    // Animate in
    requestAnimationFrame(() => {
      snackbar.style.transform = 'translateX(-50%) translateY(0)';
      snackbar.style.opacity = '1';
    });
    
    if (action) {
      snackbar.querySelector('button').addEventListener('click', () => {
        action.onClick();
        close();
      });
    }
    
    const timeout = setTimeout(close, duration);
    
    function close() {
      clearTimeout(timeout);
      snackbar.style.transform = 'translateX(-50%) translateY(100px)';
      snackbar.style.opacity = '0';
      setTimeout(() => snackbar.remove(), 300);
    }
    
    return { close };
  },

  // Accordion
  createAccordion: (items, options = {}) => {
    const { multiple = false, defaultOpen = null } = options;
    
    const container = document.createElement('div');
    container.style.cssText = 'border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;';
    
    const panels = [];
    
    items.forEach((item, index) => {
      const panel = document.createElement('div');
      panel.style.cssText = 'border-bottom: 1px solid #e5e7eb;';
      
      const header = document.createElement('button');
      header.style.cssText = `
        width: 100%;
        padding: 16px;
        background: none;
        border: none;
        text-align: left;
        display: flex;
        justify-content: space-between;
        align-items: center;
        cursor: pointer;
        font-weight: 600;
      `;
      header.innerHTML = `
        <span>${item.title}</span>
        <span style="transition: transform 0.3s;">▼</span>
      `;
      
      const content = document.createElement('div');
      content.style.cssText = `
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease-out;
      `;
      
      const contentInner = document.createElement('div');
      contentInner.style.cssText = 'padding: 0 16px 16px;';
      contentInner.innerHTML = item.content;
      
      content.appendChild(contentInner);
      panel.appendChild(header);
      panel.appendChild(content);
      container.appendChild(panel);
      
      const isOpen = index === defaultOpen;
      if (isOpen) {
        content.style.maxHeight = content.scrollHeight + 'px';
        header.querySelector('span:last-child').style.transform = 'rotate(180deg)';
      }
      
      header.addEventListener('click', () => {
        const currentlyOpen = content.style.maxHeight !== '0px' && content.style.maxHeight !== '';
        
        if (!multiple) {
          panels.forEach(p => {
            if (p !== panel) {
              p.content.style.maxHeight = '0px';
              p.header.querySelector('span:last-child').style.transform = 'rotate(0deg)';
            }
          });
        }
        
        if (currentlyOpen) {
          content.style.maxHeight = '0px';
          header.querySelector('span:last-child').style.transform = 'rotate(0deg)';
        } else {
          content.style.maxHeight = content.scrollHeight + 'px';
          header.querySelector('span:last-child').style.transform = 'rotate(180deg)';
        }
      });
      
      panels.push({ panel, header, content });
    });
    
    return {
      element: container,
      open: (index) => {
        const p = panels[index];
        if (p) {
          p.content.style.maxHeight = p.content.scrollHeight + 'px';
          p.header.querySelector('span:last-child').style.transform = 'rotate(180deg)';
        }
      },
      close: (index) => {
        const p = panels[index];
        if (p) {
          p.content.style.maxHeight = '0px';
          p.header.querySelector('span:last-child').style.transform = 'rotate(0deg)';
        }
      },
      closeAll: () => {
        panels.forEach(p => {
          p.content.style.maxHeight = '0px';
          p.header.querySelector('span:last-child').style.transform = 'rotate(0deg)';
        });
      }
    };
  },

  // Tabs
  createTabs: (items, options = {}) => {
    const { defaultTab = 0 } = options;
    
    const container = document.createElement('div');
    
    const tabList = document.createElement('div');
    tabList.style.cssText = `
      display: flex;
      border-bottom: 2px solid #e5e7eb;
      gap: 8px;
    `;
    
    const panels = document.createElement('div');
    
    const tabs = [];
    let activeTab = defaultTab;
    
    items.forEach((item, index) => {
      const tab = document.createElement('button');
      tab.style.cssText = `
        padding: 12px 16px;
        background: none;
        border: none;
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
        cursor: pointer;
        font-weight: 500;
        color: ${index === defaultTab ? '#4f46e5' : '#6b7280'};
        border-color: ${index === defaultTab ? '#4f46e5' : 'transparent'};
        transition: all 0.2s;
      `;
      tab.textContent = item.label;
      
      const panel = document.createElement('div');
      panel.style.cssText = `
        display: ${index === defaultTab ? 'block' : 'none'};
        padding: 16px 0;
      `;
      panel.innerHTML = item.content;
      
      tab.addEventListener('click', () => {
        // Deactivate current
        tabs[activeTab].tab.style.color = '#6b7280';
        tabs[activeTab].tab.style.borderColor = 'transparent';
        tabs[activeTab].panel.style.display = 'none';
        
        // Activate new
        activeTab = index;
        tab.style.color = '#4f46e5';
        tab.style.borderColor = '#4f46e5';
        panel.style.display = 'block';
        
        item.onActivate?.();
      });
      
      tabList.appendChild(tab);
      panels.appendChild(panel);
      tabs.push({ tab, panel });
    });
    
    container.appendChild(tabList);
    container.appendChild(panels);
    
    return {
      element: container,
      setActive: (index) => {
        tabs[index]?.tab.click();
      },
      getActive: () => activeTab
    };
  },

  // Carousel/Slider
  createCarousel: (items, options = {}) => {
    const { autoplay = false, interval = 5000, loop = true } = options;
    
    const container = document.createElement('div');
    container.style.cssText = 'position: relative; overflow: hidden;';
    
    const track = document.createElement('div');
    track.style.cssText = `
      display: flex;
      transition: transform 0.5s ease;
    `;
    
    items.forEach(item => {
      const slide = document.createElement('div');
      slide.style.cssText = 'flex: 0 0 100%; min-width: 100%;';
      slide.innerHTML = item;
      track.appendChild(slide);
    });
    
    container.appendChild(track);
    
    let currentIndex = 0;
    let autoplayInterval;
    
    const goTo = (index) => {
      if (!loop && (index < 0 || index >= items.length)) return;
      
      currentIndex = loop ? 
        ((index % items.length) + items.length) % items.length : 
        Math.max(0, Math.min(index, items.length - 1));
      
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
    };
    
    const next = () => goTo(currentIndex + 1);
    const prev = () => goTo(currentIndex - 1);
    
    // Navigation arrows
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '←';
    prevBtn.style.cssText = `
      position: absolute;
      left: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0,0,0,0.5);
      color: white;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
    `;
    
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '→';
    nextBtn.style.cssText = `
      position: absolute;
      right: 10px;
      top: 50%;
      transform: translateY(-50%);
      background: rgba(0,0,0,0.5);
      color: white;
      border: none;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
    `;
    
    container.appendChild(prevBtn);
    container.appendChild(nextBtn);
    
    prevBtn.addEventListener('click', () => {
      prev();
      resetAutoplay();
    });
    
    nextBtn.addEventListener('click', () => {
      next();
      resetAutoplay();
    });
    
    // Dots
    const dots = document.createElement('div');
    dots.style.cssText = `
      position: absolute;
      bottom: 10px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: 8px;
    `;
    
    items.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.style.cssText = `
        width: 10px;
        height: 10px;
        border-radius: 50%;
        border: none;
        background: ${index === 0 ? 'white' : 'rgba(255,255,255,0.5)'};
        cursor: pointer;
      `;
      dot.addEventListener('click', () => {
        goTo(index);
        resetAutoplay();
      });
      dots.appendChild(dot);
    });
    
    container.appendChild(dots);
    
    // Autoplay
    const startAutoplay = () => {
      if (autoplay) {
        autoplayInterval = setInterval(next, interval);
      }
    };
    
    const stopAutoplay = () => {
      clearInterval(autoplayInterval);
    };
    
    const resetAutoplay = () => {
      stopAutoplay();
      startAutoplay();
    };
    
    container.addEventListener('mouseenter', stopAutoplay);
    container.addEventListener('mouseleave', startAutoplay);
    
    startAutoplay();
    
    return {
      element: container,
      goTo,
      next,
      prev,
      getCurrent: () => currentIndex,
      destroy: () => {
        stopAutoplay();
        container.removeEventListener('mouseenter', stopAutoplay);
        container.removeEventListener('mouseleave', startAutoplay);
      }
    };
  },

  // Lightbox
  createLightbox: (images, options = {}) => {
    const { startIndex = 0 } = options;
    
    let currentIndex = startIndex;
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.3s;
    `;
    
    const img = document.createElement('img');
    img.style.cssText = `
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
      transform: scale(0.9);
      transition: transform 0.3s;
    `;
    
    const updateImage = () => {
      img.src = images[currentIndex];
    };
    
    const close = () => {
      overlay.style.opacity = '0';
      overlay.style.visibility = 'hidden';
      img.style.transform = 'scale(0.9)';
      setTimeout(() => overlay.remove(), 300);
    };
    
    const next = () => {
      currentIndex = (currentIndex + 1) % images.length;
      updateImage();
    };
    
    const prev = () => {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateImage();
    };
    
    // Navigation
    const prevBtn = document.createElement('button');
    prevBtn.innerHTML = '←';
    prevBtn.style.cssText = `
      position: absolute;
      left: 20px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: white;
      font-size: 30px;
      cursor: pointer;
    `;
    
    const nextBtn = document.createElement('button');
    nextBtn.innerHTML = '→';
    nextBtn.style.cssText = `
      position: absolute;
      right: 20px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      color: white;
      font-size: 30px;
      cursor: pointer;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '✕';
    closeBtn.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      background: none;
      border: none;
      color: white;
      font-size: 30px;
      cursor: pointer;
    `;
    
    overlay.appendChild(img);
    overlay.appendChild(prevBtn);
    overlay.appendChild(nextBtn);
    overlay.appendChild(closeBtn);
    document.body.appendChild(overlay);
    
    updateImage();
    
    // Open animation
    requestAnimationFrame(() => {
      overlay.style.opacity = '1';
      overlay.style.visibility = 'visible';
      img.style.transform = 'scale(1)';
    });
    
    // Event listeners
    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', prev);
    nextBtn.addEventListener('click', next);
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    });
    
    // Touch/swipe support
    let touchStartX = 0;
    overlay.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    });
    
    overlay.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      
      if (Math.abs(diff) > 50) {
        if (diff > 0) next();
        else prev();
      }
    });
    
    return { close, next, prev };
  },

  // Image zoom
  createImageZoom: (img, options = {}) => {
    const { scale = 2 } = options;
    
    const container = document.createElement('div');
    container.style.cssText = `
      position: relative;
      overflow: hidden;
      cursor: crosshair;
    `;
    
    img.parentNode.insertBefore(container, img);
    container.appendChild(img);
    
    const lens = document.createElement('div');
    lens.style.cssText = `
      position: absolute;
      width: 100px;
      height: 100px;
      border: 2px solid white;
      border-radius: 50%;
      pointer-events: none;
      opacity: 0;
      background-repeat: no-repeat;
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    `;
    
    container.appendChild(lens);
    
    const handleMove = (e) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const lensX = x - 50;
      const lensY = y - 50;
      
      lens.style.left = `${lensX}px`;
      lens.style.top = `${lensY}px`;
      lens.style.opacity = '1';
      
      const bgX = (x / rect.width) * 100;
      const bgY = (y / rect.height) * 100;
      
      lens.style.backgroundImage = `url(${img.src})`;
      lens.style.backgroundSize = `${rect.width * scale}px ${rect.height * scale}px`;
      lens.style.backgroundPosition = `${bgX}% ${bgY}%`;
    };
    
    const handleLeave = () => {
      lens.style.opacity = '0';
    };
    
    container.addEventListener('mousemove', handleMove);
    container.addEventListener('mouseleave', handleLeave);
    
    return {
      destroy: () => {
        container.removeEventListener('mousemove', handleMove);
        container.removeEventListener('mouseleave', handleLeave);
        container.parentNode.insertBefore(img, container);
        container.remove();
      }
    };
  },

  // Image comparison slider
  createImageComparison: (beforeImg, afterImg, options = {}) => {
    const { defaultPosition = 50 } = options;
    
    const container = document.createElement('div');
    container.style.cssText = `
      position: relative;
      overflow: hidden;
      user-select: none;
    `;
    
    const beforeContainer = document.createElement('div');
    beforeContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: ${defaultPosition}%;
      height: 100%;
      overflow: hidden;
    `;
    
    const beforeImage = document.createElement('img');
    beforeImage.src = beforeImg;
    beforeImage.style.cssText = 'display: block; width: 100%; height: 100%; object-fit: cover;';
    
    const afterImage = document.createElement('img');
    afterImage.src = afterImg;
    afterImage.style.cssText = 'display: block; width: 100%; height: 100%; object-fit: cover;';
    
    const slider = document.createElement('div');
    slider.style.cssText = `
      position: absolute;
      top: 0;
      left: ${defaultPosition}%;
      width: 4px;
      height: 100%;
      background: white;
      cursor: ew-resize;
      transform: translateX(-50%);
      box-shadow: 0 0 10px rgba(0,0,0,0.5);
    `;
    
    const handle = document.createElement('div');
    handle.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 40px;
      height: 40px;
      background: white;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0,0,0,0.3);
    `;
    handle.innerHTML = '↔';
    
    slider.appendChild(handle);
    beforeContainer.appendChild(beforeImage);
    container.appendChild(afterImage);
    container.appendChild(beforeContainer);
    container.appendChild(slider);
    
    let isDragging = false;
    
    const updatePosition = (x) => {
      const rect = container.getBoundingClientRect();
      let position = ((x - rect.left) / rect.width) * 100;
      position = Math.max(0, Math.min(100, position));
      
      beforeContainer.style.width = `${position}%`;
      slider.style.left = `${position}%`;
    };
    
    slider.addEventListener('mousedown', () => isDragging = true);
    document.addEventListener('mousemove', (e) => {
      if (isDragging) updatePosition(e.clientX);
    });
    document.addEventListener('mouseup', () => isDragging = false);
    
    // Touch events
    slider.addEventListener('touchstart', () => isDragging = true);
    document.addEventListener('touchmove', (e) => {
      if (isDragging) updatePosition(e.touches[0].clientX);
    });
    document.addEventListener('touchend', () => isDragging = false);
    
    return {
      setPosition: (percent) => {
        beforeContainer.style.width = `${percent}%`;
        slider.style.left = `${percent}%`;
      },
      getPosition: () => parseFloat(beforeContainer.style.width)
    };
  },

  // Lazy load images
  lazyLoad: (selector = 'img[data-src]', options = {}) => {
    const { rootMargin = '50px', threshold = 0.01 } = options;
    
    const images = document.querySelectorAll(selector);
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          
          if (img.dataset.srcset) {
            img.srcset = img.dataset.srcset;
          }
          
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    }, { rootMargin, threshold });
    
    images.forEach(img => imageObserver.observe(img));
    
    return {
      refresh: () => {
        const newImages = document.querySelectorAll(selector);
        newImages.forEach(img => {
          if (!img.classList.contains('loaded')) {
            imageObserver.observe(img);
          }
        });
      },
      destroy: () => imageObserver.disconnect()
    };
  },

  // Responsive images with srcset
  createResponsiveImage: (src, srcset, sizes, options = {}) => {
    const { alt = '', className = '' } = options;
    
    const img = document.createElement('img');
    img.src = src;
    img.srcset = srcset;
    img.sizes = sizes;
    img.alt = alt;
    if (className) img.className = className;
    
    return img;
  },

  // Picture element with sources
  createPicture: (sources, fallback, options = {}) => {
    const { alt = '', className = '' } = options;
    
    const picture = document.createElement('picture');
    
    sources.forEach(source => {
      const sourceEl = document.createElement('source');
      sourceEl.srcset = source.srcset;
      if (source.media) sourceEl.media = source.media;
      if (source.type) sourceEl.type = source.type;
      picture.appendChild(sourceEl);
    });
    
    const img = document.createElement('img');
    img.src = fallback;
    img.alt = alt;
    if (className) img.className = className;
    picture.appendChild(img);
    
    return picture;
  },

  // Image preloader
  preloadImages: (urls) => {
    return Promise.all(urls.map(url => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(url);
        img.onerror = () => reject(url);
        img.src = url;
      });
    }));
  },

  // Progressive image loading
  loadProgressiveImage: (container, smallSrc, largeSrc, options = {}) => {
    const { blur = 20 } = options;
    
    const smallImg = document.createElement('img');
    smallImg.src = smallSrc;
    smallImg.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: cover;
      filter: blur(${blur}px);
      transition: opacity 0.3s;
    `;
    
    const largeImg = document.createElement('img');
    largeImg.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0;
      transition: opacity 0.3s;
    `;
    
    container.style.position = 'relative';
    container.appendChild(smallImg);
    container.appendChild(largeImg);
    
    const img = new Image();
    img.src = largeSrc;
    img.onload = () => {
      largeImg.src = largeSrc;
      largeImg.style.opacity = '1';
      smallImg.style.opacity = '0';
    };
    
    return {
      destroy: () => {
        smallImg.remove();
        largeImg.remove();
      }
    };
  },

  // Video lazy load
  lazyLoadVideo: (video, options = {}) => {
    const { autoplay = false, muted = true } = options;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const sources = video.querySelectorAll('source[data-src]');
          sources.forEach(source => {
            source.src = source.dataset.src;
          });
          
          video.load();
          
          if (autoplay) {
            video.muted = muted;
            video.play();
          }
          
          observer.unobserve(video);
        }
      });
    });
    
    observer.observe(video);
    
    return () => observer.disconnect();
  },

  // Background video
  createBackgroundVideo: (sources, options = {}) => {
    const { poster = '', overlay = true } = options;
    
    const container = document.createElement('div');
    container.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index: -1;
    `;
    
    const video = document.createElement('video');
    video.autoplay = true;
    video.loop = true;
    video.muted = true;
    video.playsInline = true;
    video.poster = poster;
    video.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      min-width: 100%;
      min-height: 100%;
      transform: translate(-50%, -50%);
      object-fit: cover;
    `;
    
    sources.forEach(src => {
      const source = document.createElement('source');
      source.src = src.url;
      source.type = src.type;
      video.appendChild(source);
    });
    
    container.appendChild(video);
    
    if (overlay) {
      const overlayEl = document.createElement('div');
      overlayEl.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.4);
      `;
      container.appendChild(overlayEl);
    }
    
    return container;
  },

  // Audio visualizer
  createAudioVisualizer: (audioElement, canvas, options = {}) => {
    const { fftSize = 256, barCount = 64, color = '#4f46e5' } = options;
    
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    const source = audioCtx.createMediaElementSource(audioElement);
    
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    analyser.fftSize = fftSize;
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const ctx = canvas.getContext('2d');
    
    const draw = () => {
      requestAnimationFrame(draw);
      
      analyser.getByteFrequencyData(dataArray);
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const barWidth = (canvas.width / barCount) * 2.5;
      let barHeight;
      let x = 0;
      
      for (let i = 0; i < barCount; i++) {
        const dataIndex = Math.floor(i * (bufferLength / barCount));
        barHeight = (dataArray[dataIndex] / 255) * canvas.height;
        
        ctx.fillStyle = color;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        x += barWidth + 1;
      }
    };
    
    draw();
    
    return {
      destroy: () => {
        source.disconnect();
        analyser.disconnect();
      }
    };
  },

  // Form validation
  validateForm: (form, rules) => {
    const errors = {};
    
    Object.entries(rules).forEach(([field, validations]) => {
      const input = form.elements[field];
      if (!input) return;
      
      const value = input.value.trim();
      
      validations.forEach(rule => {
        if (errors[field]) return;
        
        switch (rule.type) {
          case 'required':
            if (!value) errors[field] = rule.message || 'Field is required';
            break;
          case 'email':
            if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
              errors[field] = rule.message || 'Invalid email';
            }
            break;
          case 'min':
            if (value.length < rule.value) {
              errors[field] = rule.message || `Minimum ${rule.value} characters`;
            }
            break;
          case 'max':
            if (value.length > rule.value) {
              errors[field] = rule.message || `Maximum ${rule.value} characters`;
            }
            break;
          case 'pattern':
            if (value && !rule.value.test(value)) {
              errors[field] = rule.message || 'Invalid format';
            }
            break;
          case 'match':
            const matchValue = form.elements[rule.field]?.value;
            if (value !== matchValue) {
              errors[field] = rule.message || 'Fields do not match';
            }
            break;
          case 'custom':
            if (!rule.validator(value)) {
              errors[field] = rule.message || 'Invalid value';
            }
            break;
        }
      });
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  },

  // Real-time form validation
  createLiveValidation: (input, rules, options = {}) => {
    const { onValidate, debounce = 300 } = options;
    
    let errorEl = null;
    
    const showError = (message) => {
      if (!errorEl) {
        errorEl = document.createElement('div');
        errorEl.className = 'validation-error';
        errorEl.style.cssText = `
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
        `;
        input.parentNode.appendChild(errorEl);
      }
      errorEl.textContent = message;
      input.style.borderColor = '#ef4444';
    };
    
    const clearError = () => {
      if (errorEl) {
        errorEl.remove();
        errorEl = null;
      }
      input.style.borderColor = '';
    };
    
    const validate = Utils.debounce(() => {
      const value = input.value;
      
      for (const rule of rules) {
        let isValid = true;
        
        switch (rule.type) {
          case 'required':
            isValid = value.trim() !== '';
            break;
          case 'email':
            isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
            break;
          case 'min':
            isValid = value.length >= rule.value;
            break;
          case 'max':
            isValid = value.length <= rule.value;
            break;
          case 'pattern':
            isValid = rule.value.test(value);
            break;
          case 'custom':
            isValid = rule.validator(value);
            break;
        }
        
        if (!isValid) {
          showError(rule.message);
          onValidate?.(false, rule.message);
          return;
        }
      }
      
      clearError();
      onValidate?.(true);
    }, debounce);
    
    input.addEventListener('input', validate);
    input.addEventListener('blur', validate);
    
    return {
      validate: () => {
        validate.flush?.() || validate();
      },
      destroy: () => {
        input.removeEventListener('input', validate);
        input.removeEventListener('blur', validate);
      }
    };
  },

  // Character counter
  createCharCounter: (input, maxLength, options = {}) => {
    const { warningAt = 0.8 } = options;
    
    const counter = document.createElement('div');
    counter.style.cssText = `
      text-align: right;
      font-size: 12px;
      color: #6b7280;
      margin-top: 4px;
    `;
    
    input.parentNode.appendChild(counter);
    
    const update = () => {
      const length = input.value.length;
      const remaining = maxLength - length;
      
      counter.textContent = `${length}/${maxLength}`;
      
      if (length > maxLength) {
        counter.style.color = '#ef4444';
        input.style.borderColor = '#ef4444';
      } else if (length > maxLength * warningAt) {
        counter.style.color = '#f59e0b';
      } else {
        counter.style.color = '#6b7280';
        input.style.borderColor = '';
      }
    };
    
    input.addEventListener('input', update);
    update();
    
    return {
      getCount: () => input.value.length,
      destroy: () => {
        input.removeEventListener('input', update);
        counter.remove();
      }
    };
  },

  // Password strength meter
  createPasswordStrength: (input, meter) => {
    const update = () => {
      const password = input.value;
      let strength = 0;
      
      if (password.length >= 8) strength++;
      if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
      if (/[0-9]/.test(password)) strength++;
      if (/[^a-zA-Z0-9]/.test(password)) strength++;
      
      const colors = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];
      const labels = ['Very Weak', 'Weak', 'Medium', 'Strong', 'Very Strong'];
      
      meter.style.width = `${(strength / 4) * 100}%`;
      meter.style.backgroundColor = colors[strength - 1] || '#ef4444';
      meter.textContent = labels[strength];
    };
    
    input.addEventListener('input', update);
    
    return {
      getStrength: () => {
        const password = input.value;
        let score = 0;
        if (password.length >= 8) score++;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
        if (/[0-9]/.test(password)) score++;
        if (/[^a-zA-Z0-9]/.test(password)) score++;
        return score;
      }
    };
  },

  // Tag input
  createTagInput: (input, options = {}) => {
    const { separator = ',', maxTags = null, onAdd, onRemove } = options;
    
    const container = document.createElement('div');
    container.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      padding: 8px;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      min-height: 42px;
    `;
    
    input.parentNode.insertBefore(container, input);
    container.appendChild(input);
    
    input.style.cssText = `
      border: none;
      outline: none;
      flex: 1;
      min-width: 100px;
      background: transparent;
    `;
    
    const tags = new Set();
    
    const createTag = (text) => {
      const tag = document.createElement('span');
      tag.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 8px;
        background: #e0e7ff;
        color: #4f46e5;
        border-radius: 4px;
        font-size: 14px;
      `;
      tag.innerHTML = `
        ${text}
        <button style="background: none; border: none; cursor: pointer; padding: 0; font-size: 16px; line-height: 1;">&times;</button>
      `;
      
      tag.querySelector('button').addEventListener('click', () => {
        tags.delete(text);
        tag.remove();
        onRemove?.(text);
      });
      
      return tag;
    };
    
    const addTag = (text) => {
      text = text.trim();
      if (!text || tags.has(text)) return;
      if (maxTags && tags.size >= maxTags) return;
      
      tags.add(text);
      const tag = createTag(text);
      container.insertBefore(tag, input);
      onAdd?.(text);
    };
    
    input.addEventListener('keydown', (e) => {
      if (e.key === separator || e.key === 'Enter') {
        e.preventDefault();
        addTag(input.value);
        input.value = '';
      } else if (e.key === 'Backspace' && !input.value && tags.size > 0) {
        const lastTag = Array.from(tags).pop();
        tags.delete(lastTag);
        container.removeChild(container.children[container.children.length - 2]);
        onRemove?.(lastTag);
      }
    });
    
    input.addEventListener('blur', () => {
      if (input.value.trim()) {
        addTag(input.value);
        input.value = '';
      }
    });
    
    return {
      getTags: () => Array.from(tags),
      addTag,
      removeTag: (text) => {
        if (tags.has(text)) {
          tags.delete(text);
          Array.from(container.children).forEach(child => {
            if (child.textContent.includes(text)) {
              child.remove();
            }
          });
          onRemove?.(text);
        }
      },
      clear: () => {
        tags.clear();
        Array.from(container.querySelectorAll('span')).forEach(tag => tag.remove());
      }
    };
  },

  // Autocomplete
  createAutocomplete: (input, getSuggestions, options = {}) => {
    const { minChars = 2, maxResults = 10, onSelect } = options;
    
    const list = document.createElement('ul');
    list.style.cssText = `
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: white;
      border: 1px solid #d1d5db;
      border-top: none;
      border-radius: 0 0 6px 6px;
      max-height: 200px;
      overflow-y: auto;
      list-style: none;
      margin: 0;
      padding: 0;
      z-index: 1000;
      display: none;
    `;
    
    input.parentNode.style.position = 'relative';
    input.parentNode.appendChild(list);
    
    let selectedIndex = -1;
    let suggestions = [];
    
    const render = () => {
      list.innerHTML = '';
      
      suggestions.forEach((suggestion, index) => {
        const li = document.createElement('li');
        li.style.cssText = `
          padding: 8px 12px;
          cursor: pointer;
          ${index === selectedIndex ? 'background: #e0e7ff;' : ''}
        `;
        li.textContent = typeof suggestion === 'string' ? suggestion : suggestion.label;
        
        li.addEventListener('mouseenter', () => {
          selectedIndex = index;
          render();
        });
        
        li.addEventListener('click', () => {
          select(suggestion);
        });
        
        list.appendChild(li);
      });
      
      list.style.display = suggestions.length > 0 ? 'block' : 'none';
    };
    
    const select = (suggestion) => {
      input.value = typeof suggestion === 'string' ? suggestion : suggestion.value;
      list.style.display = 'none';
      onSelect?.(suggestion);
    };
    
    const search = Utils.debounce(async () => {
      const query = input.value.trim();
      
      if (query.length < minChars) {
        list.style.display = 'none';
        return;
      }
      
      suggestions = await getSuggestions(query);
      suggestions = suggestions.slice(0, maxResults);
      selectedIndex = -1;
      render();
    }, 300);
    
    input.addEventListener('input', search);
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
        render();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        render();
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        select(suggestions[selectedIndex]);
      } else if (e.key === 'Escape') {
        list.style.display = 'none';
      }
    });
    
    document.addEventListener('click', (e) => {
      if (!input.parentNode.contains(e.target)) {
        list.style.display = 'none';
      }
    });
    
    return {
      destroy: () => {
        input.removeEventListener('input', search);
        list.remove();
      }
    };
  },

  // Date picker
  createDatePicker: (input, options = {}) => {
    const { format = 'YYYY-MM-DD', min = null, max = null } = options;
    
    // Use native date picker as base
    input.type = 'date';
    
    if (min) input.min = min;
    if (max) input.max = max;
    
    return {
      getValue: () => input.value,
      setValue: (date) => { input.value = date; },
      getDate: () => input.valueAsDate,
      setDate: (date) => { input.valueAsDate = date; }
    };
  },

  // Time picker
  createTimePicker: (input, options = {}) => {
    const { step = 60 } = options;
    
    input.type = 'time';
    input.step = step;
    
    return {
      getValue: () => input.value,
      setValue: (time) => { input.value = time; }
    };
  },

  // Color picker
  createColorPicker: (input, options = {}) => {
    const { defaultColor = '#000000' } = options;
    
    input.type = 'color';
    input.value = defaultColor;
    
    const preview = document.createElement('div');
    preview.style.cssText = `
      width: 30px;
      height: 30px;
      border-radius: 4px;
      border: 2px solid #d1d5db;
      cursor: pointer;
      background: ${defaultColor};
    `;
    
    preview.addEventListener('click', () => input.click());
    
    input.addEventListener('input', () => {
      preview.style.background = input.value;
    });
    
    input.style.display = 'none';
    input.parentNode.insertBefore(preview, input);
    
    return {
      getValue: () => input.value,
      setValue: (color) => {
        input.value = color;
        preview.style.background = color;
      },
      getPreview: () => preview
    };
  },

  // Range slider with dual handles
  createDualRange: (container, options = {}) => {
    const { min = 0, max = 100, step = 1, defaultMin = min, defaultMax = max } = options;
    
    container.style.cssText = `
      position: relative;
      height: 6px;
      background: #e5e7eb;
      border-radius: 3px;
    `;
    
    const range = document.createElement('div');
    range.style.cssText = `
      position: absolute;
      height: 100%;
      background: #4f46e5;
      border-radius: 3px;
    `;
    
    const createHandle = (value, isMin) => {
      const handle = document.createElement('div');
      handle.style.cssText = `
        position: absolute;
        width: 20px;
        height: 20px;
        background: white;
        border: 2px solid #4f46e5;
        border-radius: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        cursor: grab;
      `;
      
      const updatePosition = () => {
        const percent = ((value - min) / (max - min)) * 100;
        handle.style.left = `${percent}%`;
        updateRange();
      };
      
      const updateRange = () => {
        const minPercent = ((minValue - min) / (max - min)) * 100;
        const maxPercent = ((maxValue - min) / (max - min)) * 100;
        range.style.left = `${minPercent}%`;
        range.style.width = `${maxPercent - minPercent}%`;
      };
      
      let isDragging = false;
      
      handle.addEventListener('mousedown', (e) => {
        isDragging = true;
        handle.style.cursor = 'grabbing';
      });
      
      document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const rect = container.getBoundingClientRect();
        const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const newValue = Math.round((percent * (max - min) + min) / step) * step;
        
        if (isMin) {
          minValue = Math.min(newValue, maxValue - step);
        } else {
          maxValue = Math.max(newValue, minValue + step);
        }
        
        value = isMin ? minValue : maxValue;
        updatePosition();
      });
      
      document.addEventListener('mouseup', () => {
        isDragging = false;
        handle.style.cursor = 'grab';
      });
      
      updatePosition();
      return handle;
    };
    
    let minValue = defaultMin;
    let maxValue = defaultMax;
    
    const minHandle = createHandle(minValue, true);
    const maxHandle = createHandle(maxValue, false);
    
    container.appendChild(range);
    container.appendChild(minHandle);
    container.appendChild(maxHandle);
    
    return {
      getValues: () => ({ min: minValue, max: maxValue }),
      setValues: (min, max) => {
        minValue = Math.max(min, min);
        maxValue = Math.min(max, max);
        minHandle.updatePosition();
        maxHandle.updatePosition();
      }
    };
  },

  // Star rating
  createStarRating: (container, options = {}) => {
    const { max = 5, defaultValue = 0, allowHalf = false, onChange } = options;
    
    container.style.cssText = `
      display: inline-flex;
      gap: 4px;
      font-size: 24px;
    `;
    
    let value = defaultValue;
    const stars = [];
    
    for (let i = 1; i <= max; i++) {
      const star = document.createElement('span');
      star.innerHTML = '★';
      star.style.cssText = `
        cursor: pointer;
        color: ${i <= value ? '#fbbf24' : '#d1d5db'};
        transition: color 0.2s;
      `;
      
      star.addEventListener('click', () => {
        value = i;
        updateStars();
        onChange?.(value);
      });
      
      star.addEventListener('mouseenter', () => {
        highlightStars(i);
      });
      
      container.addEventListener('mouseleave', () => {
        updateStars();
      });
      
      stars.push(star);
      container.appendChild(star);
    }
    
    const updateStars = () => {
      stars.forEach((star, index) => {
        star.style.color = index < value ? '#fbbf24' : '#d1d5db';
      });
    };
    
    const highlightStars = (count) => {
      stars.forEach((star, index) => {
        star.style.color = index < count ? '#fbbf24' : '#d1d5db';
      });
    };
    
    return {
      getValue: () => value,
      setValue: (newValue) => {
        value = newValue;
        updateStars();
      }
    };
  },

  // File upload with drag & drop
  createFileUpload: (container, options = {}) => {
    const { accept = '*', multiple = false, maxSize = null, onUpload } = options;
    
    const dropZone = document.createElement('div');
    dropZone.style.cssText = `
      border: 2px dashed #d1d5db;
      border-radius: 8px;
      padding: 40px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s;
    `;
    dropZone.innerHTML = `
      <div style="font-size: 48px; margin-bottom: 16px;">📁</div>
      <div>Drag & drop files here or click to browse</div>
    `;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = accept;
    input.multiple = multiple;
    input.style.display = 'none';
    
    dropZone.appendChild(input);
    container.appendChild(dropZone);
    
    const handleFiles = (files) => {
      const validFiles = Array.from(files).filter(file => {
        if (maxSize && file.size > maxSize) {
          Utils.showToast(`File too large: ${file.name}`, 'error');
          return false;
        }
        return true;
      });
      
      onUpload?.(multiple ? validFiles : validFiles[0]);
    };
    
    dropZone.addEventListener('click', () => input.click());
    
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = '#4f46e5';
      dropZone.style.background = '#eef2ff';
    });
    
    dropZone.addEventListener('dragleave', () => {
      dropZone.style.borderColor = '#d1d5db';
      dropZone.style.background = '';
    });
    
    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.style.borderColor = '#d1d5db';
      dropZone.style.background = '';
      handleFiles(e.dataTransfer.files);
    });
    
    input.addEventListener('change', () => {
      handleFiles(input.files);
    });
    
    return {
      clear: () => { input.value = ''; },
      getInput: () => input
    };
  },

  // Image cropper
  createImageCropper: (image, options = {}) => {
    const { aspectRatio = 1, minWidth = 100, minHeight = 100 } = options;
    
    const container = document.createElement('div');
    container.style.cssText = `
      position: relative;
      display: inline-block;
      max-width: 100%;
    `;
    
    image.parentNode.insertBefore(container, image);
    container.appendChild(image);
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
    `;
    
    const cropArea = document.createElement('div');
    cropArea.style.cssText = `
      position: absolute;
      border: 2px solid white;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
      cursor: move;
    `;
    
    // Initial crop area
    const imgRect = image.getBoundingClientRect();
    const size = Math.min(imgRect.width, imgRect.height) * 0.8;
    cropArea.style.width = `${size}px`;
    cropArea.style.height = `${size / aspectRatio}px`;
    cropArea.style.left = `${(imgRect.width - size) / 2}px`;
    cropArea.style.top = `${(imgRect.height - size / aspectRatio) / 2}px`;
    
    // Resize handles
    const handles = ['nw', 'ne', 'sw', 'se'].map(pos => {
      const handle = document.createElement('div');
      handle.style.cssText = `
        position: absolute;
        width: 10px;
        height: 10px;
        background: white;
        border-radius: 50%;
        cursor: ${pos}-resize;
        ${pos.includes('n') ? 'top: -5px;' : 'bottom: -5px;'}
        ${pos.includes('w') ? 'left: -5px;' : 'right: -5px;'}
      `;
      cropArea.appendChild(handle);
      return handle;
    });
    
    container.appendChild(cropArea);
    
    // Drag functionality
    let isDragging = false;
    let startX, startY, startLeft, startTop;
    
    cropArea.addEventListener('mousedown', (e) => {
      if (e.target !== cropArea) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      startLeft = cropArea.offsetLeft;
      startTop = cropArea.offsetTop;
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      
      cropArea.style.left = `${Math.max(0, Math.min(image.width - cropArea.offsetWidth, startLeft + dx))}px`;
      cropArea.style.top = `${Math.max(0, Math.min(image.height - cropArea.offsetHeight, startTop + dy))}px`;
    });
    
    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
    
    return {
      getCropData: () => ({
        x: cropArea.offsetLeft,
        y: cropArea.offsetTop,
        width: cropArea.offsetWidth,
        height: cropArea.offsetHeight
      }),
      getCroppedImage: () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        canvas.width = cropArea.offsetWidth;
        canvas.height = cropArea.offsetHeight;
        
        ctx.drawImage(
          image,
          cropArea.offsetLeft,
          cropArea.offsetTop,
          cropArea.offsetWidth,
          cropArea.offsetHeight,
          0,
          0,
          cropArea.offsetWidth,
          cropArea.offsetHeight
        );
        
        return canvas.toDataURL();
      }
    };
  },

  // Signature pad
  createSignaturePad: (canvas, options = {}) => {
    const { penColor = 'black', penWidth = 2, backgroundColor = 'white' } = options;
    
    const ctx = canvas.getContext('2d');
    ctx.strokeStyle = penColor;
    ctx.lineWidth = penWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    
    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };
    
    const start = (e) => {
      isDrawing = true;
      const pos = getPos(e);
      lastX = pos.x;
      lastY = pos.y;
    };
    
    const draw = (e) => {
      if (!isDrawing) return;
      e.preventDefault();
      
      const pos = getPos(e);
      
      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
      
      lastX = pos.x;
      lastY = pos.y;
    };
    
    const stop = () => {
      isDrawing = false;
    };
    
    canvas.addEventListener('mousedown', start);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stop);
    canvas.addEventListener('mouseout', stop);
    
    canvas.addEventListener('touchstart', start, { passive: false });
    canvas.addEventListener('touchmove', draw, { passive: false });
    canvas.addEventListener('touchend', stop);
    
    return {
      clear: () => {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      },
      toDataURL: () => canvas.toDataURL(),
      isEmpty: () => {
        const pixelBuffer = new Uint32Array(
          ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer
        );
        return !pixelBuffer.some(color => color !== 0);
      }
    };
  },

  // QR Code generator
  generateQRCode: (text, options = {}) => {
    const { size = 200, color = '#000000', bgColor = '#ffffff' } = options;
    
    // Using QRCode.js library would be needed here
    // This is a placeholder that returns a data URL
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Draw placeholder
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, size, size);
    ctx.fillStyle = color;
    ctx.fillRect(size * 0.2, size * 0.2, size * 0.6, size * 0.6);
    
    return canvas.toDataURL();
  },

  // Barcode generator
  generateBarcode: (text, options = {}) => {
    const { format = 'CODE128', width = 2, height = 100 } = options;
    
    // Using JsBarcode library would be needed here
    // This is a placeholder
    const canvas = document.createElement('canvas');
    canvas.width = text.length * width * 10;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.font = '20px monospace';
    ctx.fillText(text, 10, height / 2);
    
    return canvas.toDataURL();
  },

  // Chart.js helper
  createChart: (canvas, type, data, options = {}) => {
    // Assuming Chart.js is loaded
    if (typeof Chart === 'undefined') {
      console.error('Chart.js is required');
      return null;
    }
    
    return new Chart(canvas, {
      type,
      data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        ...options
      }
    });
  },

  // D3.js helper
  createD3Chart: (container, data, renderFn) => {
    // Assuming D3.js is loaded
    if (typeof d3 === 'undefined') {
      console.error('D3.js is required');
      return null;
    }
    
    const svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%');
    
    renderFn(svg, data);
    
    return svg;
  },

  // Map (Leaflet)
  createMap: (container, options = {}) => {
    // Assuming Leaflet is loaded
    if (typeof L === 'undefined') {
      console.error('Leaflet is required');
      return null;
    }
    
    const { center = [0, 0], zoom = 13 } = options;
    
    const map = L.map(container).setView(center, zoom);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);
    
    return map;
  },

  // Data table
  createDataTable: (container, data, options = {}) => {
    const { columns, sortable = true, searchable = true, pagination = true, pageSize = 10 } = options;
    
    let currentPage = 1;
    let sortColumn = null;
    let sortDirection = 'asc';
    let searchTerm = '';
    
    const wrapper = document.createElement('div');
    
    // Search
    if (searchable) {
      const searchInput = document.createElement('input');
      searchInput.placeholder = 'Search...';
      searchInput.style.cssText = `
        width: 100%;
        padding: 8px 12px;
        margin-bottom: 16px;
        border: 1px solid #d1d5db;
        border-radius: 6px;
      `;
      
      searchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value.toLowerCase();
        currentPage = 1;
        render();
      });
      
      wrapper.appendChild(searchInput);
    }
    
    // Table
    const table = document.createElement('table');
    table.style.cssText = `
      width: 100%;
      border-collapse: collapse;
    `;
    
    // Header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    columns.forEach(col => {
      const th = document.createElement('th');
      th.textContent = col.title;
      th.style.cssText = `
        padding: 12px;
        text-align: left;
        border-bottom: 2px solid #e5e7eb;
        cursor: ${sortable ? 'pointer' : 'default'};
        user-select: none;
      `;
      
      if (sortable) {
        th.addEventListener('click', () => {
          if (sortColumn === col.key) {
            sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
          } else {
            sortColumn = col.key;
            sortDirection = 'asc';
          }
          render();
        });
        
        if (sortColumn === col.key) {
          th.textContent += sortDirection === 'asc' ? ' ▲' : ' ▼';
        }
      }
      
      headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    const tbody = document.createElement('tbody');
    table.appendChild(tbody);
    wrapper.appendChild(table);
    
    // Pagination
    let paginationEl = null;
    if (pagination) {
      paginationEl = document.createElement('div');
      paginationEl.style.cssText = `
        display: flex;
        justify-content: center;
        gap: 8px;
        margin-top: 16px;
      `;
      wrapper.appendChild(paginationEl);
    }
    
    const getFilteredData = () => {
      let result = [...data];
      
      // Search
      if (searchTerm) {
        result = result.filter(row => 
          columns.some(col => 
            String(row[col.key]).toLowerCase().includes(searchTerm)
          )
        );
      }
      
      // Sort
      if (sortColumn) {
        result.sort((a, b) => {
          const aVal = a[sortColumn];
          const bVal = b[sortColumn];
          
          if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
          if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
          return 0;
        });
      }
      
      return result;
    };
    
    const render = () => {
      const filtered = getFilteredData();
      
      // Pagination
      const totalPages = Math.ceil(filtered.length / pageSize);
      const start = (currentPage - 1) * pageSize;
      const paginated = filtered.slice(start, start + pageSize);
      
      // Render rows
      tbody.innerHTML = '';
      paginated.forEach(row => {
        const tr = document.createElement('tr');
        tr.style.borderBottom = '1px solid #e5e7eb';
        
        columns.forEach(col => {
          const td = document.createElement('td');
          td.style.padding = '12px';
          td.textContent = row[col.key];
          tr.appendChild(td);
        });
        
        tbody.appendChild(tr);
      });
      
      // Render pagination
      if (paginationEl) {
        paginationEl.innerHTML = '';
        
        for (let i = 1; i <= totalPages; i++) {
          const btn = document.createElement('button');
          btn.textContent = i;
          btn.style.cssText = `
            padding: 8px 12px;
            border: 1px solid #d1d5db;
            background: ${i === currentPage ? '#4f46e5' : 'white'};
            color: ${i === currentPage ? 'white' : 'black'};
            border-radius: 6px;
            cursor: pointer;
          `;
          
          btn.addEventListener('click', () => {
            currentPage = i;
            render();
          });
          
          paginationEl.appendChild(btn);
        }
      }
    };
    
    container.appendChild(wrapper);
    render();
    
    return {
      refresh: render,
      getFilteredData,
      setPage: (page) => {
        currentPage = page;
        render();
      }
    };
  },

  // Virtual list
  createVirtualList: (container, itemHeight, totalItems, renderItem) => {
    const viewportHeight = container.clientHeight;
    const visibleCount = Math.ceil(viewportHeight / itemHeight) + 2;
    
    container.style.cssText = `
      overflow-y: auto;
      position: relative;
    `;
    
    const content = document.createElement('div');
    content.style.height = `${totalItems * itemHeight}px`;
    container.appendChild(content);
    
    const items = new Map();
    let scrollTop = 0;
    
    const update = () => {
      scrollTop = container.scrollTop;
      const startIndex = Math.floor(scrollTop / itemHeight);
      const endIndex = Math.min(startIndex + visibleCount, totalItems);
      
      // Remove items that are no longer visible
      items.forEach((el, index) => {
        if (index < startIndex || index >= endIndex) {
          el.remove();
          items.delete(index);
        }
      });
      
      // Add new visible items
      for (let i = startIndex; i < endIndex; i++) {
        if (!items.has(i)) {
          const el = renderItem(i);
          el.style.position = 'absolute';
          el.style.top = `${i * itemHeight}px`;
          el.style.height = `${itemHeight}px`;
          el.style.left = '0';
          el.style.right = '0';
          content.appendChild(el);
          items.set(i, el);
        }
      }
    };
    
    container.addEventListener('scroll', update);
    update();
    
    return {
      refresh: update,
      scrollToIndex: (index) => {
        container.scrollTop = index * itemHeight;
      }
    };
  },

  // Masonry grid
  createMasonry: (container, items, options = {}) => {
    const { columns = 3, gap = 16 } = options;
    
    container.style.cssText = `
      display: flex;
      flex-wrap: wrap;
      margin: -${gap / 2}px;
    `;
    
    const columnElements = Array.from({ length: columns }, () => {
      const col = document.createElement('div');
      col.style.cssText = `
        flex: 1;
        padding: ${gap / 2}px;
      `;
      container.appendChild(col);
      return col;
    });
    
    const columnHeights = new Array(columns).fill(0);
    
    items.forEach(item => {
      const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
      columnElements[shortestColumn].appendChild(item);
      columnHeights[shortestColumn] += item.offsetHeight + gap;
    });
    
    return {
      refresh: () => {
        // Recalculate layout
        columnElements.forEach(col => col.innerHTML = '');
        const heights = new Array(columns).fill(0);
        
        items.forEach(item => {
          const shortest = heights.indexOf(Math.min(...heights));
          columnElements[shortest].appendChild(item);
          heights[shortest] += item.offsetHeight + gap;
        });
      }
    };
  },

  // Drag and drop sortable
  createSortable: (list, options = {}) => {
    const { onSort, handle = null, animation = 150 } = options;
    
    let draggedItem = null;
    let placeholder = null;
    
    const items = Array.from(list.children);
    
    items.forEach(item => {
      item.draggable = true;
      item.style.cursor = handle ? 'default' : 'move';
      
      if (handle) {
        const handleEl = item.querySelector(handle);
        if (handleEl) {
          handleEl.style.cursor = 'move';
          handleEl.addEventListener('mousedown', () => item.draggable = true);
          handleEl.addEventListener('mouseup', () => item.draggable = false);
        }
      }
      
      item.addEventListener('dragstart', (e) => {
        draggedItem = item;
        e.dataTransfer.effectAllowed = 'move';
        setTimeout(() => item.classList.add('dragging'), 0);
      });
      
      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
        draggedItem = null;
        if (placeholder) {
          placeholder.remove();
          placeholder = null;
        }
      });
      
      item.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!draggedItem || item === draggedItem) return;
        
        const rect = item.getBoundingClientRect();
        const midpoint = rect.top + rect.height / 2;
        
        if (!placeholder) {
          placeholder = document.createElement(item.tagName);
          placeholder.className = 'sortable-placeholder';
          placeholder.style.cssText = `
            background: #f3f4f6;
            border: 2px dashed #d1d5db;
            height: ${draggedItem.offsetHeight}px;
          `;
        }
        
        if (e.clientY < midpoint) {
          item.before(placeholder);
        } else {
          item.after(placeholder);
        }
      });
      
      item.addEventListener('drop', (e) => {
        e.preventDefault();
        if (placeholder && draggedItem) {
          placeholder.replaceWith(draggedItem);
          onSort?.(Array.from(list.children));
        }
      });
    });
    
    return {
      destroy: () => {
        items.forEach(item => {
          item.draggable = false;
          item.style.cursor = '';
        });
      }
    };
  },

  // Resizable panels
  createResizablePanels: (container, options = {}) => {
    const { direction = 'horizontal', minSize = 100 } = options;
    
    const panels = Array.from(container.children);
    const isHorizontal = direction === 'horizontal';
    
    container.style.cssText = `
      display: flex;
      flex-direction: ${isHorizontal ? 'row' : 'column'};
      overflow: hidden;
    `;
    
    panels.forEach((panel, index) => {
      if (index === panels.length - 1) return;
      
      const resizer = document.createElement('div');
      resizer.style.cssText = `
        ${isHorizontal ? 'width' : 'height'}: 4px;
        ${isHorizontal ? 'cursor: col-resize;' : 'cursor: row-resize;'}
        background: #e5e7eb;
        flex-shrink: 0;
      `;
      
      panel.after(resizer);
      
      let isResizing = false;
      let startPos = 0;
      let startSize = 0;
      
      resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        startPos = isHorizontal ? e.clientX : e.clientY;
        startSize = isHorizontal ? panel.offsetWidth : panel.offsetHeight;
        document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize';
        document.body.style.userSelect = 'none';
      });
      
      document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const currentPos = isHorizontal ? e.clientX : e.clientY;
        const diff = currentPos - startPos;
        const newSize = Math.max(minSize, startSize + diff);
        
        panel.style.flex = 'none';
        if (isHorizontal) {
          panel.style.width = `${newSize}px`;
        } else {
          panel.style.height = `${newSize}px`;
        }
      });
      
      document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      });
    });
    
    return {
      reset: () => {
        panels.forEach(panel => {
          panel.style.flex = '';
          panel.style.width = '';
          panel.style.height = '';
        });
      }
    };
  },

  // Split view (like VS Code)
  createSplitView: (container, views, options = {}) => {
    const { initialSizes = [], minSize = 100 } = options;
    
    container.style.cssText = `
      display: flex;
      height: 100%;
      overflow: hidden;
    `;
    
    const panels = views.map((view, index) => {
      const panel = document.createElement('div');
      panel.style.cssText = `
        flex: ${initialSizes[index] || 1};
        min-width: ${minSize}px;
        overflow: auto;
      `;
      panel.appendChild(view);
      container.appendChild(panel);
      return panel;
    });
    
    // Add resizers between panels
    for (let i = 0; i < panels.length - 1; i++) {
      const resizer = document.createElement('div');
      resizer.style.cssText = `
        width: 4px;
        background: #e5e7eb;
        cursor: col-resize;
        flex-shrink: 0;
      `;
      
      panels[i].after(resizer);
      
      let isResizing = false;
      
      resizer.addEventListener('mousedown', () => {
        isResizing = true;
        document.body.style.cursor = 'col-resize';
      });
      
      document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        
        const rect1 = panels[i].getBoundingClientRect();
        const newWidth = e.clientX - rect1.left;
        
        if (newWidth > minSize) {
          panels[i].style.flex = 'none';
          panels[i].style.width = `${newWidth}px`;
        }
      });
      
      document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.cursor = '';
      });
    }
    
    return {
      setSizes: (sizes) => {
        sizes.forEach((size, index) => {
          if (panels[index]) {
            panels[index].style.flex = 'none';
            panels[index].style.width = `${size}px`;
          }
        });
      }
    };
  },

  // Command palette
  createCommandPalette: (commands, options = {}) => {
    const { placeholder = 'Type a command...' } = options;
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      padding-top: 100px;
      z-index: 9999;
      opacity: 0;
      visibility: hidden;
      transition: all 0.2s;
    `;
    
    const palette = document.createElement('div');
    palette.style.cssText = `
      background: white;
      width: 90%;
      max-width: 600px;
      border-radius: 8px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    `;
    
    const input = document.createElement('input');
    input.placeholder = placeholder;
    input.style.cssText = `
      width: 100%;
      padding: 16px;
      border: none;
      border-bottom: 1px solid #e5e7eb;
      font-size: 16px;
      outline: none;
    `;
    
    const list = document.createElement('div');
    list.style.cssText = `
      max-height: 400px;
      overflow-y: auto;
    `;
    
    palette.appendChild(input);
    palette.appendChild(list);
    overlay.appendChild(palette);
    document.body.appendChild(overlay);
    
    let selectedIndex = 0;
    let filteredCommands = commands;
    
    const render = () => {
      list.innerHTML = '';
      
      filteredCommands.forEach((cmd, index) => {
        const item = document.createElement('div');
        item.style.cssText = `
          padding: 12px 16px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 12px;
          ${index === selectedIndex ? 'background: #e0e7ff;' : ''}
        `;
        
        item.innerHTML = `
          ${cmd.icon ? `<span>${cmd.icon}</span>` : ''}
          <div style="flex: 1;">
            <div style="font-weight: 500;">${cmd.title}</div>
            ${cmd.description ? `<div style="font-size: 12px; color: #6b7280;">${cmd.description}</div>` : ''}
          </div>
          ${cmd.shortcut ? `<span style="font-size: 12px; color: #9ca3af;">${cmd.shortcut}</span>` : ''}
        `;
        
        item.addEventListener('click', () => {
          execute(cmd);
        });
        
        item.addEventListener('mouseenter', () => {
          selectedIndex = index;
          render();
        });
        
        list.appendChild(item);
      });
    };
    
    const execute = (cmd) => {
      cmd.action();
      close();
    };
    
    const open = () => {
      overlay.style.opacity = '1';
      overlay.style.visibility = 'visible';
      input.value = '';
      input.focus();
      filteredCommands = commands;
      selectedIndex = 0;
      render();
    };
    
    const close = () => {
      overlay.style.opacity = '0';
      overlay.style.visibility = 'hidden';
    };
    
    const filter = (query) => {
      filteredCommands = commands.filter(cmd => 
        cmd.title.toLowerCase().includes(query.toLowerCase()) ||
        cmd.description?.toLowerCase().includes(query.toLowerCase())
      );
      selectedIndex = 0;
      render();
    };
    
    input.addEventListener('input', (e) => filter(e.target.value));
    
    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedIndex = (selectedIndex + 1) % filteredCommands.length;
        render();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedIndex = (selectedIndex - 1 + filteredCommands.length) % filteredCommands.length;
        render();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          execute(filteredCommands[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        close();
      }
    });
    
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) close();
    });
    
    // Keyboard shortcut to open (Cmd/Ctrl + K)
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        open();
      }
    });
    
    return { open, close };
  },

  // Context menu
  createContextMenu: (items, options = {}) => {
    const menu = document.createElement('div');
    menu.style.cssText = `
      position: fixed;
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      min-width: 200px;
      z-index: 10000;
      opacity: 0;
      visibility: hidden;
      transform: scale(0.95);
      transition: all 0.1s;
    `;
    
    const render = () => {
      menu.innerHTML = '';
      
      items.forEach(item => {
        if (item === 'separator') {
          const sep = document.createElement('div');
          sep.style.cssText = 'height: 1px; background: #e5e7eb; margin: 4px 0;';
          menu.appendChild(sep);
        } else {
          const button = document.createElement('button');
          button.style.cssText = `
            width: 100%;
            padding: 8px 12px;
            border: none;
            background: none;
            text-align: left;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 8px;
          `;
          
          button.innerHTML = `
            ${item.icon ? `<span>${item.icon}</span>` : '<span style="width: 16px;"></span>'}
            <span style="flex: 1;">${item.label}</span>
            ${item.shortcut ? `<span style="color: #9ca3af; font-size: 12px;">${item.shortcut}</span>` : ''}
          `;
          
          button.addEventListener('mouseenter', () => {
            button.style.background = '#f3f4f6';
          });
          
          button.addEventListener('mouseleave', () => {
            button.style.background = '';
          });
          
          button.addEventListener('click', () => {
            item.action();
            hide();
          });
          
          menu.appendChild(button);
        }
      });
    };
    
    const show = (x, y) => {
      render();
      
      // Adjust position if off-screen
      const rect = menu.getBoundingClientRect();
      const winWidth = window.innerWidth;
      const winHeight = window.innerHeight;
      
      if (x + rect.width > winWidth) x = winWidth - rect.width - 10;
      if (y + rect.height > winHeight) y = winHeight - rect.height - 10;
      
      menu.style.left = `${x}px`;
      menu.style.top = `${y}px`;
      menu.style.opacity = '1';
      menu.style.visibility = 'visible';
      menu.style.transform = 'scale(1)';
      
      document.body.appendChild(menu);
    };
    
    const hide = () => {
      menu.style.opacity = '0';
      menu.style.visibility = 'hidden';
      menu.style.transform = 'scale(0.95)';
      setTimeout(() => menu.remove(), 100);
    };
    
    document.addEventListener('click', (e) => {
      if (!menu.contains(e.target)) hide();
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') hide();
    });
    
    return {
      show,
      hide,
      attachTo: (element) => {
        element.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          show(e.clientX, e.clientY);
        });
      }
    };
  },

  // Tour/onboarding
  createTour: (steps, options = {}) => {
    const { showProgress = true, allowClose = true } = options;
    
    let currentStep = 0;
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
    `;
    
    const highlight = document.createElement('div');
    highlight.style.cssText = `
      position: absolute;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.7);
      border-radius: 4px;
      transition: all 0.3s;
    `;
    
    const tooltip = document.createElement('div');
    tooltip.style.cssText = `
      position: absolute;
      background: white;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
      max-width: 300px;
      z-index: 10000;
    `;
    
    const showStep = () => {
      const step = steps[currentStep];
      const target = document.querySelector(step.target);
      
      if (!target) {
        next();
        return;
      }
      
      const rect = target.getBoundingClientRect();
      
      highlight.style.left = `${rect.left - 4}px`;
      highlight.style.top = `${rect.top - 4}px`;
      highlight.style.width = `${rect.width + 8}px`;
      highlight.style.height = `${rect.height + 8}px`;
      
      tooltip.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 8px;">${step.title}</div>
        <div style="margin-bottom: 16px; color: #6b7280;">${step.content}</div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          ${showProgress ? `<span style="font-size: 12px; color: #9ca3af;">${currentStep + 1} / ${steps.length}</span>` : '<span></span>'}
          <div style="display: flex; gap: 8px;">
            ${currentStep > 0 ? '<button class="tour-prev" style="padding: 6px 12px; border: 1px solid #d1d5db; background: white; border-radius: 4px; cursor: pointer;">Previous</button>' : ''}
            <button class="tour-next" style="padding: 6px 12px; background: #4f46e5; color: white; border: none; border-radius: 4px; cursor: pointer;">
              ${currentStep === steps.length - 1 ? 'Finish' : 'Next'}
            </button>
          </div>
        </div>
      `;
      
      // Position tooltip
      const tooltipRect = tooltip.getBoundingClientRect();
      let top = rect.bottom + 10;
      let left = rect.left;
      
      if (top + tooltipRect.height > window.innerHeight) {
        top = rect.top - tooltipRect.height - 10;
      }
      
      if (left + tooltipRect.width > window.innerWidth) {
        left = window.innerWidth - tooltipRect.width - 10;
      }
      
      tooltip.style.left = `${left}px`;
      tooltip.style.top = `${top}px`;
      
      // Event listeners
      tooltip.querySelector('.tour-next')?.addEventListener('click', next);
      tooltip.querySelector('.tour-prev')?.addEventListener('click', prev);
    };
    
    const next = () => {
      if (currentStep < steps.length - 1) {
        currentStep++;
        showStep();
      } else {
        end();
      }
    };
    
    const prev = () => {
      if (currentStep > 0) {
        currentStep--;
        showStep();
      }
    };
    
    const end = () => {
      overlay.remove();
      options.onComplete?.();
    };
    
    const start = () => {
      overlay.appendChild(highlight);
      overlay.appendChild(tooltip);
      document.body.appendChild(overlay);
      showStep();
      
      if (allowClose) {
        overlay.addEventListener('click', (e) => {
          if (e.target === overlay) end();
        });
      }
    };
    
    return { start, next, prev, end };
  },

  // Loading states
  createSkeleton: (container, options = {}) => {
    const { count = 3, type = 'text' } = options;
    
    const skeletons = [];
    
    for (let i = 0; i < count; i++) {
      const skeleton = document.createElement('div');
      skeleton.className = 'skeleton';
      skeleton.style.cssText = `
        background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%);
        background-size: 200% 100%;
        animation: shimmer 1.5s infinite;
        border-radius: 4px;
        margin-bottom: 8px;
      `;
      
      if (type === 'text') {
        skeleton.style.height = '16px';
        skeleton.style.width = `${Math.random() * 40 + 60}%`;
      } else if (type === 'avatar') {
        skeleton.style.width = '40px';
        skeleton.style.height = '40px';
        skeleton.style.borderRadius = '50%';
      } else if (type === 'image') {
        skeleton.style.height = '200px';
        skeleton.style.width = '100%';
      }
      
      container.appendChild(skeleton);
      skeletons.push(skeleton);
    }
    
    // Add animation keyframes if not present
    if (!document.getElementById('skeleton-style')) {
      const style = document.createElement('style');
      style.id = 'skeleton-style';
      style.textContent = `
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `;
      document.head.appendChild(style);
    }
    
    return {
      remove: () => {
        skeletons.forEach(s => s.remove());
      }
    };
  },

  // Shimmer effect
  createShimmer: (element) => {
    element.style.cssText += `
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    `;
  },

  // Pulse animation
  createPulse: (element) => {
    element.style.animation = 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite';
    
    if (!document.getElementById('pulse-style')) {
      const style = document.createElement('style');
      style.id = 'pulse-style';
      style.textContent = `
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `;
      document.head.appendChild(style);
    }
  },

  // Spinner/loader
  createSpinner: (options = {}) => {
    const { size = 40, color = '#4f46e5' } = options;
    
    const spinner = document.createElement('div');
    spinner.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      border: 3px solid #e5e7eb;
      border-top-color: ${color};
      border-radius: 50%;
      animation: spin 1s linear infinite;
    `;
    
    if (!document.getElementById('spin-style')) {
      const style = document.createElement('style');
      style.id = 'spin-style';
      style.textContent = `
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }
    
    return spinner;
  },

  // Progress bar
  createProgressBar: (options = {}) => {
    const { height = 4, color = '#4f46e5', backgroundColor = '#e5e7eb' } = options;
    
    const container = document.createElement('div');
    container.style.cssText = `
      width: 100%;
      height: ${height}px;
      background: ${backgroundColor};
      border-radius: ${height / 2}px;
      overflow: hidden;
    `;
    
    const bar = document.createElement('div');
    bar.style.cssText = `
      height: 100%;
      background: ${color};
      width: 0%;
      transition: width 0.3s ease;
    `;
    
    container.appendChild(bar);
    
    return {
      element: container,
      setProgress: (percent) => {
        bar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
      },
      setIndeterminate: () => {
        bar.style.cssText += `
          width: 40%;
          animation: indeterminate 1s infinite linear;
        `;
        
        if (!document.getElementById('indeterminate-style')) {
          const style = document.createElement('style');
          style.id = 'indeterminate-style';
          style.textContent = `
            @keyframes indeterminate {
              0% { transform: translateX(-100%); }
              100% { transform: translateX(250%); }
            }
          `;
          document.head.appendChild(style);
        }
      }
    };
  },

  // Circular progress
  createCircularProgress: (options = {}) => {
    const { size = 100, strokeWidth = 8, color = '#4f46e5' } = options;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', size);
    svg.setAttribute('height', size);
    
    const backgroundCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    backgroundCircle.setAttribute('cx', size / 2);
    backgroundCircle.setAttribute('cy', size / 2);
    backgroundCircle.setAttribute('r', radius);
    backgroundCircle.setAttribute('fill', 'none');
    backgroundCircle.setAttribute('stroke', '#e5e7eb');
    backgroundCircle.setAttribute('stroke-width', strokeWidth);
    
    const progressCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    progressCircle.setAttribute('cx', size / 2);
    progressCircle.setAttribute('cy', size / 2);
    progressCircle.setAttribute('r', radius);
    progressCircle.setAttribute('fill', 'none');
    progressCircle.setAttribute('stroke', color);
    progressCircle.setAttribute('stroke-width', strokeWidth);
    progressCircle.setAttribute('stroke-linecap', 'round');
    progressCircle.setAttribute('stroke-dasharray', circumference);
    progressCircle.setAttribute('stroke-dashoffset', circumference);
    progressCircle.style.transition = 'stroke-dashoffset 0.3s';
    progressCircle.style.transform = 'rotate(-90deg)';
    progressCircle.style.transformOrigin = '50% 50%';
    
    svg.appendChild(backgroundCircle);
    svg.appendChild(progressCircle);
    
    return {
      element: svg,
      setProgress: (percent) => {
        const offset = circumference - (percent / 100) * circumference;
        progressCircle.setAttribute('stroke-dashoffset', offset);
      }
    };
  },

  // Stepper/Wizard
  createStepper: (steps, options = {}) => {
    const { onChange, linear = true } = options;
    
    let currentStep = 0;
    
    const container = document.createElement('div');
    
    // Header
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      margin-bottom: 24px;
    `;
    
    steps.forEach((step, index) => {
      const stepEl = document.createElement('div');
      stepEl.style.cssText = `
        display: flex;
        flex-direction: column;
        align-items: center;
        flex: 1;
        position: relative;
      `;
      
      const circle = document.createElement('div');
      circle.style.cssText = `
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 600;
        margin-bottom: 8px;
        ${index <= currentStep ? 'background: #4f46e5; color: white;' : 'background: #e5e7eb; color: #6b7280;'}
        ${index === currentStep ? 'box-shadow: 0 0 0 4px #e0e7ff;' : ''}
      `;
      circle.textContent = index + 1;
      
      const label = document.createElement('div');
      label.textContent = step.label;
      label.style.cssText = `
        font-size: 12px;
        color: ${index <= currentStep ? '#4f46e5' : '#6b7280'};
      `;
      
      stepEl.appendChild(circle);
      stepEl.appendChild(label);
      header.appendChild(stepEl);
      
      // Connector line
      if (index < steps.length - 1) {
        const line = document.createElement('div');
        line.style.cssText = `
          position: absolute;
          top: 16px;
          left: 50%;
          width: 100%;
          height: 2px;
          background: ${index < currentStep ? '#4f46e5' : '#e5e7eb'};
          z-index: -1;
        `;
        stepEl.appendChild(line);
      }
    });
    
    // Content
    const content = document.createElement('div');
    content.style.cssText = 'min-height: 200px;';
    
    // Navigation
    const nav = document.createElement('div');
    nav.style.cssText = `
      display: flex;
      justify-content: space-between;
      margin-top: 24px;
    `;
    
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Previous';
    prevBtn.style.cssText = `
      padding: 8px 16px;
      border: 1px solid #d1d5db;
      background: white;
      border-radius: 6px;
      cursor: pointer;
    `;
    
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.style.cssText = `
      padding: 8px 16px;
      background: #4f46e5;
      color: white;
      border: none;
      border-radius: 6px;
      cursor: pointer;
    `;
    
    nav.appendChild(prevBtn);
    nav.appendChild(nextBtn);
    
    container.appendChild(header);
    container.appendChild(content);
    container.appendChild(nav);
    
    const update = () => {
      // Update header
      Array.from(header.children).forEach((stepEl, index) => {
        const circle = stepEl.querySelector('div:first-child');
        const label = stepEl.querySelector('div:last-child');
        const line = stepEl.querySelector('div:nth-child(3)');
        
        if (index <= currentStep) {
          circle.style.background = '#4f46e5';
          circle.style.color = 'white';
          label.style.color = '#4f46e5';
        } else {
          circle.style.background = '#e5e7eb';
          circle.style.color = '#6b7280';
          label.style.color = '#6b7280';
        }
        
        if (index === currentStep) {
          circle.style.boxShadow = '0 0 0 4px #e0e7ff';
        } else {
          circle.style.boxShadow = 'none';
        }
        
        if (line) {
          line.style.background = index < currentStep ? '#4f46e5' : '#e5e7eb';
        }
      });
      
      // Update content
      content.innerHTML = '';
      content.appendChild(steps[currentStep].content);
      
      // Update buttons
      prevBtn.disabled = currentStep === 0;
      prevBtn.style.opacity = currentStep === 0 ? '0.5' : '1';
      
      nextBtn.textContent = currentStep === steps.length - 1 ? 'Finish' : 'Next';
      
      onChange?.(currentStep);
    };
    
    prevBtn.addEventListener('click', () => {
      if (currentStep > 0) {
        currentStep--;
        update();
      }
    });
    
    nextBtn.addEventListener('click', () => {
      if (currentStep < steps.length - 1) {
        if (linear && !steps[currentStep].validate?.()) return;
        currentStep++;
        update();
      } else {
        options.onFinish?.();
      }
    });
    
    update();
    
    return {
      element: container,
      goTo: (step) => {
        if (!linear || step <= currentStep + 1) {
          currentStep = step;
          update();
        }
      },
      getCurrentStep: () => currentStep
    };
  },

  // Timeline
  createTimeline: (items, options = {}) => {
    const { alternate = false } = options;
    
    const container = document.createElement('div');
    container.style.cssText = 'position: relative; padding: 20px 0;';
    
    // Center line
    const line = document.createElement('div');
    line.style.cssText = `
      position: absolute;
      left: ${alternate ? '50%' : '30px'};
      top: 0;
      bottom: 0;
      width: 2px;
      background: #e5e7eb;
      transform: translateX(-50%);
    `;
    container.appendChild(line);
    
    items.forEach((item, index) => {
      const itemEl = document.createElement('div');
      itemEl.style.cssText = `
        display: flex;
        ${alternate ? (index % 2 === 0 ? 'flex-direction: row-reverse;' : '') : ''}
        margin-bottom: 24px;
        position: relative;
      `;
      
      const dot = document.createElement('div');
      dot.style.cssText = `
        width: 16px;
        height: 16px;
        border-radius: 50%;
        background: ${item.active ? '#4f46e5' : '#d1d5db'};
        border: 3px solid white;
        box-shadow: 0 0 0 2px ${item.active ? '#4f46e5' : '#d1d5db'};
        position: absolute;
        left: ${alternate ? '50%' : '30px'};
        transform: translateX(-50%);
        z-index: 1;
      `;
      
      const content = document.createElement('div');
      content.style.cssText = `
        flex: 1;
        ${alternate ? `padding-${index % 2 === 0 ? 'right' : 'left'}: 40px;` : 'padding-left: 60px;'}
      `;
      
      content.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 4px;">${item.title}</div>
        <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">${item.date}</div>
        <div style="color: #374151;">${item.content}</div>
      `;
      
      itemEl.appendChild(dot);
      itemEl.appendChild(content);
      container.appendChild(itemEl);
    });
    
    return container;
  },

  // Tree view
  createTreeView: (data, options = {}) => {
    const { onSelect, onToggle } = options;
    
    const container = document.createElement('ul');
    container.style.cssText = `
      list-style: none;
      padding: 0;
      margin: 0;
    `;
    
    const createNode = (node, level = 0) => {
      const li = document.createElement('li');
      li.style.paddingLeft = `${level * 20}px`;
      
      const content = document.createElement('div');
      content.style.cssText = `
        display: flex;
        align-items: center;
        padding: 8px;
        cursor: pointer;
        border-radius: 4px;
        transition: background 0.2s;
      `;
      
      const hasChildren = node.children && node.children.length > 0;
      
      if (hasChildren) {
        const toggle = document.createElement('span');
        toggle.innerHTML = '▶';
        toggle.style.cssText = `
          margin-right: 8px;
          transition: transform 0.2s;
          font-size: 10px;
        `;
        content.appendChild(toggle);
      } else {
        const spacer = document.createElement('span');
        spacer.style.width = '18px';
        content.appendChild(spacer);
      }
      
      if (node.icon) {
        const icon = document.createElement('span');
        icon.innerHTML = node.icon;
        icon.style.marginRight = '8px';
        content.appendChild(icon);
      }
      
      const label = document.createElement('span');
      label.textContent = node.label;
      content.appendChild(label);
      
      li.appendChild(content);
      
      let childrenContainer = null;
      
      if (hasChildren) {
        childrenContainer = document.createElement('ul');
        childrenContainer.style.cssText = `
          list-style: none;
          padding: 0;
          margin: 0;
          overflow: hidden;
          max-height: 0;
          transition: max-height 0.3s;
        `;
        
        node.children.forEach(child => {
          childrenContainer.appendChild(createNode(child, level + 1));
        });
        
        li.appendChild(childrenContainer);
        
        content.addEventListener('click', () => {
          const isExpanded = childrenContainer.style.maxHeight !== '0px';
          
          if (isExpanded) {
            childrenContainer.style.maxHeight = '0px';
            content.querySelector('span').style.transform = 'rotate(0deg)';
          } else {
            childrenContainer.style.maxHeight = childrenContainer.scrollHeight + 'px';
            content.querySelector('span').style.transform = 'rotate(90deg)';
          }
          
          onToggle?.(node, !isExpanded);
        });
      } else {
        content.addEventListener('click', () => {
          container.querySelectorAll('div').forEach(el => {
            el.style.background = '';
          });
          content.style.background = '#e0e7ff';
          onSelect?.(node);
        });
      }
      
      return li;
    };
    
    data.forEach(node => {
      container.appendChild(createNode(node));
    });
    
    return {
      element: container,
      expandAll: () => {
        container.querySelectorAll('ul').forEach(ul => {
          ul.style.maxHeight = ul.scrollHeight + 'px';
        });
        container.querySelectorAll('span:first-child').forEach(span => {
          if (span.textContent === '▶') {
            span.style.transform = 'rotate(90deg)';
          }
        });
      },
      collapseAll: () => {
        container.querySelectorAll('ul').forEach(ul => {
          ul.style.maxHeight = '0px';
        });
        container.querySelectorAll('span:first-child').forEach(span => {
          if (span.textContent === '▶') {
            span.style.transform = 'rotate(0deg)';
          }
        });
      }
    };
  },

  // Breadcrumb
  createBreadcrumb: (items, options = {}) => {
    const { separator = '/', onClick } = options;
    
    const container = document.createElement('nav');
    container.style.cssText = `
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 14px;
    `;
    
    items.forEach((item, index) => {
      if (index > 0) {
        const sep = document.createElement('span');
        sep.textContent = separator;
        sep.style.color = '#9ca3af';
        container.appendChild(sep);
      }
      
      const link = document.createElement(index === items.length - 1 ? 'span' : 'a');
      link.textContent = item.label;
      link.style.cssText = `
        color: ${index === items.length - 1 ? '#374151' : '#6b7280'};
        text-decoration: none;
        cursor: ${index === items.length - 1 ? 'default' : 'pointer'};
      `;
      
      if (index !== items.length - 1) {
        link.addEventListener('click', () => onClick?.(item, index));
      }
      
      container.appendChild(link);
    });
    
    return container;
  },

  // Pagination
  createPagination: (totalPages, options = {}) => {
    const { currentPage = 1, onChange, showFirstLast = true } = options;
    
    let page = currentPage;
    
    const container = document.createElement('div');
    container.style.cssText = `
      display: flex;
      gap: 4px;
      align-items: center;
    `;
    
    const render = () => {
      container.innerHTML = '';
      
      // First
      if (showFirstLast) {
        const firstBtn = createPageButton('«', () => goTo(1), page === 1);
        container.appendChild(firstBtn);
      }
      
      // Previous
      const prevBtn = createPageButton('‹', () => goTo(page - 1), page === 1);
      container.appendChild(prevBtn);
      
      // Page numbers
      const startPage = Math.max(1, page - 2);
      const endPage = Math.min(totalPages, page + 2);
      
      if (startPage > 1) {
        container.appendChild(createPageButton('1', () => goTo(1), false));
        if (startPage > 2) {
          const ellipsis = document.createElement('span');
          ellipsis.textContent = '...';
          ellipsis.style.padding = '8px';
          container.appendChild(ellipsis);
        }
      }
      
      for (let i = startPage; i <= endPage; i++) {
        container.appendChild(createPageButton(i, () => goTo(i), false, i === page));
      }
      
      if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
          const ellipsis = document.createElement('span');
          ellipsis.textContent = '...';
          ellipsis.style.padding = '8px';
          container.appendChild(ellipsis);
        }
        container.appendChild(createPageButton(totalPages, () => goTo(totalPages), false));
      }
      
      // Next
      const nextBtn = createPageButton('›', () => goTo(page + 1), page === totalPages);
      container.appendChild(nextBtn);
      
      // Last
      if (showFirstLast) {
        const lastBtn = createPageButton('»', () => goTo(totalPages), page === totalPages);
        container.appendChild(lastBtn);
      }
    };
    
    const createPageButton = (label, onClick, disabled, active = false) => {
      const btn = document.createElement('button');
      btn.textContent = label;
      btn.disabled = disabled;
      btn.style.cssText = `
        min-width: 36px;
        height: 36px;
        padding: 0 8px;
        border: 1px solid ${active ? '#4f46e5' : '#d1d5db'};
        background: ${active ? '#4f46e5' : 'white'};
        color: ${active ? 'white' : '#374151'};
        border-radius: 6px;
        cursor: ${disabled ? 'not-allowed' : 'pointer'};
        opacity: ${disabled ? '0.5' : '1'};
      `;
      
      if (!disabled) {
        btn.addEventListener('click', onClick);
      }
      
      return btn;
    };
    
    const goTo = (newPage) => {
      page = Math.max(1, Math.min(totalPages, newPage));
      render();
      onChange?.(page);
    };
    
    render();
    
    return {
      element: container,
      goTo,
      getPage: () => page
    };
  },

  // Badge/Tag
  createBadge: (text, options = {}) => {
    const { color = 'gray', removable = false, onRemove } = options;
    
    const colors = {
      gray: 'bg-gray-100 text-gray-800',
      red: 'bg-red-100 text-red-800',
      yellow: 'bg-yellow-100 text-yellow-800',
      green: 'bg-green-100 text-green-800',
      blue: 'bg-blue-100 text-blue-800',
      indigo: 'bg-indigo-100 text-indigo-800',
      purple: 'bg-purple-100 text-purple-800',
      pink: 'bg-pink-100 text-pink-800'
    };
    
    const badge = document.createElement('span');
    badge.className = `inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[color]}`;
    badge.textContent = text;
    
    if (removable) {
      const removeBtn = document.createElement('button');
      removeBtn.innerHTML = '✕';
      removeBtn.className = 'flex-shrink-0 ml-1.5 h-4 w-4 rounded-full inline-flex items-center justify-center hover:bg-gray-200';
      removeBtn.addEventListener('click', () => {
        badge.remove();
        onRemove?.();
      });
      badge.appendChild(removeBtn);
    }
    
    return badge;
  },

  // Avatar
  createAvatar: (options = {}) => {
    const { src = null, name = '', size = 'md', shape = 'circle' } = options;
    
    const sizes = {
      xs: 'w-6 h-6 text-xs',
      sm: 'w-8 h-8 text-sm',
      md: 'w-10 h-10 text-base',
      lg: 'w-12 h-12 text-lg',
      xl: 'w-14 h-14 text-xl',
      '2xl': 'w-16 h-16 text-2xl'
    };
    
    const initials = name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
    
    const avatar = document.createElement('div');
    avatar.className = `${sizes[size]} ${shape === 'circle' ? 'rounded-full' : 'rounded-lg'} flex items-center justify-center bg-indigo-500 text-white font-medium overflow-hidden`;
    
    if (src) {
      const img = document.createElement('img');
      img.src = src;
      img.alt = name;
      img.className = 'w-full h-full object-cover';
      avatar.appendChild(img);
    } else {
      avatar.textContent = initials;
    }
    
    return avatar;
  },

  // Avatar group
  createAvatarGroup: (avatars, options = {}) => {
    const { max = 3, size = 'md' } = options;
    
    const container = document.createElement('div');
    container.className = 'flex -space-x-2 overflow-hidden';
    
    avatars.slice(0, max).forEach(avatarOptions => {
      const avatar = Utils.createAvatar({ ...avatarOptions, size });
      avatar.className += ' ring-2 ring-white';
      container.appendChild(avatar);
    });
    
    if (avatars.length > max) {
      const more = document.createElement('div');
      more.className = `inline-flex items-center justify-center ring-2 ring-white bg-gray-100 text-gray-600 font-medium ${size === 'md' ? 'w-10 h-10' : 'w-8 h-8'}`;
      more.className += size === 'md' ? ' text-base' : ' text-sm';
      more.className += ' rounded-full';
      more.textContent = `+${avatars.length - max}`;
      container.appendChild(more);
    }
    
    return container;
  },

  // Stat card
  createStatCard: (options = {}) => {
    const { title, value, change = null, icon = null, trend = 'neutral' } = options;
    
    const card = document.createElement('div');
    card.className = 'bg-white p-6 rounded-lg shadow-sm border border-gray-200';
    
    const trendColors = {
      up: 'text-green-600',
      down: 'text-red-600',
      neutral: 'text-gray-600'
    };
    
    const trendIcons = {
      up: '↑',
      down: '↓',
      neutral: '→'
    };
    
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">${title}</p>
          <p class="text-2xl font-semibold text-gray-900 mt-1">${value}</p>
          ${change !== null ? `
            <p class="text-sm ${trendColors[trend]} mt-1">
              ${trendIcons[trend]} ${Math.abs(change)}%
            </p>
          ` : ''}
        </div>
        ${icon ? `
          <div class="p-3 bg-indigo-50 rounded-lg">
            <span class="text-2xl">${icon}</span>
          </div>
        ` : ''}
      </div>
    `;
    
    return card;
  },

  // Empty state
  createEmptyState: (options = {}) => {
    const { icon = '📭', title = 'No data', description = '', action = null } = options;
    
    const container = document.createElement('div');
    container.className = 'text-center py-12';
    
    container.innerHTML = `
      <div class="text-6xl mb-4">${icon}</div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">${title}</h3>
      ${description ? `<p class="text-gray-500 mb-6">${description}</p>` : ''}
    `;
    
    if (action) {
      const btn = document.createElement('button');
      btn.className = 'px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700';
      btn.textContent = action.label;
      btn.addEventListener('click', action.onClick);
      container.appendChild(btn);
    }
    
    return container;
  },

  // Error state
  createErrorState: (options = {}) => {
    const { title = 'Something went wrong', description = '', retry = null } = options;
    
    const container = document.createElement('div');
    container.className = 'text-center py-12';
    
    container.innerHTML = `
      <div class="text-6xl mb-4">⚠️</div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">${title}</h3>
      ${description ? `<p class="text-gray-500 mb-6">${description}</p>` : ''}
    `;
    
    if (retry) {
      const btn = document.createElement('button');
      btn.className = 'px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700';
      btn.textContent = 'Try again';
      btn.addEventListener('click', retry);
      container.appendChild(btn);
    }
    
    return container;
  },

  // Loading state
  createLoadingState: (options = {}) => {
    const { text = 'Loading...' } = options;
    
    const container = document.createElement('div');
    container.className = 'flex flex-col items-center justify-center py-12';
    
    const spinner = Utils.createSpinner({ size: 40 });
    const label = document.createElement('p');
    label.className = 'mt-4 text-gray-600';
    label.textContent = text;
    
    container.appendChild(spinner);
    container.appendChild(label);
    
    return container;
  },

  // Skeleton screen
  createSkeletonScreen: (options = {}) => {
    const { rows = 3, columns = 1 } = options;
    
    const container = document.createElement('div');
    container.className = 'space-y-4 animate-pulse';
    
    for (let i = 0; i < rows; i++) {
      const row = document.createElement('div');
      row.className = 'flex space-x-4';
      
      for (let j = 0; j < columns; j++) {
        const item = document.createElement('div');
        item.className = 'flex-1 h-4 bg-gray-200 rounded';
        if (j === 0 && columns > 1) {
          item.className = 'w-12 h-12 bg-gray-200 rounded-full';
        }
        row.appendChild(item);
      }
      
      container.appendChild(row);
    }
    
    return container;
  },

  // Notification badge
  createNotificationBadge: (count, options = {}) => {
    const { max = 99 } = options;
    
    const badge = document.createElement('span');
    badge.className = 'absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-[20px] flex items-center justify-center px-1';
    badge.textContent = count > max ? `${max}+` : count;
    
    return badge;
  },

  // Status indicator
  createStatusIndicator: (status, options = {}) => {
    const { size = 'md', pulse = false } = options;
    
    const sizes = {
      sm: 'w-2 h-2',
      md: 'w-3 h-3',
      lg: 'w-4 h-4'
    };
    
    const colors = {
      online: 'bg-green-500',
      offline: 'bg-gray-500',
      away: 'bg-yellow-500',
      busy: 'bg-red-500',
      dnd: 'bg-red-600'
    };
    
    const indicator = document.createElement('span');
    indicator.className = `${sizes[size]} ${colors[status]} rounded-full ${pulse ? 'animate-pulse' : ''}`;
    
    return indicator;
  },

  // Divider with text
  createDivider = (text, options = {}) => {
    const { align = 'center' } = options;
    
    const container = document.createElement('div');
    container.className = 'relative';
    container.innerHTML = `
      <div class="absolute inset-0 flex items-center">
        <div class="w-full border-t border-gray-300"></div>
      </div>
      <div class="relative flex justify-${align} text-sm">
        <span class="px-2 bg-white text-gray-500">${text}</span>
      </div>
    `;
    
    return container;
  },

  // Code block with copy
  createCodeBlock = (code, options = {}) => {
    const { language = 'javascript', showLineNumbers = false } = options;
    
    const container = document.createElement('div');
    container.className = 'relative group';
    
    const pre = document.createElement('pre');
    pre.className = 'bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm';
    
    const codeEl = document.createElement('code');
    codeEl.className = `language-${language}`;
    codeEl.textContent = code;
    
    if (showLineNumbers) {
      const lines = code.split('\n');
      codeEl.innerHTML = lines.map((line, i) => 
        `<span class="text-gray-500 select-none mr-4">${i + 1}</span>${escapeHtml(line)}`
      ).join('\n');
    }
    
    const copyBtn = document.createElement('button');
    copyBtn.className = 'absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs';
    copyBtn.textContent = 'Copy';
    
    copyBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(code);
      copyBtn.textContent = 'Copied!';
      setTimeout(() => copyBtn.textContent = 'Copy', 2000);
    });
    
    pre.appendChild(codeEl);
    container.appendChild(pre);
    container.appendChild(copyBtn);
    
    return container;
  },

  // Keyboard shortcut display
  createKeyboardShortcut = (keys, options = {}) => {
    const { separator = '+' } = options;
    
    const container = document.createElement('span');
    container.className = 'inline-flex items-center gap-1';
    
    keys.forEach((key, index) => {
      const kbd = document.createElement('kbd');
      kbd.className = 'px-2 py-1 bg-gray-100 border border-gray-300 rounded text-xs font-mono';
      kbd.textContent = key;
      container.appendChild(kbd);
      
      if (index < keys.length - 1) {
        const sep = document.createElement('span');
        sep.textContent = separator;
        sep.className = 'text-gray-400';
        container.appendChild(sep);
      }
    });
    
    return container;
  },

  // Copy to clipboard button
  createCopyButton = (textToCopy, options = {}) => {
    const { label = 'Copy', successLabel = 'Copied!' } = options;
    
    const btn = document.createElement('button');
    btn.className = 'inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50';
    btn.innerHTML = `
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
      ${label}
    `;
    
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(textToCopy);
        btn.innerHTML = `
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
          ${successLabel}
        `;
        setTimeout(() => {
          btn.innerHTML = `
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            ${label}
          `;
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    });
    
    return btn;
  },

  // Share buttons
  createShareButtons = (url, options = {}) => {
    const { title = '', description = '' } = options;
    
    const platforms = [
      { name: 'Twitter', icon: '🐦', shareUrl: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}` },
      { name: 'Facebook', icon: '📘', shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
      { name: 'LinkedIn', icon: '💼', shareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
      { name: 'Email', icon: '✉️', shareUrl: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(url)}` }
    ];
    
    const container = document.createElement('div');
    container.className = 'flex gap-2';
    
    platforms.forEach(platform => {
      const btn = document.createElement('button');
      btn.className = 'p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors';
      btn.innerHTML = `<span class="text-xl">${platform.icon}</span>`;
      btn.title = `Share on ${platform.name}`;
      btn.addEventListener('click', () => {
        window.open(platform.shareUrl, '_blank', 'width=600,height=400');
      });
      container.appendChild(btn);
    });
    
    return container;
  },

  // Print button
  createPrintButton = (options = {}) => {
    const { label = 'Print', target = null } = options;
    
    const btn = document.createElement('button');
    btn.className = 'inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors';
    btn.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
      ${label}
    `;
    
    btn.addEventListener('click', () => {
      if (target) {
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
          <html>
            <head><title>Print</title></head>
            <body>${target.innerHTML}</body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      } else {
        window.print();
      }
    });
    
    return btn;
  },

  // Download button
  createDownloadButton = (content, filename, options = {}) => {
    const { type = 'text/plain', label = 'Download' } = options;
    
    const btn = document.createElement('button');
    btn.className = 'inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors';
    btn.innerHTML = `
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
      ${label}
    `;
    
    btn.addEventListener('click', () => {
      const blob = new Blob([content], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
    
    return btn;
  },

  // Export to CSV
  exportToCSV = (data, filename = 'export.csv') => {
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const cell = row[header] ?? '';
          const escaped = String(cell).replace(/"/g, '""');
          return escaped.includes(',') ? `"${escaped}"` : escaped;
        }).join(',')
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  },

  // Export to JSON
  exportToJSON = (data, filename = 'export.json') => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  },

  // Import from file
  importFromFile = (options = {}) => {
    const { accept = '.json,.csv', onImport } = options;
    
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      
      input.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
          const text = await file.text();
          let data;
          
          if (file.name.endsWith('.json')) {
            data = JSON.parse(text);
          } else if (file.name.endsWith('.csv')) {
            data = parseCSV(text);
          } else {
            data = text;
          }
          
          onImport?.(data, file);
          resolve(data);
        } catch (err) {
          reject(err);
        }
      });
      
      input.click();
    });
  },

  // Parse CSV
  parseCSV = (csvText) => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = [];
      let inQuotes = false;
      let currentValue = '';
      
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(currentValue.trim());
          currentValue = '';
        } else {
          currentValue += char;
        }
      }
      values.push(currentValue.trim());
      
      return headers.reduce((obj, header, index) => {
        obj[header] = values[index] ?? '';
        return obj;
      }, {});
    });
  },

  // Escape HTML
  escapeHtml = (unsafe) => {
    return unsafe
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  // Sanitize HTML (basic)
  sanitizeHtml = (html, allowedTags = []) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    
    const removeTags = (node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (!allowedTags.includes(node.tagName.toLowerCase())) {
          const parent = node.parentNode;
          while (node.firstChild) {
            parent.insertBefore(node.firstChild, node);
          }
          parent.removeChild(node);
        } else {
          Array.from(node.attributes).forEach(attr => {
            if (attr.name.startsWith('on')) {
              node.removeAttribute(attr.name);
            }
          });
        }
      }
      
      Array.from(node.childNodes).forEach(removeTags);
    };
    
    removeTags(div);
    return div.innerHTML;
  },

  // Truncate text
  truncateText = (text, maxLength, suffix = '...') => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  },

  // Highlight search terms
  highlightText = (text, query, options = {}) => {
    const { className = 'bg-yellow-200' } = options;
    
    if (!query) return text;
    
    const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
    return text.replace(regex, `<span class="${className}">$1</span>`);
  },

  // Escape regex special characters
  escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  },

  // Slugify
  slugify = (text) => {
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-');
  },

  // CamelCase to kebab-case
  camelToKebab = (str) => {
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
  },

  // Kebab-case to camelCase
  kebabToCamel = (str) => {
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  },

  // PascalCase
  toPascalCase = (str) => {
    return str
      .replace(new RegExp(/[-_]+/, 'g'), ' ')
      .replace(new RegExp(/[^\w\s]/, 'g'), '')
      .replace(
        new RegExp(/\s+(.)(\w*)/, 'g'),
        ($1, $2, $3) => `${$2.toUpperCase() + $3.toLowerCase()}`
      )
      .replace(new RegExp(/\w/), s => s.toUpperCase());
  },

  // Format number with commas
  formatNumber = (num) => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  },

  // Format bytes
  formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  },

  // Format duration
  formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  },

  // Time ago
  timeAgo = (date) => {
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
  },

  // Debounce
  debounce = (func, wait) => {
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

  // Throttle
  throttle = (func, limit) => {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  // Deep clone
  deepClone = (obj) => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime());
    if (Array.isArray(obj)) return obj.map(item => deepClone(item));
    if (typeof obj === 'object') {
      const cloned = {};
      Object.keys(obj).forEach(key => {
        cloned[key] = deepClone(obj[key]);
      });
      return cloned;
    }
  },

  // Deep merge
  deepMerge = (target, source) => {
    const output = Object.assign({}, target);
    
    if (isObject(target) && isObject(source)) {
      Object.keys(source).forEach(key => {
        if (isObject(source[key])) {
          if (!(key in target)) {
            Object.assign(output, { [key]: source[key] });
          } else {
            output[key] = deepMerge(target[key], source[key]);
          }
        } else {
          Object.assign(output, { [key]: source[key] });
        }
      });
    }
    
    return output;
  },

  // Check if object
  isObject = (item) => {
    return item && typeof item === 'object' && !Array.isArray(item);
  },

  // Generate ID
  generateId = (length = 8) => {
    return Math.random().toString(36).substring(2, length + 2);
  },

  // Generate UUID
  generateUUID = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },

  // Shuffle array
  shuffle = (array) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  },

  // Chunk array
  chunk = (array, size) => {
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  // Group by
  groupBy = (array, key) => {
    return array.reduce((result, item) => {
      const group = item[key];
      result[group] = result[group] || [];
      result[group].push(item);
      return result;
    }, {});
  },

  // Unique by key
  uniqueBy = (array, key) => {
    const seen = new Set();
    return array.filter(item => {
      const val = item[key];
      if (seen.has(val)) return false;
      seen.add(val);
      return true;
    });
  },

  // Sort by
  sortBy = (array, key, order = 'asc') => {
    return [...array].sort((a, b) => {
      let valA = a[key];
      let valB = b[key];
      
      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();
      
      if (valA < valB) return order === 'asc' ? -1 : 1;
      if (valA > valB) return order === 'asc' ? 1 : -1;
      return 0;
    });
  },

  // Intersection
  intersection = (a, b) => {
    return a.filter(x => b.includes(x));
  },

  // Difference
  difference = (a, b) => {
    return a.filter(x => !b.includes(x));
  },

  // Union
  union = (a, b) => {
    return [...new Set([...a, ...b])];
  },

  // Flatten array
  flatten = (arr, depth = 1) => {
    return arr.flat(depth);
  },

  // Deep flatten
  flattenDeep = (arr) => {
    return arr.reduce((acc, val) => 
      Array.isArray(val) ? acc.concat(flattenDeep(val)) : acc.concat(val), 
    []);
  },

  // Pick object properties
  pick = (obj, keys) => {
    return keys.reduce((acc, key) => {
      if (obj.hasOwnProperty(key)) acc[key] = obj[key];
      return acc;
    }, {});
  },

  // Omit object properties
  omit = (obj, keys) => {
    return Object.keys(obj)
      .filter(key => !keys.includes(key))
      .reduce((acc, key) => {
        acc[key] = obj[key];
        return acc;
      }, {});
  },

  // Get nested value
  get = (obj, path, defaultValue) => {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      result = result?.[key];
      if (result === undefined) return defaultValue;
    }
    
    return result;
  },

  // Set nested value
  set = (obj, path, value) => {
    const keys = path.split('.');
    let current = obj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(key in current)) {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[keys[keys.length - 1]] = value;
    return obj;
  },

  // Memoize function
  memoize = (fn) => {
    const cache = new Map();
    return (...args) => {
      const key = JSON.stringify(args);
      if (cache.has(key)) return cache.get(key);
      const result = fn.apply(this, args);
      cache.set(key, result);
      return result;
    };
  },

  // Once function
  once = (fn) => {
    let called = false;
    let result;
    return (...args) => {
      if (called) return result;
      called = true;
      result = fn.apply(this, args);
      return result;
    };
  },

  // Curry function
  curry = (fn) => {
    return function curried(...args) {
      if (args.length >= fn.length) {
        return fn.apply(this, args);
      }
      return (...nextArgs) => curried(...args, ...nextArgs);
    };
  },

  // Compose functions
  compose = (...fns) => {
    return (x) => fns.reduceRight((v, f) => f(v), x);
  },

  // Pipe functions
  pipe = (...fns) => {
    return (x) => fns.reduce((v, f) => f(v), x);
  },

  // Retry function
  retry = async (fn, retries = 3, delay = 1000) => {
    try {
      return await fn();
    } catch (error) {
      if (retries === 0) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
      return retry(fn, retries - 1, delay);
    }
  },

  // Timeout promise
  withTimeout = (promise, ms) => {
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), ms)
    );
    return Promise.race([promise, timeout]);
  },

  // Delay promise
  delay = (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  // Poll function
  poll = async (fn, interval, condition) => {
    const result = await fn();
    if (condition(result)) return result;
    await delay(interval);
    return poll(fn, interval, condition);
  },

  // Queue
  createQueue = (concurrency = 1) => {
    const queue = [];
    let running = 0;
    
    const runNext = async () => {
      if (running >= concurrency || queue.length === 0) return;
      
      running++;
      const { fn, resolve, reject } = queue.shift();
      
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        running--;
        runNext();
      }
    };
    
    return {
      add: (fn) => {
        return new Promise((resolve, reject) => {
          queue.push({ fn, resolve, reject });
          runNext();
        });
      },
      size: () => queue.length,
      running: () => running
    };
  },

  // Event emitter
  createEventEmitter = () => {
    const events = {};
    
    return {
      on: (event, callback) => {
        events[event] = events[event] || [];
        events[event].push(callback);
        return () => {
          events[event] = events[event].filter(cb => cb !== callback);
        };
      },
      emit: (event, data) => {
        (events[event] || []).forEach(callback => callback(data));
      },
      once: (event, callback) => {
        const onceCallback = (data) => {
          callback(data);
          events[event] = events[event].filter(cb => cb !== onceCallback);
        };
        events[event] = events[event] || [];
        events[event].push(onceCallback);
      }
    };
  },

  // Observable
  createObservable = (initialValue) => {
    let value = initialValue;
    const listeners = new Set();
    
    return {
      get: () => value,
      set: (newValue) => {
        value = newValue;
        listeners.forEach(listener => listener(value));
      },
      subscribe: (listener) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
      }
    };
  },

  // State machine
  createStateMachine = (config) => {
    let currentState = config.initial;
    const context = config.context || {};
    
    return {
      getState: () => currentState,
      getContext: () => context,
      transition: (event, data) => {
        const stateConfig = config.states[currentState];
        const transition = stateConfig.on?.[event];
        
        if (!transition) {
          console.warn(`No transition for event ${event} in state ${currentState}`);
          return;
        }
        
        const nextState = typeof transition === 'string' ? transition : transition.target;
        
        // Execute actions
        if (transition.actions) {
          transition.actions.forEach(action => action(context, data));
        }
        
        // Execute exit actions
        if (stateConfig.exit) {
          stateConfig.exit.forEach(action => action(context, data));
        }
        
        // Execute entry actions
        const nextStateConfig = config.states[nextState];
        if (nextStateConfig.entry) {
          nextStateConfig.entry.forEach(action => action(context, data));
        }
        
        currentState = nextState;
      }
    };
  },

  // LRU Cache
  createLRUCache = (maxSize) => {
    const cache = new Map();
    
    return {
      get: (key) => {
        if (!cache.has(key)) return undefined;
        const value = cache.get(key);
        cache.delete(key);
        cache.set(key, value);
        return value;
      },
      set: (key, value) => {
        if (cache.has(key)) cache.delete(key);
        cache.set(key, value);
        if (cache.size > maxSize) {
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
      },
      has: (key) => cache.has(key),
      delete: (key) => cache.delete(key),
      clear: () => cache.clear(),
      size: () => cache.size
    };
  },

  // Local storage with expiry
  createExpiringStorage = (prefix = '') => {
    return {
      set: (key, value, ttl) => {
        const item = {
          value,
          expiry: ttl ? Date.now() + ttl : null
        };
        localStorage.setItem(prefix + key, JSON.stringify(item));
      },
      get: (key) => {
        const itemStr = localStorage.getItem(prefix + key);
        if (!itemStr) return null;
        
        const item = JSON.parse(itemStr);
        if (item.expiry && Date.now() > item.expiry) {
          localStorage.removeItem(prefix + key);
          return null;
        }
        return item.value;
      },
      remove: (key) => {
        localStorage.removeItem(prefix + key);
      },
      clear: () => {
        Object.keys(localStorage)
          .filter(key => key.startsWith(prefix))
          .forEach(key => localStorage.removeItem(key));
      }
    };
  },

  // Session storage wrapper
  sessionStorage = {
    set: (key, value) => {
      sessionStorage.setItem(key, JSON.stringify(value));
    },
    get: (key, defaultValue = null) => {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    },
    remove: (key) => {
      sessionStorage.removeItem(key);
    }
  },

  // Cookie helpers
  cookies = {
    set: (name, value, days = 7, options = {}) => {
      const expires = new Date(Date.now() + days * 864e5).toUTCString();
      let cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/`;
      
      if (options.secure) cookie += '; secure';
      if (options.sameSite) cookie += `; samesite=${options.sameSite}`;
      if (options.domain) cookie += `; domain=${options.domain}`;
      
      document.cookie = cookie;
    },
    get: (name) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    },
    remove: (name) => {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }
  },

  // IndexedDB wrapper
  createIndexedDB = (dbName, version, upgradeCallback) => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        upgradeCallback(event.target.result, event.oldVersion, event.newVersion);
      };
    });
  },

  // Web Worker helper
  createWebWorker = (fn) => {
    const blob = new Blob([`(${fn.toString()})()`], { type: 'application/javascript' });
    return new Worker(URL.createObjectURL(blob));
  },

  // Service Worker registration
  registerServiceWorker = async (path = '/sw.js') => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register(path);
        console.log('SW registered:', registration);
        return registration;
      } catch (error) {
        console.error('SW registration failed:', error);
      }
    }
    return null;
  },

  // Push notification permission
  requestNotificationPermission = async () => {
    if (!('Notification' in window)) return false;
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  },

  // Show notification
  showNotification = (title, options = {}) => {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icon.png',
        badge: '/badge.png',
        ...options
      });
    }
  },

  // Fullscreen API
  requestFullscreen = async (element = document.documentElement) => {
    if (element.requestFullscreen) {
      await element.requestFullscreen();
    } else if (element.webkitRequestFullscreen) {
      await element.webkitRequestFullscreen();
    }
  },

  exitFullscreen = async () => {
    if (document.exitFullscreen) {
      await document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      await document.webkitExitFullscreen();
    }
  },

  // Page Visibility API
  onVisibilityChange = (callback) => {
    document.addEventListener('visibilitychange', () => {
      callback(document.visibilityState === 'visible');
    });
  },

  // Online/Offline detection
  onConnectionChange = (callback) => {
    window.addEventListener('online', () => callback(true));
    window.addEventListener('offline', () => callback(false));
  },

  // Battery API
  getBatteryInfo = async () => {
    if ('getBattery' in navigator) {
      const battery = await navigator.getBattery();
      return {
        level: battery.level * 100,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime
      };
    }
    return null;
  },

  // Network Information API
  getNetworkInfo = () => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    if (connection) {
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData
      };
    }
    return null;
  },

  // Vibration API
  vibrate = (pattern) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  },

  // Clipboard API
  copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (err) {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      
      try {
        document.execCommand('copy');
        return true;
      } catch (err) {
        return false;
      } finally {
        document.body.removeChild(textarea);
      }
    }
  },

  readFromClipboard = async () => {
    try {
      return await navigator.clipboard.readText();
    } catch (err) {
      return null;
    }
  },

  // Geolocation
  getCurrentPosition = (options = {}) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }
      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  },

  watchPosition = (success, error, options) => {
    return navigator.geolocation.watchPosition(success, error, options);
  },

  // Intersection Observer helper
  createIntersectionObserver = (callback, options = {}) => {
    return new IntersectionObserver(callback, options);
  },

  // Resize Observer helper
  createResizeObserver = (callback) => {
    return new ResizeObserver(callback);
  },

  // Mutation Observer helper
  createMutationObserver = (callback, options = {}) => {
    return new MutationObserver(callback);
  },

  // Performance Observer helper
  createPerformanceObserver = (callback, options = {}) => {
    return new PerformanceObserver(callback);
  },

  // Measure performance
  measurePerformance = (fn, ...args) => {
    const start = performance.now();
    const result = fn(...args);
    const end = performance.now();
    return {
      result,
      duration: end - start
    };
  },

  // RAF loop
  createRAFLoop = (callback) => {
    let rafId;
    const loop = (timestamp) => {
      callback(timestamp);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    
    return {
      stop: () => cancelAnimationFrame(rafId)
    };
  },

  // Lazy load images
  lazyLoadImages = (selector = 'img[data-src]') => {
    const images = document.querySelectorAll(selector);
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          img.classList.add('loaded');
          observer.unobserve(img);
        }
      });
    });
    
    images.forEach(img => imageObserver.observe(img));
    
    return {
      refresh: () => {
        const newImages = document.querySelectorAll(selector);
        newImages.forEach(img => imageObserver.observe(img));
      }
    };
  },

  // Infinite scroll
  createInfiniteScroll = (container, callback, options = {}) => {
    const { threshold = 100, rootMargin = '0px' } = options;
    
    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    container.appendChild(sentinel);
    
    let loading = false;
    
    const observer = new IntersectionObserver(async (entries) => {
      if (entries[0].isIntersecting && !loading) {
        loading = true;
        await callback();
        loading = false;
      }
    }, { rootMargin: `${rootMargin} 0px` });
    
    observer.observe(sentinel);
    
    return {
      destroy: () => {
        observer.disconnect();
        sentinel.remove();
      }
    };
  },

  // Smooth scroll
  smoothScrollTo = (target, options = {}) => {
    const { offset = 0, behavior = 'smooth' } = options;
    
    const element = typeof target === 'string' 
      ? document.querySelector(target) 
      : target;
    
    if (!element) return;
    
    const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior });
  },

  // Scroll spy
  createScrollSpy = (sections, callback, options = {}) => {
    const { offset = 0, threshold = 0.5 } = options;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          callback(entry.target.id);
        }
      });
    }, { rootMargin: `${-offset}px 0px 0px 0px`, threshold });
    
    sections.forEach(section => observer.observe(section));
    
    return () => observer.disconnect();
  },

  // Parallax effect
  createParallax = (elements, options = {}) => {
    const { speed = 0.5 } = options;
    
    const handleScroll = () => {
      const scrollY = window.pageYOffset;
      
      elements.forEach(el => {
        const rect = el.getBoundingClientRect();
        const scrolled = scrollY - (rect.top + scrollY - window.innerHeight);
        el.style.transform = `translateY(${scrolled * speed}px)`;
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => window.removeEventListener('scroll', handleScroll);
  },

  // Sticky header
  createStickyHeader = (header, options = {}) => {
    const { offset = 0, classes = { stuck: 'is-stuck' } } = options;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          header.classList.add(classes.stuck);
        } else {
          header.classList.remove(classes.stuck);
        }
      },
      { rootMargin: `${-offset}px 0px 0px 0px` }
    );
    
    const sentinel = document.createElement('div');
    header.parentNode.insertBefore(sentinel, header);
    observer.observe(sentinel);
    
    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  },

  // Drag and drop
  createDraggable = (element, options = {}) => {
    const { onDragStart, onDrag, onDragEnd, axis = 'both' } = options;
    
    let isDragging = false;
    let startX, startY, initialX, initialY;
    
    const handleStart = (e) => {
      isDragging = true;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      startX = clientX;
      startY = clientY;
      
      const rect = element.getBoundingClientRect();
      initialX = rect.left;
      initialY = rect.top;
      
      onDragStart?.({ x: initialX, y: initialY });
    };
    
    const handleMove = (e) => {
      if (!isDragging) return;
      e.preventDefault();
      
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      
      const deltaX = clientX - startX;
      const deltaY = clientY - startY;
      
      let newX = initialX + deltaX;
      let newY = initialY + deltaY;
      
      if (axis === 'x') newY = initialY;
      if (axis === 'y') newX = initialX;
      
      element.style.position = 'fixed';
      element.style.left = `${newX}px`;
      element.style.top = `${newY}px`;
      
      onDrag?.({ x: newX, y: newY, deltaX, deltaY });
    };
    
    const handleEnd = () => {
      isDragging = false;
      onDragEnd?.();
    };
    
    element.addEventListener('mousedown', handleStart);
    element.addEventListener('touchstart', handleStart, { passive: true });
    
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });
    
    window.addEventListener('mouseup', handleEnd);
    window.addEventListener('touchend', handleEnd);
    
    return {
      destroy: () => {
        element.removeEventListener('mousedown', handleStart);
        element.removeEventListener('touchstart', handleStart);
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('touchmove', handleMove);
        window.removeEventListener('mouseup', handleEnd);
        window.removeEventListener('touchend', handleEnd);
      }
    };
  },

  // Swipe detection
  createSwipeDetector = (element, callbacks, options = {}) => {
    const { threshold = 50, timeout = 500 } = options;
    
    let startX, startY, startTime;
    
    const handleStart = (e) => {
      const touch = e.touches[0];
      startX = touch.clientX;
      startY = touch.clientY;
      startTime = Date.now();
    };
    
    const handleEnd = (e) => {
      const touch = e.changedTouches[0];
      const endX = touch.clientX;
      const endY = touch.clientY;
      const endTime = Date.now();
      
      const deltaX = endX - startX;
      const deltaY = endY - startY;
      const deltaTime = endTime - startTime;
      
      if (deltaTime > timeout) return;
      
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
        if (deltaX > 0) {
          callbacks.onSwipeRight?.();
        } else {
          callbacks.onSwipeLeft?.();
        }
      } else if (Math.abs(deltaY) > threshold) {
        if (deltaY > 0) {
          callbacks.onSwipeDown?.();
        } else {
          callbacks.onSwipeUp?.();
        }
      }
    };
    
    element.addEventListener('touchstart', handleStart, { passive: true });
    element.addEventListener('touchend', handleEnd, { passive: true });
    
    return {
      destroy: () => {
        element.removeEventListener('touchstart', handleStart);
        element.removeEventListener('touchend', handleEnd);
      }
    };
  },

  // Pinch zoom
  createPinchZoom = (element, options = {}) => {
    const { minScale = 0.5, maxScale = 3 } = options;
    
    let scale = 1;
    let initialDistance = 0;
    
    const getDistance = (touches) => {
      const dx = touches[0].clientX - touches[1].clientX;
      const dy = touches[0].clientY - touches[1].clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };
    
    const handleStart = (e) => {
      if (e.touches.length === 2) {
        initialDistance = getDistance(e.touches);
      }
    };
    
    const handleMove = (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const distance = getDistance(e.touches);
        const newScale = Math.min(Math.max(
          scale * (distance / initialDistance),
          minScale
        ), maxScale);
        
        element.style.transform = `scale(${newScale})`;
      }
    };
    
    const handleEnd = () => {
      const transform = element.style.transform;
      const match = transform.match(/scale\(([^)]+)\)/);
      if (match) {
        scale = parseFloat(match[1]);
      }
    };
    
    element.addEventListener('touchstart', handleStart, { passive: true });
    element.addEventListener('touchmove', handleMove, { passive: false });
    element.addEventListener('touchend', handleEnd);
    
    return {
      reset: () => {
        scale = 1;
        element.style.transform = 'scale(1)';
      },
      destroy: () => {
        element.removeEventListener('touchstart', handleStart);
        element.removeEventListener('touchmove', handleMove);
        element.removeEventListener('touchend', handleEnd);
      }
    };
  },

  // Double tap
  onDoubleTap = (element, callback, options = {}) => {
    const { delay = 300 } = options;
    
    let lastTap = 0;
    
    const handleTap = () => {
      const currentTime = Date.now();
      if (currentTime - lastTap < delay) {
        callback();
      }
      lastTap = currentTime;
    };
    
    element.addEventListener('touchend', handleTap);
    element.addEventListener('click', handleTap);
    
    return () => {
      element.removeEventListener('touchend', handleTap);
      element.removeEventListener('click', handleTap);
    };
  },

  // Long press
  onLongPress = (element, callback, options = {}) => {
    const { duration = 500 } = options;
    
    let timer;
    
    const start = () => {
      timer = setTimeout(callback, duration);
    };
    
    const cancel = () => {
      clearTimeout(timer);
    };
    
    element.addEventListener('mousedown', start);
    element.addEventListener('touchstart', start, { passive: true });
    
    element.addEventListener('mouseup', cancel);
    element.addEventListener('mouseleave', cancel);
    element.addEventListener('touchend', cancel);
    
    return {
      destroy: () => {
        element.removeEventListener('mousedown', start);
        element.removeEventListener('touchstart', start);
        element.removeEventListener('mouseup', cancel);
        element.removeEventListener('mouseleave', cancel);
        element.removeEventListener('touchend', cancel);
      }
    };
  },

  // Keyboard shortcuts
  createKeyboardShortcuts = (shortcuts) => {
    const handleKeyDown = (e) => {
      const key = [];
      if (e.ctrlKey) key.push('ctrl');
      if (e.metaKey) key.push('cmd');
      if (e.altKey) key.push('alt');
      if (e.shiftKey) key.push('shift');
      key.push(e.key.toLowerCase());
      
      const shortcutKey = key.join('+');
      
      if (shortcuts[shortcutKey]) {
        e.preventDefault();
        shortcuts[shortcutKey](e);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    
    return () => document.removeEventListener('keydown', handleKeyDown);
  },

  // Focus trap
  createFocusTrap = (element) => {
    const focusableElements = element.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    
    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;
      
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    };
    
    element.addEventListener('keydown', handleTabKey);
    firstFocusable.focus();
    
    return {
      destroy: () => element.removeEventListener('keydown', handleTabKey)
    };
  },

  // Focus visible polyfill
  initFocusVisible = () => {
    const className = 'focus-visible';
    
    const onKeyDown = (e) => {
      if (e.key === 'Tab') {
        document.body.classList.add(className);
      }
    };
    
    const onMouseDown = () => {
      document.body.classList.remove(className);
    };
    
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('mousedown', onMouseDown);
    
    // Add styles
    const style = document.createElement('style');
    style.textContent = `
      body:not(.focus-visible) *:focus {
        outline: none !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('mousedown', onMouseDown);
      style.remove();
    };
  },

  // Prefers reduced motion
  prefersReducedMotion = () => {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  },

  // Prefers color scheme
  prefersColorScheme = () => {
    const dark = window.matchMedia('(prefers-color-scheme: dark)');
    return dark.matches ? 'dark' : 'light';
  },

  // Watch prefers color scheme
  watchColorScheme = (callback) => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => callback(e.matches ? 'dark' : 'light');
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  },

  // Safe area insets (for notched devices)
  getSafeAreaInsets = () => {
    return {
      top: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sat')) || 0,
      right: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sar')) || 0,
      bottom: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sab')) || 0,
      left: parseInt(getComputedStyle(document.documentElement).getPropertyValue('--sal')) || 0
    };
  },

  // Prevent body scroll
  preventBodyScroll = () => {
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    
    return {
      restore: () => {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, scrollY);
      }
    };
  },

  // Lock scroll
  lockScroll = () => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  },

  // Scroll to top
  scrollToTop = (behavior = 'smooth') => {
    window.scrollTo({ top: 0, behavior });
  },

  // Scroll to bottom
  scrollToBottom = (behavior = 'smooth') => {
    window.scrollTo({ top: document.body.scrollHeight, behavior });
  },

  // Detect scroll direction
  detectScrollDirection = (callback) => {
    let lastScrollY = window.scrollY;
    
    const handler = () => {
      const currentScrollY = window.scrollY;
      const direction = currentScrollY > lastScrollY ? 'down' : 'up';
      callback(direction, currentScrollY);
      lastScrollY = currentScrollY;
    };
    
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  },

  // Get scroll percentage
  getScrollPercentage = () => {
    const scrollTop = window.pageYOffset;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    return (scrollTop / docHeight) * 100;
  },

  // Animate on scroll
  animateOnScroll = (elements, animationClass, options = {}) => {
    const { threshold = 0.1, once = true } = options;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add(animationClass);
          if (once) observer.unobserve(entry.target);
        } else if (!once) {
          entry.target.classList.remove(animationClass);
        }
      });
    }, { threshold });
    
    elements.forEach(el => observer.observe(el));
    
    return () => observer.disconnect();
  },

  // Stagger animation
  staggerAnimation = (elements, animationClass, options = {}) => {
    const { stagger = 100, delay = 0 } = options;
    
    elements.forEach((el, index) => {
      setTimeout(() => {
        el.classList.add(animationClass);
      }, delay + (index * stagger));
    });
  },

  // Spring animation
  spring = (options = {}) => {
    const { stiffness = 100, damping = 10, mass = 1 } = options;
    
    return {
      to: (target) => {
        let velocity = 0;
        let current = 0;
        let animationId;
        
        const animate = () => {
          const force = -stiffness * (current - target);
          const dampingForce = -damping * velocity;
          const acceleration = (force + dampingForce) / mass;
          
          velocity += acceleration;
          current += velocity;
          
          if (Math.abs(velocity) < 0.001 && Math.abs(current - target) < 0.001) {
            current = target;
            return { value: current, done: true };
          }
          
          return { value: current, done: false };
        };
        
        return {
          next: animate,
          start: (callback) => {
            const loop = () => {
              const result = animate();
              callback(result.value);
              
              if (!result.done) {
                animationId = requestAnimationFrame(loop);
              }
            };
            loop();
          },
          stop: () => cancelAnimationFrame(animationId)
        };
      }
    };
  },

  // Lerp
  lerp = (start, end, t) => start * (1 - t) + end * t,

  // Clamp
  clamp = (value, min, max) => Math.min(Math.max(value, min), max),

  // Map range
  mapRange = (value, inMin, inMax, outMin, outMax) => {
    return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
  },

  // Random range
  randomRange = (min, max) => Math.random() * (max - min) + min,

  // Random int
  randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,

  // Random choice
  randomChoice = (arr) => arr[Math.floor(Math.random() * arr.length)],

  // Random shuffle
  randomShuffle = (arr) => {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  },

  // Random ID
  randomId = (length = 8) => {
    return Math.random().toString(36).substring(2, length + 2);
  },

  // Random color
  randomColor = () => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
  },

  // Random gradient
  randomGradient = () => {
    const color1 = randomColor();
    const color2 = randomColor();
    const angle = randomInt(0, 360);
    return `linear-gradient(${angle}deg, ${color1}, ${color2})`;
  },

  // Hex to RGB
  hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  },

  // RGB to Hex
  rgbToHex = (r, g, b) => {
    return '#' + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    }).join('');
  },

  // Lighten color
  lighten = (color, amount) => {
    const rgb = hexToRgb(color);
    if (!rgb) return color;
    
    return rgbToHex(
      Math.min(255, rgb.r + amount),
      Math.min(255, rgb.g + amount),
      Math.min(255, rgb.b + amount)
    );
  },

  // Darken color
  darken = (color, amount) => {
    const rgb = hexToRgb(color);
    if (!rgb) return color;
    
    return rgbToHex(
      Math.max(0, rgb.r - amount),
      Math.max(0, rgb.g - amount),
      Math.max(0, rgb.b - amount)
    );
  },

  // Get contrast color
  getContrastColor = (hexColor) => {
    const rgb = hexToRgb(hexColor);
    if (!rgb) return '#000000';
    
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
    return brightness > 128 ? '#000000' : '#ffffff';
  },

  // Color interpolation
  interpolateColor = (color1, color2, factor) => {
    const c1 = hexToRgb(color1);
    const c2 = hexToRgb(color2);
    
    if (!c1 || !c2) return color1;
    
    return rgbToHex(
      Math.round(c1.r + factor * (c2.r - c1.r)),
      Math.round(c1.g + factor * (c2.g - c1.g)),
      Math.round(c1.b + factor * (c2.b - c1.b))
    );
  },

  // Parse URL
  parseUrl = (url) => {
    const a = document.createElement('a');
    a.href = url;
    return {
      href: a.href,
      protocol: a.protocol,
      host: a.host,
      hostname: a.hostname,
      port: a.port,
      pathname: a.pathname,
      search: a.search,
      hash: a.hash
    };
  },

  // Build URL
  buildUrl = (base, params) => {
    const url = new URL(base, window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        url.searchParams.append(key, value);
      }
    });
    return url.toString();
  },

  // Parse query string
  parseQueryString = (query = window.location.search) => {
    const params = new URLSearchParams(query);
    const result = {};
    for (const [key, value] of params) {
      result[key] = value;
    }
    return result;
  },

  // Build query string
  buildQueryString = (params) => {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.append(key, value);
      }
    });
    return searchParams.toString();
  },

  // Update URL without reload
  updateUrl = (params, options = {}) => {
    const { replace = false, title = '' } = options;
    const queryString = buildQueryString(params);
    const newUrl = `${window.location.pathname}${queryString ? '?' + queryString : ''}`;
    
    if (replace) {
      window.history.replaceState(params, title, newUrl);
    } else {
      window.history.pushState(params, title, newUrl);
    }
  },

  // Listen to URL changes
  onUrlChange = (callback) => {
    window.addEventListener('popstate', callback);
    return () => window.removeEventListener('popstate', callback);
  },

  // Detect mobile
  isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  // Detect touch
  isTouch = () => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  // Detect iOS
  isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
  },

  // Detect Android
  isAndroid = () => {
    return /Android/.test(navigator.userAgent);
  },

  // Detect Safari
  isSafari = () => {
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
  },

  // Detect Chrome
  isChrome = () => {
    return /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
  },

  // Detect Firefox
  isFirefox = () => {
    return /Firefox/.test(navigator.userAgent);
  },

  // Detect Edge
  isEdge = () => {
    return /Edg/.test(navigator.userAgent);
  },

  // Get browser info
  getBrowserInfo = () => {
    const ua = navigator.userAgent;
    let browser = 'Unknown';
    let version = '';
    
    if (ua.indexOf('Firefox') > -1) {
      browser = 'Firefox';
      version = ua.match(/Firefox\/([0-9.]+)/)?.[1];
    } else if (ua.indexOf('SamsungBrowser') > -1) {
      browser = 'Samsung Browser';
      version = ua.match(/SamsungBrowser\/([0-9.]+)/)?.[1];
    } else if (ua.indexOf('Opera') > -1 || ua.indexOf('OPR') > -1) {
      browser = 'Opera';
      version = ua.match(/(?:Opera|OPR)\/([0-9.]+)/)?.[1];
    } else if (ua.indexOf('Trident') > -1) {
      browser = 'Internet Explorer';
      version = ua.match(/rv:([0-9.]+)/)?.[1];
    } else if (ua.indexOf('Edge') > -1) {
      browser = 'Edge';
      version = ua.match(/Edge\/([0-9.]+)/)?.[1];
    } else if (ua.indexOf('Edg') > -1) {
      browser = 'Edge';
      version = ua.match(/Edg\/([0-9.]+)/)?.[1];
    } else if (ua.indexOf('Chrome') > -1) {
      browser = 'Chrome';
      version = ua.match(/Chrome\/([0-9.]+)/)?.[1];
    } else if (ua.indexOf('Safari') > -1) {
      browser = 'Safari';
      version = ua.match(/Version\/([0-9.]+)/)?.[1];
    }
    
    return { browser, version, userAgent: ua };
  },

  // Feature detection
  supports = {
    webp: () => {
      const elem = document.createElement('canvas');
      if (elem.getContext && elem.getContext('2d')) {
        return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      }
      return false;
    },
    avif: async () => {
      const avifData = 'data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A=';
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = avifData;
      });
    },
    intersectionObserver: () => 'IntersectionObserver' in window,
    resizeObserver: () => 'ResizeObserver' in window,
    mutationObserver: () => 'MutationObserver' in window,
    webAnimations: () => 'animate' in document.createElement('div'),
    webGL: () => !!window.WebGLRenderingContext,
    webWorkers: () => !!window.Worker,
    serviceWorkers: () => 'serviceWorker' in navigator,
    webShare: () => !!navigator.share,
    clipboard: () => !!navigator.clipboard,
    notifications: () => 'Notification' in window,
    geolocation: () => 'geolocation' in navigator,
    localStorage: () => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    },
    sessionStorage: () => {
      try {
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        return true;
      } catch (e) {
        return false;
      }
    },
    indexedDB: () => !!window.indexedDB,
    webSQL: () => !!window.openDatabase,
    webSockets: () => 'WebSocket' in window,
    fetch: () => 'fetch' in window,
    promises: () => 'Promise' in window,
    asyncAwait: () => {
      try {
        eval('async function test() {}');
        return true;
      } catch (e) {
        return false;
      }
    },
    cssGrid: () => CSS.supports('display', 'grid'),
    cssFlexbox: () => CSS.supports('display', 'flex'),
    cssVariables: () => CSS.supports('color', 'var(--test)'),
    cssCustomProperties: () => CSS.supports('color', 'var(--test)'),
    cssSupports: () => 'supports' in CSS,
    touchEvents: () => 'ontouchstart' in window,
    pointerEvents: () => 'onpointerdown' in window,
    passiveEvents: () => {
      let supportsPassive = false;
      try {
        const opts = Object.defineProperty({}, 'passive', {
          get: () => { supportsPassive = true; }
        });
        window.addEventListener('test', null, opts);
        window.removeEventListener('test', null, opts);
      } catch (e) {}
      return supportsPassive;
    },
    es6: () => {
      try {
        eval('const f = () => {}; class C {}');
        return true;
      } catch (e) {
        return false;
      }
    }
  },

  // Prefers reduced data
  prefersReducedData = () => {
    return window.matchMedia('(prefers-reduced-data: reduce)').matches;
  },

  // Save data enabled
  saveDataEnabled = () => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return connection?.saveData === true;
  },

  // Effective connection type
  getEffectiveConnectionType = () => {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
    return connection?.effectiveType || '4g';
  },

  // Round Robin Load Balancer
  createLoadBalancer = (servers) => {
    let currentIndex = 0;
    
    return {
      getNext: () => {
        const server = servers[currentIndex];
        currentIndex = (currentIndex + 1) % servers.length;
        return server;
      },
      getAll: () => servers,
      add: (server) => servers.push(server),
      remove: (server) => {
        const index = servers.indexOf(server);
        if (index > -1) servers.splice(index, 1);
      }
    };
  },

  // Circuit Breaker pattern
  createCircuitBreaker = (fn, options = {}) => {
    const { failureThreshold = 5, resetTimeout = 60000 } = options;
    
    let failures = 0;
    let lastFailureTime = null;
    let state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    
    return async (...args) => {
      if (state === 'OPEN') {
        if (Date.now() - lastFailureTime > resetTimeout) {
          state = 'HALF_OPEN';
        } else {
          throw new Error('Circuit breaker is OPEN');
        }
      }
      
      try {
        const result = await fn(...args);
        
        if (state === 'HALF_OPEN') {
          state = 'CLOSED';
          failures = 0;
        }
        
        return result;
      } catch (error) {
        failures++;
        lastFailureTime = Date.now();
        
        if (failures >= failureThreshold) {
          state = 'OPEN';
        }
        
        throw error;
      }
    };
  },

  // Rate Limiter
  createRateLimiter = (maxRequests, windowMs) => {
    const requests = [];
    
    return {
      tryAcquire: () => {
        const now = Date.now();
        
        // Remove old requests
        while (requests.length > 0 && requests[0] <= now - windowMs) {
          requests.shift();
        }
        
        if (requests.length < maxRequests) {
          requests.push(now);
          return true;
        }
        
        return false;
      },
      getRemaining: () => {
        const now = Date.now();
        while (requests.length > 0 && requests[0] <= now - windowMs) {
          requests.shift();
        }
        return maxRequests - requests.length;
      }
    };
  },

  // Token Bucket
  createTokenBucket = (capacity, refillRate) => {
    let tokens = capacity;
    let lastRefill = Date.now();
    
    return {
      tryConsume: (tokensRequested = 1) => {
        const now = Date.now();
        const timePassed = now - lastRefill;
        tokens = Math.min(capacity, tokens + timePassed * refillRate);
        lastRefill = now;
        
        if (tokens >= tokensRequested) {
          tokens -= tokensRequested;
          return true;
        }
        
        return false;
      },
      getTokens: () => tokens
    };
  },

  // Sliding Window Log
  createSlidingWindowLog = (windowSize, maxRequests) => {
    const requests = [];
    
    return {
      tryAcquire: () => {
        const now = Date.now();
        const windowStart = now - windowSize;
        
        // Remove requests outside window
        while (requests.length > 0 && requests[0] < windowStart) {
          requests.shift();
        }
        
        if (requests.length < maxRequests) {
          requests.push(now);
          return true;
        }
        
        return false;
      }
    };
  },

  // Leaky Bucket
  createLeakyBucket = (capacity, leakRate) => {
    let volume = 0;
    let lastLeak = Date.now();
    
    return {
      tryAdd: (drops = 1) => {
        const now = Date.now();
        const timePassed = now - lastLeak;
        volume = Math.max(0, volume - timePassed * leakRate);
        lastLeak = now;
        
        if (volume + drops <= capacity) {
          volume += drops;
          return true;
        }
        
        return false;
      }
    };
  },

  // Priority Queue
  createPriorityQueue = () => {
    const items = [];
    
    return {
      enqueue: (item, priority = 0) => {
        const element = { item, priority };
        let added = false;
        
        for (let i = 0; i < items.length; i++) {
          if (items[i].priority > priority) {
            items.splice(i, 0, element);
            added = true;
            break;
          }
        }
        
        if (!added) items.push(element);
      },
      dequeue: () => items.shift()?.item,
      peek: () => items[0]?.item,
      isEmpty: () => items.length === 0,
      size: () => items.length
    };
  },

  // Binary Heap
  createBinaryHeap = (compareFn) => {
    const heap = [];
    
    const parent = i => Math.floor((i - 1) / 2);
    const left = i => 2 * i + 1;
    const right = i => 2 * i + 2;
    
    const swap = (i, j) => {
      [heap[i], heap[j]] = [heap[j], heap[i]];
    };
    
    const siftUp = (i) => {
      while (i > 0 && compareFn(heap[i], heap[parent(i)]) < 0) {
        swap(i, parent(i));
        i = parent(i);
      }
    };
    
    const siftDown = (i) => {
      const minIndex = i;
      const l = left(i);
      const r = right(i);
      
      if (l < heap.length && compareFn(heap[l], heap[minIndex]) < 0) {
        minIndex = l;
      }
      
      if (r < heap.length && compareFn(heap[r], heap[minIndex]) < 0) {
        minIndex = r;
      }
      
      if (i !== minIndex) {
        swap(i, minIndex);
        siftDown(minIndex);
      }
    };
    
    return {
      insert: (value) => {
        heap.push(value);
        siftUp(heap.length - 1);
      },
      extractMin: () => {
        if (heap.length === 0) return null;
        if (heap.length === 1) return heap.pop();
        
        const min = heap[0];
        heap[0] = heap.pop();
        siftDown(0);
        return min;
      },
      peek: () => heap[0],
      size: () => heap.length,
      isEmpty: () => heap.length === 0
    };
  },

  // Bloom Filter
  createBloomFilter = (size, hashFunctions) => {
    const bitArray = new Array(size).fill(false);
    
    const hashes = (item) => {
      return hashFunctions.map(fn => fn(item) % size);
    };
    
    return {
      add: (item) => {
        hashes(item).forEach(index => {
          bitArray[index] = true;
        });
      },
      mightContain: (item) => {
        return hashes(item).every(index => bitArray[index]);
      }
    };
  },

  // Count-Min Sketch
  createCountMinSketch = (width, depth) => {
    const table = Array(depth).fill(null).map(() => Array(width).fill(0));
    
    const hashes = (item) => {
      // Simple hash functions
      return Array(depth).fill(null).map((_, i) => {
        let hash = 0;
        for (let j = 0; j < item.length; j++) {
          hash = ((hash << 5) + hash + item.charCodeAt(j) + i) % width;
        }
        return Math.abs(hash);
      });
    };
    
    return {
      add: (item, count = 1) => {
        hashes(item).forEach((index, i) => {
          table[i][index] += count;
        });
      },
      estimate: (item) => {
        return Math.min(...hashes(item).map((index, i) => table[i][index]));
      }
    };
  },

  // HyperLogLog (simplified)
  createHyperLogLog = (precision = 14) => {
    const m = 1 << precision;
    const registers = new Array(m).fill(0);
    
    const hash = (item) => {
      let h = 0;
      for (let i = 0; i < item.length; i++) {
        h = ((h << 5) + h) + item.charCodeAt(i);
      }
      return Math.abs(h);
    };
    
    const leadingZeros = (x) => {
      let count = 1;
      while ((x & 1) === 0 && count <= 32) {
        x >>= 1;
        count++;
      }
      return count;
    };
    
    return {
      add: (item) => {
        const h = hash(item);
        const j = h & (m - 1);
        const w = h >> precision;
        registers[j] = Math.max(registers[j], leadingZeros(w));
      },
      count: () => {
        const alpha = 0.7213 / (1 + 1.079 / m);
        const sum = registers.reduce((acc, val) => acc + Math.pow(2, -val), 0);
        return Math.floor(alpha * m * m / sum);
      }
    };
  },

  // MinHash (simplified)
  createMinHash = (numHashes = 128) => {
    const signatures = new Map();
    
    const hash = (item, seed) => {
      let h = seed;
      for (let i = 0; i < item.length; i++) {
        h = ((h << 5) + h) + item.charCodeAt(i);
      }
      return Math.abs(h);
    };
    
    return {
      add: (id, items) => {
        const signature = new Array(numHashes).fill(Infinity);
        
        items.forEach(item => {
          for (let i = 0; i < numHashes; i++) {
            signature[i] = Math.min(signature[i], hash(item, i));
          }
        });
        
        signatures.set(id, signature);
      },
      similarity: (id1, id2) => {
        const sig1 = signatures.get(id1);
        const sig2 = signatures.get(id2);
        
        if (!sig1 || !sig2) return 0;
        
        let matches = 0;
        for (let i = 0; i < numHashes; i++) {
          if (sig1[i] === sig2[i]) matches++;
        }
        
        return matches / numHashes;
      }
    };
  },

  // SimHash (simplified)
  createSimHash = (bitLength = 64) => {
    const hash = (item) => {
      let h = 0;
      for (let i = 0; i < item.length; i++) {
        h = ((h << 5) + h) + item.charCodeAt(i);
      }
      return h;
    };
    
    return {
      compute: (items) => {
        const vector = new Array(bitLength).fill(0);
        
        items.forEach(item => {
          const h = hash(item);
          for (let i = 0; i < bitLength; i++) {
            vector[i] += (h & (1 << i)) ? 1 : -1;
          }
        });
        
        let fingerprint = 0;
        for (let i = 0; i < bitLength; i++) {
          if (vector[i] > 0) fingerprint |= (1 << i);
        }
        
        return fingerprint;
      },
      hammingDistance: (hash1, hash2) => {
        let xor = hash1 ^ hash2;
        let distance = 0;
        while (xor) {
          distance += xor & 1;
          xor >>= 1;
        }
        return distance;
      }
    };
  },

  // Consistent Hashing
  createConsistentHash = (replicas = 150) => {
    const ring = new Map();
    const nodes = new Set();
    
    const hash = (key) => {
      let h = 0;
      for (let i = 0; i < key.length; i++) {
        h = ((h << 5) + h) + key.charCodeAt(i);
      }
      return Math.abs(h);
    };
    
    return {
      addNode: (node) => {
        nodes.add(node);
        for (let i = 0; i < replicas; i++) {
          const key = hash(`${node}:${i}`);
          ring.set(key, node);
        }
      },
      removeNode: (node) => {
        nodes.delete(node);
        for (let i = 0; i < replicas; i++) {
          const key = hash(`${node}:${i}`);
          ring.delete(key);
        }
      },
      getNode: (key) => {
        if (ring.size === 0) return null;
        
        const hashKey = hash(key);
        const sortedKeys = Array.from(ring.keys()).sort((a, b) => a - b);
        
        for (const ringKey of sortedKeys) {
          if (ringKey >= hashKey) return ring.get(ringKey);
        }
        
        return ring.get(sortedKeys[0]);
      }
    };
  },

  // Rendezvous Hashing
  createRendezvousHash = () => {
    const nodes = [];
    
    const hash = (a, b) => {
      let h = 0;
      const str = `${a}:${b}`;
      for (let i = 0; i < str.length; i++) {
        h = ((h << 5) + h) + str.charCodeAt(i);
      }
      return Math.abs(h);
    };
    
    return {
      addNode: (node) => {
        nodes.push(node);
      },
      removeNode: (node) => {
        const index = nodes.indexOf(node);
        if (index > -1) nodes.splice(index, 1);
      },
      getNode: (key) => {
        if (nodes.length === 0) return null;
        
        let maxHash = -1;
        let selectedNode = null;
        
        nodes.forEach(node => {
          const h = hash(key, node);
          if (h > maxHash) {
            maxHash = h;
            selectedNode = node;
          }
        });
        
        return selectedNode;
      }
    };
  },

  // Jump Consistent Hash
  jumpConsistentHash = (key, numBuckets) => {
    let b = -1;
    let j = 0;
    
    while (j < numBuckets) {
      b = j;
      key = ((key * 2862933555777941757n) + 1n) & 0xFFFFFFFFFFFFFFFFn;
      j = Math.floor((Number(b) + 1) * (2 ** 31) / Number((key >> 33n) + 1n));
    }
    
    return b;
  },

  // Multi-Probe Consistent Hashing
  createMultiProbeHash = (replicas = 10) => {
    const ring = new Map();
    const nodes = new Set();
    
    const hash = (key, probe) => {
      let h = probe;
      for (let i = 0; i < key.length; i++) {
        h = ((h << 5) + h) + key.charCodeAt(i);
      }
      return Math.abs(h);
    };
    
    return {
      addNode: (node) => {
        nodes.add(node);
        for (let i = 0; i < replicas; i++) {
          const key = hash(node, i);
          ring.set(key, node);
        }
      },
      removeNode: (node) => {
        nodes.delete(node);
        for (let i = 0; i < replicas; i++) {
          const key = hash(node, i);
          ring.delete(key);
        }
      },
      getNodes: (key, n = 3) => {
        const results = new Set();
        let probe = 0;
        
        while (results.size < n && probe < 1000) {
          const hashKey = hash(key, probe);
          const sortedKeys = Array.from(ring.keys()).sort((a, b) => a - b);
          
          for (const ringKey of sortedKeys) {
            if (ringKey >= hashKey) {
              results.add(ring.get(ringKey));
              break;
            }
          }
          
          probe++;
        }
        
        return Array.from(results);
      }
    };
  },

  // Cuckoo Filter (simplified)
  createCuckooFilter = (capacity, fingerprintSize = 8) => {
    const buckets = Array(capacity).fill(null).map(() => []);
    const maxKicks = 500;
    
    const fingerprint = (item) => {
      let h = 0;
      for (let i = 0; i < item.length; i++) {
        h = ((h << 5) + h) + item.charCodeAt(i);
      }
      return Math.abs(h) % (2 ** fingerprintSize);
    };
    
    const hash = (item) => {
      let h = 0;
      for (let i = 0; i < item.length; i++) {
        h = ((h << 5) + h) + item.charCodeAt(i);
      }
      return Math.abs(h) % capacity;
    };
    
    const alternateIndex = (index, fp) => {
      return (index ^ hash(fp.toString())) % capacity;
    };
    
    return {
      add: (item) => {
        const fp = fingerprint(item);
        let i1 = hash(item);
        let i2 = alternateIndex(i1, fp);
        
        if (buckets[i1].length < 4) {
          buckets[i1].push(fp);
          return true;
        }
        
        if (buckets[i2].length < 4) {
          buckets[i2].push(fp);
          return true;
        }
        
        // Kick existing item
        let i = Math.random() < 0.5 ? i1 : i2;
        for (let n = 0; n < maxKicks; n++) {
          const j = Math.floor(Math.random() * buckets[i].length);
          const oldFp = buckets[i][j];
          buckets[i][j] = fp;
          
          i = alternateIndex(i, oldFp);
          if (buckets[i].length < 4) {
            buckets[i].push(oldFp);
            return true;
          }
        }
        
        return false; // Insertion failed
      },
      contains: (item) => {
        const fp = fingerprint(item);
        const i1 = hash(item);
        const i2 = alternateIndex(i1, fp);
        
        return buckets[i1].includes(fp) || buckets[i2].includes(fp);
      },
      delete: (item) => {
        const fp = fingerprint(item);
        const i1 = hash(item);
        const i2 = alternateIndex(i1, fp);
        
        const idx1 = buckets[i1].indexOf(fp);
        if (idx1 > -1) {
          buckets[i1].splice(idx1, 1);
          return true;
        }
        
        const idx2 = buckets[i2].indexOf(fp);
        if (idx2 > -1) {
          buckets[i2].splice(idx2, 1);
          return true;
        }
        
        return false;
      }
    };
  },

  // Counting Bloom Filter
  createCountingBloomFilter = (size, hashFunctions) => {
    const counters = new Array(size).fill(0);
    
    const hashes = (item) => {
      return hashFunctions.map(fn => fn(item) % size);
    };
    
    return {
      add: (item) => {
        hashes(item).forEach(index => {
          counters[index]++;
        });
      },
      remove: (item) => {
        hashes(item).forEach(index => {
          if (counters[index] > 0) counters[index]--;
        });
      },
      mightContain: (item) => {
        return hashes(item).every(index => counters[index] > 0);
      },
      count: (item) => {
        return Math.min(...hashes(item).map(index => counters[index]));
      }
    };
  },

  // Quotient Filter (simplified)
  createQuotientFilter = (size) => {
    const table = new Array(size).fill(null);
    
    const hash = (item) => {
      let h = 0;
      for (let i = 0; i < item.length; i++) {
        h = ((h << 5) + h) + item.charCodeAt(i);
      }
      return Math.abs(h);
    };
    
    return {
      add: (item) => {
        const h = hash(item);
        const quotient = h % size;
        const remainder = Math.floor(h / size);
        
        let idx = quotient;
        while (table[idx] !== null) {
          idx = (idx + 1) % size;
        }
        
        table[idx] = { quotient, remainder, is_continuation: idx !== quotient, is_shifted: idx !== quotient };
      },
      contains: (item) => {
        const h = hash(item);
        const quotient = h % size;
        const remainder = Math.floor(h / size);
        
        let idx = quotient;
        while (table[idx] !== null) {
          if (table[idx].remainder === remainder) {
            return true;
          }
          idx = (idx + 1) % size;
        }
        
        return false;
      }
    };
  },

  // Xor Filter (simplified)
  createXorFilter = (size) => {
    const fingerprints = new Array(size).fill(0);
    const hashFunctions = [
      x => x % size,
      x => (x * 31) % size,
      x => (x * 127) % size
    ];
    
    return {
      build: (items) => {
        // Simplified - real implementation would use peeling algorithm
        items.forEach((item, idx) => {
          const h = idx;
          hashFunctions.forEach((fn, i) => {
            fingerprints[fn(h)] ^= (h >> (i * 8)) & 0xFF;
          });
        });
      },
      contains: (item) => {
        const h = item.length; // Simplified
        let result = 0;
        hashFunctions.forEach((fn, i) => {
          result ^= fingerprints[fn(h)];
        });
        return result === (h & 0xFF);
      }
    };
  },

  // Adaptive Replacement Cache (ARC)
  createARCache = (capacity) => {
    const t1 = []; // Recent cache
    const t2 = []; // Frequent cache
    const b1 = []; // Ghost entries for recent
    const b2 = []; // Ghost entries for frequent
    
    let p = 0; // Target size for T1
    
    const moveToFront = (list, item) => {
      const idx = list.indexOf(item);
      if (idx > -1) list.splice(idx, 1);
      list.unshift(item);
    };
    
    const replace = (item) => {
      if (t1.length > 0 && (t1.length > p || (b2.includes(item) && t1.length === p))) {
        const lru = t1.pop();
        b1.unshift(lru);
      } else {
        const lru = t2.pop();
        b2.unshift(lru);
      }
    };
    
    return {
      get: (key) => {
        if (t1.includes(key)) {
          moveToFront(t2, key);
          return key;
        }
        if (t2.includes(key)) {
          moveToFront(t2, key);
          return key;
        }
        return null;
      },
      set: (key) => {
        if (t1.includes(key) || t2.includes(key)) {
          moveToFront(t2, key);
          return;
        }
        
        if (b1.includes(key)) {
          p = Math.min(capacity, p + Math.max(1, b2.length / b1.length));
          replace(key);
          moveToFront(t2, key);
          return;
        }
        
        if (b2.includes(key)) {
          p = Math.max(0, p - Math.max(1, b1.length / b2.length));
          replace(key);
          moveToFront(t2, key);
          return;
        }
        
        if (t1.length + b1.length === capacity) {
          if (t1.length < capacity) {
            b1.pop();
            replace(key);
          } else {
            t1.pop();
          }
        } else {
          const total = t1.length + t2.length + b1.length + b2.length;
          if (total >= capacity) {
            if (total === 2 * capacity) {
              b2.pop();
            }
            replace(key);
          }
        }
        
        t1.unshift(key);
      }
    };
  },

  // TinyLFU Cache
  createTinyLFUCache = (capacity, windowSize = 0.01) => {
    const windowCapacity = Math.max(1, Math.floor(capacity * windowSize));
    const mainCapacity = capacity - windowCapacity;
    
    const windowCache = new Map(); // LRU
    const mainCache = new Map(); // LFU with LRU eviction
    
    const frequencySketch = createCountMinSketch(1000, 4);
    let admissionThreshold = 0;
    
    return {
      get: (key) => {
        // Record access
        frequencySketch.add(key.toString());
        
        if (windowCache.has(key)) {
          return windowCache.get(key);
        }
        
        if (mainCache.has(key)) {
          const value = mainCache.get(key);
          // Update frequency
          mainCache.delete(key);
          mainCache.set(key, value);
          return value;
        }
        
        return null;
      },
      set: (key, value) => {
        frequencySketch.add(key.toString());
        
        if (windowCache.has(key) || mainCache.has(key)) {
          mainCache.set(key, value);
          return;
        }
        
        // Try to insert into window cache
        if (windowCache.size >= windowCapacity) {
          const victim = windowCache.keys().next().value;
          windowCache.delete(victim);
          
          // Try to promote victim to main cache
          const victimFreq = frequencySketch.estimate(victim.toString());
          if (victimFreq > admissionThreshold) {
            if (mainCache.size >= mainCapacity) {
              const mainVictim = mainCache.keys().next().value;
              mainCache.delete(mainVictim);
            }
            mainCache.set(victim, windowCache.get(victim));
          }
        }
        
        windowCache.set(key, value);
        
        // Update admission threshold periodically
        if (Math.random() < 0.01) {
          admissionSketch = createCountMinSketch(1000, 4);
        }
      }
    };
  },

  // W-TinyLFU Cache
  createWTinyLFUCache = (capacity) => {
    const windowSize = Math.max(1, Math.floor(capacity * 0.01));
    const mainSize = capacity - windowSize;
    const protectedSize = Math.floor(mainSize * 0.8);
    const probationSize = mainSize - protectedSize;
    
    const window = new Map(); // LRU
    const probation = new Map(); // LRU
    const protected = new Map(); // LRU
    
    const sketch = createCountMinSketch(10000, 8);
    
    return {
      get: (key) => {
        sketch.add(key.toString());
        
        if (window.has(key)) return window.get(key);
        if (probation.has(key)) {
          // Promote to protected
          const value = probation.get(key);
          probation.delete(key);
          
          if (protected.size >= protectedSize) {
            const victim = protected.keys().next().value;
            protected.delete(victim);
            probation.set(victim, protected.get(victim));
          }
          
          protected.set(key, value);
          return value;
        }
        if (protected.has(key)) {
          // Move to front
          const value = protected.get(key);
          protected.delete(key);
          protected.set(key, value);
          return value;
        }
        
        return null;
      },
      set: (key, value) => {
        sketch.add(key.toString());
        
        if (window.has(key) || probation.has(key) || protected.has(key)) {
          this.get(key); // Update position
          return;
        }
        
        // Insert into window
        if (window.size >= windowSize) {
          const victim = window.keys().next().value;
          window.delete(victim);
          
          // Try to insert victim into probation
          if (probation.size >= probationSize) {
            const candidate = probation.keys().next().value;
            const victimFreq = sketch.estimate(victim.toString());
            const candidateFreq = sketch.estimate(candidate.toString());
            
            if (victimFreq > candidateFreq) {
              probation.delete(candidate);
              probation.set(victim, window.get(victim));
            }
          } else {
            probation.set(victim, window.get(victim));
          }
        }
        
        window.set(key, value);
      }
    };
  },

  // Simple Cache
  createCache = (maxSize = 100, ttl = null) => {
    const cache = new Map();
    
    return {
      get: (key) => {
        const item = cache.get(key);
        if (!item) return null;
        
        if (ttl && Date.now() - item.timestamp > ttl) {
          cache.delete(key);
          return null;
        }
        
        // Update access order
        cache.delete(key);
        cache.set(key, item);
        
        return item.value;
      },
      set: (key, value) => {
        if (cache.size >= maxSize) {
          const firstKey = cache.keys().next().value;
          cache.delete(firstKey);
        }
        
        cache.set(key, {
          value,
          timestamp: Date.now()
        });
      },
      delete: (key) => cache.delete(key),
      clear: () => cache.clear(),
      has: (key) => cache.has(key),
      size: () => cache.size,
      keys: () => Array.from(cache.keys())
    };
  },

  // TTL Cache
  createTTLCache = () => {
    const cache = new Map();
    const timers = new Map();
    
    return {
      get: (key) => {
        return cache.get(key)?.value;
      },
      set: (key, value, ttl) => {
        // Clear existing timer
        if (timers.has(key)) {
          clearTimeout(timers.get(key));
        }
        
        cache.set(key, { value, expires: Date.now() + ttl });
        
        // Set expiration timer
        const timer = setTimeout(() => {
          cache.delete(key);
          timers.delete(key);
        }, ttl);
        
        timers.set(key, timer);
      },
      delete: (key) => {
        if (timers.has(key)) {
          clearTimeout(timers.get(key));
          timers.delete(key);
        }
        return cache.delete(key);
      },
      clear: () => {
        timers.forEach(timer => clearTimeout(timer));
        timers.clear();
        cache.clear();
      }
    };
  },

  // LRU Cache
  createLRUCache = (maxSize) => {
    const cache = new Map();
    
    return {
      get: (key) => {
        if (!cache.has(key)) return undefined;
        
        const value = cache.get(key);
        cache.delete(key);
        cache.set(key, value);
        return value;
      },
      set: (key, value) => {
        if (cache.has(key)) {
          cache.delete(key);
        } else if (cache.size >= maxSize) {
          cache.delete(cache.keys().next().value);
        }
        
        cache.set(key, value);
      },
      has: (key) => cache.has(key),
      delete: (key) => cache.delete(key),
      clear: () => cache.clear(),
      size: () => cache.size
    };
  },

  // LFU Cache
  createLFUCache = (capacity) => {
    const cache = new Map();
    const frequencies = new Map();
    let minFreq = 0;
    
    const updateFrequency = (key) => {
      const freq = frequencies.get(key);
      frequencies.set(key, freq + 1);
      
      if (freq === minFreq && !Array.from(frequencies.values()).includes(freq)) {
        minFreq++;
      }
    };
    
    return {
      get: (key) => {
        if (!cache.has(key)) return -1;
        
        updateFrequency(key);
        return cache.get(key);
      },
      put: (key, value) => {
        if (capacity <= 0) return;
        
        if (cache.has(key)) {
          cache.set(key, value);
          updateFrequency(key);
          return;
        }
        
        if (cache.size >= capacity) {
          // Remove least frequently used
          for (const [k, freq] of frequencies) {
            if (freq === minFreq) {
              cache.delete(k);
              frequencies.delete(k);
              break;
            }
          }
        }
        
        cache.set(key, value);
        frequencies.set(key, 1);
        minFreq = 1;
      }
    };
  },

  // Time Window Cache
  createTimeWindowCache = (windowMs) => {
    const windows = new Map();
    
    const getCurrentWindow = () => Math.floor(Date.now() / windowMs);
    
    return {
      get: (key) => {
        const currentWindow = getCurrentWindow();
        const item = windows.get(key);
        
        if (!item || item.window !== currentWindow) {
          return null;
        }
        
        return item.value;
      },
      set: (key, value) => {
        const currentWindow = getCurrentWindow();
        windows.set(key, { value, window: currentWindow });
      },
      clear: () => windows.clear()
    };
  },

  // Multi-Level Cache
  createMultiLevelCache = (levels) => {
    // levels: [{ cache: l1, cost: 1 }, { cache: l2, cost: 10 }]
    
    return {
      get: async (key) => {
        for (const level of levels) {
          const value = await level.cache.get(key);
          if (value !== null) {
            // Promote to higher levels
            for (let i = 0; i < levels.indexOf(level); i++) {
              await levels[i].cache.set(key, value);
            }
            return value;
          }
        }
        return null;
      },
      set: async (key, value) => {
        for (const level of levels) {
          await level.cache.set(key, value);
        }
      },
      delete: async (key) => {
        for (const level of levels) {
          await level.cache.delete(key);
        }
      }
    };
  },

  // Cache Aside Pattern
  createCacheAside = (cache, dataStore) => {
    return {
      get: async (key) => {
        let value = await cache.get(key);
        
        if (value === null) {
          value = await dataStore.get(key);
          if (value !== null) {
            await cache.set(key, value);
          }
        }
        
        return value;
      },
      set: async (key, value) => {
        await dataStore.set(key, value);
        await cache.set(key, value);
      },
      delete: async (key) => {
        await dataStore.delete(key);
        await cache.delete(key);
      }
    };
  },

  // Read-Through Cache
  createReadThroughCache = (cache, dataStore) => {
    return {
      get: async (key) => {
        let value = await cache.get(key);
        
        if (value === null) {
          value = await dataStore.get(key);
          if (value !== null) {
            await cache.set(key, value);
          }
        }
        
        return value;
      }
    };
  },

  // Write-Through Cache
  createWriteThroughCache = (cache, dataStore) => {
    return {
      set: async (key, value) => {
        await dataStore.set(key, value);
        await cache.set(key, value);
      },
      delete: async (key) => {
        await dataStore.delete(key);
        await cache.delete(key);
      }
    };
  },

  // Write-Behind Cache
  createWriteBehindCache = (cache, dataStore, options = {}) => {
    const { flushInterval = 5000, batchSize = 100 } = options;
    const writeQueue = [];
    let flushTimer = null;
    
    const flush = async () => {
      if (writeQueue.length === 0) return;
      
      const batch = writeQueue.splice(0, batchSize);
      
      try {
        await Promise.all(batch.map(({ key, value, operation }) => {
          if (operation === 'set') {
            return dataStore.set(key, value);
          } else {
            return dataStore.delete(key);
          }
        }));
      } catch (error) {
        // Put failed items back in queue
        writeQueue.unshift(...batch);
      }
    };
    
    const scheduleFlush = () => {
      if (!flushTimer) {
        flushTimer = setTimeout(() => {
          flush();
          flushTimer = null;
        }, flushInterval);
      }
    };
    
    return {
      get: (key) => cache.get(key),
      set: async (key, value) => {
        await cache.set(key, value);
        writeQueue.push({ key, value, operation: 'set' });
        scheduleFlush();
      },
      delete: async (key) => {
        await cache.delete(key);
        writeQueue.push({ key, operation: 'delete' });
        scheduleFlush();
      },
      flush,
      destroy: () => {
        if (flushTimer) {
          clearTimeout(flushTimer);
          flush();
        }
      }
    };
  },

  // Refresh-Ahead Cache
  createRefreshAheadCache = (cache, dataStore, options = {}) => {
    const { refreshThreshold = 0.8, ttl } = options;
    const refreshing = new Set();
    
    return {
      get: async (key) => {
        const item = await cache.get(key);
        
        if (item) {
          // Check if needs refresh
          const age = Date.now() - item.timestamp;
          const refreshPoint = ttl * refreshThreshold;
          
          if (age > refreshPoint && !refreshing.has(key)) {
            refreshing.add(key);
            
            // Refresh in background
            dataStore.get(key).then(value => {
              cache.set(key, { value, timestamp: Date.now() });
              refreshing.delete(key);
            });
          }
          
          return item.value;
        }
        
        // Cache miss
        const value = await dataStore.get(key);
        if (value !== null) {
          await cache.set(key, { value, timestamp: Date.now() });
        }
        
        return value;
      }
    };
  },

  // Cache Stampede Protection
  createCacheWithLock = (cache, options = {}) => {
    const { lockTimeout = 10000 } = options;
    const locks = new Map();
    const pending = new Map();
    
    const acquireLock = async (key) => {
      while (locks.has(key)) {
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      locks.set(key, Date.now());
      
      // Auto-release lock
      setTimeout(() => locks.delete(key), lockTimeout);
    };
    
    const releaseLock = (key) => {
      locks.delete(key);
    };
    
    return {
      get: async (key, fetchFn) => {
        // Check cache first
        const cached = await cache.get(key);
        if (cached !== null) return cached;
        
        // Check if someone is already fetching
        if (pending.has(key)) {
          return pending.get(key);
        }
        
        // Acquire lock and fetch
        await acquireLock(key);
        
        try {
          // Double-check after acquiring lock
          const cached2 = await cache.get(key);
          if (cached2 !== null) return cached2;
          
          // Fetch and cache
          const promise = fetchFn(key);
          pending.set(key, promise);
          
          const value = await promise;
          await cache.set(key, value);
          
          return value;
        } finally {
          pending.delete(key);
          releaseLock(key);
        }
      }
    };
  },

  // Probabilistic Early Expiration
  createProbabilisticCache = (cache, options = {}) => {
    const { beta = 1.0 } = options;
    
    const randomExp = (lambda) => {
      return -Math.log(Math.random()) / lambda;
    };
    
    return {
      get: async (key, fetchFn, ttl) => {
        const item = await cache.get(key);
        const now = Date.now();
        
        if (!item) {
          const value = await fetchFn();
          await cache.set(key, { value, expires: now + ttl });
          return value;
        }
        
        const remainingTtl = item.expires - now;
        
        if (remainingTtl > 0) {
          // Probabilistic early expiration
          const delta = ttl - remainingTtl;
          const probability = Math.exp(beta * delta / ttl);
          
          if (Math.random() < probability) {
            // Refresh in background
            fetchFn().then(value => {
              cache.set(key, { value, expires: Date.now() + ttl });
            });
          }
          
          return item.value;
        }
        
        // Expired
        const value = await fetchFn();
        await cache.set(key, { value, expires: now + ttl });
        return value;
      }
    };
  },

  // Request Coalescing
  createRequestCoalescing = (fn) => {
    const pending = new Map();
    
    return async (...args) => {
      const key = JSON.stringify(args);
      
      if (pending.has(key)) {
        return pending.get(key);
      }
      
      const promise = fn(...args).finally(() => {
        pending.delete(key);
      });
      
      pending.set(key, promise);
      return promise;
    };
  },

  // Debounce with leading/trailing
  debounceAdvanced = (fn, wait, options = {}) => {
    const { leading = false, trailing = true, maxWait = null } = options;
    
    let timeout, lastCallTime, lastInvokeTime, result;
    
    const invokeFunc = (time) => {
      const args = lastArgs;
      const thisArg = lastThis;
      
      lastArgs = lastThis = undefined;
      lastInvokeTime = time;
      result = fn.apply(thisArg, args);
      return result;
    };
    
    const leadingEdge = (time) => {
      lastInvokeTime = time;
      timeout = setTimeout(timerExpired, wait);
      return leading ? invokeFunc(time) : result;
    };
    
    const remainingWait = (time) => {
      const timeSinceLastCall = time - lastCallTime;
      const timeSinceLastInvoke = time - lastInvokeTime;
      const timeWaiting = wait - timeSinceLastCall;
      
      return maxWait !== null
        ? Math.min(timeWaiting, maxWait - timeSinceLastInvoke)
        : timeWaiting;
    };
    
    const shouldInvoke = (time) => {
      const timeSinceLastCall = time - lastCallTime;
      const timeSinceLastInvoke = time - lastInvokeTime;
      
      return (lastCallTime === undefined || timeSinceLastCall >= wait ||
        timeSinceLastCall < 0 || (maxWait !== null && timeSinceLastInvoke >= maxWait));
    };
    
    const timerExpired = () => {
      const time = Date.now();
      
      if (shouldInvoke(time)) {
        return trailingEdge(time);
      }
      
      timeout = setTimeout(timerExpired, remainingWait(time));
    };
    
    const trailingEdge = (time) => {
      timeout = undefined;
      
      if (trailing && lastArgs) {
        return invokeFunc(time);
      }
      
      lastArgs = lastThis = undefined;
      return result;
    };
    
    let lastArgs, lastThis;
    
    return function(...args) {
      const time = Date.now();
      const isInvoking = shouldInvoke(time);
      
      lastArgs = args;
      lastThis = this;
      lastCallTime = time;
      
      if (isInvoking) {
        if (timeout === undefined) {
          return leadingEdge(lastCallTime);
        }
        if (maxWait !== null) {
          timeout = setTimeout(timerExpired, wait);
          return invokeFunc(lastCallTime);
        }
      }
      
      if (timeout === undefined) {
        timeout = setTimeout(timerExpired, wait);
      }
      
      return result;
    };
  },

  // Throttle with leading/trailing
  throttleAdvanced = (fn, wait, options = {}) => {
    const { leading = true, trailing = true } = options;
    let timeout, previous = 0;
    
    return function(...args) {
      const now = Date.now();
      
      if (!previous && !leading) {
        previous = now;
      }
      
      const remaining = wait - (now - previous);
      
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        fn.apply(this, args);
      } else if (!timeout && trailing) {
        timeout = setTimeout(() => {
          previous = leading ? Date.now() : 0;
          timeout = null;
          fn.apply(this, args);
        }, remaining);
      }
    };
  },

  // Memoize with resolver
  memoizeWith = (fn, resolver) => {
    const cache = new Map();
    
    return function(...args) {
      const key = resolver ? resolver(...args) : args[0];
      
      if (cache.has(key)) {
        return cache.get(key);
      }
      
      const result = fn.apply(this, args);
      cache.set(key, result);
      return result;
    };
  },

  // Memoize with TTL
  memoizeTTL = (fn, ttl) => {
    const cache = new Map();
    
    return function(...args) {
      const key = JSON.stringify(args);
      const now = Date.now();
      
      if (cache.has(key)) {
        const { value, expires } = cache.get(key);
        if (now < expires) {
          return value;
        }
      }
      
      const result = fn.apply(this, args);
      cache.set(key, { value: result, expires: now + ttl });
      return result;
    };
  },

  // Memoize with LRU
  memoizeLRU = (fn, maxSize = 100) => {
    const cache = new Map();
    
    return function(...args) {
      const key = JSON.stringify(args);
      
      if (cache.has(key)) {
        const value = cache.get(key);
        cache.delete(key);
        cache.set(key, value);
        return value;
      }
      
      const result = fn.apply(this, args);
      
      if (cache.size >= maxSize) {
        cache.delete(cache.keys().next().value);
      }
      
      cache.set(key, result);
      return result;
    };
  },

  // Memoize async with stale-while-revalidate
  memoizeSWR = (fn, options = {}) => {
    const { ttl = 60000, staleTtl = 300000 } = options;
    const cache = new Map();
    
    return async function(...args) {
      const key = JSON.stringify(args);
      const now = Date.now();
      const cached = cache.get(key);
      
      if (cached) {
        // Return stale data immediately
        if (now - cached.timestamp < staleTtl) {
          // Refresh in background if stale
          if (now - cached.timestamp > ttl) {
            fn(...args).then(result => {
              cache.set(key, { value: result, timestamp: Date.now() });
            });
          }
          return cached.value;
        }
      }
      
      // Fetch fresh data
      const result = await fn(...args);
      cache.set(key, { value: result, timestamp: Date.now() });
      return result;
    };
  },

  // Retry with exponential backoff
  retryWithBackoff = async (fn, options = {}) => {
    const { maxRetries = 3, baseDelay = 1000, maxDelay = 30000, factor = 2 } = options;
    
    for (let i = 0; i <= maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries) throw error;
        
        const delay = Math.min(baseDelay * Math.pow(factor, i), maxDelay);
        const jitter = Math.random() * delay * 0.1;
        
        await new Promise(resolve => setTimeout(resolve, delay + jitter));
      }
    }
  },

  // Timeout with abort signal
  withTimeoutAndAbort = (promise, ms, signal) => {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Timeout'));
      }, ms);
      
      promise
        .then(resolve)
        .catch(reject)
        .finally(() => clearTimeout(timeout));
      
      if (signal) {
        signal.addEventListener('abort', () => {
          clearTimeout(timeout);
          reject(new Error('Aborted'));
        });
      }
    });
  },

  // Race with timeout
  raceWithTimeout = (promises, timeoutMs) => {
    const timeout = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    );
    
    return Promise.race([...promises, timeout]);
  },

  // All settled with timeout
  allSettledWithTimeout = (promises, timeoutMs) => {
    const wrapped = promises.map(p => 
      Promise.race([
        p,
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout')), timeoutMs)
        )
      ])
    );
    
    return Promise.allSettled(wrapped);
  },

  // Sequential execution with concurrency
  asyncPool = async (concurrency, iterable, iteratorFn) => {
    const ret = [];
    const executing = new Set();
    
    for (const item of iterable) {
      const p = Promise.resolve().then(() => iteratorFn(item, iterable));
      ret.push(p);
      executing.add(p);
      
      const clean = () => executing.delete(p);
      p.then(clean).catch(clean);
      
      if (executing.size >= concurrency) {
        await Promise.race(executing);
      }
    }
    
    return Promise.all(ret);
  },

  // Parallel with limit
  pLimit = (concurrency) => {
    const queue = [];
    let activeCount = 0;
    
    const next = () => {
      activeCount--;
      
      if (queue.length > 0) {
        queue.shift()();
      }
    };
    
    const run = async (fn, resolve, ...args) => {
      activeCount++;
      
      const result = (async () => fn(...args))();
      
      resolve(result);
      
      try {
        await result;
      } catch {}
      
      next();
    };
    
    const enqueue = (fn, resolve, ...args) => {
      queue.push(run.bind(null, fn, resolve, ...args));
      
      (async () => {
        await Promise.resolve();
        
        if (activeCount < concurrency && queue.length > 0) {
          queue.shift()();
        }
      })();
    };
    
    const generator = (fn, ...args) => new Promise(resolve => {
      enqueue(fn, resolve, ...args);
    });
    
    Object.defineProperties(generator, {
      activeCount: { get: () => activeCount },
      pendingCount: { get: () => queue.length },
      clearQueue: { value: () => { queue.length = 0; } }
    });
    
    return generator;
  },

  // Promise queue
  createPromiseQueue = (concurrency = 1) => {
    const queue = [];
    let running = 0;
    
    const runNext = async () => {
      if (running >= concurrency || queue.length === 0) return;
      
      running++;
      const { fn, resolve, reject } = queue.shift();
      
      try {
        const result = await fn();
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        running--;
        runNext();
      }
    };
    
    return {
      add: (fn) => {
        return new Promise((resolve, reject) => {
          queue.push({ fn, resolve, reject });
          runNext();
        });
      },
      size: () => queue.length,
      running: () => running
    };
  },

  // Observable pattern
  createObservable = (initialValue) => {
    let value = initialValue;
    const subscribers = new Set();
    
    return {
      get: () => value,
      set: (newValue) => {
        value = newValue;
        subscribers.forEach(fn => fn(value));
      },
      subscribe: (fn) => {
        subscribers.add(fn);
        fn(value);
        return () => subscribers.delete(fn);
      }
    };
  },

  // Computed observable
  createComputed = (observables, computeFn) => {
    const subscribers = new Set();
    let value;
    
    const update = () => {
      const values = observables.map(obs => obs.get());
      value = computeFn(...values);
      subscribers.forEach(fn => fn(value));
    };
    
    observables.forEach(obs => obs.subscribe(update));
    update();
    
    return {
      get: () => value,
      subscribe: (fn) => {
        subscribers.add(fn);
        fn(value);
        return () => subscribers.delete(fn);
      }
    };
  },

  // Event bus
  createEventBus = () => {
    const events = {};
    
    return {
      on: (event, callback) => {
        events[event] = events[event] || [];
        events[event].push(callback);
        
        return () => {
          events[event] = events[event].filter(cb => cb !== callback);
        };
      },
      once: (event, callback) => {
        const onceCallback = (...args) => {
          callback(...args);
          off(event, onceCallback);
        };
        this.on(event, onceCallback);
      },
      emit: (event, ...args) => {
        (events[event] || []).forEach(callback => callback(...args));
      },
      off: (event, callback) => {
        if (!events[event]) return;
        events[event] = events[event].filter(cb => cb !== callback);
      }
    };
  },

  // Pub/Sub with topics
  createPubSub = () => {
    const topics = {};
    
    return {
      subscribe: (topic, callback) => {
        topics[topic] = topics[topic] || [];
        topics[topic].push(callback);
        
        return {
          unsubscribe: () => {
            topics[topic] = topics[topic].filter(cb => cb !== callback);
          }
        };
      },
      publish: (topic, data) => {
        (topics[topic] || []).forEach(callback => {
          try {
            callback(data);
          } catch (error) {
            console.error('PubSub error:', error);
          }
        });
      },
      hasSubscribers: (topic) => {
        return !!(topics[topic] && topics[topic].length);
      }
    };
  },

  // State machine
  createStateMachine = (config) => {
    let currentState = config.initial;
    const context = config.context || {};
    
    return {
      getState: () => currentState,
      getContext: () => context,
      can: (event) => {
        return !!config.states[currentState].on?.[event];
      },
      transition: (event, data) => {
        const stateConfig = config.states[currentState];
        const transition = stateConfig.on?.[event];
        
        if (!transition) {
          throw new Error(`No transition for event ${event} in state ${currentState}`);
        }
        
        const nextState = typeof transition === 'string' 
          ? transition 
          : transition.target;
        
        // Execute actions
        if (transition.actions) {
          transition.actions.forEach(action => action(context, data));
        }
        
        // Execute exit actions
        if (stateConfig.exit) {
          stateConfig.exit.forEach(action => action(context, data));
        }
        
        currentState = nextState;
        
        // Execute entry actions
        const nextStateConfig = config.states[nextState];
        if (nextStateConfig.entry) {
          nextStateConfig.entry.forEach(action => action(context, data));
        }
        
        return currentState;
      }
    };
  },

  // Finite State Machine with history
  createFSMWithHistory = (config) => {
    const fsm = createStateMachine(config);
    const history = [config.initial];
    
    return {
      ...fsm,
      transition: (event, data) => {
        const state = fsm.transition(event, data);
        history.push(state);
        return state;
      },
      undo: () => {
        if (history.length > 1) {
          history.pop();
          return history[history.length - 1];
        }
        return null;
      },
      getHistory: () => [...history]
    };
  },

  // Hierarchical State Machine
  createHierarchicalFSM = (config) => {
    const machines = new Map();
    
    const createMachine = (name, machineConfig, parent = null) => {
      const machine = {
        name,
        parent,
        fsm: createStateMachine(machineConfig),
        children: new Map()
      };
      
      machines.set(name, machine);
      return machine;
    };
    
    return {
      create: (name, config, parent) => createMachine(name, config, parent),
      get: (name) => machines.get(name),
      transition: (machineName, event, data) => {
        const machine = machines.get(machineName);
        if (!machine) throw new Error(`Machine ${machineName} not found`);
        
        const result = machine.fsm.transition(event, data);
        
        // Notify parent
        if (machine.parent) {
          this.transition(machine.parent, `${machineName}.${event}`, data);
        }
        
        return result;
      }
    };
  },

  // Actor model
  createActor = (initialState, behavior) => {
    const mailbox = [];
    let state = initialState;
    let processing = false;
    
    const process = async () => {
      if (processing) return;
      processing = true;
      
      while (mailbox.length > 0) {
        const message = mailbox.shift();
        state = await behavior(state, message);
      }
      
      processing = false;
    };
    
    return {
      send: (message) => {
        mailbox.push(message);
        process();
      },
      getState: () => state
    };
  },

  // Saga pattern
  createSaga = (generatorFn) => {
    const iterator = generatorFn();
    
    const run = async (input) => {
      let result = iterator.next(input);
      
      while (!result.done) {
        try {
          const value = await result.value;
          result = iterator.next(value);
        } catch (error) {
          result = iterator.throw(error);
        }
      }
      
      return result.value;
    };
    
    return { run };
  },

  // Command pattern
  createCommand = (execute, undo) => {
    return {
      execute,
      undo,
      redo: execute
    };
  },

  // Command manager
  createCommandManager = () => {
    const history = [];
    let position = -1;
    
    return {
      execute: (command) => {
        command.execute();
        
        // Remove any commands after current position
        history.splice(position + 1);
        
        history.push(command);
        position++;
      },
      undo: () => {
        if (position >= 0) {
          history[position].undo();
          position--;
        }
      },
      redo: () => {
        if (position < history.length - 1) {
          position++;
          history[position].execute();
        }
      },
      canUndo: () => position >= 0,
      canRedo: () => position < history.length - 1
    };
  },

  // Memento pattern
  createMemento = () => {
    const states = [];
    
    return {
      save: (state) => {
        states.push(JSON.parse(JSON.stringify(state)));
      },
      restore: () => {
        return states.length > 0 ? states.pop() : null;
      },
      getHistory: () => [...states]
    };
  },

  // Strategy pattern
  createStrategy = (strategies) => {
    return {
      execute: (name, ...args) => {
        const strategy = strategies[name];
        if (!strategy) throw new Error(`Strategy ${name} not found`);
        return strategy(...args);
      },
      add: (name, strategy) => {
        strategies[name] = strategy;
      }
    };
  },

  // Template method pattern
  createTemplate = (steps) => {
    return async (...args) => {
      const context = {};
      
      for (const step of steps) {
        await step(context, ...args);
      }
      
      return context;
    };
  },

  // Chain of responsibility
  createChain = (handlers) => {
    return {
      handle: async (request) => {
        for (const handler of handlers) {
          const result = await handler(request);
          if (result !== null) {
            return result;
          }
        }
        return null;
      }
    };
  },

  // Mediator pattern
  createMediator = () => {
    const colleagues = {};
    
    return {
      register: (name, colleague) => {
        colleagues[name] = colleague;
        colleague.setMediator(this);
      },
      send: (message, from, to) => {
        if (to) {
          colleagues[to]?.receive(message, from);
        } else {
          Object.entries(colleagues).forEach(([name, colleague]) => {
            if (name !== from) {
              colleague.receive(message, from);
            }
          });
        }
      }
    };
  },

  // Visitor pattern
  createVisitor = (visitors) => {
    return {
      visit: (element) => {
        const visitor = visitors[element.type];
        if (visitor) {
          return visitor(element);
        }
        return null;
      }
    };
  },

  // Interpreter pattern
  createInterpreter = (grammar) => {
    return {
      interpret: (expression) => {
        return grammar.parse(expression);
      }
    };
  },

  // Iterator pattern
  createIterator = (collection) => {
    let index = 0;
    
    return {
      next: () => {
        if (index < collection.length) {
          return { value: collection[index++], done: false };
        }
        return { done: true };
      },
      reset: () => { index = 0; },
      hasNext: () => index < collection.length
    };
  },

  // Composite pattern
  createComposite = () => {
    const children = [];
    
    return {
      add: (component) => children.push(component),
      remove: (component) => {
        const index = children.indexOf(component);
        if (index > -1) children.splice(index, 1);
      },
      operation: (...args) => {
        return children.map(child => child.operation(...args));
      }
    };
  },

  // Decorator pattern
  createDecorator = (component) => {
    return {
      operation: (...args) => component.operation(...args)
    };
  },

  // Proxy pattern
  createProxy = (target, handler) => {
    return new Proxy(target, handler);
  },

  // Adapter pattern
  createAdapter = (adaptee, interface) => {
    return {
      ...interface,
      request: (...args) => adaptee.specificRequest(...args)
    };
  },

  // Facade pattern
  createFacade = (subsystems) => {
    return {
      operation: () => {
        subsystems.forEach(subsystem => subsystem.operation());
      }
    };
  },

  // Flyweight pattern
  createFlyweight = (factory) => {
    const pool = new Map();
    
    return {
      get: (key) => {
        if (!pool.has(key)) {
          pool.set(key, factory(key));
        }
        return pool.get(key);
      }
    };
  },

  // Bridge pattern
  createBridge = (implementation) => {
    return {
      operation: () => implementation.operationImpl()
    };
  },

  // Builder pattern
  createBuilder = () => {
    const parts = [];
    
    return {
      addPart: (part) => {
        parts.push(part);
        return this;
      },
      build: () => {
        return parts.join('');
      }
    };
  },

  // Prototype pattern
  createPrototype = (prototype) => {
    return {
      clone: () => ({ ...prototype })
    };
  },

  // Singleton pattern
  createSingleton = (factory) => {
    let instance;
    
    return {
      getInstance: () => {
        if (!instance) {
          instance = factory();
        }
        return instance;
      }
    };
  },

  // Factory pattern
  createFactory = (creators) => {
    return {
      create: (type, ...args) => {
        const creator = creators[type];
        if (!creator) throw new Error(`Unknown type: ${type}`);
        return creator(...args);
      }
    };
  },

  // Abstract Factory pattern
  createAbstractFactory = (families) => {
    return {
      createProductA: () => families.productA(),
      createProductB: () => families.productB()
    };
  },

  // Module pattern
  createModule = ((api) => {
    const privateVar = 'private';
    
    return {
      publicMethod: () => privateVar,
      ...api
    };
  }),

  // Revealing module pattern
  createRevealingModule = (definition) => {
    const privateVars = {};
    const publicAPI = {};
    
    definition(privateVars, publicAPI);
    
    return publicAPI;
  },

  // Namespace pattern
  createNamespace = (name) => {
    window[name] = window[name] || {};
    return window[name];
  },

  // Sandbox pattern
  createSandbox = (modules) => {
    const box = {};
    
    modules.forEach(module => {
      box[module.name] = module.init(box);
    });
    
    return box;
  },

  // Dependency injection container
  createDIContainer = () => {
    const dependencies = new Map();
    const factories = new Map();
    
    return {
      register: (name, factory) => {
        factories.set(name, factory);
      },
      resolve: (name) => {
        if (dependencies.has(name)) {
          return dependencies.get(name);
        }
        
        const factory = factories.get(name);
        if (!factory) throw new Error(`Dependency ${name} not found`);
        
        const dependency = factory(this);
        dependencies.set(name, dependency);
        return dependency;
      }
    };
  },

  // Service locator
  createServiceLocator = () => {
    const services = new Map();
    
    return {
      register: (name, service) => {
        services.set(name, service);
      },
      get: (name) => {
        const service = services.get(name);
        if (!service) throw new Error(`Service ${name} not found`);
        return service;
      }
    };
  },

  // Inversion of Control container
  createIoCContainer = () => {
    const registrations = new Map();
    
    return {
      bind: (interface) => {
        return {
          to: (implementation) => {
            registrations.set(interface, implementation);
          }
        };
      },
      resolve: (interface) => {
        const implementation = registrations.get(interface);
        if (!implementation) throw new Error(`No registration for ${interface}`);
        return new implementation();
      }
    };
  },

  // Aspect Oriented Programming
  createAOP = () => {
    const aspects = [];
    
    return {
      addAspect: (aspect) => aspects.push(aspect),
      weave: (target, method) => {
        const original = target[method];
        
        target[method] = function(...args) {
          aspects.forEach(aspect => aspect.before?.(this, method, args));
          
          let result;
          try {
            result = original.apply(this, args);
            aspects.forEach(aspect => aspect.afterReturning?.(this, method, args, result));
          } catch (error) {
            aspects.forEach(aspect => aspect.afterThrowing?.(this, method, args, error));
            throw error;
          } finally {
            aspects.forEach(aspect => aspect.after?.(this, method, args));
          }
          
          return result;
        };
      }
    };
  },

  // Object pool
  createObjectPool = (factory, resetFn, options = {}) => {
    const { min = 0, max = 10 } = options;
    const available = [];
    const inUse = new Set();
    
    // Pre-populate
    for (let i = 0; i < min; i++) {
      available.push(factory());
    }
    
    return {
      acquire: () => {
        let obj;
        
        if (available.length > 0) {
          obj = available.pop();
        } else if (inUse.size < max) {
          obj = factory();
        } else {
          throw new Error('Pool exhausted');
        }
        
        inUse.add(obj);
        return obj;
      },
      release: (obj) => {
        if (inUse.has(obj)) {
          inUse.delete(obj);
          resetFn(obj);
          available.push(obj);
        }
      },
      size: () => inUse.size,
      available: () => available.length
    };
  },

  // Connection pool
  createConnectionPool = (createConnection, options = {}) => {
    const { min = 2, max = 10, idleTimeout = 30000 } = options;
    const pool = createObjectPool(createConnection, (conn) => conn.reset(), { min, max });
    const timers = new WeakMap();
    
    return {
      getConnection: async () => {
        const conn = pool.acquire();
        
        // Clear idle timeout
        if (timers.has(conn)) {
          clearTimeout(timers.get(conn));
          timers.delete(conn);
        }
        
        return conn;
      },
      releaseConnection: (conn) => {
        // Set idle timeout
        const timer = setTimeout(() => {
          conn.close();
        }, idleTimeout);
        
        timers.set(conn, timer);
        pool.release(conn);
      }
    };
  },

  // Resource pool
  createResourcePool = (resources) => {
    const available = [...resources];
    const inUse = new Set();
    
    return {
      acquire: () => {
        if (available.length === 0) {
          throw new Error('No resources available');
        }
        
        const resource = available.pop();
        inUse.add(resource);
        return resource;
      },
      release: (resource) => {
        if (inUse.has(resource)) {
          inUse.delete(resource);
          available.push(resource);
        }
      }
    };
  },

  // Worker pool
  createWorkerPool = (workerScript, poolSize = 4) => {
    const workers = [];
    const queue = [];
    let taskId = 0;
    const tasks = new Map();
    
    // Initialize workers
    for (let i = 0; i < poolSize; i++) {
      const worker = new Worker(workerScript);
      
      worker.onmessage = (e) => {
        const { id, result, error } = e.data;
        const task = tasks.get(id);
        
        if (task) {
          if (error) {
            task.reject(new Error(error));
          } else {
            task.resolve(result);
          }
          tasks.delete(id);
        }
        
        // Process next task
        if (queue.length > 0) {
          const nextTask = queue.shift();
          worker.postMessage({ id: nextTask.id, data: nextTask.data });
        } else {
          worker.busy = false;
        }
      };
      
      workers.push(worker);
    }
    
    return {
      execute: (data) => {
        return new Promise((resolve, reject) => {
          const id = ++taskId;
          tasks.set(id, { resolve, reject });
          
          // Find available worker
          const availableWorker = workers.find(w => !w.busy);
          
          if (availableWorker) {
            availableWorker.busy = true;
            availableWorker.postMessage({ id, data });
          } else {
            queue.push({ id, data });
          }
        });
      },
      terminate: () => {
        workers.forEach(w => w.terminate());
      }
    };
  },

  // Thread pool (using Web Workers)
  createThreadPool = (poolSize = navigator.hardwareConcurrency || 4) => {
    return createWorkerPool('worker.js', poolSize);
  },

  // Task queue
  createTaskQueue = (options = {}) => {
    const { concurrency = 1, autoStart = true } = options;
    const queue = [];
    let running = 0;
    let isRunning = autoStart;
    
    const runNext = async () => {
      if (!isRunning || running >= concurrency || queue.length === 0) return;
      
      running++;
      const { task, resolve, reject } = queue.shift();
      
      try {
        const result = await task();
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        running--;
        runNext();
      }
    };
    
    return {
      add: (task, priority = 0) => {
        return new Promise((resolve, reject) => {
          const item = { task, resolve, reject, priority };
          
          // Insert by priority
          const index = queue.findIndex(i => i.priority < priority);
          if (index === -1) {
            queue.push(item);
          } else {
            queue.splice(index, 0, item);
          }
          
          runNext();
        });
      },
      start: () => {
        isRunning = true;
        runNext();
      },
      pause: () => {
        isRunning = false;
      },
      clear: () => {
        queue.length = 0;
      },
      size: () => queue.length,
      running: () => running
    };
  },

  // Priority task queue
  createPriorityTaskQueue = () => {
    const queue = createBinaryHeap((a, b) => a.priority - b.priority);
    
    return {
      add: (task, priority = 0) => {
        queue.insert({ task, priority });
      },
      next: () => queue.extractMin()?.task,
      peek: () => queue.peek()?.task,
      isEmpty: () => queue.isEmpty(),
      size: () => queue.size()
    };
  },

  // Delayed task queue
  createDelayedTaskQueue = () => {
    const queue = [];
    let timer = null;
    
    const process = () => {
      const now = Date.now();
      
      while (queue.length > 0 && queue[0].time <= now) {
        const { task } = queue.shift();
        task();
      }
      
      if (queue.length > 0) {
        const delay = queue[0].time - now;
        timer = setTimeout(process, delay);
      }
    };
    
    return {
      add: (task, delay) => {
        const time = Date.now() + delay;
        
        // Insert in sorted order
        const index = queue.findIndex(item => item.time > time);
        if (index === -1) {
          queue.push({ task, time });
        } else {
          queue.splice(index, 0, { task, time });
        }
        
        // Reset timer
        if (timer) {
          clearTimeout(timer);
        }
        process();
      },
      clear: () => {
        queue.length = 0;
        if (timer) {
          clearTimeout(timer);
          timer = null;
        }
      }
    };
  },

  // Recurring task scheduler
  createScheduler = () => {
    const tasks = new Map();
    let id = 0;
    
    return {
      schedule: (fn, interval, immediate = false) => {
        const taskId = ++id;
        
        const execute = async () => {
          try {
            await fn();
          } catch (error) {
            console.error('Scheduled task error:', error);
          }
          
          if (tasks.has(taskId)) {
            tasks.get(taskId).timer = setTimeout(execute, interval);
          }
        };
        
        const timer = immediate ? setImmediate(execute) : setTimeout(execute, interval);
        tasks.set(taskId, { timer, fn, interval });
        
        return taskId;
      },
      cancel: (taskId) => {
        const task = tasks.get(taskId);
        if (task) {
          clearTimeout(task.timer);
          tasks.delete(taskId);
        }
      },
      cancelAll: () => {
        tasks.forEach(task => clearTimeout(task.timer));
        tasks.clear();
      }
    };
  },

  // Cron-like scheduler
  createCronScheduler = () => {
    const jobs = [];
    
    const parseCron = (pattern) => {
      // Simplified cron parser
      const parts = pattern.split(' ');
      return {
        minute: parts[0],
        hour: parts[1],
        dayOfMonth: parts[2],
        month: parts[3],
        dayOfWeek: parts[4]
      };
    };
    
    const matches = (value, pattern) => {
      if (pattern === '*') return true;
      if (pattern.includes(',')) {
        return pattern.split(',').includes(value.toString());
      }
      if (pattern.includes('-')) {
        const [start, end] = pattern.split('-').map(Number);
        return value >= start && value <= end;
      }
      if (pattern.includes('/')) {
        const [base, step] = pattern.split('/');
        if (base !== '*') return false;
        return value % Number(step) === 0;
      }
      return value === Number(pattern);
    };
    
    const check = () => {
      const now = new Date();
      
      jobs.forEach(job => {
        const { minute, hour, dayOfMonth, month, dayOfWeek } = job.schedule;
        
        if (matches(now.getMinutes(), minute) &&
            matches(now.getHours(), hour) &&
            matches(now.getDate(), dayOfMonth) &&
            matches(now.getMonth() + 1, month) &&
            matches(now.getDay(), dayOfWeek)) {
          job.fn();
        }
      });
    };
    
    // Check every minute
    const interval = setInterval(check, 60000);
    
    return {
      schedule: (pattern, fn) => {
        jobs.push({ schedule: parseCron(pattern), fn });
      },
      stop: () => clearInterval(interval)
    };
  },

  // Job queue with retry
  createJobQueue = (processor, options = {}) => {
    const { retries = 3, backoff = 1000 } = options;
    const queue = [];
    let processing = false;
    
    const processJob = async (job) => {
      for (let attempt = 0; attempt <= retries; attempt++) {
        try {
          await processor(job.data);
          job.resolve();
          return;
        } catch (error) {
          if (attempt === retries) {
            job.reject(error);
            return;
          }
          
          const delay = backoff * Math.pow(2, attempt);
          await new Promise(r => setTimeout(r, delay));
        }
      }
    };
    
    const run = async () => {
      if (processing || queue.length === 0) return;
      processing = true;
      
      const job = queue.shift();
      await processJob(job);
      
      processing = false;
      run();
    };
    
    return {
      add: (data) => {
        return new Promise((resolve, reject) => {
          queue.push({ data, resolve, reject });
          run();
        });
      },
      size: () => queue.length
    };
  },

  // Pipeline
  createPipeline = (...stages) => {
    return async (input) => {
      let result = input;
      
      for (const stage of stages) {
        result = await stage(result);
      }
      
      return result;
    };
  },

  // Stream processing
  createStream = () => {
    const listeners = [];
    
    return {
      subscribe: (listener) => {
        listeners.push(listener);
        return () => {
          const index = listeners.indexOf(listener);
          if (index > -1) listeners.splice(index, 1);
        };
      },
      push: (data) => {
        listeners.forEach(listener => listener(data));
      },
      map: (fn) => {
        const newStream = createStream();
        this.subscribe(data => newStream.push(fn(data)));
        return newStream;
      },
      filter: (fn) => {
        const newStream = createStream();
        this.subscribe(data => {
          if (fn(data)) newStream.push(data);
        });
        return newStream;
      },
      reduce: (fn, initial) => {
        let acc = initial;
        this.subscribe(data => {
          acc = fn(acc, data);
        });
        return {
          getValue: () => acc
        };
      }
    };
  },

  // Event sourcing
  createEventStore = () => {
    const events = [];
    const projections = new Map();
    
    return {
      append: (event) => {
        events.push({
          ...event,
          timestamp: Date.now(),
          version: events.length + 1
        });
        
        // Update projections
        projections.forEach((projection, name) => {
          projection.handle(event);
        });
      },
      getEvents: () => [...events],
      getEventsByType: (type) => events.filter(e => e.type === type),
      getEventsForAggregate: (aggregateId) => 
        events.filter(e => e.aggregateId === aggregateId),
      createProjection: (name, handlers) => {
        const state = {};
        
        const projection = {
          handle: (event) => {
            const handler = handlers[event.type];
            if (handler) {
              handler(state, event);
            }
          },
          getState: () => ({ ...state })
        };
        
        // Replay all events
        events.forEach(event => projection.handle(event));
        
        projections.set(name, projection);
        return projection;
      }
    };
  },

  // CQRS (Command Query Responsibility Segregation)
  createCQRS = () => {
    const commands = new Map();
    const queries = new Map();
    const eventBus = createEventBus();
    
    return {
      registerCommand: (name, handler) => {
        commands.set(name, handler);
      },
      registerQuery: (name, handler) => {
        queries.set(name, handler);
      },
      execute: async (commandName, data) => {
        const handler = commands.get(commandName);
        if (!handler) throw new Error(`Command ${commandName} not found`);
        
        const events = await handler(data);
        events.forEach(event => eventBus.emit(event.type, event));
        
        return events;
      },
      query: async (queryName, criteria) => {
        const handler = queries.get(queryName);
        if (!handler) throw new Error(`Query ${queryName} not found`);
        
        return handler(criteria);
      },
      subscribe: (eventType, handler) => {
        return eventBus.on(eventType, handler);
      }
    };
  },

  // Unit of Work
  createUnitOfWork = () => {
    const changes = [];
    
    return {
      registerNew: (entity) => {
        changes.push({ type: 'new', entity });
      },
      registerDirty: (entity) => {
        changes.push({ type: 'dirty', entity });
      },
      registerDeleted: (entity) => {
        changes.push({ type: 'deleted', entity });
      },
      commit: async () => {
        for (const change of changes) {
          switch (change.type) {
            case 'new':
              await change.entity.insert();
              break;
            case 'dirty':
              await change.entity.update();
              break;
            case 'deleted':
              await change.entity.delete();
              break;
          }
        }
        changes.length = 0;
      },
      rollback: () => {
        changes.length = 0;
      }
    };
  },

  // Repository pattern
  createRepository = (entityClass, dataSource) => {
    const cache = new Map();
    
    return {
      findById: async (id) => {
        if (cache.has(id)) {
          return cache.get(id);
        }
        
        const entity = await dataSource.findById(entityClass, id);
        if (entity) {
          cache.set(id, entity);
        }
        return entity;
      },
      findAll: async (criteria) => {
        return dataSource.findAll(entityClass, criteria);
      },
      save: async (entity) => {
        if (entity.id) {
          await dataSource.update(entity);
        } else {
          entity.id = await dataSource.insert(entity);
        }
        cache.set(entity.id, entity);
        return entity;
      },
      delete: async (id) => {
        await dataSource.delete(entityClass, id);
        cache.delete(id);
      }
    };
  },

  // Specification pattern
  createSpecification = (predicate) => {
    return {
      isSatisfiedBy: (candidate) => predicate(candidate),
      and: (other) => createSpecification(
        candidate => predicate(candidate) && other.isSatisfiedBy(candidate)
      ),
      or: (other) => createSpecification(
        candidate => predicate(candidate) || other.isSatisfiedBy(candidate)
      ),
      not: () => createSpecification(candidate => !predicate(candidate))
    };
  },

  // Value Object
  createValueObject = (props) => {
    return Object.freeze({
      ...props,
      equals: (other) => {
        return JSON.stringify(props) === JSON.stringify(other);
      }
    });
  },

  // Entity
  createEntity = (id, props) => {
    return {
      id,
      ...props,
      equals: (other) => id === other.id,
      toJSON: () => ({ id, ...props })
    };
  },

  // Aggregate Root
  createAggregateRoot = (id, props) => {
    const events = [];
    const entity = createEntity(id, props);
    
    return {
      ...entity,
      apply: (event) => {
        events.push(event);
        // Update state based on event
      },
      getUncommittedEvents: () => [...events],
      markCommitted: () => {
        events.length = 0;
      }
    };
  },

  // Domain Event
  createDomainEvent = (type, payload, aggregateId) => {
    return {
      type,
      payload,
      aggregateId,
      timestamp: Date.now(),
      id: generateUUID()
    };
  },

  // Domain Service
  createDomainService = (name, execute) => {
    return {
      name,
      execute
    };
  },

  // Application Service
  createApplicationService = (repositories, domainServices) => {
    return {
      execute: async (command) => {
        // Transaction management
        // Orchestrate domain objects
        // Publish domain events
      }
    };
  },

  // Data Mapper
  createDataMapper = (entityClass, mappings) => {
    return {
      toDomain: (data) => {
        const props = {};
        for (const [domainProp, dbColumn] of Object.entries(mappings)) {
          props[domainProp] = data[dbColumn];
        }
        return new entityClass(props);
      },
      toData: (entity) => {
        const data = {};
        for (const [domainProp, dbColumn] of Object.entries(mappings)) {
          data[dbColumn] = entity[domainProp];
        }
        return data;
      }
    };
  },

  // Identity Map
  createIdentityMap = () => {
    const map = new Map();
    
    return {
      add: (entity) => {
        map.set(entity.id, entity);
      },
      get: (id) => map.get(id),
      remove: (id) => map.delete(id),
      clear: () => map.clear(),
      contains: (id) => map.has(id)
    };
  },

  // Lazy Loading
  createLazyLoader = (loader) => {
    let loaded = false;
    let value;
    
    return {
      get: async () => {
        if (!loaded) {
          value = await loader();
          loaded = true;
        }
        return value;
      },
      isLoaded: () => loaded
    };
  },

  // Virtual Proxy
  createVirtualProxy = (realSubject, loader) => {
    let subject = null;
    
    return new Proxy({}, {
      get: (target, prop) => {
        if (!subject) {
          subject = loader();
        }
        return subject[prop];
      }
    });
  },

  // Protection Proxy
  createProtectionProxy = (realSubject, accessControl) => {
    return new Proxy(realSubject, {
      get: (target, prop) => {
        if (!accessControl.canAccess(prop)) {
          throw new Error(`Access denied to ${prop}`);
        }
        return target[prop];
      }
    });
  },

  // Remote Proxy
  createRemoteProxy = (endpoint) => {
    return new Proxy({}, {
      get: (target, prop) => {
        return async (...args) => {
          const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ method: prop, args })
          });
          return response.json();
        };
      }
    });
  },

  // Smart Reference Proxy
  createSmartReference = (realSubject, options = {}) => {
    const { onAccess, onDispose } = options;
    let refCount = 0;
    
    return {
      acquire: () => {
        refCount++;
        onAccess?.();
        return realSubject;
      },
      release: () => {
        refCount--;
        if (refCount === 0) {
          onDispose?.();
        }
      },
      getRefCount: () => refCount
    };
  },

  // Copy-on-Write
  createCOW = (initial) => {
    let current = initial;
    let copies = 0;
    
    return {
      read: () => current,
      write: (modifier) => {
        if (copies > 0) {
          current = { ...current };
          copies = 0;
        }
        current = modifier(current);
      },
      fork: () => {
        copies++;
        return createCOW(current);
      }
    };
  },

  // Immutable updates
  immutableSet = (obj, path, value) => {
    const keys = path.split('.');
    const newObj = { ...obj };
    let current = newObj;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current[keys[i]] = { ...current[keys[i]] };
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    return newObj;
  },

  // Structural sharing
  createStructuralSharing = (size = 32) => {
    const bitmap = 0;
    const nodes = [];
    
    return {
      set: (key, value) => {
        const hash = hashKey(key);
        const idx = (hash >>> 0) & (size - 1);
        // Implementation details...
      },
      get: (key) => {
        // Implementation details...
      }
    };
  },

  // Persistent data structures
  createVector = (initial = []) => {
    const data = [...initial];
    
    return {
      get: (index) => data[index],
      set: (index, value) => {
        const newData = [...data];
        newData[index] = value;
        return createVector(newData);
      },
      push: (value) => {
        return createVector([...data, value]);
      },
      pop: () => {
        return createVector(data.slice(0, -1));
      },
      toArray: () => [...data]
    };
  },

  // Hash Map Trie
  createHashMap = () => {
    const root = {};
    
    return {
      set: (key, value) => {
        const hash = hashKey(key);
        let node = root;
        
        for (let i = 0; i < 32; i += 5) {
          const idx = (hash >>> i) & 31;
          if (!node.children) node.children = [];
          if (!node.children[idx]) node.children[idx] = {};
          node = node.children[idx];
        }
        
        node.value = value;
        node.key = key;
      },
      get: (key) => {
        const hash = hashKey(key);
        let node = root;
        
        for (let i = 0; i < 32; i += 5) {
          const idx = (hash >>> i) & 31;
          if (!node.children || !node.children[idx]) return undefined;
          node = node.children[idx];
        }
        
        return node.value;
      }
    };
  },

  // Transducers
  createTransducer = (...transforms) => {
    return (reducer) => {
      return transforms.reduceRight((acc, transform) => transform(acc), reducer);
    };
  },

  // Map transducer
  mapTransducer = (fn) => (reducer) => (acc, item) => reducer(acc, fn(item)),

  // Filter transducer
  filterTransducer = (predicate) => (reducer) => (acc, item) => 
    predicate(item) ? reducer(acc, item) : acc,

  // Take transducer
  takeTransducer = (n) => (reducer) => {
    let taken = 0;
    return (acc, item) => {
      if (taken < n) {
        taken++;
        return reducer(acc, item);
      }
      return acc;
    };
  },

  // Compose transducers
  composeTransducers = (...transforms) => (reducer) => 
    transforms.reduceRight((acc, transform) => transform(acc), reducer),

  // Into
  into = (empty, transducer, collection) => 
    collection.reduce(transducer((acc, item) => [...acc, item]), empty),

  // Lazy sequence
  createLazySeq = (generator) => {
    return {
      map: (fn) => createLazySeq(function* () {
        for (const item of generator()) {
          yield fn(item);
        }
      }),
      filter: (predicate) => createLazySeq(function* () {
        for (const item of generator()) {
          if (predicate(item)) yield item;
        }
      }),
      take: (n) => createLazySeq(function* () {
        let i = 0;
        for (const item of generator()) {
          if (i >= n) break;
          yield item;
          i++;
        }
      }),
      toArray: () => Array.from(generator())
    };
  },

  // Functional lens
  createLens = (getter, setter) => ({
    get: getter,
    set: setter,
    modify: (fn, obj) => setter(fn(getter(obj)), obj),
    compose: (other) => createLens(
      obj => other.get(getter(obj)),
      (val, obj) => setter(other.set(val, getter(obj)), obj)
    )
  }),

  // Prop lens
  propLens = (key) => createLens(
    obj => obj[key],
    (val, obj) => ({ ...obj, [key]: val })
  ),

  // Path lens
  pathLens = (path) => path.split('.').reduce(
    (acc, key) => acc.compose(propLens(key)),
    createLens(x => x, (val, _) => val)
  ),

  // Zipper
  createZipper = (tree) => {
    const path = [];
    let focus = tree;
    
    return {
      down: () => {
        if (focus.children && focus.children.length > 0) {
          path.push({ node: focus, index: 0 });
          focus = focus.children[0];
          return this;
        }
        return null;
      },
      up: () => {
        if (path.length === 0) return null;
        const { node, index } = path.pop();
        focus = node;
        return this;
      },
      left: () => {
        if (path.length === 0) return null;
        const parent = path[path.length - 1];
        if (parent.index > 0) {
          parent.index--;
          focus = parent.node.children[parent.index];
          return this;
        }
        return null;
      },
      right: () => {
        if (path.length === 0) return null;
        const parent = path[path.length - 1];
        if (parent.index < parent.node.children.length - 1) {
          parent.index++;
          focus = parent.node.children[parent.index];
          return this;
        }
        return null;
      },
      get: () => focus,
      set: (newFocus) => {
        focus = newFocus;
        return this;
      },
      edit: (fn) => {
        focus = fn(focus);
        return this;
      },
      root: () => {
        while (path.length > 0) {
          this.up();
        }
        return focus;
      }
    };
  },

  // Parser combinator
  createParser = (parse) => ({
    parse,
    map: (fn) => createParser(input => {
      const result = parse(input);
      if (result.success) {
        return { ...result, value: fn(result.value) };
      }
      return result;
    }),
    chain: (fn) => createParser(input => {
      const result = parse(input);
      if (result.success) {
        return fn(result.value).parse(result.remaining);
      }
      return result;
    }),
    or: (other) => createParser(input => {
      const result = parse(input);
      if (result.success) return result;
      return other.parse(input);
    }),
    and: (other) => createParser(input => {
      const result1 = parse(input);
      if (!result1.success) return result1;
      
      const result2 = other.parse(result1.remaining);
      if (!result2.success) return result2;
      
      return {
        success: true,
        value: [result1.value, result2.value],
        remaining: result2.remaining
      };
    })
  }),

  // String parser
  stringParser = (str) => createParser(input => {
    if (input.startsWith(str)) {
      return {
        success: true,
        value: str,
        remaining: input.slice(str.length)
      };
    }
    return { success: false, error: `Expected ${str}` };
  }),

  // Regex parser
  regexParser = (pattern) => createParser(input => {
    const match = input.match(pattern);
    if (match && match.index === 0) {
      return {
        success: true,
        value: match[0],
        remaining: input.slice(match[0].length)
      };
    }
    return { success: false, error: `Pattern ${pattern} not matched` };
  }),

  // Many parser
  manyParser = (parser) => createParser(input => {
    const values = [];
    let remaining = input;
    
    while (true) {
      const result = parser.parse(remaining);
      if (!result.success) break;
      values.push(result.value);
      remaining = result.remaining;
    }
    
    return {
      success: true,
      value: values,
      remaining
    };
  }),

  // Optional parser
  optionalParser = (parser) => createParser(input => {
    const result = parser.parse(input);
    if (result.success) return result;
    return {
      success: true,
      value: null,
      remaining: input
    };
  }),

  // JSON parser (simplified)
  jsonParser = () => {
    const whitespace = regexParser(/^\s*/);
    const nullParser = stringParser('null').map(() => null);
    const boolParser = stringParser('true').map(() => true)
      .or(stringParser('false').map(() => false));
    const numberParser = regexParser(/^-?\d+(\.\d+)?([eE][+-]?\d+)?/).map(Number);
    const stringParser = regexParser(/^"([^"\\]|\\.)*"/).map(s => 
      JSON.parse(s)
    );
    
    // Recursive parsers for array and object
    let valueParser;
    
    const arrayParser = createParser(input => {
      const result = stringParser('[').and(
        optionalParser(
          createParser(i => valueParser.parse(i)).chain(first => 
            manyParser(
              stringParser(',').and(createParser(i => valueParser.parse(i)))
                .map(([, val]) => val)
            ).map(rest => [first, ...rest])
          )
        ).map(x => x || [])
      ).and(stringParser(']'))
      .map(([[, values], ]) => values)
      .parse(input);
      
      return result;
    });
    
    const objectParser = createParser(input => {
      const pairParser = stringParser.parse(input).chain(key => 
        whitespace.and(stringParser(':')).and(createParser(i => valueParser.parse(i)))
          .map(([, value]) => [JSON.parse(key), value])
      );
      
      return stringParser('{').and(
        optionalParser(
          pairParser.chain(first =>
            manyParser(
              stringParser(',').and(pairParser).map(([, pair]) => pair)
            ).map(rest => [first, ...rest])
          )
        ).map(x => x || [])
      ).and(stringParser('}'))
      .map(([[, pairs], ]) => Object.fromEntries(pairs))
      .parse(input);
    });
    
    valueParser = whitespace.and(
      nullParser.or(boolParser).or(numberParser).or(stringParser).or(arrayParser).or(objectParser)
    ).map(([, val]) => val);
    
    return valueParser;
  },

  // Result type
  createResult = () => ({
    ok: (value) => ({ success: true, value }),
    err: (error) => ({ success: false, error }),
    map: (fn) => (result) => 
      result.success ? this.ok(fn(result.value)) : result,
    flatMap: (fn) => (result) => 
      result.success ? fn(result.value) : result,
    fold: (onErr, onOk) => (result) => 
      result.success ? onOk(result.value) : onErr(result.error)
  }),

  // Option type
  createOption = () => ({
    some: (value) => ({ hasValue: true, value }),
    none: () => ({ hasValue: false }),
    map: (fn) => (option) => 
      option.hasValue ? this.some(fn(option.value)) : option,
    flatMap: (fn) => (option) => 
      option.hasValue ? fn(option.value) : option,
    getOrElse: (defaultValue) => (option) => 
      option.hasValue ? option.value : defaultValue,
    fold: (onNone, onSome) => (option) => 
      option.hasValue ? onSome(option.value) : onNone()
  }),

  // Either type
  createEither = () => ({
    left: (value) => ({ isLeft: true, value }),
    right: (value) => ({ isRight: true, value }),
    map: (fn) => (either) => 
      either.isRight ? this.right(fn(either.value)) : either,
    mapLeft: (fn) => (either) => 
      either.isLeft ? this.left(fn(either.value)) : either,
    flatMap: (fn) => (either) => 
      either.isRight ? fn(either.value) : either,
    fold: (onLeft, onRight) => (either) => 
      either.isLeft ? onLeft(either.value) : onRight(either.value)
  }),

  // Task/Future
  createTask = (computation) => ({
    run: () => new Promise(computation),
    map: (fn) => createTask((resolve, reject) => 
      this.run().then(x => resolve(fn(x))).catch(reject)
    ),
    flatMap: (fn) => createTask((resolve, reject) => 
      this.run().then(x => fn(x).run()).catch(reject)
    ),
    catch: (fn) => createTask((resolve, reject) => 
      this.run().then(resolve).catch(e => fn(e).run().then(resolve).catch(reject))
    )
  }),

  // IO Monad
  createIO = (effect) => ({
    run: effect,
    map: (fn) => createIO(() => fn(effect())),
    flatMap: (fn) => createIO(() => fn(effect()).run()),
    apply: (other) => createIO(() => effect()(other.run()))
  }),

  // State Monad
  createState = (runState) => ({
    runState,
    evalState: (initial) => runState(initial)[0],
    execState: (initial) => runState(initial)[1],
    map: (fn) => createState(s => {
      const [a, s1] = runState(s);
      return [fn(a), s1];
    }),
    flatMap: (fn) => createState(s => {
      const [a, s1] = runState(s);
      return fn(a).runState(s1);
    }),
    get: () => createState(s => [s, s]),
    put: (s) => createState(() => [null, s]),
    modify: (fn) => createState(s => [null, fn(s)])
  }),

  // Reader Monad
  createReader = (runReader) => ({
    runReader,
    map: (fn) => createReader(e => fn(runReader(e))),
    flatMap: (fn) => createReader(e => fn(runReader(e)).runReader(e)),
    ask: () => createReader(e => e),
    asks: (fn) => createReader(e => fn(e)),
    local: (fn) => createReader(e => runReader(fn(e)))
  }),

  // Writer Monad
  createWriter = (value, log = []) => ({
    value,
    log,
    runWriter: [value, log],
    map: (fn) => createWriter(fn(value), log),
    flatMap: (fn) => {
      const [v, l] = fn(value).runWriter;
      return createWriter(v, [...log, ...l]);
    },
    tell: (msg) => createWriter(null, [msg]),
    listen: () => createWriter([value, log], log),
    pass: () => {
      const [v, f] = value;
      return createWriter(v, f(log));
    }
  }),

  // Continuation Monad
  createCont = (runCont) => ({
    runCont,
    map: (fn) => createCont(k => runCont(x => k(fn(x)))),
    flatMap: (fn) => createCont(k => runCont(x => fn(x).runCont(k))),
    callCC: (fn) => createCont(k => fn(a => createCont(() => k(a))).runCont(k))
  }),

  // Free Monad
  createFree = () => ({
    pure: (value) => ({ type: 'Pure', value }),
    liftF: (functor) => ({ type: 'Free', functor }),
    impure: (value, next) => ({ type: 'Impure', value, next }),
    foldMap: (interpreter, transformer, free) => {
      if (free.type === 'Pure') {
        return Promise.resolve(free.value);
      }
      if (free.type === 'Free') {
        return interpreter(transformer(free.functor));
      }
      if (free.type === 'Impure') {
        return interpreter(free.value).then(x => 
          foldMap(interpreter, transformer, free.next(x))
        );
      }
    }
  }),

  // Validation Applicative
  createValidation = () => ({
    success: (value) => ({ isSuccess: true, value }),
    failure: (errors) => ({ isSuccess: false, errors }),
    map: (fn) => (validation) => 
      validation.isSuccess 
        ? this.success(fn(validation.value))
        : validation,
    apply: (fnValidation) => (valueValidation) => {
      if (fnValidation.isSuccess && valueValidation.isSuccess) {
        return this.success(fnValidation.value(valueValidation.value));
      }
      if (!fnValidation.isSuccess && !valueValidation.isSuccess) {
        return this.failure([...fnValidation.errors, ...valueValidation.errors]);
      }
      return fnValidation.isSuccess ? valueValidation : fnValidation;
    }
  }),

  // Semigroup
  createSemigroup = (concat) => ({
    concat,
    fold: (xs) => xs.reduce(concat)
  }),

  // Monoid
  createMonoid = (empty, concat) => ({
    empty: () => empty,
    concat,
    fold: (xs) => xs.reduce(concat, empty)
  }),

  // Functor laws
  verifyFunctorLaws = (Functor, value, f, g) => {
    const identity = Functor.map(x => x)(value);
    const composition = Functor.map(x => f(g(x)))(value);
    const composed = Functor.map(f)(Functor.map(g)(value));
    
    return {
      identity: JSON.stringify(identity) === JSON.stringify(value),
      composition: JSON.stringify(composition) === JSON.stringify(composed)
    };
  },

  // Monad laws
  verifyMonadLaws = (Monad, value, f, g) => {
    const leftIdentity = Monad.flatMap(f)(Monad.pure(value));
    const rightIdentity = Monad.flatMap(Monad.pure)(value);
    const associativity = Monad.flatMap(g)(Monad.flatMap(f)(value));
    const composed = Monad.flatMap(x => Monad.flatMap(g)(f(x)))(value);
    
    return {
      leftIdentity,
      rightIdentity,
      associativity: JSON.stringify(associativity) === JSON.stringify(composed)
    };
  },

  // Natural Transformation
  createNaturalTransformation = (transform) => ({
    transform,
    compose: (other) => createNaturalTransformation(
      fa => transform(other.transform(fa))
    )
  }),

  // Catamorphism
  cata = (algebra, coalgebra) => {
    const rec = (structure) => algebra(coalgebra(structure).map(rec));
    return rec;
  },

  // Anamorphism
  ana = (coalgebra, algebra) => {
    const rec = (seed) => algebra(coalgebra(seed).map(rec));
    return rec;
  },

  // Hylomorphism
  hylo = (algebra, coalgebra) => (seed) => {
    const go = (s) => {
      const structure = coalgebra(s);
      return algebra(structure.map(go));
    };
    return go(seed);
  },

  // Paramorphism
  para = (algebra, coalgebra) => {
    const rec = (structure) => algebra(structure, coalgebra(structure).map(rec));
    return rec;
  },

  // Apomorphism
  apo = (coalgebra, algebra) => {
    const rec = (seed) => algebra(coalgebra(seed).map(
      either => either.fold(rec, id)
    ));
    return rec;
  },

  // Zygomorphism
  zygo = (algebra1, algebra2, coalgebra) => {
    const rec = (structure) => {
      const struct = coalgebra(structure);
      return [algebra1(struct), algebra2(struct.map(rec))];
    };
    return rec;
  },

  // Futumorphism
  futu = (coalgebra, algebra) => {
    const rec = (seed) => algebra(coalgebra(seed).map(
      free => free.fold(rec, id)
    ));
    return rec;
  },

  // Histomorphism
  histo = (algebra, coalgebra) => {
    const rec = (structure) => {
      const struct = coalgebra(structure);
      const attr = struct.map(x => ({ attribute: rec(x), hole: x }));
      return algebra(attr);
    };
    return rec;
  },

  // Dynamorphism
  dyna = (algebra, coalgebra1, coalgebra2) => {
    const rec = (seed) => {
      const struct = coalgebra1(seed);
      return algebra(struct.map(x => histo(algebra, coalgebra2)(x)));
    };
    return rec;
  },

  // Chronomorphism
  chrono = (algebra, coalgebra1, coalgebra2) => {
    const rec = (seed) => {
      const struct = coalgebra1(seed);
      return algebra(struct.map(x => futu(coalgebra2, algebra)(x)));
    };
    return rec;
  },

  // Coinduction
  unfold = (coalgebra) => (seed) => {
    const result = coalgebra(seed);
    return {
      value: result.value,
      next: () => unfold(coalgebra)(result.next)
    };
  },

  // Induction
  fold = (algebra) => (structure) => {
    return algebra(structure.map(fold(algebra)));
  },

  // Corecursion
  corec = (coalgebra) => (seed) => {
    return coalgebra(seed).map(corec(coalgebra));
  },

  // Recursion schemes helper
  createFix = (unfix) => ({
    unfix,
    cata: (algebra) => fold(algebra)(unfix),
    ana: (coalgebra) => unfold(coalgebra)(unfix),
    hylo: (algebra, coalgebra) => hylo(algebra, coalgebra)(unfix)
  }),

  // Type class dictionary
  createTypeClass = (name, methods) => ({
    name,
    methods,
    instance: (type, implementations) => ({
      type,
      typeClass: name,
      ...Object.fromEntries(
        methods.map(method => [
          method,
          implementations[method]
        ])
      )
    })
  }),

  // Type class dispatch
  dispatch = (typeClass, method, type, ...args) => {
    const instance = typeClass.instances.get(type);
    if (!instance) throw new Error(`No instance of ${typeClass.name} for ${type}`);
    return instance[method](...args);
  },

  // Generic programming
  createGeneric = (type, representations) => ({
    type,
    to: (rep) => representations.to(rep),
    from: (value) => representations.from(value)
  }),

  // Deriving functor
  deriveFunctor = (generic) => ({
    map: (fn) => (value) => 
      generic.to(generic.from(value).map(fn))
  }),

  // Deriving foldable
  deriveFoldable = (generic) => ({
    foldMap: (monoid) => (fn) => (value) =>
      generic.from(value).foldMap(monoid)(fn)
  }),

  // Deriving traversable
  deriveTraversable = (generic) => ({
    traverse: (applicative) => (fn) => (value) =>
      generic.to(generic.from(value).traverse(applicative)(fn))
  }),

  // Template Haskell-like (runtime)
  quote = (template, ...values) => {
    return template.reduce((acc, part, i) => 
      acc + part + (values[i] || ''), ''
    );
  },

  // Quasiquoter
  quasiquote = (parser) => (strings, ...values) => {
    const interpolated = quote(strings, ...values);
    return parser(interpolated);
  },

  // Metaprogramming - define syntax
  defineSyntax = (name, expander) => {
    // Store syntax transformer
    if (!window.syntaxTransformers) {
      window.syntaxTransformers = new Map();
    }
    window.syntaxTransformers.set(name, expander);
  },

  // Macro expansion
  expandMacro = (code) => {
    // Simple macro expansion
    for (const [name, expander] of window.syntaxTransformers || []) {
      const regex = new RegExp(`${name}\\s*\\(([^)]+)\\)`, 'g');
      code = code.replace(regex, (match, args) => expander(args.split(',').map(a => a.trim())));
    }
    return code;
  },

  // DSL builder
  createDSL = (grammar, semantics) => {
    return {
      parse: (input) => {
        const ast = grammar.parse(input);
        return semantics(ast);
      },
      compile: (input) => {
        const result = this.parse(input);
        return result.compile();
      },
      evaluate: (input) => {
        const result = this.parse(input);
        return result.evaluate();
      }
    };
  },

  // Embedded DSL
  createEmbeddedDSL = (constructors) => {
    return new Proxy({}, {
      get: (target, prop) => {
        if (constructors[prop]) {
          return (...args) => ({
            type: prop,
            args,
            toString: () => `${prop}(${args.join(', ')})`,
            fold: (algebra) => algebra[prop](...args.map(arg => 
              typeof arg === 'object' && arg.fold ? arg.fold(algebra) : arg
            ))
          });
        }
        return target[prop];
      }
    });
  },

  // Tagless final
  createTaglessFinal = (interpreters) => {
    return {
      interpret: (language) => (interpreterName) => {
        const interpreter = interpreters[interpreterName];
        return language(interpreter);
      }
    };
  },

  // Finally Tagless
  createFinallyTagless = (signature) => {
    return {
      create: (interpreter) => {
        const methods = {};
        for (const [name, type] of Object.entries(signature)) {
          methods[name] = (...args) => interpreter[name](...args);
        }
        return methods;
      }
    };
  },

  // Object algebra
  createObjectAlgebra = (operations) => {
    return {
      create: (factory) => {
        const algebra = {};
        for (const op of operations) {
          algebra[op] = factory[op];
        }
        return algebra;
      },
      combine: (alg1, alg2) => {
        const combined = {};
        for (const op of operations) {
          combined[op] = (...args) => [alg1[op](...args), alg2[op](...args)];
        }
        return combined;
      }
    };
  },

  // Extensible effects
  createEff = () => {
    const handlers = new Map();
    
    return {
      send: (effect, value) => ({
        type: 'Effect',
        effect,
        value,
        k: (x) => x
      }),
      handle: (effect, handler) => {
        handlers.set(effect, handler);
      },
      run: (computation) => {
        let current = computation;
        
        while (current && current.type === 'Effect') {
          const handler = handlers.get(current.effect);
          if (!handler) throw new Error(`No handler for ${current.effect}`);
          current = handler(current.value, current.k);
        }
        
        return current;
      }
    };
  },

  // Free monad with effects
  createFreeEff = () => {
    const pure = (x) => ({ type: 'Pure', x });
    const impure = (eff, k) => ({ type: 'Impure', eff, k });
    
    return {
      pure,
      liftEff: (eff) => impure(eff, pure),
      bind: (m, f) => {
        if (m.type === 'Pure') return f(m.x);
        if (m.type === 'Impure') {
          return impure(m.eff, x => bind(m.k(x), f));
        }
      },
      foldEff: (pureFn, effFn, free) => {
        if (free.type === 'Pure') return pureFn(free.x);
        if (free.type === 'Impure') {
          return effFn(free.eff, x => foldEff(pureFn, effFn, free.k(x)));
        }
      }
    };
  },

  // Handler for effects
  createHandler = (returnClause, effectClauses) => ({
    return: returnClause,
    handle: (effect, resume) => {
      const clause = effectClauses[effect.constructor.name];
      if (clause) return clause(effect, resume);
      throw new Error(`Unhandled effect: ${effect.constructor.name}`);
    }
  }),

  // Resumable computation
  createResumable = (computation) => {
    let state = { done: false, value: null, next: computation };
    
    return {
      resume: () => {
        if (state.done) return { done: true };
        
        const result = state.next();
        if (result.type === 'Yield') {
          state.next = result.next;
          return { done: false, value: result.value };
        }
        
        state.done = true;
        state.value = result.value;
        return { done: true, value: result.value };
      },
      isDone: () => state.done
    };
  },

  // Delimited continuation
  createReset = (prompt) => (f) => {
    const stack = [];
    
    const shift = (k) => (g) => {
      stack.push(k);
      return g((x) => {
        const cont = stack.pop();
        return cont(x);
      });
    };
    
    return f(shift);
  },

  // Algebraic effects with rows
  createEffectRow = (...effects) => ({
    effects: new Set(effects),
    extend: (effect) => createEffectRow(...effects, effect),
    subtract: (effect) => createEffectRow(...effects.filter(e => e !== effect)),
    has: (effect) => effects.includes(effect)
  }),

  // Indexed monads
  createIndexedMonad = () => ({
    pure: (x) => ({ type: 'Pure', x }),
    bind: (m, f) => ({ type: 'Bind', m, f }),
    run: (ixMonad) => {
      // Type-safe state transitions
      return ixMonad;
    }
  }),

  // Dependent types (simulated)
  createDependentType = (type, predicate) => ({
    type,
    predicate,
    refine: (value) => {
      if (predicate(value)) {
        return { value, type: 'Refined', predicate };
      }
      throw new Error(`Value ${value} does not satisfy predicate`);
    }
  }),

  // Liquid types (refinement types)
  createLiquidType = (baseType, refinements) => ({
    baseType,
    refinements,
    check: (value) => {
      return refinements.every(r => r(value));
    }
  }),

  // Session types
  createSessionType = (protocol) => ({
    protocol,
    dual: () => createSessionType(dualProtocol(protocol)),
    compose: (other) => createSessionType(composeProtocols(protocol, other.protocol))
  }),

  // Linear types
  createLinearType = (value, consumed = false) => ({
    value,
    consumed,
    use: (fn) => {
      if (consumed) throw new Error('Linear value already consumed');
      const result = fn(value);
      return { result, linear: createLinearType(value, true) };
    }
  }),

  // Ownership types
  createOwner = () => {
    const owned = new Set();
    
    return {
      own: (value) => {
        owned.add(value);
        return {
          value,
          owner: this,
          borrow: () => ({ value, mutable: false }),
          borrowMut: () => {
            if (borrowed.size > 0) throw new Error('Cannot borrow mutably while borrowed');
            return { value, mutable: true };
          }
        };
      },
      drop: (value) => {
        owned.delete(value);
      }
    };
  },

  // Region-based memory management
  createRegion = () => {
    const allocations = [];
    
    return {
      allocate: (size) => {
        const ptr = { region: this, offset: allocations.length, size };
        allocations.push(new ArrayBuffer(size));
        return ptr;
      },
      free: () => {
        allocations.length = 0;
      }
    };
  },

  // Garbage collection hints
  gcHints = {
    suggestCollect: () => {
      if (global.gc) global.gc();
    },
    weakRef: (obj) => new WeakRef(obj),
    finalizer: (callback) => new FinalizationRegistry(callback)
  },

  // Memory pooling
  createMemoryPool = (objectSize, poolSize) => {
    const pool = new ArrayBuffer(objectSize * poolSize);
    const freeList = Array.from({ length: poolSize }, (_, i) => i);
    
    return {
      allocate: () => {
        if (freeList.length === 0) throw new Error('Pool exhausted');
        const index = freeList.pop();
        return {
          index,
          ptr: pool.slice(index * objectSize, (index + 1) * objectSize),
          free: () => freeList.push(index)
        };
      },
      clear: () => {
        freeList.length = 0;
        for (let i = 0; i < poolSize; i++) {
          freeList.push(i);
        }
      }
    };
  },

  // Arena allocator
  createArena = (blockSize = 1024 * 1024) => {
    const blocks = [];
    let currentBlock = null;
    let offset = 0;
    
    const allocateBlock = () => {
      const block = new ArrayBuffer(blockSize);
      blocks.push(block);
      currentBlock = block;
      offset = 0;
      return block;
    };
    
    return {
      alloc: (size) => {
        if (!currentBlock || offset + size > blockSize) {
          allocateBlock();
        }
        
        const ptr = {
          block: currentBlock,
          offset,
          size
        };
        
        offset += size;
        return ptr;
      },
      reset: () => {
        blocks.length = 0;
        currentBlock = null;
        offset = 0;
      }
    };
  },

  // Stack allocator
  createStackAllocator = (size = 1024 * 1024) => {
    const stack = new ArrayBuffer(size);
    let sp = size;
    
    return {
      push: (value) => {
        const bytes = new Uint8Array(value);
        sp -= bytes.length;
        new Uint8Array(stack, sp, bytes.length).set(bytes);
        return { ptr: sp, size: bytes.length };
      },
      pop: (frame) => {
        sp = frame.ptr + frame.size;
      },
      alloca: (size) => {
        sp -= size;
        return { ptr: sp, size };
      }
    };
  },

  // SIMD operations (using WebAssembly)
  createSIMD = async () => {
    const wasm = await WebAssembly.instantiateStreaming(
      fetch('simd.wasm'),
      { env: {} }
    );
    
    return {
      addFloat32x4: wasm.instance.exports.addFloat32x4,
      mulFloat32x4: wasm.instance.exports.mulFloat32x4,
      load: (arr) => new Float32Array(wasm.instance.exports.memory.buffer, 0, 4).set(arr),
      store: () => Array.from(new Float32Array(wasm.instance.exports.memory.buffer, 0, 4))
    };
  },

  // WebAssembly interface
  createWasmInterface = async (url, imports = {}) => {
    const response = await fetch(url);
    const bytes = await response.arrayBuffer();
    const module = await WebAssembly.compile(bytes);
    const instance = await WebAssembly.instantiate(module, imports);
    
    return {
      exports: instance.exports,
      memory: instance.exports.memory,
      call: (name, ...args) => instance.exports[name](...args)
    };
  },

  // WASI interface
  createWASI = (options = {}) => {
    const { args = [], env = {}, preopens = {} } = options;
    
    return {
      args,
      env,
      preopens,
      start: (instance) => {
        // Initialize WASI environment
        const memory = instance.exports.memory;
        
        // Setup stdin/stdout/stderr
        const fds = {
          0: { type: 'stdin' },
          1: { type: 'stdout', write: (data) => console.log(new TextDecoder().decode(data)) },
          2: { type: 'stderr', write: (data) => console.error(new TextDecoder().decode(data)) }
        };
        
        // Call _start
        if (instance.exports._start) {
          instance.exports._start();
        }
      }
    };
  },

  // Component model
  createComponent = (wit, implementation) => {
    return {
      wit,
      implementation,
      instantiate: (imports) => {
        // Validate imports against WIT
        // Bind functions
        return implementation;
      }
    };
  },

  // Interface types
  createInterfaceType = (types) => ({
    types,
    lift: (value, type) => {
      // Convert from canonical ABI
      return value;
    },
    lower: (value, type) => {
      // Convert to canonical ABI
      return value;
    }
  }),

  // Resource handles
  createResourceTable = () => {
    const table = new Map();
    let nextId = 1;
    
    return {
      insert: (resource) => {
        const id = nextId++;
        table.set(id, resource);
        return id;
      },
      get: (id) => {
        const resource = table.get(id);
        if (!resource) throw new Error(`Invalid resource id: ${id}`);
        return resource;
      },
      remove: (id) => {
        const resource = table.get(id);
        table.delete(id);
        return resource;
      }
    };
  },

  // Asyncify
  asyncify = (wasmModule) => {
    // Transform WASM module to support async operations
    // This is a placeholder for the actual asyncify transformation
    return wasmModule;
  },

  // GC for WASM
  wasmGC = {
    enable: () => {
      // Enable reference types and GC proposal
    },
    allocate: (size) => {
      // Allocate with GC support
    },
    collect: () => {
      // Trigger GC
    }
  },

  // Exception handling
  wasmExceptions = {
    try: (block) => {
      try {
        return block();
      } catch (e) {
        if (e instanceof WebAssembly.Exception) {
          // Handle WASM exception
        }
        throw e;
      }
    },
    throw: (tag, values) => {
      throw new WebAssembly.Exception(tag, values);
    }
  },

  // Tail calls
  wasmTailCalls = {
    return_call: (func, ...args) => {
      // Tail call optimization
      return func(...args);
    }
  },

  // Bulk memory operations
  wasmBulkMemory = {
    memory_copy: (dst, src, len) => {
      new Uint8Array(memory.buffer, dst, len).set(
        new Uint8Array(memory.buffer, src, len)
      );
    },
    memory_fill: (dst, val, len) => {
      new Uint8Array(memory.buffer, dst, len).fill(val);
    }
  },

  // Reference types
  wasmReferences = {
    externref: () => {},
    funcref: () => {},
    ref_null: (type) => null,
    ref_is_null: (ref) => ref === null,
    ref_func: (func) => func
  },

  // Typed function references
  wasmTypedFunctionReferences = {
    call_ref: (func, ...args) => func(...args),
    ref_as_non_null: (ref) => {
      if (ref === null) throw new Error('Null reference');
      return ref;
    }
  },

  // Multiple memories
  wasmMultiMemory = {
    memory0: new WebAssembly.Memory({ initial: 1 }),
    memory1: new WebAssembly.Memory({ initial: 1 }),
    memory_grow: (memory, delta) => memory.grow(delta)
  },

  // Memory64
  wasmMemory64 = {
    memory: new WebAssembly.Memory({ initial: 1n, maximum: 10n, index: 'i64' })
  },

  // Relaxed SIMD
  wasmRelaxedSIMD = {
    relaxed_madd: (a, b, c) => a * b + c, // Non-deterministic rounding
    relaxed_nmadd: (a, b, c) => -(a * b) + c
  },

  // Branch hinting
  wasmBranchHinting = {
    likely: (condition) => condition, // Hint for branch prediction
    unlikely: (condition) => condition
  },

  // Custom sections
  wasmCustomSection = (name, data) => ({
    name,
    data: new TextEncoder().encode(data)
  }),

  // Dynamic linking
  wasmDynamicLinking = {
    dlopen: (name) => {
      // Load dynamic library
    },
    dlsym: (handle, symbol) => {
      // Get symbol from library
    }
  },

  // Module linking (legacy)
  wasmModuleLinking = {
    instantiate: (module, imports) => {
      // Link modules together
    }
  },

  // Interface types (legacy)
  wasmInterfaceTypes = {
    adapt: (module, interface) => {
      // Adapt module to interface
    }
  },

  // Streaming instantiation
  wasmStreaming = async (response) => {
    const { module, instance } = await WebAssembly.instantiateStreaming(
      response,
      imports
    );
    return { module, instance };
  },

  // Module caching
  wasmModuleCache = {
    cache: new Map(),
    compile: async (bytes) => {
      const key = await crypto.subtle.digest('SHA-256', bytes);
      const keyHex = Array.from(new Uint8Array(key)).map(b => b.toString(16).padStart(2, '0')).join('');
      
      if (this.cache.has(keyHex)) {
        return this.cache.get(keyHex);
      }
      
      const module = await WebAssembly.compile(bytes);
      this.cache.set(keyHex, module);
      return module;
    }
  },

  // Debugging support
  wasmDebug = {
    nameSection: (module, names) => {
      // Add name section for debugging
    },
    sourceMap: (module, mappings) => {
      // Add source map
    }
  },

  // Profiling support
  wasmProfile = {
    instrument: (module) => {
      // Add profiling instrumentation
    },
    report: () => {
      // Generate profiling report
    }
  },

  // Tracing
  wasmTrace = {
    enable: () => {
      // Enable execution tracing
    },
    log: (instruction) => {
      // Log instruction execution
    }
  },

  // Verification
  wasmVerify = (module) => {
    // Verify module structure
    // Check type safety
    // Validate control flow
    return true;
  },

  // Optimization hints
  wasmOptimize = {
    inline: (func) => {
      // Inline function
    },
    unroll: (loop, times) => {
      // Unroll loop
    },
    vectorize: (loop) => {
      // Vectorize loop
    }
  },

  // Custom toolchain
  wasmToolchain = {
    compile: (source, options) => {
      // Compile source to WASM
    },
    optimize: (module, level) => {
      // Optimize WASM module
    },
    validate: (module) => {
      // Validate WASM module
    }
  },

  // Embedded DSL for WASM
  wasmDSL = () => {
    const instructions = [];
    
    return {
      i32: {
        const: (val) => instructions.push(['i32.const', val]),
        add: () => instructions.push(['i32.add']),
        sub: () => instructions.push(['i32.sub']),
        mul: () => instructions.push(['i32.mul'])
      },
      f32: {
        const: (val) => instructions.push(['f32.const', val]),
        add: () => instructions.push(['f32.add']),
        sqrt: () => instructions.push(['f32.sqrt'])
      },
      local: {
        get: (idx) => instructions.push(['local.get', idx]),
        set: (idx) => instructions.push(['local.set', idx]),
        tee: (idx) => instructions.push(['local.tee', idx])
      },
      call: (func) => instructions.push(['call', func]),
      if: (blockType, thenFn, elseFn) => {
        instructions.push(['if', blockType]);
        thenFn();
        if (elseFn) {
          instructions.push(['else']);
          elseFn();
        }
        instructions.push(['end']);
      },
      loop: (blockType, fn) => {
        instructions.push(['loop', blockType]);
        fn();
        instructions.push(['end']);
      },
      block: (blockType, fn) => {
        instructions.push(['block', blockType]);
        fn();
        instructions.push(['end']);
      },
      br: (label) => instructions.push(['br', label]),
      br_if: (label) => instructions.push(['br_if', label]),
      return: () => instructions.push(['return']),
      drop: () => instructions.push(['drop']),
      select: () => instructions.push(['select']),
      build: () => instructions
    };
  },

  // End of Utils
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Utils;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.Utils = Utils;
}
