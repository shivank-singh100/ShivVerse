// Initialize YouTube API
import { boot } from 'quasar/wrappers';
import { useMusicPlayerStore } from '../stores/musicPlayer';

// This is for when window.onYouTubeIframeAPIReady gets called
let musicPlayerStore = null;

// Global flag to track YouTube API readiness
window.isYouTubeAPIReady = false;

export default boot(({ app }) => {
    console.log('Initializing YouTube API boot file');

    // Define global callback for YouTube API
    window.onYouTubeIframeAPIReady = function () {
        console.log('YouTube IFrame API is ready!');
        window.isYouTubeAPIReady = true;

        // Initialize the music player store with YouTube ready state
        if (musicPlayerStore) {
            console.log('Setting YouTube ready in music player store');
            musicPlayerStore.setYouTubeReady();
        } else {
            console.warn('Music player store not initialized yet, will be set when accessed');
            // Create a global reference so we can set it as soon as possible
            window.youtubeReadyCallback = function (store) {
                console.log('Delayed YouTube ready callback executed');
                store.setYouTubeReady();
            };
        }
    };

    // Get store reference (if Pinia is ready)
    try {
        musicPlayerStore = useMusicPlayerStore();

        // If YouTube API was already loaded before we got the store reference
        if (window.YT && window.YT.Player) {
            console.log('YouTube API was already ready, initializing player now');
            musicPlayerStore.setYouTubeReady();
        } else if (window.youtubeReadyCallback) {
            // If the callback was saved globally, use it
            console.log('Using delayed YouTube ready callback');
            window.youtubeReadyCallback(musicPlayerStore);
            window.youtubeReadyCallback = null; // Clean up
        }
    } catch (e) {
        console.warn('Could not access music player store yet:', e.message);
        // Will retry when YouTube API is ready via the global callback
    }

    // Load the YouTube API script if not already loaded
    if (!document.getElementById('youtube-api') && !window.YT) {
        const tag = document.createElement('script');
        tag.id = 'youtube-api';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        console.log('Injected YouTube API script from boot file');
    } else if (window.YT && window.YT.Player) {
        console.log('YouTube API already loaded, initializing player');
        window.onYouTubeIframeAPIReady();
    }
});
