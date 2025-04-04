<template>
  <div class="podcasts-container">
    <div class="section-header">
      <h2 class="section-title">Podcasts</h2>
      <div class="see-all" @click="navigateTo('/podcasts')">SHOW ALL</div>
    </div>
    <div v-if="isLoading" class="podcasts-grid">
      <div v-for="i in 6" :key="i" class="podcast-card skeleton-card">
        <q-skeleton type="rect" class="podcast-image-skeleton" />
        <q-skeleton type="text" width="70%" class="q-mb-sm" />
        <q-skeleton type="text" width="50%" />
      </div>
    </div>
    <div v-else-if="podcasts.length === 0" class="empty-state">
      <q-icon name="podcasts" size="48px" color="grey-6" />
      <div class="empty-state-text">Follow podcasts to see them here</div>
      <q-btn unelevated rounded color="green" label="Browse podcasts" class="browse-btn" @click="navigateTo('/podcasts')" />
    </div>
    <div v-else class="podcasts-grid">
      <div v-for="(podcast, index) in podcasts" :key="podcast.id || index" class="podcast-card">
        <div class="podcast-image">
          <q-img :src="podcast.imageUrl" ratio="1">
            <div class="play-overlay">
              <q-btn round color="green" icon="play_arrow" class="play-button" size="md" @click.stop="playPodcast(podcast)" />
            </div>
          </q-img>
        </div>
        <div class="podcast-title" @click="navigateToShow(podcast)">{{ podcast.name }}</div>
        <div class="podcast-creator">{{ podcast.publisher }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMusicPlayerStore } from '../stores/musicPlayer';
import spotifyService from '../services/spotifyService';

const router = useRouter();
const musicPlayer = useMusicPlayerStore();
const podcasts = ref([]);
const isLoading = ref(true);
const userFollowsPodcasts = ref(false);

// Default podcast data for fallback
const DEFAULT_PODCASTS = [
  {
    id: 'joe-rogan',
    name: 'The Joe Rogan Experience',
    publisher: 'Joe Rogan',
    imageUrl: 'https://via.placeholder.com/180x180/27856a/FFFFFF?text=JRE',
    episodes: []
  },
  {
    id: 'armchair-expert',
    name: 'Armchair Expert',
    publisher: 'Dax Shepard',
    imageUrl: 'https://via.placeholder.com/180x180/1e3264/FFFFFF?text=Armchair',
    episodes: []
  },
  {
    id: 'daily',
    name: 'The Daily',
    publisher: 'The New York Times',
    imageUrl: 'https://via.placeholder.com/180x180/8c67ac/FFFFFF?text=Daily',
    episodes: []
  },
  {
    id: 'crime-junkie',
    name: 'Crime Junkie',
    publisher: 'audiochuck',
    imageUrl: 'https://via.placeholder.com/180x180/ba5d07/FFFFFF?text=Crime',
    episodes: []
  },
  {
    id: 'ted-talks-daily',
    name: 'TED Talks Daily',
    publisher: 'TED',
    imageUrl: 'https://via.placeholder.com/180x180/e13300/FFFFFF?text=TED',
    episodes: []
  },
  {
    id: 'stuff-you-should-know',
    name: 'Stuff You Should Know',
    publisher: 'iHeartPodcasts',
    imageUrl: 'https://via.placeholder.com/180x180/148a08/FFFFFF?text=SYSK',
    episodes: []
  }
];

// Navigate to any page
const navigateTo = (path) => {
  router.push(path);
};

// Navigate to podcast show page
const navigateToShow = (podcast) => {
  router.push(`/show/${podcast.id}`);
};

// Play a podcast episode
const playPodcast = (podcast) => {
  if (podcast.episodes && podcast.episodes.length > 0) {
    // Play the first episode
    musicPlayer.playTrack(podcast.episodes[0]);
  } else {
    // Try to fetch episodes
    fetchPodcastEpisodes(podcast).then(episodes => {
      if (episodes && episodes.length > 0) {
        musicPlayer.playTrack(episodes[0]);
      } else {
        console.warn('No episodes available for this podcast');
        // Could show notification here
      }
    }).catch(error => {
      console.error('Error fetching podcast episodes:', error);
    });
  }
};

