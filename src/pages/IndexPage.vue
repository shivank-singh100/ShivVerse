<template>
  <q-page class="home-page">
    <!-- Optional: Greeting -->
    <div class="q-pa-md page-header">
      <h1 class="greeting text-h4 text-weight-bold text-white">{{ greeting }}</h1>
    </div>

    <!-- Good Morning/Afternoon/Evening Playlists -->
    <div class="q-pa-md">
      <div class="section quick-picks">
        <div class="spotify-grid-condensed">
          <div v-for="item in quickPicks" :key="item.id" class="quick-pick-card" @click="playItem(item)">
            <q-img :src="item.image" class="quick-pick-image" />
            <div class="quick-pick-title">{{ item.name }}</div>
            <div class="play-overlay-quick">
              <q-btn round color="primary" icon="play_arrow" size="md" @click.stop="playItem(item)" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content Grid Sections -->
    <div class="q-px-md">
      <!-- Made For You / Personalized -->
      <div class="section">
        <div class="section-header">
          <h2 class="text-h5 text-weight-bold text-white">{{ personalizedTitle }}</h2>
          <router-link to="/section/made-for-you" class="see-more-btn">Show all</router-link>
        </div>
        <div class="spotify-grid">
          <div v-for="playlist in personalizedPlaylists" :key="playlist.id" class="grid-item">
            <div class="item-card" @click="navigateToPlaylist(playlist)">
              <div class="item-artwork">
                <q-img :src="playlist.image" class="artwork-image" />
                <div class="play-overlay">
                  <q-btn round color="primary" icon="play_arrow" size="md" @click.stop="playPlaylist(playlist)" />
                </div>
                <div v-if="playlist.type === 'daily-mix'" class="daily-mix-label">
                  {{ playlist.mixNumber }}
                </div>
              </div>
              <div class="item-title" :title="playlist.name">{{ playlist.name }}</div>
              <div class="item-subtitle" :title="playlist.description">{{ playlist.description }}</div>
            </div>
          </div>
          <q-inner-loading :showing="isLoading.personalized" color="primary" dark />
        </div>
      </div>

      <!-- Recently Played -->
      <div class="section">
        <div class="section-header">
          <h2 class="text-h5 text-weight-bold text-white">Recently Played</h2>
          <router-link to="/section/recently-played" class="see-more-btn">Show all</router-link>
        </div>
        <div class="spotify-grid">
          <div v-for="item in recentlyPlayed" :key="item.played_at" class="grid-item">
            <div class="item-card" @click="playItem(item.track || item.context)">
              <div class="item-artwork">
                <q-img :src="item.track.album.images[0].url" class="artwork-image" />
                <div class="play-overlay">
                  <q-btn round color="primary" icon="play_arrow" size="md" @click.stop="playItem(item.track)" />
                </div>
              </div>
              <div class="item-title" :title="item.track.name">{{ item.track.name }}</div>
              <div class="item-subtitle">{{ item.track.artists[0].name }}</div>
            </div>
          </div>
          <q-inner-loading :showing="isLoading.recent" color="primary" dark />
        </div>
      </div>

      <!-- Other Sections (New Releases, Featured Playlists, Artists, Categories etc.) -->
      <!-- Add similar structures for other sections based on Spotify API data -->

    </div>

    <!-- Keyboard Shortcuts Hint (Optional) -->
    <!-- <div class="keyboard-shortcuts-hint">...</div> -->

  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useQuasar } from 'quasar'
// Mock services/stores - Replace with actual API calls
import spotifyService from '../services/spotifyService'
import { useMusicPlayerStore } from '../stores/musicPlayer'

defineOptions({
  name: 'IndexPage'
})

const router = useRouter()
const $q = useQuasar()
const musicPlayer = useMusicPlayerStore()

const isLoading = ref({
  quickPicks: false,
  personalized: false,
  recent: false,
  // Add other sections
})

const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
})

const personalizedTitle = computed(() => {
  // Can vary based on time or user data
  return `Made For User` // Placeholder
})

const quickPicks = ref([])
const personalizedPlaylists = ref([])
const recentlyPlayed = ref([])

// --- Mock Data & Functions (Replace with API calls) ---

