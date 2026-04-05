/**
 * WebPOS Firebase Configuration
 * Core configuration for Firebase services
 */

const firebaseConfig = {
  apiKey: "AIzaSyD9XyvgofyFyX5aUMARcA_GO-N2Tcw725Q",
  authDomain: "goodhifzicell.firebaseapp.com",
  databaseURL: "https://goodhifzicell-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "goodhifzicell",
  storageBucket: "goodhifzicell.firebasestorage.app",
  messagingSenderId: "306835710868",
  appId: "1:306835710868:web:817551e6c8c19c8eca6581"
};

// Initialize Firebase
let app, auth, database, storage;

try {
  app = firebase.initializeApp(firebaseConfig);
  auth = firebase.auth();
  database = firebase.database();
  storage = firebase.storage();
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization error:', error);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { app, auth, database, storage, firebaseConfig };
}