// Fetch podcast episodes (simulated)
const fetchPodcastEpisodes = async (podcast) => {
  try {
    // In a real implementation, this would call the API to get episodes
    // For now, we'll simulate by searching for tracks
    const episodes = await spotifyService.searchTracks(`${podcast.name} podcast`, 5);
    podcast.episodes = episodes;
    return episodes;
  } catch (error) {
    console.error('Error fetching podcast episodes:', error);
    return [];
  }
};

// Check user's podcast preferences
const checkUserPodcastPreferences = () => {
  try {
    // In a real app, this would be from the user's profile/API
    const followedPodcasts = localStorage.getItem('followedPodcasts');
    if (followedPodcasts) {
      // User follows podcasts
      userFollowsPodcasts.value = true;
      return true;
    }

    return false;
  } catch (error) {
    console.error('Error checking user podcast preferences:', error);
    return false;
  }
};

// Load podcasts data
const loadPodcasts = async () => {
  isLoading.value = true;

  // Check if user follows any podcasts
  const hasFollowedPodcasts = checkUserPodcastPreferences();

  // If user doesn't follow any podcasts, we'll show the empty state
  if (!hasFollowedPodcasts) {
    // Check if they've listened to any podcasts recently
    const hasRecentPodcasts = localStorage.getItem('hasListenedToPodcasts') === 'true';

    if (!hasRecentPodcasts) {
      isLoading.value = false;
      podcasts.value = [];
      return;
    }
  }

  try {
    // Search for podcasts through the Spotify API
    // Since spotifyService doesn't have a dedicated podcast method, we'll search for podcast episodes
    const results = await spotifyService.searchTracks('podcast', 12);

    // Extract unique podcasts from the results
    const podcastsMap = new Map();

    results.forEach(item => {
      // If the track has show information, it's likely a podcast
      if (item.album && !podcastsMap.has(item.album.id)) {
        podcastsMap.set(item.album.id, {
          id: item.album.id,
          name: item.album.name,
          publisher: item.artists && item.artists.length > 0 ? item.artists[0].name : 'Unknown Publisher',
          imageUrl: item.album.images && item.album.images.length > 0
            ? item.album.images[0].url
            : `https://via.placeholder.com/180x180?text=${encodeURIComponent(item.album.name)}`,
          episodes: [item] // Add the track as the first episode
        });
      } else if (item.album && podcastsMap.has(item.album.id)) {
        // Add this track to the podcast's episodes
        const podcast = podcastsMap.get(item.album.id);
        podcast.episodes.push(item);
      }
    });

    // Convert to array and take first 6
    const podcastList = Array.from(podcastsMap.values()).slice(0, 6);

    if (podcastList.length > 0) {
      podcasts.value = podcastList;
    } else {
      // If no podcasts found, use default data
      podcasts.value = DEFAULT_PODCASTS;
    }
  } catch (error) {
    console.error('Error loading podcasts:', error);
    // Use fallback data
    podcasts.value = DEFAULT_PODCASTS;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadPodcasts();
});
</script>

<style lang="scss" scoped>
.podcasts-container {
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
    margin-bottom: 24px;
    color: #b3b3b3;
    font-size: 1rem;
  }

  .browse-btn {
    font-weight: 600;
  }
}

.podcasts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
}

.podcast-card {
  background: #181818;
  padding: 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background: #282828;

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

.podcast-image-skeleton {
  width: 100%;
  height: 0;
  padding-bottom: 100%;
  margin-bottom: 16px;
  border-radius: 4px;
}

.podcast-image {
  position: relative;
  margin-bottom: 16px;
  border-radius: 4px;
  overflow: hidden;

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

.podcast-title {
  font-size: 1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.podcast-creator {
  font-size: 0.875rem;
  color: #b3b3b3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (max-width: 768px) {
  .podcasts-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
  }
}
</style>
