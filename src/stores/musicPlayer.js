import { defineStore } from 'pinia';
import spotifyService from '../services/spotifyService';
import youtubeService from '../services/youtubeService';

// Log initialization to help with debugging
console.log('Initializing music player store...');

// Fallback/demo tracks in case APIs are unavailable
const FALLBACK_TRACKS = [
    {
        id: 'fallback-track-1',
        name: 'Fallback Track 1',
        album: {
            id: 'fallback-album-1',
            name: 'Fallback Album',
            images: [{ url: 'https://via.placeholder.com/300?text=Fallback+Album' }]
        },
        artists: [{ id: 'fallback-artist-1', name: 'Fallback Artist' }],
        duration_ms: 210000,
        preview_url: null
    },
    {
        id: 'fallback-track-2',
        name: 'Fallback Track 2',
        album: {
            id: 'fallback-album-1',
            name: 'Fallback Album',
            images: [{ url: 'https://via.placeholder.com/300?text=Fallback+Album' }]
        },
        artists: [{ id: 'fallback-artist-1', name: 'Fallback Artist' }],
        duration_ms: 180000,
        preview_url: null
    }
];

export const useMusicPlayerStore = defineStore('musicPlayer', {
    state: () => ({
        currentTrack: null,
        currentVideo: null,
        isPlaying: false,
        volume: 70,
        previousVolume: 70, // Store previous volume for mute/unmute
        progress: 0,
        duration: 0,
        queue: [],
        recentlyPlayed: [],
        searchResults: [],
        newReleases: [],
        relatedSongs: [],
        likedSongs: [], // Add liked songs array
        featuredPlaylist: null,
        player: null,
        progressInterval: null,
        isYouTubeReady: false,
        isShuffled: false,
        isRepeated: false,
        isQueueVisible: false,
        isDevicesVisible: false,
        activeRightPanel: null, // 'queue', 'related', or null
        continuousPlayback: true, // Add continuous playback state
        playerErrors: 0, // Count player errors for better fallback handling
        isOfflineMode: false // For when APIs are unavailable
    }),

    actions: {
        setYouTubeReady() {
            console.log('YouTube API is ready (from musicPlayer store)');
            this.isYouTubeReady = true;

            // Load liked songs from localStorage
            this.loadLikedSongs();

            // Initialize YouTube player if not already initialized
            this.initializeYouTubePlayer();
        },

        initializeYouTubePlayer() {
            if (!this.player && window.YT && window.YT.Player) {
                // Make sure the player container exists
                let playerContainer = document.getElementById('youtube-player');
                if (!playerContainer) {
                    playerContainer = document.createElement('div');
                    playerContainer.id = 'youtube-player';
                    document.body.appendChild(playerContainer);
                    console.log('Created YouTube player container');
                }

                try {
                    console.log('Initializing YouTube player with container:', playerContainer);
                    this.player = new window.YT.Player('youtube-player', {
                        height: '0',
                        width: '0',
                        videoId: '',
                        playerVars: {
                            autoplay: 0,
                            controls: 0,
                            modestbranding: 1,
                            rel: 0,
                            enablejsapi: 1
                        },
                        events: {
                            onReady: (event) => {
                                console.log('YouTube player initialized and ready');
                                this.setVolume(this.volume);
                            },
                            onStateChange: this.handlePlayerStateChange.bind(this),
                            onError: this.handlePlayerError.bind(this)
                        }
                    });
                } catch (error) {
                    console.error('Error initializing YouTube player:', error);
                    this.isOfflineMode = true;
                }
            } else if (!window.YT) {
                console.warn('YouTube API not available yet. Will be initialized by boot file.');
                this.isOfflineMode = true; // Temporarily set offline mode until YouTube API is ready
            }
        },

        handlePlayerStateChange(event) {
            if (!event || !event.data) return;

            console.log('Player state changed:', event.data);
            if (event.data === window.YT.PlayerState.ENDED) {
                this.isPlaying = false;
                this.stopProgressTracking();
                if (this.isRepeated) {
                    this.player.playVideo();
                } else if (this.queue.length > 0) {
                    this.playNextTrack();
                } else if (this.continuousPlayback && this.relatedSongs.length > 0) {
                    // Play first related song if queue is empty AND continuous playback is enabled
                    this.playTrack(this.relatedSongs[0]);
                }
            } else if (event.data === window.YT.PlayerState.PLAYING) {
                this.isPlaying = true;
                this.startProgressTracking();
                this.duration = this.player.getDuration() || 0;
            } else if (event.data === window.YT.PlayerState.PAUSED) {
                this.isPlaying = false;
                this.stopProgressTracking();
            }
        },

        handlePlayerError(event) {
            console.error('YouTube player error:', event);
            this.playerErrors++;

            // If too many errors, switch to offline mode
            if (this.playerErrors > 3) {
                console.warn('Too many player errors, switching to offline mode');
                this.isOfflineMode = true;
            }

            // Try to play the next track
            if (this.queue.length > 0) {
                this.playNextTrack();
            } else if (this.relatedSongs.length > 0) {
                this.playTrack(this.relatedSongs[0]);
            }
        },

        async searchTracks(query) {
            if (!query || query.trim() === '') {
                this.searchResults = [];
                return;
            }

            try {
                const spotifyResults = await spotifyService.searchTracks(query);
                this.searchResults = spotifyResults;

                // If no results found and in offline mode, use fallbacks
                if ((!spotifyResults || spotifyResults.length === 0) && this.isOfflineMode) {
                    this.searchResults = FALLBACK_TRACKS.filter(track =>
                        track.name.toLowerCase().includes(query.toLowerCase()) ||
                        track.artists[0].name.toLowerCase().includes(query.toLowerCase())
                    );
                }
            } catch (error) {
                console.error('Error searching tracks:', error);

                // Use fallback data if API fails
                this.isOfflineMode = true;
                this.searchResults = FALLBACK_TRACKS.filter(track =>
                    track.name.toLowerCase().includes(query.toLowerCase()) ||
                    track.artists[0].name.toLowerCase().includes(query.toLowerCase())
                );
            }
        },

        async playTrack(track) {
            if (!track) {
                console.error('Cannot play track: No track provided');
                return;
            }

            try {
                this.currentTrack = track;
                this.addToRecentlyPlayed(track);
                this.progress = 0;

                // Try to load related songs in the background (non-blocking)
                this.loadRelatedSongs(track).catch(err => console.warn('Could not load related songs:', err));

                // Skip YouTube if offline mode is enabled
                if (this.isOfflineMode) {
                    console.log('Running in offline mode - simulating playback');
                    this.isPlaying = true;
                    this.simulatePlayback(track);
                    return;
                }

                // Search for YouTube video
                try {
                    const videoQuery = `${track.name} ${track.artists?.[0]?.name || ''} official audio`;
                    console.log('Searching YouTube for:', videoQuery);
                    const youtubeResults = await youtubeService.searchVideos(videoQuery);

                    if (youtubeResults && youtubeResults.length > 0) {
                        this.currentVideo = youtubeResults[0];
                        const videoId = youtubeResults[0].id.videoId;

                        // Make sure YouTube is ready
                        if (!this.isYouTubeReady) {
                            console.log('YouTube not ready, waiting for boot initialization...');
                            // Don't try to initialize again - the boot file handles this
                            if (window.YT && window.YT.Player) {
                                this.isYouTubeReady = true;
                                this.initializeYouTubePlayer();
                            } else {
                                // Fallback to simulation if YouTube still not available
                                console.warn('YouTube API not available, using simulation');
                                this.isPlaying = true;
                                this.simulatePlayback(track);
                                return;
                            }
                        }

                        // Load the YouTube player
                        if (this.player && this.player.loadVideoById) {
                            console.log('Loading video ID:', videoId);
                            this.player.loadVideoById(videoId);
                            this.isPlaying = true;
                        } else if (window.YT && window.YT.Player) {
                            console.log('Player not available, loading with new player');
                            this.loadYouTubePlayer(videoId);
                        } else {
                            console.warn('YouTube API not ready, falling back to simulation');
                            this.isPlaying = true;
                            this.simulatePlayback(track);
                        }
                    } else {
                        // No YouTube results, fall back to simulation
                        console.warn('No YouTube results found, using fallback playback');
                        this.isPlaying = true;
                        this.simulatePlayback(track);
                    }
                } catch (youtubeError) {
                    console.error('YouTube error:', youtubeError);
                    // Fallback to simulation if YouTube fails
                    this.isPlaying = true;
                    this.simulatePlayback(track);
                }
            } catch (error) {
                console.error('Error playing track:', error);
                // Final fallback
                this.isOfflineMode = true;
                this.simulatePlayback(track);
            }
        },

        // Simulate playback when YouTube isn't available
        simulatePlayback(track) {
            this.isPlaying = true;
            this.duration = track.duration_ms ? track.duration_ms / 1000 : 180; // Default to 3 minutes

            this.stopProgressTracking();
            this.progressInterval = setInterval(() => {
                if (this.isPlaying) {
                    this.progress += 1;

                    // "End" the track when progress reaches duration
                    if (this.progress >= this.duration) {
                        this.progress = 0;
                        this.isPlaying = false;
                        this.stopProgressTracking();

                        // Simulate track ended event
                        if (this.isRepeated) {
                            setTimeout(() => this.simulatePlayback(track), 500);
                        } else if (this.queue.length > 0) {
                            this.playNextTrack();
                        } else if (this.continuousPlayback && this.relatedSongs.length > 0) {
                            this.playTrack(this.relatedSongs[0]);
                        }
                    }
                }
            }, 1000);
        },

        async loadRelatedSongs(track) {
            try {
                // First try to get tracks from the same artist
                const artistId = track.artists[0].id;
                const relatedTracks = await spotifyService.getArtistTopTracks(artistId);

                // Filter out the current track
                this.relatedSongs = relatedTracks.filter(relatedTrack => relatedTrack.id !== track.id);

                // If we don't have enough related songs, add recommendations based on the track
                if (this.relatedSongs.length < 5) {
                    const recommendations = await spotifyService.getRecommendations([track.id]);
                    const newRecommendations = recommendations.filter(
                        rec => !this.relatedSongs.some(related => related.id === rec.id) && rec.id !== track.id
                    );
                    this.relatedSongs = [...this.relatedSongs, ...newRecommendations].slice(0, 10);
                }
            } catch (error) {
                console.error('Error loading related songs:', error);
                // Fallback: if we can't get related songs, use new releases
                this.relatedSongs = this.newReleases.filter(release =>
                    release.id !== track.id &&
                    !this.relatedSongs.some(related => related.id === release.id)
                ).slice(0, 5);
            }
        },

        loadYouTubePlayer(videoId) {
            if (!this.isYouTubeReady) {
                console.error('YouTube API is not ready');
                return;
            }

            if (window.YT && window.YT.Player) {
                if (this.player) {
                    this.player.loadVideoById(videoId);
                } else {
                    this.player = new window.YT.Player('youtube-player', {
                        height: '0',
                        width: '0',
                        videoId: videoId,
                        playerVars: {
                            autoplay: 1,
                            controls: 0,
                            modestbranding: 1,
                            rel: 0,
                            enablejsapi: 1
                        },
                        events: {
                            onReady: (event) => {
                                console.log('Player is ready');
                                event.target.playVideo();
                                this.duration = event.target.getDuration();
                                this.startProgressTracking();
                            },
                            onStateChange: (event) => {
                                console.log('Player state changed:', event.data);
                                if (event.data === window.YT.PlayerState.ENDED) {
                                    this.isPlaying = false;
                                    this.stopProgressTracking();
                                    if (this.isRepeated) {
                                        this.player.playVideo();
                                    } else if (this.queue.length > 0) {
                                        this.playNextTrack();
                                    } else if (this.continuousPlayback && this.relatedSongs.length > 0) {
                                        // Play first related song if queue is empty AND continuous playback is enabled
                                        this.playTrack(this.relatedSongs[0]);
                                    }
                                } else if (event.data === window.YT.PlayerState.PLAYING) {
                                    this.isPlaying = true;
                                    this.startProgressTracking();
                                } else if (event.data === window.YT.PlayerState.PAUSED) {
                                    this.isPlaying = false;
                                    this.stopProgressTracking();
                                }
                            },
                            onError: (event) => {
                                console.error('Player error:', event.data);
                            }
                        }
                    });
                }
            } else {
                console.error('YouTube API is not available');
            }
        },

        startProgressTracking() {
            this.stopProgressTracking();
            this.progressInterval = setInterval(() => {
                if (this.player && this.player.getCurrentTime) {
                    const currentTime = this.player.getCurrentTime();
                    if (currentTime !== this.progress) {
                        this.progress = currentTime;
                    }
                }
            }, 1000);
        },

        stopProgressTracking() {
            if (this.progressInterval) {
                clearInterval(this.progressInterval);
                this.progressInterval = null;
            }
        },

        addToRecentlyPlayed(track) {
            // Remove the track if it's already in the recently played list
            this.recentlyPlayed = this.recentlyPlayed.filter(t => t.id !== track.id);
            // Add the track to the beginning of the list
            this.recentlyPlayed = [track, ...this.recentlyPlayed.slice(0, 9)];
        },

        async loadNewReleases() {
            try {
                this.newReleases = await spotifyService.getNewReleases();
            } catch (error) {
                console.error('Error loading new releases:', error);
                throw error;
            }
        },

        setVolume(value) {
            this.volume = value;
            if (this.player) {
                this.player.setVolume(value);
            }
        },

        seek(value) {
            if (this.player) {
                this.player.seekTo(value, true);
                this.progress = value;
            }
        },

        togglePlay() {
            if (this.isOfflineMode) {
                this.isPlaying = !this.isPlaying;
                if (!this.isPlaying) {
                    this.stopProgressTracking();
                } else if (this.currentTrack) {
                    this.simulatePlayback(this.currentTrack);
                }
                return;
            }

            if (this.player) {
                if (this.isPlaying) {
                    this.player.pauseVideo();
                } else {
                    this.player.playVideo();
                }
            }
        },

        toggleShuffle() {
            this.isShuffled = !this.isShuffled;
            if (this.isShuffled) {
                // Shuffle the queue
                this.queue = this.queue.sort(() => Math.random() - 0.5);
            }
        },

        toggleRepeat() {
            this.isRepeated = !this.isRepeated;
        },

        addToQueue(track) {
            this.queue.push(track);
        },

        clearQueue() {
            this.queue = [];
        },

        removeFromQueue(index) {
            if (index >= 0 && index < this.queue.length) {
                this.queue.splice(index, 1);
            }
        },

        moveInQueue(oldIndex, newIndex) {
            if (oldIndex >= 0 && oldIndex < this.queue.length &&
                newIndex >= 0 && newIndex < this.queue.length) {
                const track = this.queue[oldIndex];
                this.queue.splice(oldIndex, 1);
                this.queue.splice(newIndex, 0, track);
            }
        },

        playNextTrack() {
            if (this.queue.length > 0) {
                const nextTrack = this.queue.shift();
                this.playTrack(nextTrack);
            } else if (this.continuousPlayback && this.relatedSongs.length > 0) {
                // If queue is empty and continuous playback is enabled, play a related song
                this.playTrack(this.relatedSongs[0]);
            }
        },

        playNext() {
            this.playNextTrack();
        },

        playPrevious() {
            this.playPreviousTrack();
        },

        playPreviousTrack() {
            if (this.progress > 5) {
                // If the track has been playing for more than 5 seconds, restart it
                this.seek(0);
            } else if (this.recentlyPlayed.length > 1) {
                // Play the previous track in recently played
                const previousTrack = this.recentlyPlayed[1]; // Current track is at index 0
                this.playTrack(previousTrack);
            }
        },

        toggleQueue() {
            if (this.activeRightPanel === 'queue') {
                this.activeRightPanel = null;
            } else {
                this.activeRightPanel = 'queue';
            }
        },

        toggleRelated() {
            if (this.activeRightPanel === 'related') {
                this.activeRightPanel = null;
            } else {
                this.activeRightPanel = 'related';
            }
        },

        toggleDevices() {
            this.isDevicesVisible = !this.isDevicesVisible;
        },

        setContinuousPlayback(value) {
            this.continuousPlayback = value;
        },

        // Like/unlike songs
        toggleLike(track) {
            if (!track) return;

            const index = this.likedSongs.findIndex(t => t.id === track.id);
            if (index === -1) {
                // Add to liked songs
                this.likedSongs.push(track);
                this.saveLikedSongs();
            } else {
                // Remove from liked songs
                this.likedSongs.splice(index, 1);
                this.saveLikedSongs();
            }
        },

        isLiked(trackId) {
            if (!trackId) return false;
            return this.likedSongs.some(track => track.id === trackId);
        },

        // Save liked songs to localStorage
        saveLikedSongs() {
            try {
                localStorage.setItem('likedSongs', JSON.stringify(this.likedSongs));
            } catch (error) {
                console.error('Error saving liked songs to localStorage:', error);
            }
        },

        // Load liked songs from localStorage
        loadLikedSongs() {
            try {
                const saved = localStorage.getItem('likedSongs');
                if (saved) {
                    this.likedSongs = JSON.parse(saved);
                }
            } catch (error) {
                console.error('Error loading liked songs from localStorage:', error);
            }
        },

        // Volume controls for keyboard shortcuts
        toggleMute() {
            if (this.volume > 0) {
                this.previousVolume = this.volume;
                this.setVolume(0);
            } else {
                this.setVolume(this.previousVolume || 70);
            }
        },

        volumeUp() {
            const newVolume = Math.min(100, this.volume + 10);
            this.setVolume(newVolume);
        },

        volumeDown() {
            const newVolume = Math.max(0, this.volume - 10);
            this.setVolume(newVolume);
        },

        // Add album to queue
        addAlbumToQueue(album) {
            if (!album || !album.id) return;

            // In a real app, we'd fetch all tracks in the album
            this.getAlbumTracks(album.id).then(tracks => {
                if (tracks && tracks.length) {
                    tracks.forEach(track => this.addToQueue(track));
                }
            });
        },

        // Get album tracks
        async getAlbumTracks(albumId) {
            try {
                return await spotifyService.getAlbumTracks(albumId);
            } catch (error) {
                console.error('Error loading album tracks:', error);
                return [];
            }
        }
    }
});
