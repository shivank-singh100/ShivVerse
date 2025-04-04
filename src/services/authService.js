// Authentication Service
// Handles user login, signup, and session persistence

import { auth, db } from '../boot/firebase';
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    sendPasswordResetEmail,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    serverTimestamp
} from 'firebase/firestore';

class AuthService {
    constructor() {
        this.auth = auth;
        this.db = db;
        this.currentUser = null;
        this.authStateListener = null;
    }

    /**
     * Initialize auth service and set up auth state listener
     */
    init() {
        return new Promise((resolve) => {
            // Set up auth state listener
            this.authStateListener = onAuthStateChanged(this.auth, (user) => {
                this.currentUser = user;
                resolve(user);
            });
        });
    }

    /**
     * Get the current user
     * @returns {Object|null} The current user or null if not logged in
     */
    getCurrentUser() {
        return this.currentUser;
    }

    /**
     * Check if user is logged in
     * @returns {boolean} True if user is logged in
     */
    isLoggedIn() {
        return !!this.currentUser;
    }

    /**
     * Get the current user's auth token
     * @returns {Promise<string|null>} A promise that resolves to the auth token or null
     */
    async getToken() {
        if (!this.currentUser) return null;
        return await this.currentUser.getIdToken();
    }

    /**
     * Register a new user
     * @param {Object} userData User data including email, password, and username
     * @returns {Promise} A promise that resolves when signup is complete
     */
    async signup(userData) {
        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(
                this.auth,
                userData.email,
                userData.password
            );

            const user = userCredential.user;

            // Update profile with username
            await updateProfile(user, {
                displayName: userData.username
            });

            // Create user document in Firestore
            const userDocRef = doc(this.db, 'users', user.uid);
            await setDoc(userDocRef, {
                username: userData.username,
                email: userData.email,
                createdAt: serverTimestamp(),
                preferences: {
                    likedSongs: [],
                    likedArtists: [],
                    playbackHistory: [],
                    recentSearches: [],
                    genreInteractions: {}
                }
            });

            return user;
        } catch (error) {
            console.error('Error signing up:', error);
            throw this._handleAuthError(error);
        }
    }

    /**
     * Login a user
     * @param {string} email User email
     * @param {string} password User password
     * @returns {Promise} A promise that resolves when login is complete
     */
    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(
                this.auth,
                email,
                password
            );

            // Update last login timestamp
            const userDocRef = doc(this.db, 'users', userCredential.user.uid);
            await updateDoc(userDocRef, {
                lastLogin: serverTimestamp()
            });

            return userCredential.user;
        } catch (error) {
            console.error('Error logging in:', error);
            throw this._handleAuthError(error);
        }
    }

    /**
     * Login with Google
     * @returns {Promise} A promise that resolves when Google login is complete
     */
    async loginWithGoogle() {
        try {
            const provider = new GoogleAuthProvider();
            const userCredential = await signInWithPopup(this.auth, provider);

            // Check if user document exists, if not create it
            const userDocRef = doc(this.db, 'users', userCredential.user.uid);
            const userDoc = await getDoc(userDocRef);

            if (!userDoc.exists()) {
                // Create new user document
                await setDoc(userDocRef, {
                    username: userCredential.user.displayName,
                    email: userCredential.user.email,
                    createdAt: serverTimestamp(),
                    lastLogin: serverTimestamp(),
                    preferences: {
                        likedSongs: [],
                        likedArtists: [],
                        playbackHistory: [],
                        recentSearches: [],
                        genreInteractions: {}
                    }
                });
            } else {
                // Update last login
                await updateDoc(userDocRef, {
                    lastLogin: serverTimestamp()
                });
            }

            return userCredential.user;
        } catch (error) {
            console.error('Error with Google login:', error);
            throw this._handleAuthError(error);
        }
    }

    /**
     * Logout current user
     * @returns {Promise} A promise that resolves when logout is complete
     */
    async logout() {
        try {
            await signOut(this.auth);
            return true;
        } catch (error) {
            console.error('Error logging out:', error);
            throw error;
        }
    }

    /**
     * Send password reset email
     * @param {string} email User email
     * @returns {Promise} A promise that resolves when the email is sent
     */
    async sendPasswordResetEmail(email) {
        try {
            await sendPasswordResetEmail(this.auth, email);
            return true;
        } catch (error) {
            console.error('Error sending password reset:', error);
            throw this._handleAuthError(error);
        }
    }

    /**
     * Update user preferences
     * @param {Object} preferences User preferences to update
     * @returns {Promise} A promise that resolves when update is complete
     */
    async updateUserPreferences(preferences) {
        if (!this.currentUser) {
            throw new Error('User not authenticated');
        }

        try {
            const userDocRef = doc(this.db, 'users', this.currentUser.uid);
            await updateDoc(userDocRef, {
                'preferences': preferences
            });

            return true;
        } catch (error) {
            console.error('Error updating user preferences:', error);
            throw error;
        }
    }

    /**
     * Get user preferences from Firestore
     * @returns {Promise<Object>} A promise that resolves with user preferences
     */
    async getUserPreferences() {
        if (!this.currentUser) {
            return null;
        }

        try {
            const userDocRef = doc(this.db, 'users', this.currentUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists() && userDoc.data().preferences) {
                return userDoc.data().preferences;
            }

            return null;
        } catch (error) {
            console.error('Error getting user preferences:', error);
            throw error;
        }
    }

    /**
     * Clean up auth state listener
     */
    cleanup() {
        if (this.authStateListener) {
            this.authStateListener();
        }
    }

    /**
     * Handle Firebase auth errors with user-friendly messages
     * @param {Error} error Firebase auth error
     * @returns {Error} Error with user-friendly message
     */
    _handleAuthError(error) {
        const errorCode = error.code;
        let errorMessage = 'An error occurred. Please try again.';

        switch (errorCode) {
            case 'auth/email-already-in-use':
                errorMessage = 'This email is already registered. Please log in or use a different email.';
                break;
            case 'auth/invalid-email':
                errorMessage = 'Invalid email format.';
                break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
                errorMessage = 'Incorrect email or password.';
                break;
            case 'auth/weak-password':
                errorMessage = 'Password is too weak. It should be at least 6 characters.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'Too many login attempts. Please try again later.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'Network error. Please check your connection and try again.';
                break;
        }

        const customError = new Error(errorMessage);
        customError.code = errorCode;
        return customError;
    }
}

export default new AuthService();
