import axios from 'axios';

// Get YouTube API key from environment variables - use import.meta.env for Vite/Quasar
const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY ||
    import.meta.env.VUE_APP_YOUTUBE_API_KEY ||
    process.env.VUE_APP_YOUTUBE_API_KEY;

// Log if we have YouTube API key (for debugging)
console.log('YouTube API key available:', !!YOUTUBE_API_KEY);

// Expanded mock data for fallbacks when API fails
const MOCK_YOUTUBE_VIDEOS = [
    {
        id: { videoId: 'dQw4w9WgXcQ' },
        snippet: {
            title: 'Rick Astley - Never Gonna Give You Up',
            description: 'Music video for Rick Astley - Never Gonna Give You Up',
            thumbnails: {
                default: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/default.jpg' },
                medium: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/mqdefault.jpg' },
                high: { url: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg' }
            }
        }
    },
    {
        id: { videoId: 'y6120QOlsfU' },
        snippet: {
            title: 'Darude - Sandstorm',
            description: 'Music video for Darude - Sandstorm',
            thumbnails: {
                default: { url: 'https://i.ytimg.com/vi/y6120QOlsfU/default.jpg' },
                medium: { url: 'https://i.ytimg.com/vi/y6120QOlsfU/mqdefault.jpg' },
                high: { url: 'https://i.ytimg.com/vi/y6120QOlsfU/hqdefault.jpg' }
            }
        }
    },
    {
        id: { videoId: '09R8_2nJtjg' },
        snippet: {
            title: 'Maroon 5 - Sugar',
            description: 'Music video for Maroon 5 - Sugar',
            thumbnails: {
                default: { url: 'https://i.ytimg.com/vi/09R8_2nJtjg/default.jpg' },
                medium: { url: 'https://i.ytimg.com/vi/09R8_2nJtjg/mqdefault.jpg' },
                high: { url: 'https://i.ytimg.com/vi/09R8_2nJtjg/hqdefault.jpg' }
            }
        }
    },
    {
        id: { videoId: 'JGwWNGJdvx8' },
        snippet: {
            title: 'Ed Sheeran - Shape of You',
            description: 'The official music video for Ed Sheeran - Shape of You',
            thumbnails: {
                default: { url: 'https://i.ytimg.com/vi/JGwWNGJdvx8/default.jpg' },
                medium: { url: 'https://i.ytimg.com/vi/JGwWNGJdvx8/mqdefault.jpg' },
                high: { url: 'https://i.ytimg.com/vi/JGwWNGJdvx8/hqdefault.jpg' }
            }
        }
    },
    {
        id: { videoId: 'fKopy74weus' },
        snippet: {
            title: 'Imagine Dragons - Believer',
            description: 'Get Imagine Dragons\' album EVOLVE ft. Believer, Thunder, Whatever It Takes and Walking The Wire, out now.',
            thumbnails: {
                default: { url: 'https://i.ytimg.com/vi/fKopy74weus/default.jpg' },
                medium: { url: 'https://i.ytimg.com/vi/fKopy74weus/mqdefault.jpg' },
                high: { url: 'https://i.ytimg.com/vi/fKopy74weus/hqdefault.jpg' }
            }
        }
    }
];

// Create a map for quick lookup of video by search term
const MOCK_VIDEO_MAP = {
    'believer': MOCK_YOUTUBE_VIDEOS[4],
    'imagine dragons': MOCK_YOUTUBE_VIDEOS[4],
    'shape of you': MOCK_YOUTUBE_VIDEOS[3],
    'ed sheeran': MOCK_YOUTUBE_VIDEOS[3],
    'sugar': MOCK_YOUTUBE_VIDEOS[2],
    'maroon 5': MOCK_YOUTUBE_VIDEOS[2],
    'never gonna give you up': MOCK_YOUTUBE_VIDEOS[0],
    'rick astley': MOCK_YOUTUBE_VIDEOS[0],
    'sandstorm': MOCK_YOUTUBE_VIDEOS[1],
    'darude': MOCK_YOUTUBE_VIDEOS[1]
};

// Cache for API responses to reduce redundant calls
const apiCache = {
    search: new Map(),
    details: new Map()
};

// Maximum cache age in milliseconds (30 minutes)
const MAX_CACHE_AGE = 30 * 60 * 1000;

const youtubeService = {
    async searchVideos(query, maxResults = 10) {
        // First, check the cache
        const cacheKey = `${query}_${maxResults}`;
        const cachedResult = apiCache.search.get(cacheKey);

        if (cachedResult && (Date.now() - cachedResult.timestamp < MAX_CACHE_AGE)) {
            console.log('Returning cached YouTube search results for:', query);
            return cachedResult.data;
        }

        // Check if we have an API key
        if (!YOUTUBE_API_KEY) {
            console.warn('No YouTube API key found. Using mock data.');
            // Try to find a relevant mock video based on search terms
            const lowerQuery = query.toLowerCase();
            let relevantMocks = [];

            // Check if any of our mapped terms are in the query
            for (const [term, video] of Object.entries(MOCK_VIDEO_MAP)) {
                if (lowerQuery.includes(term)) {
                    relevantMocks.push(video);
                }
            }

            // If we found relevant mocks, return those, otherwise return all mocks
            const result = relevantMocks.length > 0 ? relevantMocks : MOCK_YOUTUBE_VIDEOS;
            console.log('Mock videos returned for query:', query, result.length);

            // Cache the result
            apiCache.search.set(cacheKey, {
                timestamp: Date.now(),
                data: result
            });

            return result;
        }

        try {
            console.log('Searching YouTube for:', query);
            const response = await axios.get('https://www.googleapis.com/youtube/v3/search', {
                params: {
                    part: 'snippet',
                    q: query,
                    maxResults: maxResults,
                    type: 'video',
                    videoCategoryId: '10', // Music category
                    key: YOUTUBE_API_KEY
                }
            });

            if (response.data && response.data.items && response.data.items.length > 0) {
                console.log('YouTube API returned:', response.data.items.length, 'videos');

                // Cache the result
                apiCache.search.set(cacheKey, {
                    timestamp: Date.now(),
                    data: response.data.items
                });

                return response.data.items;
            } else {
                console.warn('YouTube API returned no results, using mock data');
                const fallback = this.getFallbackVideosForQuery(query);

                // Cache the fallback result
                apiCache.search.set(cacheKey, {
                    timestamp: Date.now(),
                    data: fallback
                });

                return fallback;
            }
        } catch (error) {
            console.error('Error searching YouTube videos:', error);
            console.log('Using mock data as fallback');
            // Get more relevant fallback videos
            const fallback = this.getFallbackVideosForQuery(query);

            // Cache the fallback result
            apiCache.search.set(cacheKey, {
                timestamp: Date.now(),
                data: fallback
            });

            return fallback;
        }
    },

    getFallbackVideosForQuery(query) {
        // Try to find a relevant mock video based on search terms
        const lowerQuery = query.toLowerCase();
        let relevantMocks = [];

        // Check if any of our mapped terms are in the query
        for (const [term, video] of Object.entries(MOCK_VIDEO_MAP)) {
            if (lowerQuery.includes(term)) {
                relevantMocks.push(video);
            }
        }

        // If we found relevant mocks, return those, otherwise return all mocks
        return relevantMocks.length > 0 ? relevantMocks : MOCK_YOUTUBE_VIDEOS;
    },

    async getVideoDetails(videoId) {
        // First, check the cache
        const cachedResult = apiCache.details.get(videoId);

        if (cachedResult && (Date.now() - cachedResult.timestamp < MAX_CACHE_AGE)) {
            console.log('Returning cached YouTube video details for:', videoId);
            return cachedResult.data;
        }

        // Check if we have an API key
        if (!YOUTUBE_API_KEY) {
            console.warn('No YouTube API key found. Using mock data for video details.');
            const mockVideo = MOCK_YOUTUBE_VIDEOS.find(video => video.id.videoId === videoId) || MOCK_YOUTUBE_VIDEOS[0];

            // Cache the mock result
            apiCache.details.set(videoId, {
                timestamp: Date.now(),
                data: mockVideo
            });

            return mockVideo;
        }

        try {
            console.log('Getting YouTube video details for:', videoId);
            const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
                params: {
                    part: 'snippet,contentDetails',
                    id: videoId,
                    key: YOUTUBE_API_KEY
                }
            });

            if (response.data && response.data.items && response.data.items.length > 0) {
                const videoDetails = response.data.items[0];
                console.log('YouTube API returned details for video:', videoId);

                // Cache the result
                apiCache.details.set(videoId, {
                    timestamp: Date.now(),
                    data: videoDetails
                });

                return videoDetails;
            } else {
                console.warn('YouTube API returned no details for video, using mock data');
                const mockVideo = MOCK_YOUTUBE_VIDEOS.find(video => video.id.videoId === videoId) || MOCK_YOUTUBE_VIDEOS[0];

                // Cache the mock result
                apiCache.details.set(videoId, {
                    timestamp: Date.now(),
                    data: mockVideo
                });

                return mockVideo;
            }
        } catch (error) {
            console.error('Error getting video details:', error);
            console.log('Using mock data as fallback for video details');
            // Return mock data as fallback
            const mockVideo = MOCK_YOUTUBE_VIDEOS.find(video => video.id.videoId === videoId) || MOCK_YOUTUBE_VIDEOS[0];

            // Cache the mock result
            apiCache.details.set(videoId, {
                timestamp: Date.now(),
                data: mockVideo
            });

            return mockVideo;
        }
    },

    // Helper function to extract video ID from YouTube URL
    extractVideoId(url) {
        if (!url || typeof url !== 'string') {
            console.warn('Invalid URL provided to extractVideoId:', url);
            return null;
        }

        try {
            const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
            const match = url.match(regExp);
            return (match && match[7] && match[7].length === 11) ? match[7] : null;
        } catch (error) {
            console.error('Error extracting video ID:', error);
            return null;
        }
    },

    // Clear cache to force fresh data
    clearCache() {
        apiCache.search.clear();
        apiCache.details.clear();
        console.log('YouTube API cache cleared');
    }
};

export default youtubeService;
