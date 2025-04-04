<template>
 <div class="spotify-sidebar">
    <!-- Main Navigation -->
    <div class="sidebar-top">
      <!-- Logo -->
      <router-link to="/" class="logo-container">
        <q-img src="/icons/shivverse_icon.png" width="40px" @error="handleLogoError" />
      </router-link>

      <!-- Main Nav Items -->
      <ul class="main-nav-list">
        <li>
          <router-link to="/" class="nav-item" exact>
            <q-icon name="home" size="md" />
            <span>Home</span>
          </router-link>
        </li>
        <li>
          <router-link to="/search" class="nav-item">
            <q-icon name="search" size="md" />
            <span>Search</span>
          </router-link>
        </li>
        <li>
          <router-link to="/library" class="nav-item">
            <q-icon name="library_music" size="md" />
            <span>Your Library</span>
          </router-link>
        </li>
      </ul>

      <!-- Create and Liked -->
      <div class="action-buttons">
        <div class="action-item">
          <div class="action-button create-button">
            <q-icon name="add" size="sm" />
          </div>
          <span>Create Playlist</span>
        </div>
        <div class="action-item">
          <router-link to="/liked-songs" class="action-button liked-button">
            <q-icon name="favorite" size="sm" />
          </router-link>
          <span>Liked Songs</span>
        </div>
      </div>
    </div>

    <!-- Divider -->
    <div class="sidebar-divider"></div>

    <!-- Library Section -->
    <div class="library-section">
      <!-- Library Header -->
      <div class="library-header">
        <div class="library-title">
          <q-icon name="library_music" size="sm" />
          <span>Your Library</span>
        </div>
        <div class="library-actions">
          <q-btn flat round dense icon="add" size="sm" />
          <q-btn flat round dense icon="arrow_forward" size="sm" />
        </div>
      </div>

      <!-- Filter Options -->
      <div class="filter-section">
        <q-btn
          v-for="filter in filterOptions"
          :key="filter.value"
          class="filter-btn"
          unelevated
          dense
          rounded
          no-caps
          :color="activeFilter === filter.value ? 'primary' : 'transparent'"
          text-color="white"
          :label="filter.label"
          @click="activeFilter = filter.value"
        />
      </div>

      <!-- Search in Library -->
      <div class="library-search">
        <q-input v-model="librarySearch" dense borderless placeholder="Search in Your Library" class="library-search-input">
          <template v-slot:prepend>
            <q-icon name="search" color="grey-5" size="sm" />
          </template>
        </q-input>
      </div>

      <!-- Recent Items -->
      <div class="recents-title">
        <div class="recents-label">Recent</div>
        <q-btn flat round dense icon="format_list_bulleted" size="xs" />
      </div>

      <!-- Recent Library Items -->
      <div class="recents-list">
        <!-- Liked Songs -->
        <router-link to="/liked-songs" class="recent-item">
          <div class="recent-item-avatar liked-songs-avatar">
            <q-icon name="favorite" color="white" size="sm" />
          </div>
          <div class="recent-item-details">
            <div class="recent-item-name">Liked Songs</div>
            <div class="recent-item-meta">Playlist • {{ likedSongsCount }} songs</div>
          </div>
        </router-link>

        <!-- Dynamic Library Items -->
        <template v-if="isLoading">
          <div v-for="i in 5" :key="i" class="recent-item skeleton-item">
            <q-skeleton type="QAvatar" size="48px" square class="recent-item-avatar" />
            <div class="recent-item-details">
              <q-skeleton type="text" width="80%" class="q-mb-xs" />
              <q-skeleton type="text" width="60%" />
            </div>
          </div>
        </template>

        <template v-else>
          <router-link
            v-for="item in filteredLibraryItems"
            :key="item.id"
            :to="item.route"
            class="recent-item"
          >
            <div class="recent-item-avatar">
              <q-img :src="item.imageUrl" />
            </div>
            <div class="recent-item-details">
              <div class="recent-item-name">{{ item.name }}</div>
              <div class="recent-item-meta">{{ item.typeName }} {{ item.meta || '' }}</div>
            </div>
          </router-link>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useMusicPlayerStore } from '../stores/musicPlayer';
import spotifyService from '../services/spotifyService';

const musicPlayer = useMusicPlayerStore();
const librarySearch = ref('');
const activeFilter = ref('all');
const isLoading = ref(true);
const libraryItems = ref([]);
const likedSongsCount = ref(24);

