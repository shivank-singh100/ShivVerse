import { boot } from 'quasar/wrappers';
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import authService from '../services/authService';

// Firebase configuration
// Replace these with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyCyDoeygfoKTUf1bTwOeHmf_vC0ElP3H4E",
  authDomain: "shivverse-56a39.firebaseapp.com",
  projectId: "shivverse-56a39",
  storageBucket: "shivverse-56a39.firebasestorage.app",
  messagingSenderId: "809132762074",
  appId: "1:809132762074:web:2f55182fe0d628214856e3",
  measurementId: "G-1ZD5FPK210"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export default boot(async ({ app: vueApp, router, store }) => {
  // Wait for Firebase Auth to initialize and restore the authentication state
  await authService.init();

  // Add global authentication guard
  router.beforeEach((to, from, next) => {
    // This is handled in router/index.js, but we keep a duplicate here as a fallback
    const isAuthenticated = authService.isLoggedIn();

    if (to.matched.some(record => record.meta.requiresAuth) && !isAuthenticated) {
      next({ name: 'login', query: { redirect: to.fullPath } });
    } else if (to.matched.some(record => record.meta.guestOnly) && isAuthenticated) {
      next({ name: 'home' });
    } else {
      next();
    }
  });

  // Clean up auth state listener when app is destroyed
  vueApp.unmount = () => {
    authService.cleanup();
  };
});

export { app, auth, db };