const fetchQuickPicks = async () => {
  isLoading.value.quickPicks = true;
  // Simulate API call - Fetch liked songs, top tracks/artists, recent playlists
  await new Promise(resolve => setTimeout(resolve, 800));
  quickPicks.value = [
    { id: 'liked', name: 'Liked Songs', image: 'https://t.scdn.co/images/3099b3803ad9496896c43f22fe9be8c4.png', type: 'playlist' },
    { id: 'mix1', name: 'Daily Mix 1', image: 'https://dailymix-images.scdn.co/v2/img/ab6761610000e5eb8ae7f2aaa9817a704a87ea36/1/en/large', type: 'playlist' },
    { id: 'artist1', name: 'Imagine Dragons', image: 'https://i.scdn.co/image/ab6761610000e5eb920dc1e0f00bad3853499362', type: 'artist' },
    // ... add more based on real data patterns
  ].slice(0, 6); // Max 6-8 quick picks
  isLoading.value.quickPicks = false;
};

const fetchPersonalizedPlaylists = async () => {
  isLoading.value.personalized = true;
  await new Promise(resolve => setTimeout(resolve, 1000));
  personalizedPlaylists.value = [
    { id: '37i9dQZF1E36 KouvjJtSg', name: 'Daily Mix 1', description: 'DR MØB, ZODIVK, Eternxl and more', image: 'https://dailymix-images.scdn.co/v2/img/ab6761610000e5eb8ae7f2aaa9817a704a87ea36/1/en/large', type: 'daily-mix', mixNumber: 1 },
    { id: '37i9dQZF1E38 Lh6gJ7gPb', name: 'Daily Mix 2', description: 'Apollo On The Run, BB Cooper and more', image: 'https://dailymix-images.scdn.co/v2/img/ab6761610000e5eb7261fa84150406631b3a5550/2/en/large', type: 'daily-mix', mixNumber: 2 },
    { id: '37i9dQZF1E37 QsZ9x9t2W', name: 'Daily Mix 3', description: 'VALORANT, Arcane, Robin and more', image: 'https://dailymix-images.scdn.co/v2/img/ab6761610000e5eb9cb99140ccf551866834d97f/3/en/large', type: 'daily-mix', mixNumber: 3 },
    { id: '37i9dQZF1DXcBWIGoYBM5M', name: 'Release Radar', description: 'Catch all the latest music from artists you follow.', image: 'https://newjams-images.scdn.co/v2/img/ab6761610000e5eb8008609518302e1f3841b3e0/en/large', type: 'playlist' },
    // ... add Discover Weekly etc.
  ];
  isLoading.value.personalized = false;
};

