// User Preferences Service
// Handles storing and retrieving user preferences and generating recommendations

import authService from './authService';
import spotifyService from './spotifyService';
import { db } from '../boot/firebase';
import {
    doc,
    getDoc,
    updateDoc,
    arrayUnion,
    increment,
    serverTimestamp
} from 'firebase/firestore';

class UserPreferencesService {
    constructor() {
        this.MAX_RECENT_SEARCHES = 20;
        this.MAX_PLAYBACK_HISTORY = 100;
        this.MAX_RECOMMENDATIONS = 30;
        this.maxRecentSearches = 10;
        this.maxPlaybackHistory = 50;
        this.currentRecommendations = [];
    }

    // Get user preferences (fallback to local if not logged in)
    async getUserPreferences() {
        try {
            const user = authService.getCurrentUser();

            if (!user) {
                // Get from local storage as fallback for guest users
                const localPrefs = localStorage.getItem('guestPreferences');
                return localPrefs ? JSON.parse(localPrefs) : this._createDefaultPreferences();
            }

            // Get from Firestore
            const userDocRef = doc(db, 'users', user.uid);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists() && docSnap.data().preferences) {
                return docSnap.data().preferences;
            }

            // If no preferences found, create default ones
            const defaultPrefs = this._createDefaultPreferences();
            await this.saveUserPreferences(defaultPrefs);
            return defaultPrefs;
        } catch (error) {
            console.error('Error getting user preferences:', error);
            return this._createDefaultPreferences();
        }
    }

    // Save user preferences
    async saveUserPreferences(preferences) {
        try {
            const user = authService.getCurrentUser();

            if (!user) {
                // Save to local storage for guest users
                localStorage.setItem('guestPreferences', JSON.stringify(preferences));
                return true;
            }

            // Save to Firestore
            const userDocRef = doc(db, 'users', user.uid);
            await updateDoc(userDocRef, {
                preferences: preferences,
                updatedAt: serverTimestamp()
            });

            return true;
        } catch (error) {
            console.error('Error saving user preferences:', error);
            return false;
        }
    }

    // Default preferences structure
    _createDefaultPreferences() {
        return {
            favoriteGenres: [],
            recentSearches: [],
            likedArtists: [],
            playbackHistory: [],
            favoriteArtists: [],
            favoriteAlbums: [],
            favoriteGenres: [],
            followedPodcasts: [],
            savedTracks: [],
            darkMode: true,
            quality: 'high',
            genreInteractions: {}
        };
    }

    // Track a search query
    async trackSearch(query) {
        if (!query) return false;

        try {
            const user = authService.getCurrentUser();

            if (!user) {
                // Handle for guest users (localStorage)
                const prefs = await this.getUserPreferences();

                // Add to recent searches if not already there
                if (!prefs.recentSearches.includes(query)) {
                    prefs.recentSearches.unshift(query);
                    // Keep only the latest searches
                    prefs.recentSearches = prefs.recentSearches.slice(0, this.maxRecentSearches);
                    await this.saveUserPreferences(prefs);
                }

                return true;
            }

            // For authenticated users, use Firestore
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const preferences = userDoc.data().preferences || {};
                let recentSearches = preferences.recentSearches || [];

                // Remove duplicate if exists
                recentSearches = recentSearches.filter(item => item !== query);

                // Add to the beginning
                recentSearches.unshift(query);

                // Limit the size
                if (recentSearches.length > this.maxRecentSearches) {
                    recentSearches = recentSearches.slice(0, this.maxRecentSearches);
                }

                // Update in Firestore
                await updateDoc(userDocRef, {
                    'preferences.recentSearches': recentSearches,
                    'preferences.lastSearchAt': serverTimestamp()
                });

                return true;
            }

            return false;
        } catch (error) {
            console.error('Error tracking search:', error);
            return false;
        }
    }

    // Track playback of a track
    async trackPlayback(track) {
        if (!track || !track.id) return false;

        try {
            const user = authService.getCurrentUser();

            if (!user) {
                // Handle for guest users (localStorage)
                const prefs = await this.getUserPreferences();

                // Add to playback history
                const playbackItem = {
                    id: track.id,
                    title: track.title || track.name,
                    artist: track.artist || (track.artists ? track.artists.join(', ') : ''),
                    timestamp: new Date().toISOString()
                };

                // Remove duplicate if exists
                prefs.playbackHistory = prefs.playbackHistory.filter(item => item.id !== track.id);

                // Add to the beginning
                prefs.playbackHistory.unshift(playbackItem);

                // Keep only the latest tracks
                prefs.playbackHistory = prefs.playbackHistory.slice(0, this.maxPlaybackHistory);

                await this.saveUserPreferences(prefs);
                return true;
            }

            // For authenticated users, use Firestore
            const userDocRef = doc(db, 'users', user.uid);

            // Create a playback record
            const playbackItem = {
                id: track.id,
                title: track.title || track.name,
                artist: track.artist || (track.artists ? track.artists.join(', ') : ''),
                timestamp: serverTimestamp()
            };

            // Update the document with the new playback record
            // We'll use a different approach to manage the array size
            // by getting the current array first, then updating
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const preferences = userDoc.data().preferences || {};
                let playbackHistory = preferences.playbackHistory || [];

                // Remove duplicate if exists
                playbackHistory = playbackHistory.filter(item => item.id !== track.id);

                // Add new item at the beginning
                playbackHistory.unshift(playbackItem);

                // Limit the size
                if (playbackHistory.length > this.maxPlaybackHistory) {
                    playbackHistory = playbackHistory.slice(0, this.maxPlaybackHistory);
                }

                // Update in Firestore
                await updateDoc(userDocRef, {
                    'preferences.playbackHistory': playbackHistory,
                    'preferences.lastPlayedAt': serverTimestamp()
                });

                return true;
            }

            return false;
        } catch (error) {
            console.error('Error tracking playback:', error);
            return false;
        }
    }

    // Track liking an artist
    async trackLikedArtist(artist) {
        if (!artist || !artist.id) return false;

        try {
            const user = authService.getCurrentUser();

            if (!user) {
                // Handle for guest users (localStorage)
                const prefs = await this.getUserPreferences();

                // Check if artist is already liked
                const artistIndex = prefs.likedArtists.findIndex(a => a.id === artist.id);

                if (artistIndex === -1) {
                    // Add artist to liked artists
                    prefs.likedArtists.push({
                        id: artist.id,
                        name: artist.name,
                        playCount: 1,
                        likedAt: new Date().toISOString()
                    });
                } else {
                    // Increment play count
                    prefs.likedArtists[artistIndex].playCount++;
                }

                await this.saveUserPreferences(prefs);
                return true;
            }

            // For authenticated users, check if artist already exists
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const preferences = userDoc.data().preferences || {};
                const likedArtists = preferences.likedArtists || [];

                // Check if artist is already liked
                const existingArtist = likedArtists.find(a => a.id === artist.id);

                if (!existingArtist) {
                    // Add new artist
                    await updateDoc(userDocRef, {
                        'preferences.likedArtists': arrayUnion({
                            id: artist.id,
                            name: artist.name,
                            playCount: 1,
                            likedAt: new Date().toISOString()
                        })
                    });
                } else {
                    // Update play count for the existing artist
                    // This is more complex as we need to update a specific array element
                    // We'll need to get the array, update it, and set it back
                    const updatedArtists = likedArtists.map(a => {
                        if (a.id === artist.id) {
                            return { ...a, playCount: (a.playCount || 0) + 1 };
                        }
                        return a;
                    });

                    await updateDoc(userDocRef, {
                        'preferences.likedArtists': updatedArtists
                    });
                }

                return true;
            }

            return false;
        } catch (error) {
            console.error('Error tracking liked artist:', error);
            return false;
        }
    }

    // Remove a liked artist
    async removeLikedArtist(artistId) {
        if (!artistId) return false;

        try {
            const user = authService.getCurrentUser();

            if (!user) {
                // Handle for guest users (localStorage)
                const prefs = await this.getUserPreferences();

                // Filter out the artist
                prefs.likedArtists = prefs.likedArtists.filter(a => a.id !== artistId);

                await this.saveUserPreferences(prefs);
                return true;
            }

            // For authenticated users, update in Firestore
            const userDocRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const preferences = userDoc.data().preferences || {};
                const likedArtists = preferences.likedArtists || [];

                // Filter out the artist
                const updatedArtists = likedArtists.filter(a => a.id !== artistId);

                await updateDoc(userDocRef, {
                    'preferences.likedArtists': updatedArtists
                });

                return true;
            }

            return false;
        } catch (error) {
            console.error('Error removing liked artist:', error);
            return false;
        }
    }

    // Track interaction with genre
    async trackGenreInteraction(genre) {
        if (!genre) return false;

        try {
            const user = authService.getCurrentUser();

            if (!user) {
                // Handle for guest users (localStorage)
                const prefs = await this.getUserPreferences();

                // Initialize or increment genre count
                if (!prefs.genreInteractions) {
                    prefs.genreInteractions = {};
                }

                prefs.genreInteractions[genre] = (prefs.genreInteractions[genre] || 0) + 1;

                await this.saveUserPreferences(prefs);
                return true;
            }

            // For authenticated users, update in Firestore
            const userDocRef = doc(db, 'users', user.uid);

            // Using a clever approach with dot notation and increment
            // This allows atomic updates to a specific nested field
            const fieldPath = `preferences.genreInteractions.${genre}`;
            const updateData = {};
            updateData[fieldPath] = increment(1);

            await updateDoc(userDocRef, updateData);

            return true;
        } catch (error) {
            console.error('Error tracking genre interaction:', error);
            return false;
        }
    }

    // Get personalized recommendations based on user history
    async getRecommendations() {
        const preferences = await this.getUserPreferences();
        const recommendations = { tracks: [], artists: [], genres: [] };

        try {
            // 1. Base recommendations on recent searches
            if (preferences.recentSearches && preferences.recentSearches.length > 0) {
                // Use the 3 most recent searches
                const recentQueries = preferences.recentSearches.slice(0, 3).map(s => s.query);

                for (const query of recentQueries) {
                    const searchResults = await spotifyService.searchTracks(query, 5);
                    if (searchResults && searchResults.length > 0) {
                        recommendations.tracks.push(...searchResults);
                    }
                }
            }

            // 2. Add recommendations based on playback history
            if (preferences.playbackHistory && preferences.playbackHistory.length > 0) {
                // Get artists from recently played tracks
                const recentArtists = preferences.playbackHistory
                    .slice(0, 10)
                    .filter(item => item.artist !== 'Unknown Artist')
                    .map(item => item.artist);

                // Get unique artists
                const uniqueArtists = [...new Set(recentArtists)];

                for (const artist of uniqueArtists.slice(0, 3)) {
                    const artistTracks = await spotifyService.searchTracks(artist, 3);
                    if (artistTracks && artistTracks.length > 0) {
                        recommendations.tracks.push(...artistTracks);
                    }
                }
            }

            // 3. Add recommendations based on liked artists
            if (preferences.likedArtists && preferences.likedArtists.length > 0) {
                for (const artist of preferences.likedArtists.slice(0, 3)) {
                    const artistTracks = await spotifyService.searchTracks(artist.name, 3);
                    if (artistTracks && artistTracks.length > 0) {
                        recommendations.tracks.push(...artistTracks);
                    }
                }
            }

            // 4. Add recommendations based on favorite genres
            if (preferences.favoriteGenres && preferences.favoriteGenres.length > 0) {
                for (const genre of preferences.favoriteGenres.slice(0, 3)) {
                    const genreTracks = await spotifyService.searchTracks(genre.name || genre.id, 3);
                    if (genreTracks && genreTracks.length > 0) {
                        recommendations.tracks.push(...genreTracks);
                    }
                }
            }

            // Deduplicate tracks
            const uniqueTracks = [];
            const trackIds = new Set();

            for (const track of recommendations.tracks) {
                if (!trackIds.has(track.id)) {
                    trackIds.add(track.id);
                    uniqueTracks.push(track);
                }
            }

            recommendations.tracks = uniqueTracks.slice(0, this.MAX_RECOMMENDATIONS);

            return recommendations;
        } catch (error) {
            console.error('Error generating recommendations:', error);
            return { tracks: [], artists: [], genres: [] };
        }
    }
}

// Create and export singleton instance
const userPreferencesService = new UserPreferencesService();
export default userPreferencesService;
