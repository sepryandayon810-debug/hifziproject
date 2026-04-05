/**
 * WebPOS Authentication Module
 * Handles user authentication, roles, and session management
 */

const Auth = {
  // Current user data
  currentUser: null,
  
  // Session timeout in milliseconds (30 minutes)
  SESSION_TIMEOUT: 30 * 60 * 1000,
  
  // Session check interval
  sessionInterval: null,

  /**
   * Initialize authentication
   */
  init: () => {
    // Check for existing session
    const session = Utils.getStorage('webpos_session');
    if (session) {
      Auth.currentUser = session.user;
      Auth.startSessionTimer();
    }

    // Listen for auth state changes
    auth.onAuthStateChanged((user) => {
      if (user) {
        Auth.loadUserData(user.uid);
      } else {
        Auth.currentUser = null;
        Utils.removeStorage('webpos_session');
      }
    });

    // Activity listeners for session timeout
    document.addEventListener('click', Auth.resetSessionTimer);
    document.addEventListener('keypress', Auth.resetSessionTimer);
    document.addEventListener('touchstart', Auth.resetSessionTimer);
    document.addEventListener('scroll', Auth.resetSessionTimer);
  },

  /**
   * Load user data from database
   */
  loadUserData: async (uid) => {
    try {
      const snapshot = await database.ref(`users/${uid}`).once('value');
      const userData = snapshot.val();
      
      if (userData) {
        Auth.currentUser = {
          uid,
          email: userData.email,
          name: userData.name,
          role: userData.role,
          avatar: userData.avatar || null,
          deviceId: userData.deviceId || Utils.generateId('dev_'),
          lastLogin: Date.now()
        };

        // Save session
        Utils.setStorage('webpos_session', {
          user: Auth.currentUser,
          loginTime: Date.now()
        }, 24); // 24 hours expiry

        // Update last login
        await database.ref(`users/${uid}`).update({
          lastLogin: firebase.database.ServerValue.TIMESTAMP,
          lastDevice: Auth.currentUser.deviceId
        });

        Auth.startSessionTimer();
        return Auth.currentUser;
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Utils.showToast('Error loading user data', 'error');
    }
    return null;
  },

  /**
   * Login with email and password
   */
  login: async (email, password) => {
    try {
      Utils.showLoading('Logging in...');
      
      const result = await auth.signInWithEmailAndPassword(email, password);
      const user = await Auth.loadUserData(result.user.uid);
      
      Utils.hideLoading();
      
      if (user) {
        Utils.showToast(`Welcome back, ${user.name}!`, 'success');
        return { success: true, user };
      }
      
      return { success: false, error: 'User data not found' };
    } catch (error) {
      Utils.hideLoading();
      console.error('Login error:', error);
      
      let message = 'Login failed';
      switch (error.code) {
        case 'auth/user-not-found':
          message = 'User not found';
          break;
        case 'auth/wrong-password':
          message = 'Incorrect password';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email format';
          break;
        case 'auth/user-disabled':
          message = 'Account has been disabled';
          break;
        case 'auth/too-many-requests':
          message = 'Too many failed attempts. Please try again later';
          break;
      }
      
      Utils.showToast(message, 'error');
      return { success: false, error: message };
    }
  },

  /**
   * Register new user
   */
  register: async (email, password, name, role = 'kasir') => {
    try {
      Utils.showLoading('Creating account...');
      
      const result = await auth.createUserWithEmailAndPassword(email, password);
      const uid = result.user.uid;
      
      // Create user data in database
      await database.ref(`users/${uid}`).set({
        email,
        name,
        role,
        createdAt: firebase.database.ServerValue.TIMESTAMP,
        lastLogin: firebase.database.ServerValue.TIMESTAMP,
        status: 'active',
        deviceId: Utils.generateId('dev_')
      });

      // Create user settings
      await database.ref(`settings/${uid}`).set({
        theme: 'light',
        fontSize: 'medium',
        notifications: true,
        createdAt: firebase.database.ServerValue.TIMESTAMP
      });

      Utils.hideLoading();
      Utils.showToast('Account created successfully!', 'success');
      
      return { success: true, uid };
    } catch (error) {
      Utils.hideLoading();
      console.error('Registration error:', error);
      
      let message = 'Registration failed';
      switch (error.code) {
        case 'auth/email-already-in-use':
          message = 'Email already registered';
          break;
        case 'auth/invalid-email':
          message = 'Invalid email format';
          break;
        case 'auth/weak-password':
          message = 'Password is too weak (min 6 characters)';
          break;
      }
      
      Utils.showToast(message, 'error');
      return { success: false, error: message };
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    try {
      // Update user status
      if (Auth.currentUser) {
        await database.ref(`users/${Auth.currentUser.uid}`).update({
          isOnline: false,
          lastLogout: firebase.database.ServerValue.TIMESTAMP
        });
      }

      await auth.signOut();
      Auth.currentUser = null;
      Utils.removeStorage('webpos_session');
      Auth.stopSessionTimer();
      
      Utils.showToast('Logged out successfully', 'info');
      window.location.href = 'login.html';
    } catch (error) {
      console.error('Logout error:', error);
      Utils.showToast('Error during logout', 'error');
    }
  },

  /**
   * Check if user has required role
   */
  hasRole: (requiredRoles) => {
    if (!Auth.currentUser) return false;
    if (typeof requiredRoles === 'string') {
      return Auth.currentUser.role === requiredRoles;
    }
    return requiredRoles.includes(Auth.currentUser.role);
  },

  /**
   * Check if user can access menu
   */
  canAccess: (menuName) => {
    if (!Auth.currentUser) return false;
    
    const permissions = {
      owner: ['kasir', 'produk', 'pembelian', 'riwayat', 'modal', 'kas', 'hutang', 
              'laporan', 'telegram', 'pelanggan', 'user', 'setting', 'printer', 'reset'],
      admin: ['kasir', 'produk', 'pembelian', 'riwayat', 'modal', 'kas', 'hutang', 
              'laporan', 'telegram', 'pelanggan', 'user', 'setting', 'printer'],
      kasir: ['kasir', 'produk', 'riwayat', 'modal', 'hutang', 'pelanggan', 'printer']
    };

    const userPermissions = permissions[Auth.currentUser.role] || [];
    return userPermissions.includes(menuName);
  },

  /**
   * Get current user
   */
  getCurrentUser: () => {
    return Auth.currentUser;
  },

  /**
   * Update user profile
   */
  updateProfile: async (updates) => {
    try {
      if (!Auth.currentUser) throw new Error('Not authenticated');
      
      await database.ref(`users/${Auth.currentUser.uid}`).update({
        ...updates,
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      });

      // Update local data
      Auth.currentUser = { ...Auth.currentUser, ...updates };
      Utils.setStorage('webpos_session', {
        user: Auth.currentUser,
        loginTime: Date.now()
      }, 24);

      Utils.showToast('Profile updated successfully', 'success');
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      Utils.showToast('Failed to update profile', 'error');
      return { success: false, error: error.message };
    }
  },

  /**
   * Change password
   */
  changePassword: async (currentPassword, newPassword) => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('Not authenticated');

      // Re-authenticate
      const credential = firebase.auth.EmailAuthProvider.credential(
        user.email, 
        currentPassword
      );
      await user.reauthenticateWithCredential(credential);

      // Update password
      await user.updatePassword(newPassword);
      
      Utils.showToast('Password changed successfully', 'success');
      return { success: true };
    } catch (error) {
      console.error('Change password error:', error);
      
      let message = 'Failed to change password';
      if (error.code === 'auth/wrong-password') {
        message = 'Current password is incorrect';
      }
      
      Utils.showToast(message, 'error');
      return { success: false, error: message };
    }
  },

  /**
   * Start session timer
   */
  startSessionTimer: () => {
    Auth.stopSessionTimer();
    Auth.sessionInterval = setInterval(() => {
      const session = Utils.getStorage('webpos_session');
      if (session) {
        const inactiveTime = Date.now() - session.loginTime;
        if (inactiveTime > Auth.SESSION_TIMEOUT) {
          Utils.showToast('Session expired. Please login again.', 'warning');
          Auth.logout();
        }
      }
    }, 60000); // Check every minute
  },

  /**
   * Stop session timer
   */
  stopSessionTimer: () => {
    if (Auth.sessionInterval) {
      clearInterval(Auth.sessionInterval);
      Auth.sessionInterval = null;
    }
  },

  /**
   * Reset session timer on activity
   */
  resetSessionTimer: () => {
    const session = Utils.getStorage('webpos_session');
    if (session) {
      Utils.setStorage('webpos_session', {
        ...session,
        loginTime: Date.now()
      }, 24);
    }
  },

  /**
   * Check if authenticated
   */
  isAuthenticated: () => {
    return !!Auth.currentUser && !!auth.currentUser;
  },

  /**
   * Require authentication (redirect if not logged in)
   */
  requireAuth: () => {
    if (!Auth.isAuthenticated()) {
      window.location.href = 'login.html';
      return false;
    }
    return true;
  },

  /**
   * Get all users (owner/admin only)
   */
  getAllUsers: async () => {
    try {
      if (!Auth.hasRole(['owner', 'admin'])) {
        throw new Error('Unauthorized');
      }

      const snapshot = await database.ref('users').once('value');
      const users = [];
      
      snapshot.forEach((child) => {
        users.push({
          uid: child.key,
          ...child.val()
        });
      });

      return { success: true, users };
    } catch (error) {
      console.error('Get users error:', error);
      return { success: false, error: error.message };
    }
  },

  /**
   * Delete user (owner only)
   */
  deleteUser: async (uid) => {
    try {
      if (!Auth.hasRole('owner')) {
        throw new Error('Only owner can delete users');
      }

      // Remove from database
      await database.ref(`users/${uid}`).remove();
      await database.ref(`settings/${uid}`).remove();

      Utils.showToast('User deleted successfully', 'success');
      return { success: true };
    } catch (error) {
      console.error('Delete user error:', error);
      Utils.showToast('Failed to delete user', 'error');
      return { success: false, error: error.message };
    }
  },

  /**
   * Reset user password (owner/admin)
   */
  resetUserPassword: async (uid, newPassword) => {
    try {
      if (!Auth.hasRole(['owner', 'admin'])) {
        throw new Error('Unauthorized');
      }

      // Note: In production, this should be done via Cloud Function
      // for security reasons
      await database.ref(`users/${uid}`).update({
        passwordResetRequired: true,
        tempPassword: newPassword, // In production, use secure method
        updatedAt: firebase.database.ServerValue.TIMESTAMP
      });

      Utils.showToast('Password reset initiated', 'success');
      return { success: true };
    } catch (error) {
      console.error('Reset password error:', error);
      Utils.showToast('Failed to reset password', 'error');
      return { success: false, error: error.message };
    }
  }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', Auth.init);

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Auth;
}