// Filter options
const filterOptions = [
  { label: 'All', value: 'all' },
  { label: 'Artists', value: 'artists' },
  { label: 'Albums', value: 'albums' },
  { label: 'Playlists', value: 'playlists' },
  { label: 'Podcasts', value: 'podcasts' }
];

// Filter library items based on search and active filter
const filteredLibraryItems = computed(() => {
  let items = libraryItems.value;

  // Apply filter
  if (activeFilter.value !== 'all') {
    items = items.filter(item => item.type === activeFilter.value);
  }

  // Apply search
  if (librarySearch.value.trim() !== '') {
    const searchTerm = librarySearch.value.toLowerCase();
    items = items.filter(item =>
      item.name.toLowerCase().includes(searchTerm) ||
      (item.artist && item.artist.toLowerCase().includes(searchTerm))
    );
  }

  return items;
});

// Error handler for images
const handleLogoError = (err) => {
  console.error('Logo loading error:', err);
};

// Load library data from API
const loadLibraryData = async () => {
  isLoading.value = true;

  try {
    // Get liked songs count if available
    if (musicPlayer.likedSongs && musicPlayer.likedSongs.length) {
      likedSongsCount.value = musicPlayer.likedSongs.length;
    }

    // Load playlists
    const playlists = await spotifyService.getFeaturedPlaylists(10);

    // Load artists from search results
    const artistsSearch = await spotifyService.searchTracks('artist:', 10);
    const uniqueArtists = new Map();
    artistsSearch.forEach(track => {
      if (track.artists && track.artists.length > 0) {
        const artist = track.artists[0];
        if (!uniqueArtists.has(artist.id)) {
          uniqueArtists.set(artist.id, {
            id: artist.id,
            name: artist.name,
            type: 'artists',
            typeName: 'Artist',
            imageUrl: track.album && track.album.images && track.album.images.length > 0
              ? track.album.images[0].url
              : `https://via.placeholder.com/48?text=${encodeURIComponent(artist.name.charAt(0))}`,
            route: `/artist/${artist.id}`
          });
        }
      }
    });

    // Load albums from recent tracks
    const albumsSearch = await spotifyService.searchTracks('album:', 10);
    const uniqueAlbums = new Map();
    albumsSearch.forEach(track => {
      if (track.album && !uniqueAlbums.has(track.album.id)) {
        uniqueAlbums.set(track.album.id, {
          id: track.album.id,
          name: track.album.name,
          type: 'albums',
          typeName: 'Album',
          meta: track.artists && track.artists.length > 0 ? `• ${track.artists[0].name}` : '',
          artist: track.artists && track.artists.length > 0 ? track.artists[0].name : '',
          imageUrl: track.album.images && track.album.images.length > 0
            ? track.album.images[0].url
            : `https://via.placeholder.com/48?text=${encodeURIComponent(track.album.name.charAt(0))}`,
          route: `/album/${track.album.id}`
        });
      }
    });

    // Combine all items
    const allItems = [
      ...Array.from(uniqueArtists.values()),
      ...Array.from(uniqueAlbums.values()),
      ...playlists.map(playlist => ({
        id: playlist.id,
        name: playlist.name,
        type: 'playlists',
        typeName: 'Playlist',
        meta: playlist.owner ? `• ${playlist.owner.display_name || 'User'}` : '',
        imageUrl: playlist.images && playlist.images.length > 0
          ? playlist.images[0].url
          : `https://via.placeholder.com/48?text=${encodeURIComponent(playlist.name.charAt(0))}`,
        route: `/playlist/${playlist.id}`
      }))
    ];

    // Randomize and limit to 15 items
    libraryItems.value = allItems
      .sort(() => 0.5 - Math.random())
      .slice(0, 15);
  } catch (error) {
    console.error('Error loading library data:', error);

    // Fallback library items
    libraryItems.value = [
      {
        id: 'anime-game-collection',
        name: 'The Anime and Game Collection',
        type: 'albums',
        typeName: 'Album',
        meta: '• Taylor Davis',
        artist: 'Taylor Davis',
        imageUrl: 'https://via.placeholder.com/48?text=A',
        route: '/album/anime-game-collection'
      },
      {
        id: 'hoyo-mix',
        name: 'HOYO-MIX',
        type: 'artists',
        typeName: 'Artist',
        imageUrl: 'https://via.placeholder.com/48?text=H',
        route: '/artist/hoyo-mix'
      },
      {
        id: 'valorant',
        name: 'VALORANT',
        type: 'artists',
        typeName: 'Artist',
        imageUrl: 'https://via.placeholder.com/48?text=V',
        route: '/artist/valorant'
      },
      {
        id: 'arcane',
        name: 'Arcane',
        type: 'artists',
        typeName: 'Artist',
        imageUrl: 'https://via.placeholder.com/48?text=A',
        route: '/artist/arcane'
      },
      {
        id: 'league-of-legends',
        name: 'League of Legends',
        type: 'artists',
        typeName: 'Artist',
        imageUrl: 'https://via.placeholder.com/48?text=L',
        route: '/artist/league-of-legends'
      }
    ];
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  loadLibraryData();
});
</script>

