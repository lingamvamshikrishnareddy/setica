// Firebase Configuration
// Keys will be injected by Netlify build process from environment variables
const FIREBASE_CONFIG = {
  apiKey: "%%VITE_FIREBASE_API_KEY%%",
  authDomain: "%%VITE_FIREBASE_AUTH_DOMAIN%%",
  projectId: "%%VITE_FIREBASE_PROJECT_ID%%",
  storageBucket: "%%VITE_FIREBASE_STORAGE_BUCKET%%",
  messagingSenderId: "%%VITE_FIREBASE_MESSAGING_SENDER_ID%%",
  appId: "%%VITE_FIREBASE_APP_ID%%",
  measurementId: "%%VITE_FIREBASE_MEASUREMENT_ID%%"
};

// Validate configuration
function validateConfig() {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
  const missingKeys = requiredKeys.filter(key => 
    !FIREBASE_CONFIG[key] || 
    FIREBASE_CONFIG[key].includes('%%') || 
    FIREBASE_CONFIG[key] === 'YOUR_API_KEY_HERE'
  );
  
  if (missingKeys.length > 0) {
    console.error('❌ Missing or unreplaced Firebase configuration keys:', missingKeys);
    console.error('💡 Make sure Netlify environment variables are set and build command includes env replacement');
    return false;
  }
  return true;
}

// Initialize Firebase
function initializeFirebase() {
  if (typeof firebase === 'undefined') {
    console.error('❌ Firebase SDK not loaded. Make sure to include Firebase scripts in your HTML.');
    return false;
  }

  if (!validateConfig()) {
    return false;
  }

  try {
    firebase.initializeApp(FIREBASE_CONFIG);
    window.db = firebase.firestore();
    console.log('✅ Firebase initialized successfully');
    console.log('📊 Project ID:', FIREBASE_CONFIG.projectId);
    return true;
  } catch (error) {
    console.error('❌ Firebase initialization failed:', error.message);
    return false;
  }
}

// Auto-initialize on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeFirebase);
} else {
  initializeFirebase();
}