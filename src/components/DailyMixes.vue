<template>
  <div class="daily-mixes-container">
    <div class="section-header">
      <h2 class="section-title">Made For {{ username }}</h2>
      <div class="see-all">SHOW ALL</div>
    </div>
    <div v-if="dailyMixes.length === 0 && !isLoading" class="empty-state">
      <q-icon name="music_note" size="48px" color="grey-6" />
      <div class="empty-state-text">Listen to more music to get personalized Daily Mixes</div>
    </div>
    <div v-else-if="isLoading" class="daily-mixes-grid">
      <div v-for="i in 6" :key="i" class="daily-mix-card skeleton-card">
        <q-skeleton type="rect" class="daily-mix-image-skeleton" />
        <q-skeleton type="text" width="60%" class="q-mb-sm" />
        <q-skeleton type="text" width="90%" />
      </div>
    </div>
    <div v-else class="daily-mixes-grid">
      <div v-for="(mix, index) in dailyMixes" :key="index" class="daily-mix-card">
        <div class="daily-mix-image">
          <q-img :src="mix.imageUrl" ratio="1">
            <div class="mix-label">{{ String(index + 1).padStart(2, '0') }}</div>
            <div class="play-overlay">
              <q-btn round color="green" icon="play_arrow" class="play-button" size="md" @click.stop="playMix(mix)" />
            </div>
          </q-img>
        </div>
        <div class="daily-mix-title" @click="navigateToMix(mix)">Daily Mix {{ index + 1 }}</div>
        <div class="daily-mix-description">{{ mix.description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useMusicPlayerStore } from '../stores/musicPlayer';
import spotifyService from '../services/spotifyService';

const router = useRouter();
const musicPlayer = useMusicPlayerStore();
const username = ref('');
const dailyMixes = ref([]);
const isLoading = ref(true);
const userHasListeningHistory = ref(false);

// Static mix genre categories
const mixCategories = [
  { genre: 'electronic', imageColor: '#1e3264' },
  { genre: 'hip-hop', imageColor: '#ba5d07' },
  { genre: 'rock', imageColor: '#e13300' },
  { genre: 'indie', imageColor: '#8c67ac' },
  { genre: 'pop', imageColor: '#148a08' },
  { genre: 'ambient', imageColor: '#27856a' }
];

// Navigate to mix details page
const navigateToMix = (mix) => {
  router.push(`/playlist/${mix.id}`);
};

// Play the mix directly
const playMix = (mix) => {
  if (mix && mix.tracks && mix.tracks.length > 0) {
    // Play the first track and queue the rest
    musicPlayer.clearQueue();
    musicPlayer.setQueue(mix.tracks);
    musicPlayer.playTrack(mix.tracks[0]);
  } else {
    // If no tracks available, show notification
    // You can use Quasar's notify plugin or handle this differently
    console.warn('No tracks available in this mix');
  }
};

// Generate artist text from tracks
const getArtistDescriptionFromTracks = (tracks, maxArtists = 3) => {
  if (!tracks || tracks.length === 0) return 'Various Artists';

  // Extract unique artist names
  const artistNames = [...new Set(tracks.flatMap(track =>
    track.artists ? track.artists.map(artist => artist.name) : []))];

  // Take the first few artists and add "and more" if there are more
  if (artistNames.length <= maxArtists) {
    return artistNames.join(', ');
  } else {
    return `${artistNames.slice(0, maxArtists).join(', ')} and more`;
  }
};

// Generate mock image for daily mixes
const generateMixImage = (index) => {
  const color = mixCategories[index % mixCategories.length].imageColor;
  return `https://via.placeholder.com/180x180/${color.replace('#', '')}?text=Mix+${index + 1}`;
};

// Get username from local storage or settings
const getUserPreferences = () => {
  try {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      username.value = storedUsername;
    } else {
      // Default username if not set
      username.value = 'You';
    }

    // Check if user has listening history (in a real app, you'd check the API)
    const hasHistory = localStorage.getItem('hasListeningHistory') === 'true';
    userHasListeningHistory.value = hasHistory;

    return hasHistory;
  } catch (error) {
    console.error('Error getting user preferences:', error);
    username.value = 'You';
    return false;
  }
};

