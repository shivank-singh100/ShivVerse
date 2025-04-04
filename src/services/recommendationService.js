import axios from 'axios';
import userPreferencesService from './userPreferencesService';
import authService from './authService';

class RecommendationService {
    constructor() {
        this.baseURL = 'https://api.spotify.com/v1';
        this.fallbackGenres = ['pop', 'rock', 'hip-hop', 'indie', 'electronic'];
        this.cachedRecommendations = {
            forYou: [],
            discovery: [],
            genres: {},
            lastUpdated: null
        };
    }

    /**
     * Get personalized recommendations for the user
     * @param {number} limit - Number of tracks to return
     * @returns {Promise<Array>} - Array of recommended tracks
     */
    async getPersonalizedRecommendations(limit = 20) {
        try {
            // Check if we have cached recommendations and they're less than 2 hours old
            const now = new Date();
            if (
                this.cachedRecommendations.forYou.length > 0 &&
                this.cachedRecommendations.lastUpdated &&
                (now - this.cachedRecommendations.lastUpdated) < (2 * 60 * 60 * 1000)
            ) {
                return this.cachedRecommendations.forYou.slice(0, limit);
            }

            // Get user preferences
            const userPreferences = userPreferencesService.getUserPreferences();

            // If user has no preferences yet, return trending tracks
            if (!userPreferences || !userPreferences.likedArtists || userPreferences.likedArtists.length === 0) {
                return this.getTrendingTracks(limit);
            }

            // Get seed tracks, artists and genres from user preferences
            const seedArtists = userPreferences.likedArtists.slice(0, 2).map(artist => artist.id).join(',');
            const seedGenres = Object.keys(userPreferences.genreInteractions || {})
                .sort((a, b) => userPreferences.genreInteractions[b] - userPreferences.genreInteractions[a])
                .slice(0, 1)
                .join(',');

            // Get top tracks from playback history
            const seedTracks = userPreferences.playbackHistory
                .slice(0, 2)
                .map(track => track.id)
                .join(',');

            // Make API request to Spotify recommendations endpoint
            const token = authService.getToken();
            if (!token) {
                return this.getFallbackRecommendations(limit);
            }

            const response = await axios.get(`${this.baseURL}/recommendations`, {
                headers: { 'Authorization': `Bearer ${token}` },
                params: {
                    seed_artists: seedArtists || undefined,
                    seed_genres: seedGenres || 'pop',
                    seed_tracks: seedTracks || undefined,
                    limit: limit,
                    market: 'US'
                }
            });

            const recommendations = response.data.tracks.map(track => ({
                id: track.id,
                title: track.name,
                artist: track.artists.map(artist => artist.name).join(', '),
                album: track.album.name,
                albumCover: track.album.images[0]?.url,
                duration: track.duration_ms,
                uri: track.uri,
                explicit: track.explicit,
                popularity: track.popularity
            }));

            // Update cache
            this.cachedRecommendations.forYou = recommendations;
            this.cachedRecommendations.lastUpdated = now;

            return recommendations;
        } catch (error) {
            console.error('Error getting personalized recommendations:', error);
            return this.getFallbackRecommendations(limit);
        }
    }

