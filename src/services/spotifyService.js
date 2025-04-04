import axios from 'axios';

// Environment variables - use import.meta.env for Vite/Quasar
const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID ||
    import.meta.env.VUE_APP_SPOTIFY_CLIENT_ID ||
    process.env.VUE_APP_SPOTIFY_CLIENT_ID;

const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET ||
    import.meta.env.VUE_APP_SPOTIFY_CLIENT_SECRET ||
    process.env.VUE_APP_SPOTIFY_CLIENT_SECRET;

const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI ||
    import.meta.env.VUE_APP_SPOTIFY_REDIRECT_URI ||
    process.env.VUE_APP_SPOTIFY_REDIRECT_URI ||
    'http://localhost:9001/callback';

// Log environment variables (for debugging)
console.log('Spotify credentials available:', !!SPOTIFY_CLIENT_ID && !!SPOTIFY_CLIENT_SECRET);

// Mock data for fallbacks
const MOCK_TRACKS = [
    {
        id: '1',
        name: 'Believer',
        artists: [{ id: 'artist1', name: 'Imagine Dragons' }],
        album: {
            id: 'album1',
            name: 'Evolve',
            images: [{ url: 'https://i.scdn.co/image/ab67616d00001e02c8a11e48c91a982d086afc69' }],
            release_date: '2017-06-23'
        },
        duration_ms: 204000,
        popularity: 85
    },
    {
        id: '2',
        name: 'Thunder',
        artists: [{ id: 'artist1', name: 'Imagine Dragons' }],
        album: {
            id: 'album1',
            name: 'Evolve',
            images: [{ url: 'https://i.scdn.co/image/ab67616d00001e02c8a11e48c91a982d086afc69' }],
            release_date: '2017-06-23'
        },
        duration_ms: 187000,
        popularity: 83
    },
    {
        id: '3',
        name: 'Radioactive',
        artists: [{ id: 'artist1', name: 'Imagine Dragons' }],
        album: {
            id: 'album2',
            name: 'Night Visions',
            images: [{ url: 'https://i.scdn.co/image/ab67616d00001e028f9ddae971ec2eeb56be07ac' }],
            release_date: '2012-09-04'
        },
        duration_ms: 187000,
        popularity: 81
    },
    {
        id: '4',
        name: 'Blinding Lights',
        artists: [{ id: 'artist2', name: 'The Weeknd' }],
        album: {
            id: 'album3',
            name: 'After Hours',
            images: [{ url: 'https://i.scdn.co/image/ab67616d00001e02ef12a4e9d85a9f73d0aa48e7' }],
            release_date: '2020-03-20'
        },
        duration_ms: 200000,
        popularity: 92
    },
    {
        id: '5',
        name: 'Shape of You',
        artists: [{ id: 'artist3', name: 'Ed Sheeran' }],
        album: {
            id: 'album4',
            name: '÷ (Divide)',
            images: [{ url: 'https://i.scdn.co/image/ab67616d00001e02ba5db46f4b838ef6027e6f96' }],
            release_date: '2017-03-03'
        },
        duration_ms: 233000,
        popularity: 90
    },
    {
        id: '6',
        name: 'Dance Monkey',
        artists: [{ id: 'artist4', name: 'Tones and I' }],
        album: {
            id: 'album5',
            name: 'The Kids Are Coming',
            images: [{ url: 'https://i.scdn.co/image/ab67616d00001e0294f08406ec555b39d2d16a63' }],
            release_date: '2019-08-30'
        },
        duration_ms: 210000,
        popularity: 88
    }
];