onMounted(async () => {
  isLoading.value = true;

  // Check user preferences first
  const hasHistory = getUserPreferences();

  // If no listening history, don't load mixes
  if (!hasHistory) {
    const recentlyPlayed = musicPlayer.recentlyPlayed;

    // If there are at least a few played tracks, assume user has some history
    if (recentlyPlayed && recentlyPlayed.length >= 3) {
      userHasListeningHistory.value = true;
      localStorage.setItem('hasListeningHistory', 'true');
    } else {
      isLoading.value = false;
      return;
    }
  }

  try {
    // Fetch tracks from Spotify API
    const allTracks = await spotifyService.searchTracks('', 50);

    // Create 6 daily mixes
    const mixes = [];
    for (let i = 0; i < 6; i++) {
      // Get a subset of tracks for this mix
      const startIdx = i * 8;
      const mixTracks = allTracks.slice(startIdx, startIdx + 8);

      // Create mix
      mixes.push({
        id: `daily-mix-${i + 1}`,
        title: `Daily Mix ${i + 1}`,
        description: getArtistDescriptionFromTracks(mixTracks),
        imageUrl: mixTracks.length > 0 && mixTracks[0].album && mixTracks[0].album.images && mixTracks[0].album.images.length > 0
          ? mixTracks[0].album.images[0].url
          : generateMixImage(i),
        tracks: mixTracks
      });
    }

    dailyMixes.value = mixes;
  } catch (error) {
    console.error('Error loading daily mixes:', error);

    // Fallback to static data
    dailyMixes.value = [
      {
        id: 'daily-mix-1',
        title: 'Daily Mix 1',
        description: 'DR MØB, Eternxlize, ZODIVK and more',
        imageUrl: generateMixImage(0),
        tracks: []
      },
      {
        id: 'daily-mix-2',
        title: 'Daily Mix 2',
        description: 'Apollo On The Run, BB Cooper, Crypto and more',
        imageUrl: generateMixImage(1),
        tracks: []
      },
      {
        id: 'daily-mix-3',
        title: 'Daily Mix 3',
        description: 'VALORANT, Arcane, Robin and more',
        imageUrl: generateMixImage(2),
        tracks: []
      },
      {
        id: 'daily-mix-4',
        title: 'Daily Mix 4',
        description: 'Badshah and Diljit Dosanjh',
        imageUrl: generateMixImage(3),
        tracks: []
      },
      {
        id: 'daily-mix-5',
        title: 'Daily Mix 5',
        description: 'Tera Bhai Paul',
        imageUrl: generateMixImage(4),
        tracks: []
      },
      {
        id: 'daily-mix-6',
        title: 'Daily Mix 6',
        description: 'Vitamin String Quartet and more',
        imageUrl: generateMixImage(5),
        tracks: []
      }
    ];
  } finally {
    isLoading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.daily-mixes-container {
  margin-bottom: 32px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 0 8px;

  .section-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fff;
    margin: 0;
  }

  .see-all {
    font-size: 0.875rem;
    font-weight: 600;
    color: #b3b3b3;
    text-transform: uppercase;
    cursor: pointer;
    transition: color 0.2s;

    &:hover {
      color: #fff;
    }
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #181818;
  border-radius: 8px;
  padding: 48px 24px;
  text-align: center;

  .empty-state-text {
    margin-top: 16px;
    color: #b3b3b3;
    font-size: 1rem;
  }
}

.daily-mixes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
}

.daily-mix-card {
  background: #181818;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background: #282828;

    .mix-label {
      opacity: 1;
    }

    .play-overlay {
      opacity: 1;
    }
  }
}

.skeleton-card {
  cursor: default;

  &:hover {
    background: #181818;
  }
}

.daily-mix-image-skeleton {
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  margin-bottom: 16px;
  border-radius: 4px;
}

.daily-mix-image {
  position: relative;
  margin-bottom: 16px;
  border-radius: 4px;
  overflow: hidden;

  .mix-label {
    position: absolute;
    bottom: 8px;
    right: 8px;
    background-color: rgba(0, 0, 0, 0.7);
    color: #fff;
    font-size: 1.5rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: 4px;
    opacity: 0.8;
    transition: opacity 0.3s;
    z-index: 2;
  }

  .play-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
    z-index: 1;
  }

  .play-button {
    transform: translateY(8px);
    transition: transform 0.3s;
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);

    &:hover {
      transform: translateY(8px) scale(1.1);
    }
  }
}

.daily-mix-title {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.daily-mix-description {
  font-size: 0.875rem;
  color: #b3b3b3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}

@media (max-width: 768px) {
  .daily-mixes-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
  }
}
</style>
