<template>
  <div id="q-app">
    <router-view />
    <MusicPlayer />
    <RightPanel />
    <div id="youtube-player"></div>
  </div>
</template>

<script>
import { defineComponent, onMounted } from 'vue'
import MusicPlayer from './components/MusicPlayer.vue'
import RightPanel from './components/RightPanel.vue'
import { useMusicPlayerStore } from './stores/musicPlayer'
import spotifyService from './services/spotifyService'

export default defineComponent({
  name: 'App',
  components: {
    MusicPlayer,
    RightPanel
  },
  setup() {
    const musicPlayer = useMusicPlayerStore()

    onMounted(() => {
      console.log('App mounted - initializing services')

      // Initialize Spotify API connection
      spotifyService.getAccessToken().then(token => {
        console.log('Spotify API initialized:', !!token)
        if (!token) {
          console.warn('Using mock data for Spotify services')
        }
      })

      // Load new releases
      musicPlayer.loadNewReleases()
    })

    return {
    }
  }
})
</script>

<style>
/* Apply global styles */
:root {
  --brand-color: #1DB954;
  --background-color: #121212;
  --surface-color: #181818;
  --text-primary: #FFFFFF;
  --text-secondary: #B3B3B3;
  --highlight-color: rgba(255, 255, 255, 0.1);
}

body {
  font-family: 'Montserrat', sans-serif;
  margin: 0;
  padding: 0;
  background-color: var(--background-color);
  color: var(--text-primary);
}

/* Custom Scrollbar */
::-webkit-scrollbar {
  width: 12px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background: #535353;
  border-radius: 10px;
  border: 3px solid var(--background-color);
}

::-webkit-scrollbar-thumb:hover {
  background: #7f7f7f;
}

/* Hidden player */
#youtube-player {
  position: fixed;
  left: -9999px;
  top: -9999px;
  width: 1px;
  height: 1px;
}

/* Keyboard shortcuts hint */
.keyboard-shortcuts-hint {
  position: fixed;
  bottom: 100px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(40, 40, 40, 0.8);
  color: white;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 0.8rem;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(4px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.keyboard-shortcuts-hint kbd {
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  padding: 2px 5px;
  margin: 0 3px;
  font-family: monospace;
}
</style>