    /**
     * Get discovery recommendations (music the user might like to discover)
     * @param {number} limit - Number of tracks to return
     * @returns {Promise<Array>} - Array of discovery tracks
     */
    async getDiscoveryRecommendations(limit = 20) {
        try {
            // Check if we have cached discovery recommendations
            const now = new Date();
            if (
                this.cachedRecommendations.discovery.length > 0 &&
                this.cachedRecommendations.lastUpdated &&
                (now - this.cachedRecommendations.lastUpdated) < (2 * 60 * 60 * 1000)
            ) {
                return this.cachedRecommendations.discovery.slice(0, limit);
            }

            // Get user preferences for seeds
            const userPreferences = userPreferencesService.getUserPreferences();

            // For discovery, use less common genres and lower popularity target
            const genrePool = this.fallbackGenres;

            if (userPreferences && userPreferences.genreInteractions) {
                Object.keys(userPreferences.genreInteractions).forEach(genre => {
                    if (!genrePool.includes(genre)) {
                        genrePool.push(genre);
                    }
                });
            }

            // Pick 2 random genres from the pool
            const shuffled = [...genrePool].sort(() => 0.5 - Math.random());
            const seedGenres = shuffled.slice(0, 2).join(',');

            // Get artist seeds (prefer less listened ones)
            let seedArtists = '';
            if (userPreferences && userPreferences.likedArtists && userPreferences.likedArtists.length > 0) {
                // Take some less frequently played artists
                const lessPlayedArtists = [...userPreferences.likedArtists]
                    .sort((a, b) => a.playCount - b.playCount)
                    .slice(0, 2);

                seedArtists = lessPlayedArtists.map(artist => artist.id).join(',');
            }

            // Make API request with lower popularity target for discovery
            const token = authService.getToken();
            if (!token) {
                return this.getFallbackRecommendations(limit, true);
            }

            const response = await axios.get(`${this.baseURL}/recommendations`, {
                headers: { 'Authorization': `Bearer ${token}` },
                params: {
                    seed_artists: seedArtists || undefined,
                    seed_genres: seedGenres,
                    target_popularity: 50, // Slightly less popular for discovery
                    min_popularity: 20,    // Not too obscure
                    limit: limit,
                    market: 'US'
                }
            });

            const recommendations = response.data.tracks.map(track => ({
                id: track.id,
                title: track.name,
                artist: track.artists.map(artist => artist.name).join(', '),
                album: track.album.name,
                albumCover: track.album.images[0]?.url,
                duration: track.duration_ms,
                uri: track.uri,
                explicit: track.explicit,
                popularity: track.popularity
            }));

            // Update cache
            this.cachedRecommendations.discovery = recommendations;
            this.cachedRecommendations.lastUpdated = now;

            return recommendations;
        } catch (error) {
            console.error('Error getting discovery recommendations:', error);
            return this.getFallbackRecommendations(limit, true);
        }
    }

    /**
     * Get recommendations based on a specific genre
     * @param {string} genre - The genre to get recommendations for
     * @param {number} limit - Number of tracks to return
     * @returns {Promise<Array>} - Array of genre-based recommended tracks
     */
    async getGenreRecommendations(genre, limit = 20) {
        try {
            // Check if we have cached recommendations for this genre
            const now = new Date();
            if (
                this.cachedRecommendations.genres[genre] &&
                this.cachedRecommendations.genres[genre].lastUpdated &&
                (now - this.cachedRecommendations.genres[genre].lastUpdated) < (24 * 60 * 60 * 1000)
            ) {
                return this.cachedRecommendations.genres[genre].tracks.slice(0, limit);
            }

            // Make API request for genre-based recommendations
            const token = authService.getToken();
            if (!token) {
                return this.getFallbackRecommendationsByGenre(genre, limit);
            }

            const response = await axios.get(`${this.baseURL}/recommendations`, {
                headers: { 'Authorization': `Bearer ${token}` },
                params: {
                    seed_genres: genre,
                    limit: limit,
                    market: 'US'
                }
            });

            const recommendations = response.data.tracks.map(track => ({
                id: track.id,
                title: track.name,
                artist: track.artists.map(artist => artist.name).join(', '),
                album: track.album.name,
                albumCover: track.album.images[0]?.url,
                duration: track.duration_ms,
                uri: track.uri,
                explicit: track.explicit,
                popularity: track.popularity
            }));

            // Update cache
            if (!this.cachedRecommendations.genres[genre]) {
                this.cachedRecommendations.genres[genre] = { tracks: [], lastUpdated: null };
            }
            this.cachedRecommendations.genres[genre].tracks = recommendations;
            this.cachedRecommendations.genres[genre].lastUpdated = now;

            // Track this genre interaction
            userPreferencesService.trackGenreInteraction(genre);

            return recommendations;
        } catch (error) {
            console.error(`Error getting recommendations for genre ${genre}:`, error);
            return this.getFallbackRecommendationsByGenre(genre, limit);
        }
    }

    /**
     * Get trending tracks as recommendations
     * @param {number} limit - Number of tracks to return
     * @returns {Promise<Array>} - Array of trending tracks
     */
    async getTrendingTracks(limit = 20) {
        try {
            const token = authService.getToken();
            if (!token) {
                return this.getFallbackRecommendations(limit);
            }

            // Get top tracks from featured playlists
            const response = await axios.get(`${this.baseURL}/browse/featured-playlists`, {
                headers: { 'Authorization': `Bearer ${token}` },
                params: {
                    limit: 5,
                    country: 'US'
                }
            });

            // If we have playlists, get tracks from the first playlist
            if (response.data.playlists && response.data.playlists.items.length > 0) {
                const playlistId = response.data.playlists.items[0].id;

                const tracksResponse = await axios.get(`${this.baseURL}/playlists/${playlistId}/tracks`, {
                    headers: { 'Authorization': `Bearer ${token}` },
                    params: {
                        limit: limit,
                        market: 'US'
                    }
                });

                return tracksResponse.data.items.map(item => ({
                    id: item.track.id,
                    title: item.track.name,
                    artist: item.track.artists.map(artist => artist.name).join(', '),
                    album: item.track.album.name,
                    albumCover: item.track.album.images[0]?.url,
                    duration: item.track.duration_ms,
                    uri: item.track.uri,
                    explicit: item.track.explicit,
                    popularity: item.track.popularity
                }));
            }

            return this.getFallbackRecommendations(limit);
        } catch (error) {
            console.error('Error getting trending tracks:', error);
            return this.getFallbackRecommendations(limit);
        }
    }

