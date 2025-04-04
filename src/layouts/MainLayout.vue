<template>
  <q-layout view="lHh Lpr lFf" class="spotify-layout">
    <!-- Left Sidebar -->
    <q-drawer v-model="leftDrawerOpen" bordered show-if-above :width="260" :breakpoint="700" class="left-sidebar">
      <SpotifySidebar />
    </q-drawer>

    <!-- Main Content Area -->
    <q-page-container class="main-container">
      <!-- Top Navigation Bar -->
      <div class="top-nav-bar">
        <!-- Navigation Buttons -->
        <div class="nav-buttons">
          <q-btn round flat dense color="white" icon="chevron_left" @click="goBack" />
          <q-btn round flat dense color="white" icon="chevron_right" @click="goForward" :disable="!canGoForward" />
        </div>

        <!-- Search Bar (only on Search page) -->
        <div v-if="$route.path === '/search'" class="search-container">
          <q-input v-model="searchQuery" filled dense dark class="main-search" placeholder="What do you want to play?">
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <!-- Right Side Actions -->
        <div class="user-actions">
          <!-- Login/Signup Buttons for non-authenticated users -->
          <template v-if="!isLoggedIn">
            <q-btn
              flat
              dense
              to="/auth/signup"
              class="signup-btn"
              label="Sign up"
              color="white"
              no-caps
            />
            <q-btn
              unelevated
              dense
              to="/auth/login"
              class="login-btn"
              label="Log in"
              color="white"
              text-color="black"
              no-caps
            />
          </template>

          <!-- Profile Button for authenticated users -->
          <q-btn v-else round flat color="grey-8" class="user-profile-btn">
            <q-avatar size="28px">
              <q-img :src="userAvatar" />
            </q-avatar>

            <q-menu anchor="bottom right" self="top right" dark content-class="bg-dark">
              <q-list style="min-width: 150px">
                <q-item clickable v-close-popup :to="{ name: 'settings' }">
                  <q-item-section>Account</q-item-section>
                </q-item>
                <q-item clickable v-close-popup :to="{ name: 'profile' }">
                  <q-item-section>Profile</q-item-section>
                </q-item>
                <q-item clickable v-close-popup :to="{ name: 'settings' }">
                  <q-item-section>Settings</q-item-section>
                </q-item>
                <q-separator dark />
                <q-item clickable v-close-popup @click="handleLogout">
                  <q-item-section>Log out</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </div>

      <!-- Main Content -->
      <div class="page-content">
        <router-view />
      </div>
    </q-page-container>

    <!-- Music Player -->
    <MusicPlayer />
  </q-layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { Notify } from 'quasar';
import MusicPlayer from '../components/MusicPlayer.vue';
import SpotifySidebar from '../components/SpotifySidebar.vue';
import authService from '../services/authService';

const router = useRouter();
const leftDrawerOpen = ref(true);
const searchQuery = ref('');
const canGoForward = ref(false);

// Computed property to check if user is logged in
const isLoggedIn = computed(() => authService.isLoggedIn());

// Get user avatar or default placeholder
const userAvatar = computed(() => {
  const user = authService.getCurrentUser();
  return user && user.avatar
    ? user.avatar
    : `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.username || 'User')}&background=1D1D1D&color=fff`;
});

const goBack = () => {
  router.go(-1);
};

const goForward = () => {
  router.go(1);
};

// Handle user logout
const handleLogout = async () => {
  try {
    await authService.logout();

    Notify.create({
      color: 'positive',
      message: 'Successfully logged out',
      position: 'top',
      timeout: 2000
    });

    // Redirect to home page after logout
    router.push('/');
  } catch (error) {
    console.error('Logout error:', error);

    Notify.create({
      color: 'negative',
      message: 'An error occurred during logout',
      position: 'top',
      timeout: 2000
    });
  }
};

onMounted(() => {
  // Check if we can go forward in history
  window.addEventListener('popstate', () => {
    canGoForward.value = window.history.state && window.history.state.position < window.history.length - 1;
  });
});
</script>

<style lang="scss">
/* Layout and structure */
.spotify-layout {
  --sidebar-bg: #000000;
  --main-bg: #121212;
  --topbar-bg: rgba(16, 16, 16, 0.9);
  --player-bg: #181818;
  --primary-green: #1DB954;
  --text-color: #FFFFFF;
  --text-subdued: rgba(255, 255, 255, 0.7);

  background-color: var(--main-bg);
  height: 100vh;
  color: var(--text-color);
}

