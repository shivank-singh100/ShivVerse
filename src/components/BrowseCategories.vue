<template>
  <div class="browse-categories-container">
    <div class="section-header">
      <h2 class="section-title">Browse Categories</h2>
      <div class="see-all" @click="navigateToAllGenres">SHOW ALL</div>
    </div>
    <div v-if="isLoading" class="categories-grid">
      <div v-for="i in 8" :key="i" class="category-card skeleton-card">
        <q-skeleton type="text" width="40%" height="24px" class="q-mb-lg" />
      </div>
    </div>
    <div v-else class="categories-grid">
      <div
        v-for="category in displayCategories"
        :key="category.id"
        class="category-card"
        @click="navigateToGenre(category)"
        :style="{ backgroundColor: category.color }"
      >
        <h3 class="category-name">{{ category.name }}</h3>
        <div class="category-image" v-if="category.imageUrl">
          <q-img :src="category.imageUrl" ratio="1" fit="contain" position="bottom right" />
        </div>
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
const categories = ref([]);
const isLoading = ref(true);
const userGenrePreferences = ref([]);

// Default categories with predefined colors
const DEFAULT_CATEGORIES = [
  { id: 'pop', name: 'Pop', color: '#8c67ac', imageUrl: 'https://via.placeholder.com/100x100/8c67ac/FFFFFF?text=Pop' },
  { id: 'hip-hop', name: 'Hip Hop', color: '#ba5d07', imageUrl: 'https://via.placeholder.com/100x100/ba5d07/FFFFFF?text=Hip+Hop' },
  { id: 'electronic', name: 'Electronic', color: '#1e3264', imageUrl: 'https://via.placeholder.com/100x100/1e3264/FFFFFF?text=Electronic' },
  { id: 'rock', name: 'Rock', color: '#e13300', imageUrl: 'https://via.placeholder.com/100x100/e13300/FFFFFF?text=Rock' },
  { id: 'indie', name: 'Indie', color: '#148a08', imageUrl: 'https://via.placeholder.com/100x100/148a08/FFFFFF?text=Indie' },
  { id: 'r-n-b', name: 'R&B', color: '#dc148c', imageUrl: 'https://via.placeholder.com/100x100/dc148c/FFFFFF?text=R%26B' },
  { id: 'k-pop', name: 'K-Pop', color: '#ff4632', imageUrl: 'https://via.placeholder.com/100x100/ff4632/FFFFFF?text=K-Pop' },
  { id: 'gaming', name: 'Gaming', color: '#27856a', imageUrl: 'https://via.placeholder.com/100x100/27856a/FFFFFF?text=Gaming' }
];

// Predefined colors to assign to categories from the API
const CATEGORY_COLORS = [
  '#8c67ac', '#ba5d07', '#1e3264', '#e13300',
  '#148a08', '#dc148c', '#ff4632', '#27856a',
  '#777777', '#503750', '#509bf5', '#974ec3',
  '#e8115b', '#777777', '#b49bc8', '#f59b23'
];

// Display 8 categories, prioritizing user preferences
const displayCategories = computed(() => {
  // Start with user preferences
  let prioritizedCategories = [...categories.value];

  // If user has preferences, move them to the front
  if (userGenrePreferences.value.length > 0) {
    // Filter out preferred genres from the main list
    const preferredGenres = userGenrePreferences.value;
    const nonPreferredCategories = prioritizedCategories.filter(
      cat => !preferredGenres.includes(cat.id)
    );

    // Find categories matching preferences
    const preferredCategories = preferredGenres
      .map(genreId => prioritizedCategories.find(cat => cat.id === genreId))
      .filter(Boolean); // Remove any undefined values

    // Combine with preferred genres first
    prioritizedCategories = [...preferredCategories, ...nonPreferredCategories];
  }

  return prioritizedCategories.slice(0, 8);
});

// Navigate to genre page
const navigateToGenre = (category) => {
  // Track user interaction with this genre
  trackGenreInteraction(category.id);

  // Navigate to the genre page
  router.push(`/genre/${category.id}`);
};

// Navigate to all genres page
const navigateToAllGenres = () => {
  router.push('/genres');
};