const MOCK_ARTISTS = [
    {
        id: 'artist1',
        name: 'Imagine Dragons',
        genres: ['pop rock', 'alternative rock'],
        images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb920dc1e0f00bad3853499362' }],
        popularity: 88,
        followers: { total: 42000000 }
    },
    {
        id: 'artist2',
        name: 'The Weeknd',
        genres: ['pop', 'r&b'],
        images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb4293385d324db8558179afd9' }],
        popularity: 95,
        followers: { total: 55000000 }
    },
    {
        id: 'artist3',
        name: 'Ed Sheeran',
        genres: ['pop', 'singer-songwriter'],
        images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb3bcef85e105dfc42f5b8fae9' }],
        popularity: 93,
        followers: { total: 107000000 }
    },
    {
        id: 'artist4',
        name: 'Tones and I',
        genres: ['australian pop', 'pop'],
        images: [{ url: 'https://i.scdn.co/image/ab6761610000e5ebe03a98785f3658f0b6461ec4' }],
        popularity: 85,
        followers: { total: 5600000 }
    },
    {
        id: 'artist5',
        name: 'OneRepublic',
        genres: ['pop rock', 'pop'],
        images: [{ url: 'https://i.scdn.co/image/ab6761610000e5eb8ae7f2aaa9817a704a87ea36' }],
        popularity: 84,
        followers: { total: 14700000 }
    }
];

const MOCK_ALBUMS = [
    {
        id: 'album1',
        name: 'Evolve',
        artists: [{ id: 'artist1', name: 'Imagine Dragons' }],
        images: [{ url: 'https://i.scdn.co/image/ab67616d00001e02c8a11e48c91a982d086afc69' }],
        release_date: '2017-06-23',
        total_tracks: 11,
        tracks: { items: MOCK_TRACKS.filter(t => t.album.id === 'album1') }
    },
    {
        id: 'album2',
        name: 'Night Visions',
        artists: [{ id: 'artist1', name: 'Imagine Dragons' }],
        images: [{ url: 'https://i.scdn.co/image/ab67616d00001e028f9ddae971ec2eeb56be07ac' }],
        release_date: '2012-09-04',
        total_tracks: 13,
        tracks: { items: MOCK_TRACKS.filter(t => t.album.id === 'album2') }
    },
    {
        id: 'album3',
        name: 'After Hours',
        artists: [{ id: 'artist2', name: 'The Weeknd' }],
        images: [{ url: 'https://i.scdn.co/image/ab67616d00001e02ef12a4e9d85a9f73d0aa48e7' }],
        release_date: '2020-03-20',
        total_tracks: 14,
        tracks: { items: MOCK_TRACKS.filter(t => t.album.id === 'album3') }
    },
    {
        id: 'album4',
        name: '÷ (Divide)',
        artists: [{ id: 'artist3', name: 'Ed Sheeran' }],
        images: [{ url: 'https://i.scdn.co/image/ab67616d00001e02ba5db46f4b838ef6027e6f96' }],
        release_date: '2017-03-03',
        total_tracks: 16,
        tracks: { items: MOCK_TRACKS.filter(t => t.album.id === 'album4') }
    },
    {
        id: 'album5',
        name: 'The Kids Are Coming',
        artists: [{ id: 'artist4', name: 'Tones and I' }],
        images: [{ url: 'https://i.scdn.co/image/ab67616d00001e0294f08406ec555b39d2d16a63' }],
        release_date: '2019-08-30',
        total_tracks: 6,
        tracks: { items: MOCK_TRACKS.filter(t => t.album.id === 'album5') }
    }
];

const MOCK_PLAYLISTS = [
    {
        id: 'playlist1',
        name: 'Today\'s Top Hits',
        description: 'The most popular songs right now.',
        images: [{ url: 'https://i.scdn.co/image/ab67706f000000023f2d0b5b3614cd9f21dfbd4e' }],
        owner: { display_name: 'Spotify' },
        tracks: {
            total: 50,
            items: MOCK_TRACKS.slice(0, 3).map(track => ({ track }))
        }
    },
    {
        id: 'playlist2',
        name: 'RapCaviar',
        description: 'New music from Kendrick Lamar, Lil Uzi Vert and BabyTron.',
        images: [{ url: 'https://i.scdn.co/image/ab67706f00000002ed7cba1a316889eeefec432c' }],
        owner: { display_name: 'Spotify' },
        tracks: {
            total: 50,
            items: MOCK_TRACKS.slice(3, 6).map(track => ({ track }))
        }
    },
    {
        id: 'playlist3',
        name: 'All Out 2010s',
        description: 'The biggest songs of the 2010s.',
        images: [{ url: 'https://i.scdn.co/image/ab67706f00000002e787cffee5de492f0365304d' }],
        owner: { display_name: 'Spotify' },
        tracks: {
            total: 100,
            items: MOCK_TRACKS.map(track => ({ track }))
        }
    },
    {
        id: 'playlist4',
        name: 'Rock Classics',
        description: 'Rock legends & epic songs spanning decades.',
        images: [{ url: 'https://i.scdn.co/image/ab67706f00000002f8371c5bee1f418847db0df4' }],
        owner: { display_name: 'Spotify' },
        tracks: {
            total: 80,
            items: MOCK_TRACKS.slice(0, 3).map(track => ({ track }))
        }
    },
    {
        id: 'playlist5',
        name: 'Chill Hits',
        description: 'Kick back to the best new chill hits.',
        images: [{ url: 'https://i.scdn.co/image/ab67706f00000002b1c6294016670c983e9001e9' }],
        owner: { display_name: 'Spotify' },
        tracks: {
            total: 70,
            items: MOCK_TRACKS.slice(3, 6).map(track => ({ track }))
        }
    }
];