/* Left Sidebar */
.left-sidebar {
  background-color: var(--sidebar-bg) !important;
  display: flex;
  flex-direction: column;
  border: none !important;

  .logo-container {
    padding: 24px 16px;
  }

  .sidebar-top {
    padding-bottom: 16px;
  }

  .main-nav {
    .nav-item {
      border-radius: 4px;
      margin: 4px 8px;
      color: var(--text-subdued);
      font-weight: 700;

      &.q-router-link--active {
        color: var(--text-color);
      }

      &:hover {
        color: var(--text-color);
      }
    }
  }

  .library-section {
    background-color: rgba(20, 20, 20, 0.6);
    border-radius: 8px;
    margin: 0 8px;
    flex: 1;
    display: flex;
    flex-direction: column;

    .filter-section {
      padding: 16px 0 8px;

      .filter-toggle {
        .q-btn {
          background: rgba(255, 255, 255, 0.1);
          margin-right: 8px;
          padding: 4px 12px;
          min-height: 28px;
          border-radius: 16px;
          font-size: 0.8rem;
          font-weight: 500;
        }
      }
    }

    .search-section {
      padding: 0 8px 8px;

      .search-filter {
        background: rgba(255, 255, 255, 0.1);
        border-radius: 4px;
        height: 32px;

        .q-field__control {
          height: 32px;
        }
      }
    }

    .recents-title {
      .recents-label {
        font-size: 1rem;
        font-weight: 700;
        color: var(--text-subdued);
      }
    }

    .recents-scroll-area {
      flex: 1;

      .recent-item {
        padding: 8px 16px;
        color: var(--text-subdued);

        &:hover {
          background: rgba(255, 255, 255, 0.1);
          color: var(--text-color);
        }

        .liked-songs-avatar {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #450AF5, #C4EFD9);
          border-radius: 4px;
        }

        .caption-text {
          color: var(--text-subdued);
          font-size: 0.75rem;
        }
      }
    }
  }
}

/* Main content area */
.main-container {
  padding: 0;
  display: flex;
  flex-direction: column;
  height: 100%;

  .top-nav-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 32px;
    background-color: var(--topbar-bg);
    position: sticky;
    top: 0;
    z-index: 100;

    .nav-buttons {
      display: flex;
      gap: 16px;
    }

    .search-container {
      flex: 1;
      max-width: 364px;
      margin: 0 16px;

      .main-search {
        :deep(.q-field__control) {
          border-radius: 20px;
          background-color: #242424;
          height: 40px;
        }
      }
    }

    .user-actions {
      display: flex;
      align-items: center;
      gap: 16px;

      .user-profile-btn {
        background-color: #2a2a2a;
      }

      .login-btn {
        border-radius: 500px;
        padding: 8px 32px;
        font-weight: 700;
      }

      .signup-btn {
        font-weight: 700;
      }
    }
  }

  .page-content {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 90px;
    /* Space for player */
  }
}

/* Player footer */
.player-footer {
  background-color: var(--player-bg);
  padding: 8px 16px;
  position: fixed;
  bottom: 0;
  width: 100%;
  height: 90px;
  z-index: 1000;

  .player-container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 100%;

    .track-info {
      display: flex;
      align-items: center;
      width: 30%;
      min-width: 180px;

      .track-image {
        margin-right: 14px;
      }

      .track-details {
        .track-name {
          font-size: 0.875rem;
          font-weight: 400;
          color: var(--text-color);
        }

        .track-artist {
          font-size: 0.75rem;
          color: var(--text-subdued);
        }
      }
    }

    .player-controls {
      display: flex;
      flex-direction: column;
      align-items: center;
      width: 40%;
      max-width: 722px;

      .control-buttons {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 8px;

        .play-pause-button {
          font-size: 1.25rem;
          height: 32px;
          width: 32px;
        }
      }

      .progress-control {
        display: flex;
        align-items: center;
        width: 100%;

        .current-time,
        .total-time {
          font-size: 0.75rem;
          color: var(--text-subdued);
          min-width: 40px;
        }

        .progress-slider {
          flex: 1;
          height: 4px;
          margin: 0 8px;
        }
      }
    }

    .volume-controls {
      display: flex;
      align-items: center;
      justify-content: flex-end;
      width: 30%;
      min-width: 180px;
      gap: 8px;

      .volume-slider {
        width: 100px;
        max-width: 100px;
      }
    }
  }
}

/* Dark theme menu overrides */
.bg-dark {
  background-color: #282828 !important;

  .q-item {
    &:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