<style lang="scss" scoped>
.spotify-sidebar {
  background-color: #000000;
  display: flex;
  flex-direction: column;
  height: 100%;
  color: #b3b3b3;
  width: 100%;
}

.sidebar-top {
  padding: 24px 16px;
  background-color: #121212;
  border-radius: 8px;
  margin: 8px;
}

.logo-container {
  display: block;
  margin-bottom: 24px;
  padding-left: 8px;
}

.main-nav-list {
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;

  li {
    margin-bottom: 8px;
  }
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 8px;
  border-radius: 4px;
  color: #b3b3b3;
  text-decoration: none;
  font-weight: 600;
  transition: color 0.2s;

  &:hover, &.router-link-active {
    color: #fff;
  }

  span {
    font-size: 1rem;
  }
}

.action-buttons {
  margin-top: 24px;
}

.action-item {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;

  span {
    font-size: 0.875rem;
    font-weight: 600;
    color: #b3b3b3;
  }
}

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 2px;

  &.create-button {
    background: linear-gradient(135deg, #fff, #b3b3b3);
    color: #000;
  }

  &.liked-button {
    background: linear-gradient(135deg, #450af5, #c4efd9);
    color: #fff;
  }
}

.sidebar-divider {
  height: 1px;
  margin: 8px 16px;
  background-color: transparent;
}

.library-section {
  flex: 1;
  background-color: #121212;
  border-radius: 8px;
  margin: 0 8px 8px 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.library-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 0;
}

.library-title {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #b3b3b3;
  font-weight: 600;

  span {
    font-size: 1rem;
  }
}

.library-actions {
  display: flex;
  gap: 8px;
}

.filter-section {
  display: flex;
  gap: 8px;
  padding: 16px 16px 8px;
  overflow-x: auto;
  white-space: nowrap;

  &::-webkit-scrollbar {
    display: none;
  }
}

.filter-btn {
  background-color: #232323;
  padding: 4px 12px;
  font-size: 0.75rem;

  &:hover {
    background-color: #2a2a2a;
  }
}

.library-search {
  padding: 0 16px 16px;
}

.library-search-input {
  background-color: #242424;
  border-radius: 4px;
}

.recents-title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px 8px;
}

.recents-label {
  font-size: 0.875rem;
  color: #b3b3b3;
}

.recents-list {
  padding: 0 8px;
  overflow-y: auto;
  flex: 1;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.2);
    border-radius: 4px;
  }
}

.recent-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 4px;
  text-decoration: none;
  transition: background-color 0.2s;

  &:hover {
    background-color: #232323;
  }
}

.recent-item-avatar {
  width: 48px;
  height: 48px;
  border-radius: 4px;
  overflow: hidden;
  background-color: #333;
  display: flex;
  align-items: center;
  justify-content: center;

  &.liked-songs-avatar {
    background: linear-gradient(135deg, #450af5, #c4efd9);
  }
}

.recent-item-details {
  flex: 1;
  min-width: 0;
}

.recent-item-name {
  font-size: 0.875rem;
  font-weight: 500;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.recent-item-meta {
  font-size: 0.75rem;
  color: #b3b3b3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.skeleton-item {
  pointer-events: none;
}

@media (max-width: 768px) {
  .sidebar-top {
    padding: 16px 8px;
  }

  .nav-item {
    padding: 8px 4px;

    span {
      font-size: 0.875rem;
    }
  }
}
</style>