// Track search terms for quicker fallback responses
const SEARCH_TERM_MAP = {
    'believer': [MOCK_TRACKS[0]],
    'imagine dragons': [MOCK_TRACKS[0], MOCK_TRACKS[1], MOCK_TRACKS[2]],
    'weeknd': [MOCK_TRACKS[3]],
    'blinding': [MOCK_TRACKS[3]],
    'sheeran': [MOCK_TRACKS[4]],
    'shape': [MOCK_TRACKS[4]],
    'dance': [MOCK_TRACKS[5]],
    'monkey': [MOCK_TRACKS[5]]
};

// Cache for API responses to reduce redundant calls
const apiCache = {
    tracks: new Map(),
    artists: new Map(),
    albums: new Map(),
    playlists: new Map(),
    search: new Map()
};

// Maximum cache age in milliseconds (30 minutes)
const MAX_CACHE_AGE = 30 * 60 * 1000;

let accessToken = null;
let tokenExpirationTime = null;

const spotifyService = {
    async getAccessToken() {
        // Check if we already have a valid token
        if (accessToken && Date.now() < tokenExpirationTime) {
            return accessToken;
        }

        // Check if we have client credentials
        if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
            console.warn('Spotify API credentials not found');
            return null;
        }

        try {
            console.log('Requesting Spotify access token');
            const response = await axios.post('https://accounts.spotify.com/api/token',
                new URLSearchParams({
                    grant_type: 'client_credentials',
                    client_id: SPOTIFY_CLIENT_ID,
                    client_secret: SPOTIFY_CLIENT_SECRET
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            accessToken = response.data.access_token;
            tokenExpirationTime = Date.now() + (response.data.expires_in * 1000);
            console.log('Spotify token acquired');
            return accessToken;
        } catch (error) {
            console.error('Error getting Spotify access token:', error);
            return null;
        }
    },

    getRelevantMockTracks(query) {
        const lowerQuery = query.toLowerCase();
        let relevantTracks = [];

        // Check specific matches first
        for (const [term, tracks] of Object.entries(SEARCH_TERM_MAP)) {
            if (lowerQuery.includes(term)) {
                relevantTracks.push(...tracks);
            }
        }

        // If no specific matches, try broader matches
        if (relevantTracks.length === 0) {
            relevantTracks = MOCK_TRACKS.filter(track =>
                track.name.toLowerCase().includes(lowerQuery) ||
                track.artists.some(artist => artist.name.toLowerCase().includes(lowerQuery)) ||
                track.album.name.toLowerCase().includes(lowerQuery)
            );
        }

        // If still no matches, return a subset of mock tracks
        if (relevantTracks.length === 0) {
            relevantTracks = MOCK_TRACKS.slice(0, 3);
        }

        // Remove duplicates
        return [...new Map(relevantTracks.map(track => [track.id, track])).values()];
    },

    async searchTracks(query, limit = 10) {
        // Check cache first
        const cacheKey = `${query}_${limit}`;
        const cachedResult = apiCache.search.get(cacheKey);

        if (cachedResult && (Date.now() - cachedResult.timestamp < MAX_CACHE_AGE)) {
            console.log('Returning cached search results for:', query);
            return cachedResult.data;
        }

        try {
            const token = await this.getAccessToken();
            if (!token) {
                console.warn('No Spotify token available. Using mock data for track search');
                // Return filtered mock data based on query
                const mockResults = this.getRelevantMockTracks(query);

                // Cache results
                apiCache.search.set(cacheKey, {
                    timestamp: Date.now(),
                    data: mockResults
                });

                return mockResults;
            }

            console.log('Searching Spotify tracks for:', query);
            const response = await axios.get('https://api.spotify.com/v1/search', {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    q: query,
                    type: 'track',
                    limit: limit
                }
            });

            if (response.data && response.data.tracks && response.data.tracks.items) {
                const results = response.data.tracks.items;

                // Cache results
                apiCache.search.set(cacheKey, {
                    timestamp: Date.now(),
                    data: results
                });

                return results;
            } else {
                throw new Error('Invalid response format from Spotify API');
            }
        } catch (error) {
            console.error('Error searching tracks:', error);
            console.log('Using mock data as fallback for track search');

            const mockResults = this.getRelevantMockTracks(query);

            // Cache results
            apiCache.search.set(cacheKey, {
                timestamp: Date.now(),
                data: mockResults
            });

            return mockResults;
        }
    },

    async getTrackDetails(trackId) {
        // Check cache first
        const cachedResult = apiCache.tracks.get(trackId);

        if (cachedResult && (Date.now() - cachedResult.timestamp < MAX_CACHE_AGE)) {
            console.log('Returning cached track details for:', trackId);
            return cachedResult.data;
        }

        try {
            const token = await this.getAccessToken();
            if (!token) {
                console.warn('No Spotify token available. Using mock data for track details');
                const mockTrack = MOCK_TRACKS.find(track => track.id === trackId) || MOCK_TRACKS[0];

                // Cache result
                apiCache.tracks.set(trackId, {
                    timestamp: Date.now(),
                    data: mockTrack
                });

                return mockTrack;
            }

            const response = await axios.get(`https://api.spotify.com/v1/tracks/${trackId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data) {
                // Cache result
                apiCache.tracks.set(trackId, {
                    timestamp: Date.now(),
                    data: response.data
                });

                return response.data;
            } else {
                throw new Error('Invalid response from Spotify API');
            }
        } catch (error) {
            console.error('Error getting track details:', error);
            console.log('Using mock data as fallback for track details');

            const mockTrack = MOCK_TRACKS.find(track => track.id === trackId) || MOCK_TRACKS[0];

            // Cache result
            apiCache.tracks.set(trackId, {
                timestamp: Date.now(),
                data: mockTrack
            });

            return mockTrack;
        }
    },

    async getArtistDetails(artistId) {
        // Check cache first
        const cachedResult = apiCache.artists.get(artistId);

        if (cachedResult && (Date.now() - cachedResult.timestamp < MAX_CACHE_AGE)) {
            console.log('Returning cached artist details for:', artistId);
            return cachedResult.data;
        }

        try {
            const token = await this.getAccessToken();
            if (!token) {
                console.warn('No Spotify token available. Using mock data for artist details');
                const mockArtist = MOCK_ARTISTS.find(artist => artist.id === artistId) || MOCK_ARTISTS[0];

                // Cache result
                apiCache.artists.set(artistId, {
                    timestamp: Date.now(),
                    data: mockArtist
                });

                return mockArtist;
            }

            const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data) {
                // Cache result
                apiCache.artists.set(artistId, {
                    timestamp: Date.now(),
                    data: response.data
                });

                return response.data;
            } else {
                throw new Error('Invalid response from Spotify API');
            }
        } catch (error) {
            console.error('Error getting artist details:', error);
            console.log('Using mock data as fallback for artist details');

            const mockArtist = MOCK_ARTISTS.find(artist => artist.id === artistId) || MOCK_ARTISTS[0];

            // Cache result
            apiCache.artists.set(artistId, {
                timestamp: Date.now(),
                data: mockArtist
            });

            return mockArtist;
        }
    },

    async getAlbumDetails(albumId) {
        // Check cache first
        const cachedResult = apiCache.albums.get(albumId);

        if (cachedResult && (Date.now() - cachedResult.timestamp < MAX_CACHE_AGE)) {
            console.log('Returning cached album details for:', albumId);
            return cachedResult.data;
        }

        try {
            const token = await this.getAccessToken();
            if (!token) {
                console.warn('No Spotify token available. Using mock data for album details');
                const mockAlbum = MOCK_ALBUMS.find(album => album.id === albumId) || MOCK_ALBUMS[0];

                // Cache result
                apiCache.albums.set(albumId, {
                    timestamp: Date.now(),
                    data: mockAlbum
                });

                return mockAlbum;
            }

            const response = await axios.get(`https://api.spotify.com/v1/albums/${albumId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data) {
                // Cache result
                apiCache.albums.set(albumId, {
                    timestamp: Date.now(),
                    data: response.data
                });

                return response.data;
            } else {
                throw new Error('Invalid response from Spotify API');
            }
        } catch (error) {
            console.error('Error getting album details:', error);
            console.log('Using mock data as fallback for album details');

            const mockAlbum = MOCK_ALBUMS.find(album => album.id === albumId) || MOCK_ALBUMS[0];

            // Cache result
            apiCache.albums.set(albumId, {
                timestamp: Date.now(),
                data: mockAlbum
            });

            return mockAlbum;
        }
    },

    async getPlaylistDetails(playlistId) {
        // Check cache first
        const cachedResult = apiCache.playlists.get(playlistId);

        if (cachedResult && (Date.now() - cachedResult.timestamp < MAX_CACHE_AGE)) {
            console.log('Returning cached playlist details for:', playlistId);
            return cachedResult.data;
        }

        try {
            const token = await this.getAccessToken();
            if (!token) {
                console.warn('No Spotify token available. Using mock data for playlist details');
                const mockPlaylist = MOCK_PLAYLISTS.find(playlist => playlist.id === playlistId) || MOCK_PLAYLISTS[0];

                // Cache result
                apiCache.playlists.set(playlistId, {
                    timestamp: Date.now(),
                    data: mockPlaylist
                });

                return mockPlaylist;
            }

            const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data) {
                // Cache result
                apiCache.playlists.set(playlistId, {
                    timestamp: Date.now(),
                    data: response.data
                });

                return response.data;
            } else {
                throw new Error('Invalid response from Spotify API');
            }
        } catch (error) {
            console.error('Error getting playlist details:', error);
            console.log('Using mock data as fallback for playlist details');

            const mockPlaylist = MOCK_PLAYLISTS.find(playlist => playlist.id === playlistId) || MOCK_PLAYLISTS[0];

            // Cache result
            apiCache.playlists.set(playlistId, {
                timestamp: Date.now(),
                data: mockPlaylist
            });

            return mockPlaylist;
        }
    },

    async getUserPlaylists() {
        // For this demo, we'll just return mock playlists since we don't have user auth
        return MOCK_PLAYLISTS;
    },

    async getNewReleases(limit = 10) {
        try {
            const token = await this.getAccessToken();
            if (!token) {
                console.warn('No Spotify token available. Using mock data for new releases');
                return MOCK_ALBUMS.slice(0, limit);
            }

            const response = await axios.get('https://api.spotify.com/v1/browse/new-releases', {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    limit: limit
                }
            });
            return response.data.albums.items;
        } catch (error) {
            console.error('Error getting new releases:', error);
            console.log('Using mock data as fallback for new releases');
            return MOCK_ALBUMS.slice(0, limit);
        }
    },

    async getFeaturedPlaylists(limit = 10) {
        try {
            const token = await this.getAccessToken();
            if (!token) {
                console.warn('No Spotify token available. Using mock data for featured playlists');
                return MOCK_PLAYLISTS.slice(0, limit);
            }

            const response = await axios.get('https://api.spotify.com/v1/browse/featured-playlists', {
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                params: {
                    limit: limit
                }
            });
            return response.data.playlists.items;
        } catch (error) {
            console.error('Error getting featured playlists:', error);
            console.log('Using mock data as fallback for featured playlists');
            return MOCK_PLAYLISTS.slice(0, limit);
        }
    },

    // Clear cache to force fresh data
    clearCache() {
        apiCache.tracks.clear();
        apiCache.artists.clear();
        apiCache.albums.clear();
        apiCache.playlists.clear();
        apiCache.search.clear();
        console.log('Spotify API cache cleared');
    }
};

export default spotifyService;
