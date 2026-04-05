/**
 * WebPOS Authentication Module
 * Handles user login, logout, and authentication state
 */

const Auth = {
  // Current user state
  currentUser: null,
  
  // Auth state listeners
  listeners: [],
  
  // Initialize auth
  init: () => {
    // Check for stored session
    const session = Utils.session.get('webpos_session');
    if (session) {
      Auth.validateSession(session);
    }
    
    // Listen for auth state changes from Firebase
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        Auth.currentUser = user;
        Auth.notifyListeners({ type: 'login', user });
      } else {
        Auth.currentUser = null;
        Auth.notifyListeners({ type: 'logout' });
      }
    });
  },
  
  // Login with email/password
  loginWithEmail: async (email, password) => {
    try {
      Utils.showToast('Memproses login...', 'info');
      
      const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Get additional user data from database
      const userData = await Auth.fetchUserData(user.uid);
      
      // Store session
      Auth.storeSession(user, userData);
      
      Utils.showToast('Login berhasil!', 'success');
      return { success: true, user: { ...user, ...userData } };
      
    } catch (error) {
      console.error('Login error:', error);
      let message = 'Login gagal';
      
      switch (error.code) {
        case 'auth/user-not-found':
          message = 'Email tidak terdaftar';
          break;
        case 'auth/wrong-password':
          message = 'Password salah';
          break;
        case 'auth/invalid-email':
          message = 'Format email tidak valid';
          break;
        case 'auth/user-disabled':
          message = 'Akun telah dinonaktifkan';
          break;
        case 'auth/too-many-requests':
          message = 'Terlalu banyak percobaan, coba lagi nanti';
          break;
      }
      
      Utils.showToast(message, 'error');
      return { success: false, error: message };
    }
  },
  
  // Login with phone (OTP)
  loginWithPhone: async (phoneNumber, appVerifier) => {
    try {
      const confirmationResult = await firebase.auth().signInWithPhoneNumber(phoneNumber, appVerifier);
      window.confirmationResult = confirmationResult;
      return { success: true, confirmationResult };
    } catch (error) {
      console.error('Phone login error:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Verify OTP
  verifyOTP: async (code) => {
    try {
      const result = await window.confirmationResult.confirm(code);
      const user = result.user;
      
      const userData = await Auth.fetchUserData(user.uid);
      Auth.storeSession(user, userData);
      
      return { success: true, user: { ...user, ...userData } };
    } catch (error) {
      return { success: false, error: 'Kode OTP salah' };
    }
  },
  
  // Register new user
  register: async (email, password, userData) => {
    try {
      Utils.showToast('Membuat akun...', 'info');
      
      const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Store additional user data
      await firebase.database().ref(`users/${user.uid}`).set({
        email: user.email,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        ...userData
      });
      
      Utils.showToast('Registrasi berhasil!', 'success');
      return { success: true, user };
      
    } catch (error) {
      console.error('Registration error:', error);
      let message = 'Registrasi gagal';
      
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'Email sudah terdaftar';
          break;
        case 'auth/invalid-email':
          message = 'Format email tidak valid';
          break;
        case 'auth/weak-password':
          message = 'Password terlalu lemah (minimal 6 karakter)';
          break;
      }
      
      Utils.showToast(message, 'error');
      return { success: false, error: message };
    }
  },
  
  // Logout
  logout: async () => {
    try {
      await firebase.auth().signOut();
      Auth.clearSession();
      Utils.showToast('Logout berhasil', 'success');
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Logout error:', error);
      Utils.showToast('Logout gagal', 'error');
    }
  },
  
  // Reset password
  resetPassword: async (email) => {
    try {
      await firebase.auth().sendPasswordResetEmail(email);
      Utils.showToast('Email reset password telah dikirim', 'success');
      return { success: true };
    } catch (error) {
      Utils.showToast('Gagal mengirim email reset', 'error');
      return { success: false, error: error.message };
    }
  },
  
  // Change password
  changePassword: async (currentPassword, newPassword) => {
    try {
      const user = firebase.auth().currentUser;
      const credential = firebase.auth.EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      
      await user.reauthenticateWithCredential(credential);
      await user.updatePassword(newPassword);
      
      Utils.showToast('Password berhasil diubah', 'success');
      return { success: true };
    } catch (error) {
      Utils.showToast('Gagal mengubah password', 'error');
      return { success: false, error: error.message };
    }
  },
  
  // Fetch user data from database
  fetchUserData: async (uid) => {
    try {
      const snapshot = await firebase.database().ref(`users/${uid}`).once('value');
      return snapshot.val() || {};
    } catch (error) {
      console.error('Error fetching user data:', error);
      return {};
    }
  },
  
  // Store session
  storeSession: (user, userData) => {
    const session = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      ...userData,
      loginTime: Date.now()
    };
    
    Utils.session.set('webpos_session', session);
  },
  
  // Validate stored session
  validateSession: async (session) => {
    try {
      // Check if session is expired (24 hours)
      if (Date.now() - session.loginTime > 24 * 60 * 60 * 1000) {
        Auth.clearSession();
        return false;
      }
      
      // Verify with Firebase
      const user = firebase.auth().currentUser;
      if (!user || user.uid !== session.uid) {
        Auth.clearSession();
        return false;
      }
      
      Auth.currentUser = { ...user, ...session };
      return true;
      
    } catch (error) {
      Auth.clearSession();
      return false;
    }
  },
  
  // Clear session
  clearSession: () => {
    Utils.session.remove('webpos_session');
    Auth.currentUser = null;
  },
  
  // Check if authenticated
  isAuthenticated: () => {
    return !!Auth.currentUser && !!firebase.auth().currentUser;
  },
  
  // Check if has permission
  hasPermission: (permission) => {
    if (!Auth.currentUser) return false;
    const permissions = Auth.currentUser.permissions || [];
    return permissions.includes(permission) || permissions.includes('admin');
  },
  
  // Check if has role
  hasRole: (role) => {
    if (!Auth.currentUser) return false;
    return Auth.currentUser.role === role;
  },
  
  // Get current user
  getCurrentUser: () => Auth.currentUser,
  
  // Update user profile
  updateProfile: async (updates) => {
    try {
      const user = firebase.auth().currentUser;
      if (!user) throw new Error('Not authenticated');
      
      // Update auth profile
      if (updates.displayName || updates.photoURL) {
        await user.updateProfile({
          displayName: updates.displayName,
          photoURL: updates.photoURL
        });
      }
      
      // Update database
      await firebase.database().ref(`users/${user.uid}`).update(updates);
      
      // Update local session
      const session = Utils.session.get('webpos_session');
      Utils.session.set('webpos_session', { ...session, ...updates });
      
      Utils.showToast('Profil berhasil diperbarui', 'success');
      return { success: true };
      
    } catch (error) {
      Utils.showToast('Gagal memperbarui profil', 'error');
      return { success: false, error: error.message };
    }
  },
  
  // Subscribe to auth changes
  subscribe: (callback) => {
    Auth.listeners.push(callback);
    return () => {
      Auth.listeners = Auth.listeners.filter(cb => cb !== callback);
    };
  },
  
  // Notify listeners
  notifyListeners: (event) => {
    Auth.listeners.forEach(callback => callback(event));
  },
  
  // Require auth guard
  requireAuth: () => {
    if (!Auth.isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },
  
  // Redirect if authenticated
  redirectIfAuthenticated: (redirectTo = 'index.html') => {
    if (Auth.isAuthenticated()) {
      window.location.href = redirectTo;
      return true;
    }
    return false;
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', Auth.init);
