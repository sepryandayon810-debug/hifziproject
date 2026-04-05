/**
 * WebPOS Firebase Configuration
 * Initialize Firebase app and exports
 */

// Firebase configuration object
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project-default-rtdb.firebaseio.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Export Firebase services
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();
const firestore = firebase.firestore();

// Database references
const dbRefs = {
  // Products
  products: database.ref('products'),
  categories: database.ref('categories'),
  units: database.ref('units'),
  
  // Transactions
  transactions: database.ref('transactions'),
  sales: database.ref('sales'),
  purchases: database.ref('purchases'),
  
  // Financial
  cashFlow: database.ref('cashFlow'),
  modal: database.ref('modal'),
  debts: database.ref('debts'),
  
  // Users & Settings
  users: database.ref('users'),
  settings: database.ref('settings'),
  printers: database.ref('printers'),
  
  // Customers
  customers: database.ref('customers'),
  suppliers: database.ref('suppliers')
};

// Enable offline persistence for Firestore
firestore.enablePersistence({ synchronizeTabs: true })
  .catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support all of the features required to enable persistence');
    }
  });

// Export for use in other modules
window.firebaseApp = {
  auth,
  database,
  storage,
  firestore,
  dbRefs,
  firebaseConfig,
  
  // Helper function to check connection
  checkConnection: () => {
    const connectedRef = database.ref('.info/connected');
    return new Promise((resolve) => {
      connectedRef.on('value', (snap) => {
        resolve(snap.val() === true);
      });
    });
  },
  
  // Get current timestamp
  getTimestamp: () => firebase.database.ServerValue.TIMESTAMP,
  
  // Generate unique ID
  generateId: () => database.ref().push().key
};