const fetchRecentlyPlayed = async () => {
  isLoading.value.recent = true;
  try {
    // Replace with actual API call: const response = await spotifyService.getRecentlyPlayed( { limit: 10 } );
    await new Promise(resolve => setTimeout(resolve, 900));
    // Mock response structure similar to Spotify API
    recentlyPlayed.value = [
      { played_at: '2023-10-27T10:00:00Z', track: { id: 'track1', name: 'Sharks', artists: [{ name: 'Imagine Dragons' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b273b2b2e59d5c3c7a7a4b0e5b8e' }] } } },
      { played_at: '2023-10-27T09:55:00Z', track: { id: 'track2', name: 'Enemy', artists: [{ name: 'Imagine Dragons' }], album: { images: [{ url: 'https://i.scdn.co/image/ab67616d0000b2730f90a7f0d3b5b1e9c0b3e1f3' }] } } },
      // ... more items
    ];
    // Filter out duplicates if necessary
  } catch (error) {
    console.error("Error fetching recently played:", error);
  } finally {
    isLoading.value.recent = false;
  }
};

// --- Navigation & Playback ---

const playItem = (item) => {
  console.log("Play item:", item);
  if (!item) return;
  if (item.type === 'track') {
    musicPlayer.playTrack(item);
  } else if (item.type === 'playlist' || item.type === 'album' || item.type === 'artist') {
    // Fetch context and play (e.g., first track of playlist)
    // musicPlayer.playContext(item.uri or item.id, item.type);
    $q.notify({ type: 'positive', message: `Playing ${item.name}` });
  }
};

const navigateToPlaylist = (playlist) => {
  router.push(`/playlist/${playlist.id}`);
};

const playPlaylist = (playlist) => {
  playItem(playlist);
};

// --- Lifecycle Hook ---

onMounted(() => {
  fetchQuickPicks();
  fetchPersonalizedPlaylists();
  fetchRecentlyPlayed();
  // Fetch other sections
});

</script>

<style lang="scss">
.home-page {
  background: #121212; // Spotify's main background
  min-height: calc(100vh - 60px - 90px); // Full height minus header and player
  padding-bottom: 90px; // Space for player bar
  width: 100%;
  overflow-x: hidden;
}

.page-header {
  padding-top: 24px;
  padding-bottom: 16px;
}

.greeting {
  margin: 0;
}

.section {
  margin-bottom: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .text-h5 {
    margin: 0;
    // Adapt font size if needed
  }

  .see-more-btn {
    color: #b3b3b3;
    font-size: 0.8rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
      color: white;
      text-decoration: underline;
    }
  }
}

// Condensed Grid for Quick Picks
.spotify-grid-condensed {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); // Adjust minmax
  gap: 16px;
}

.quick-pick-card {
  background-color: hsla(0, 0%, 100%, .1);
  border-radius: 4px;
  overflow: hidden;
  display: flex;
  align-items: center;
  height: 80px; // Spotify's height
  position: relative;
  transition: background-color 0.3s ease;
  cursor: pointer;

  &:hover {
    background-color: hsla(0, 0%, 100%, .2);

    .play-overlay-quick {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

.quick-pick-image {
  width: 80px;
  height: 80px;
  border-radius: 4px 0 0 4px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, .5);
}

.quick-pick-title {
  color: white;
  font-weight: 700;
  font-size: 1rem;
  padding: 0 16px;
  flex: 1;
  // Text overflow handling if needed
  white-space: normal;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.play-overlay-quick {
  position: absolute;
  right: 16px;
  bottom: 16px;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.3s ease, transform 0.3s ease;

  .q-btn {
    background: #1db954;
    box-shadow: 0 8px 8px rgba(0, 0, 0, .3);

    &:hover {
      transform: scale(1.05);
      background: #1ed760;
    }
  }
}

// Standard Grid
.spotify-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;

  @media (max-width: $breakpoint-xs-max) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
  }
}

.item-card {
  background: #181818;
  border-radius: 8px;
  padding: 16px;
  height: 100%;
  cursor: pointer;
  transition: background-color 0.3s ease;
  position: relative;
  // Removed box-shadow for Spotify flat look

  &:hover {
    background: #282828;

    .play-overlay {
      opacity: 1;
      transform: translateY(0); // Animate from bottom
    }
  }
}

.item-artwork {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  margin-bottom: 16px;
  border-radius: 6px; // Slightly rounded, adjust if needed
  overflow: hidden;
  box-shadow: 0 8px 24px rgba(0, 0, 0, .5); // Common Spotify shadow

  &.circle {
    border-radius: 50%;

    .artwork-image {
      border-radius: 50%;
    }
  }
}

.artwork-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  bottom: 8px;
  right: 8px;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.3s ease, transform 0.3s ease;
  z-index: 3;
  pointer-events: none;

  .q-btn {
    background: #1db954;
    color: black; // Icon color
    box-shadow: 0 8px 8px rgba(0, 0, 0, .3);
    pointer-events: auto;
    transition: transform 0.2s ease, background-color 0.2s ease;

    &:hover {
      transform: scale(1.05);
      background: #1ed760;
    }
  }
}

.daily-mix-label {
  // Re-evaluate if needed or handle via title/description
  position: absolute;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 4px 8px;
  font-size: 0.7rem;
  border-radius: 0 0 0 6px;
  font-weight: 500;
}

.item-title {
  color: white;
  font-weight: 700; // Bolder title
  font-size: 1rem;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.item-subtitle {
  color: #b3b3b3;
  font-size: 0.875rem; // Slightly larger subtitle
  white-space: normal; // Allow wrapping
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2; // Limit to 2 lines
  -webkit-box-orient: vertical;
  line-height: 1.3;
}

// Inner Loading specific style for dark theme
.q-inner-loading {
  background: rgba(0, 0, 0, 0.5);
}
</style>
