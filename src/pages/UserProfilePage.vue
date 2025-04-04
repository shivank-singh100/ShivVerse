<template>
 <q-page class="profile-page q-pa-md">
    <div class="profile-container" v-if="isLoggedIn">
      <!-- User Info Header -->
      <div class="user-header q-mb-xl">
        <div class="row items-center">
          <q-avatar size="160px" class="q-mr-lg">
            <q-img :src="userAvatar" />
          </q-avatar>

          <div class="user-info">
            <div class="text-caption text-grey q-mb-sm">Profile</div>
            <h1 class="text-h3 q-mb-md">{{ user.username }}</h1>
            <div class="stats row items-center q-gutter-x-md">
              <div class="text-caption">
                <span class="text-bold">{{ playlistCount }}</span> Playlists
              </div>
              <div class="text-caption">
                <span class="text-bold">{{ likedSongsCount }}</span> Liked Songs
              </div>
              <div class="text-caption">
                <span class="text-bold">{{ followingCount }}</span> Following
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recommendations Section -->
      <div class="recommendations-section">
        <h2 class="text-h5 q-mb-md">Your Recommendations</h2>

        <!-- Loading state -->
        <div v-if="loading" class="text-center q-pa-xl">
          <q-spinner color="primary" size="3em" />
          <div class="q-mt-md text-grey">Loading your personalized recommendations...</div>
        </div>

        <!-- Recommendations display -->
        <div v-else>
          <h3 class="text-h6 q-mb-sm">Based on your listening history</h3>
          <div class="row q-col-gutter-md q-mb-xl">
            <div v-for="(track, index) in personalizedRecommendations" :key="index" class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
              <q-card flat class="track-card bg-dark">
                <q-img
                  :src="track.albumCover || 'https://placehold.co/400x400?text=No+Image'"
                  :ratio="1"
                  class="track-image"
                />
                <q-card-section class="q-pb-none">
                  <div class="text-subtitle1 ellipsis">{{ track.title }}</div>
                  <div class="text-caption text-grey ellipsis">{{ track.artist }}</div>
                </q-card-section>
                <q-card-actions align="right">
                  <q-btn flat round color="white" icon="favorite_border" size="sm" />
                  <q-btn flat round color="white" icon="play_arrow" size="sm" />
                </q-card-actions>
              </q-card>
            </div>
          </div>

          <h3 class="text-h6 q-mb-sm">Discover something new</h3>
          <div class="row q-col-gutter-md">
            <div v-for="(track, index) in discoveryRecommendations" :key="index" class="col-xs-12 col-sm-6 col-md-4 col-lg-3">
              <q-card flat class="track-card bg-dark">
                <q-img
                  :src="track.albumCover || 'https://placehold.co/400x400?text=No+Image'"
                  :ratio="1"
                  class="track-image"
                />
                <q-card-section class="q-pb-none">
                  <div class="text-subtitle1 ellipsis">{{ track.title }}</div>
                  <div class="text-caption text-grey ellipsis">{{ track.artist }}</div>
                </q-card-section>
                <q-card-actions align="right">
                  <q-btn flat round color="white" icon="favorite_border" size="sm" />
                  <q-btn flat round color="white" icon="play_arrow" size="sm" />
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Not logged in state -->
    <div v-else class="login-prompt text-center q-pa-xl">
      <q-icon name="account_circle" size="6em" color="grey-7" />
      <h2 class="text-h5 q-mt-md q-mb-sm">Profile not available</h2>
      <p class="text-body1 q-mb-lg">Please log in to view your profile and get personalized recommendations.</p>
      <div class="row justify-center q-gutter-sm">
        <q-btn color="primary" label="Log In" to="/auth/login" no-caps unelevated />
        <q-btn outline color="grey" label="Sign Up" to="/auth/signup" no-caps />
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import authService from '../services/authService';
import userPreferencesService from '../services/userPreferencesService';
import recommendationService from '../services/recommendationService';

// User data and authentication state
const isLoggedIn = computed(() => authService.isLoggedIn());
const user = computed(() => authService.getCurrentUser() || {});

// Stats
const playlistCount = ref(0);
const likedSongsCount = ref(0);
const followingCount = ref(0);

// Recommendations
const loading = ref(true);
const personalizedRecommendations = ref([]);
const discoveryRecommendations = ref([]);

// Get user avatar or default placeholder
const userAvatar = computed(() => {
  return user.value && user.value.avatar
    ? user.value.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user.value?.username || 'User')}&size=160&background=1D1D1D&color=fff`;
});

// Load user data and recommendations
const loadUserData = async () => {
  if (!isLoggedIn.value) return;

  try {
    loading.value = true;

    // Get user preferences
    const preferences = userPreferencesService.getUserPreferences();

    // Set user stats based on preferences
    if (preferences) {
      likedSongsCount.value = preferences.likedSongs?.length || 0;
      playlistCount.value = preferences.playlists?.length || 0;
      followingCount.value = preferences.likedArtists?.length || 0;
    }

    // Get personalized recommendations
    try {
      personalizedRecommendations.value = await recommendationService.getPersonalizedRecommendations(8);
    } catch (error) {
      console.error('Error fetching personalized recommendations:', error);
      personalizedRecommendations.value = [];
    }

    // Get discovery recommendations
    try {
      discoveryRecommendations.value = await recommendationService.getDiscoveryRecommendations(8);
    } catch (error) {
      console.error('Error fetching discovery recommendations:', error);
      discoveryRecommendations.value = [];
    }
  } catch (error) {
    console.error('Error loading user data:', error);
  } finally {
    loading.value = false;
  }
};

// Listen for auth changes
const handleAuthChange = () => {
  if (isLoggedIn.value) {
    loadUserData();
  }
};

onMounted(() => {
  handleAuthChange();
});
</script>

<style lang="scss" scoped>
.profile-page {
  background: linear-gradient(180deg, #404040 0%, #121212 300px);
  min-height: 100vh;
}

.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding-top: 24px;
}

.user-header {
  padding-bottom: 24px;

  .q-avatar {
    box-shadow: 0 4px 60px rgba(0, 0, 0, 0.5);
  }

  h1 {
    margin: 0;
    font-weight: 700;
  }
}

.track-card {
  transition: all 0.3s ease;
  border-radius: 6px;
  overflow: hidden;
  position: relative;

  &:hover {
    background: #2a2a2a;
    transform: translateY(-4px);

    .track-image {
      filter: brightness(0.7);
    }
  }
}

.bg-dark {
  background: #181818;
}

.login-prompt {
  max-width: 500px;
  margin: 64px auto;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;

  .q-icon {
    opacity: 0.6;
  }
}
</style>