    /**
     * Get fallback recommendations when the API fails
     * @param {number} limit - Number of tracks to return
     * @param {boolean} isDiscovery - Whether these are discovery recommendations
     * @returns {Array} - Array of fallback recommended tracks
     */
    getFallbackRecommendations(limit = 20, isDiscovery = false) {
        const fallbackTracks = [
            {
                id: '7qiZfU4dY1lWllzX7mPBI3',
                title: 'Shape of You',
                artist: 'Ed Sheeran',
                album: '÷ (Divide)',
                albumCover: 'https://i.scdn.co/image/ab67616d0000b2737fcc6eafd7ae966c8b9a141c',
                duration: 233713,
                uri: 'spotify:track:7qiZfU4dY1lWllzX7mPBI3',
                explicit: false,
                popularity: 98
            },
            {
                id: '4iJyoBOLtHqaGxP12qzhQI',
                title: 'Peaches',
                artist: 'Justin Bieber, Daniel Caesar, Giveon',
                album: 'Justice',
                albumCover: 'https://i.scdn.co/image/ab67616d0000b2738e2a8ddf6d768c1cb5a8c376',
                duration: 198082,
                uri: 'spotify:track:4iJyoBOLtHqaGxP12qzhQI',
                explicit: true,
                popularity: 95
            },
            {
                id: '5QO79kh1waicV47BqGRL3g',
                title: 'Save Your Tears',
                artist: 'The Weeknd',
                album: 'After Hours',
                albumCover: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
                duration: 215627,
                uri: 'spotify:track:5QO79kh1waicV47BqGRL3g',
                explicit: false,
                popularity: 96
            },
            {
                id: '2J2Z1SkXYghSajLibnQHOa',
                title: 'Levitating',
                artist: 'Dua Lipa',
                album: 'Future Nostalgia',
                albumCover: 'https://i.scdn.co/image/ab67616d0000b2734330f9e8c4e99ed4383920b0',
                duration: 203807,
                uri: 'spotify:track:2J2Z1SkXYghSajLibnQHOa',
                explicit: false,
                popularity: 94
            },
            {
                id: '0VjIjW4GlUZAMYd2vXMi3b',
                title: 'Blinding Lights',
                artist: 'The Weeknd',
                album: 'After Hours',
                albumCover: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
                duration: 200040,
                uri: 'spotify:track:0VjIjW4GlUZAMYd2vXMi3b',
                explicit: false,
                popularity: 99
            },
            {
                id: '5uCax9HTNlzGybIStD3vDh',
                title: 'Say So',
                artist: 'Doja Cat',
                album: 'Hot Pink',
                albumCover: 'https://i.scdn.co/image/ab67616d0000b2734b9a4602a97eaae8eac75324',
                duration: 237893,
                uri: 'spotify:track:5uCax9HTNlzGybIStD3vDh',
                explicit: false,
                popularity: 91
            },
            {
                id: '4y4spB9m0Q6026KfkAvy9Q',
                title: 'Bad Romance',
                artist: 'Lady Gaga',
                album: 'The Fame Monster',
                albumCover: 'https://i.scdn.co/image/ab67616d0000b273ae65274040157b322ecf98cd',
                duration: 294573,
                uri: 'spotify:track:4y4spB9m0Q6026KfkAvy9Q',
                explicit: false,
                popularity: 90
            },
            {
                id: '6I9VzXrHxO9rA9A5euc8Ak',
                title: 'Toxic',
                artist: 'Britney Spears',
                album: 'In The Zone',
                albumCover: 'https://i.scdn.co/image/ab67616d0000b2736db0b187e7482f5e00bfeb69',
                duration: 198933,
                uri: 'spotify:track:6I9VzXrHxO9rA9A5euc8Ak',
                explicit: false,
                popularity: 93
            },
            {
                id: '5YaskwnGDZFDRipaqzbwQx',
                title: 'Stay',
                artist: 'The Kid LAROI, Justin Bieber',
                album: 'F*CK LOVE 3: OVER YOU',
                albumCover: 'https://i.scdn.co/image/ab67616d0000b273775c8fa650cc5dd4eac675a4',
                duration: 141805,
                uri: 'spotify:track:5YaskwnGDZFDRipaqzbwQx',
                explicit: false,
                popularity: 93
            },
            {
                id: '5HCyWlXZPP0y6Gqq8TgA20',
                title: 'Heat Waves',
                artist: 'Glass Animals',
                album: 'Dreamland',
                albumCover: 'https://i.scdn.co/image/ab67616d0000b27382ce4c7bbf861fc5735ae35e',
                duration: 238805,
                uri: 'spotify:track:5HCyWlXZPP0y6Gqq8TgA20',
                explicit: false,
                popularity: 97
            }
        ];

        const discoveryTracks = [
            {
                id: '0vR2rIVORmgeKiGIgNT0fV',
                title: 'Floating Through Space',
                artist: 'Sia, David Guetta',
                album: 'Floating Through Space',
                albumCover: 'https://i.scdn.co/image/ab67616d0000b2732d8c31ac835e5cd38b6eebd9',
                duration: 176000,
                uri: 'spotify:track:0vR2rIVORmgeKiGIgNT0fV',
                explicit: false,
                popularity: 72
            },
            {
                id: '4Li2WHPkuyCdtmokzW2007',
                title: 'Hypnotized',
                artist: 'Purple Disco Machine, Sophie and the Giants',
                album: 'Hypnotized',
                albumCover: 'https://i.scdn.co/image/ab67616d0000b273aa23ab3114d8497b468cbd42',
                duration: 206000,
                uri: 'spotify:track:4Li2WHPkuyCdtmokzW2007',
                explicit: false,
                popularity: 76
            },
            {
                id: '3fDdEfGLXcidR6wOm5phB8',
                title: 'Paradise',
                artist: 'MEDUZA, Dermot Kennedy',
                album: 'Paradise',
                albumCover: 'https://i.scdn.co/image/ab67616d0000b2732bb429e37e5b82191efd5c40',
                duration: 175000,
                uri: 'spotify:track:3fDdEfGLXcidR6wOm5phB8',
                explicit: false,
                popularity: 85
            },
            {
                id: '0W6I02J9xcqK8MtSeosEXb',
                title: 'Get Lucky',
                artist: 'Daft Punk, Pharrell Williams, Nile Rodgers',
                album: 'Random Access Memories',
                albumCover: 'https://i.scdn.co/image/ab67616d0000b2739b9b36b0e22c4453be57df2f',
                duration: 369000,
                uri: 'spotify:track:0W6I02J9xcqK8MtSeosEXb',
                explicit: false,
                popularity: 83
            },
            {
                id: '2dpaYNEQHiRxtZbfNsse99',
                title: 'Happier',
                artist: 'Marshmello, Bastille',
                album: 'Happier',
                albumCover: 'https://i.scdn.co/image/ab67616d0000b273bd02d63fd3616e1f693b2aae',
                duration: 214000,
                uri: 'spotify:track:2dpaYNEQHiRxtZbfNsse99',
                explicit: false,
                popularity: 89
            }
        ];

        // Return the appropriate list
        return isDiscovery
            ? discoveryTracks.slice(0, limit)
            : fallbackTracks.slice(0, limit);
    }