// Track user interaction with a genre
const trackGenreInteraction = (genreId) => {
  try {
    // Get existing preferences
    const existingPrefs = localStorage.getItem('genrePreferences');
    let prefs = existingPrefs ? JSON.parse(existingPrefs) : [];

    // Remove this genre if it exists
    prefs = prefs.filter(id => id !== genreId);

    // Add to the front (most recent)
    prefs.unshift(genreId);

    // Keep only the 5 most recent
    prefs = prefs.slice(0, 5);

    // Save back to storage
    localStorage.setItem('genrePreferences', JSON.stringify(prefs));

    // Update our local preferences
    userGenrePreferences.value = prefs;
  } catch (error) {
    console.error('Error tracking genre interaction:', error);
  }
};

// Fetch user genre preferences
const getUserGenrePreferences = () => {
  try {
    const prefs = localStorage.getItem('genrePreferences');
    if (prefs) {
      userGenrePreferences.value = JSON.parse(prefs);
    }
  } catch (error) {
    console.error('Error getting user genre preferences:', error);
  }
};

// Load genre categories
const loadCategories = async () => {
  isLoading.value = true;

  // Get user preferences first
  getUserGenrePreferences();

  try {
    // Try to get categories from Spotify API through searches for different genres
    const genreQueries = ['pop', 'rock', 'hip-hop', 'electronic', 'indie', 'jazz', 'r&b', 'classical'];

    // Add user preferences to the queries if they exist
    if (userGenrePreferences.value.length > 0) {
      // Add any user preferences that aren't already in the queries
      userGenrePreferences.value.forEach(pref => {
        if (!genreQueries.includes(pref)) {
          genreQueries.unshift(pref);
        }
      });

      // Keep the list to a reasonable size
      genreQueries.splice(12);
    }

    const searchPromises = genreQueries.map(genre => spotifyService.searchTracks(genre, 1));

    // Process results to extract genre information
    const results = await Promise.allSettled(searchPromises);
    const processedCategories = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value && result.value.length > 0) {
        const track = result.value[0];
        const genre = genreQueries[index];

        if (track && track.album && track.album.images && track.album.images.length > 0) {
          processedCategories.push({
            id: genre,
            name: genre.charAt(0).toUpperCase() + genre.slice(1).replace('-', ' '),
            color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
            imageUrl: track.album.images[0].url
          });
        }
      }
    });

    if (processedCategories.length > 0) {
      categories.value = processedCategories;
    } else {
      // Use default categories if no API data
      categories.value = DEFAULT_CATEGORIES;
    }
  } catch (error) {
    console.error('Error loading categories:', error);
    // Use fallback data
    categories.value = DEFAULT_CATEGORIES;
  } finally {
    isLoading.value = false;
  }
};

// Play a genre playlist
const playGenre = (category) => {
  // Track user interaction
  trackGenreInteraction(category.id);

  // Search for tracks in this genre
  spotifyService.searchTracks(category.id, 20).then(tracks => {
    if (tracks && tracks.length > 0) {
      // Create a playlist from these tracks
      musicPlayer.clearQueue();
      musicPlayer.setQueue(tracks);
      musicPlayer.playTrack(tracks[0]);
    }
  }).catch(error => {
    console.error(`Error playing genre ${category.id}:`, error);
  });
};

onMounted(() => {
  loadCategories();
});
</script>

<style lang="scss" scoped>
.browse-categories-container {
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

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
}

.category-card {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1 / 1;
  cursor: pointer;
  transition: all 0.3s ease;
  padding: 16px;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);

    .category-image {
      transform: rotate(25deg) translate(10%, 10%) scale(1.1);
    }
  }
}

.skeleton-card {
  background-color: #181818;
  cursor: default;

  &:hover {
    transform: none;
    box-shadow: none;
  }
}

.category-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  z-index: 2;
}

.category-image {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 40%;
  height: 40%;
  transform: rotate(25deg) translate(15%, 15%);
  z-index: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3));
  transition: transform 0.3s ease;
}

@media (max-width: 768px) {
  .categories-grid {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 16px;
  }

  .category-name {
    font-size: 1rem;
  }
}
</style>