    /**
     * Get fallback recommendations for a specific genre
     * @param {string} genre - The genre to get recommendations for
     * @param {number} limit - Number of tracks to return
     * @returns {Array} - Array of fallback tracks for the given genre
     */
    getFallbackRecommendationsByGenre(genre, limit = 20) {
        const genreFallbackTracks = {
            'pop': [
                {
                    id: '5uCax9HTNlzGybIStD3vDh',
                    title: 'Say So',
                    artist: 'Doja Cat',
                    album: 'Hot Pink',
                    albumCover: 'https://i.scdn.co/image/ab67616d0000b2734b9a4602a97eaae8eac75324',
                    duration: 237893,
                    uri: 'spotify:track:5uCax9HTNlzGybIStD3vDh',
                    explicit: false,
                    popularity: 91
                },
                {
                    id: '4iJyoBOLtHqaGxP12qzhQI',
                    title: 'Peaches',
                    artist: 'Justin Bieber, Daniel Caesar, Giveon',
                    album: 'Justice',
                    albumCover: 'https://i.scdn.co/image/ab67616d0000b2738e2a8ddf6d768c1cb5a8c376',
                    duration: 198082,
                    uri: 'spotify:track:4iJyoBOLtHqaGxP12qzhQI',
                    explicit: true,
                    popularity: 95
                }
            ],
            'rock': [
                {
                    id: '7iN1s7xHE4ifF5povM6A48',
                    title: 'Numb',
                    artist: 'Linkin Park',
                    album: 'Meteora',
                    albumCover: 'https://i.scdn.co/image/ab67616d0000b27337bf4a344ae0c94c9097c897',
                    duration: 185773,
                    uri: 'spotify:track:7iN1s7xHE4ifF5povM6A48',
                    explicit: false,
                    popularity: 88
                },
                {
                    id: '4bDVHqeJWJjHlJXDcC3hakx',
                    title: 'Sweet Child O\' Mine',
                    artist: 'Guns N\' Roses',
                    album: 'Appetite For Destruction',
                    albumCover: 'https://i.scdn.co/image/ab67616d0000b2736ffa7878c8b220dd84ee7a47',
                    duration: 355493,
                    uri: 'spotify:track:4bDVHqeJWJjHlJXDcC3hakx',
                    explicit: false,
                    popularity: 89
                }
            ],
            'hip-hop': [
                {
                    id: '3yfqSUWxFvZELEM4PmlwIR',
                    title: 'Sicko Mode',
                    artist: 'Travis Scott',
                    album: 'Astroworld',
                    albumCover: 'https://i.scdn.co/image/ab67616d0000b273072e9faef2ef7b6db63834a3',
                    duration: 312820,
                    uri: 'spotify:track:3yfqSUWxFvZELEM4PmlwIR',
                    explicit: true,
                    popularity: 91
                },
                {
                    id: '0TK2YIli7K1leLovkQiNik',
                    title: 'Alright',
                    artist: 'Kendrick Lamar',
                    album: 'To Pimp A Butterfly',
                    albumCover: 'https://i.scdn.co/image/ab67616d0000b273cdb645498cd3d8a2db4d05e1',
                    duration: 219327,
                    uri: 'spotify:track:0TK2YIli7K1leLovkQiNik',
                    explicit: true,
                    popularity: 84
                }
            ],
            'indie': [
                {
                    id: '41zXlQxzTi6cGAjpOXyLYH',
                    title: 'Do I Wanna Know?',
                    artist: 'Arctic Monkeys',
                    album: 'AM',
                    albumCover: 'https://i.scdn.co/image/ab67616d0000b27370f7a1b35d5165c85b95a0e0',
                    duration: 272394,
                    uri: 'spotify:track:41zXlQxzTi6cGAjpOXyLYH',
                    explicit: false,
                    popularity: 88
                },
                {
                    id: '7oK9VyNzrYvRFo7nQEYkWN',
                    title: 'Mr. Brightside',
                    artist: 'The Killers',
                    album: 'Hot Fuss',
                    albumCover: 'https://i.scdn.co/image/ab67616d0000b2738f1ae6f0f4752396d514a1e0',
                    duration: 222567,
                    uri: 'spotify:track:7oK9VyNzrYvRFo7nQEYkWN',
                    explicit: false,
                    popularity: 87
                }
            ],
            'electronic': [
                {
                    id: '4kflIGfjdZJW4ot2ioixTB',
                    title: 'Higher Love',
                    artist: 'Kygo, Whitney Houston',
                    album: 'Higher Love',
                    albumCover: 'https://i.scdn.co/image/ab67616d0000b273abddcf92c37eb7c3a764b0a4',
                    duration: 228267,
                    uri: 'spotify:track:4kflIGfjdZJW4ot2ioixTB',
                    explicit: false,
                    popularity: 84
                },
                {
                    id: '2lfPecqFbH8X4bEQNBMAR5',
                    title: 'This Girl',
                    artist: 'Kungs vs Cookin\' On 3 Burners',
                    album: 'Layers',
                    albumCover: 'https://i.scdn.co/image/ab67616d0000b273c7147bbe263576db23b67d50',
                    duration: 195373,
                    uri: 'spotify:track:2lfPecqFbH8X4bEQNBMAR5',
                    explicit: false,
                    popularity: 82
                }
            ]
        };

        // If we have fallbacks for this genre, use them
        if (genreFallbackTracks[genre] && genreFallbackTracks[genre].length > 0) {
            return genreFallbackTracks[genre].slice(0, limit);
        }

        // Otherwise, use general fallbacks
        return this.getFallbackRecommendations(limit);
    }
}

export default new RecommendationService();
