<template>
  <q-page class="library-page">
    <!-- Library Header -->
    <div class="library-header">
      <h2 class="page-title">Your Library</h2>
      <div class="action-buttons">
        <q-btn flat round dense icon="add" color="white" class="q-mr-sm" />
        <q-btn flat round dense icon="arrow_forward" color="white" />
      </div>
    </div>

    <!-- Library Filters -->
    <div class="library-filters">
      <div class="filter-tabs">
        <q-btn unelevated dense no-caps class="filter-tab active" label="All" />
        <q-btn unelevated dense no-caps class="filter-tab" label="Music" />
        <q-btn unelevated dense no-caps class="filter-tab" label="Podcasts" />
      </div>
      <div class="filter-sort">
        <q-btn dense color="transparent" align="left" no-caps class="recent-btn">
          <q-icon name="sort" class="q-mr-xs" size="xs" />
          <span>Recents</span>
        </q-btn>
      </div>
    </div>

    <!-- Library Search -->
    <div class="search-box">
      <q-input v-model="searchQuery" dense placeholder="Search in Your Library" class="search-input" dark borderless
        bg-color="rgba(255, 255, 255, 0.1)">
        <template v-slot:prepend>
          <q-icon name="search" class="q-ml-sm" />
        </template>
      </q-input>
    </div>

    <!-- Library Content -->
    <div class="library-content">
      <q-list separator class="library-list">
        <!-- Liked Songs -->
        <q-item clickable to="/liked-songs" class="library-item">
          <q-item-section avatar>
            <div class="liked-songs-image">
              <q-icon name="favorite" color="white" size="sm" />
            </div>
          </q-item-section>
          <q-item-section>
            <q-item-label class="item-name">Liked Songs</q-item-label>
            <q-item-label caption class="item-details">
              <span class="item-type">Playlist</span> • <span class="item-count">24 songs</span>
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- The Anime and Game Collection -->
        <q-item clickable to="/album/anime-game-collection" class="library-item">
          <q-item-section avatar>
            <q-img src="https://via.placeholder.com/50x50" class="album-image" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="item-name">The Anime and Game Collection</q-item-label>
            <q-item-label caption class="item-details">
              <span class="item-type">Album</span> • <span class="item-artist">Taylor Davis</span>
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- HOYO-MIX -->
        <q-item clickable to="/artist/hoyo-mix" class="library-item">
          <q-item-section avatar>
            <q-img src="https://via.placeholder.com/50x50" class="artist-image" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="item-name">HOYO-MIX</q-item-label>
            <q-item-label caption class="item-details">
              <span class="item-type">Artist</span>
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- VALORANT -->
        <q-item clickable to="/artist/valorant" class="library-item">
          <q-item-section avatar>
            <q-img src="https://via.placeholder.com/50x50" class="artist-image" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="item-name">VALORANT</q-item-label>
            <q-item-label caption class="item-details">
              <span class="item-type">Artist</span>
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- Arcane -->
        <q-item clickable to="/artist/arcane" class="library-item">
          <q-item-section avatar>
            <q-img src="https://via.placeholder.com/50x50" class="artist-image" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="item-name">Arcane</q-item-label>
            <q-item-label caption class="item-details">
              <span class="item-type">Artist</span>
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- League of Legends -->
        <q-item clickable to="/artist/league-of-legends" class="library-item">
          <q-item-section avatar>
            <q-img src="https://via.placeholder.com/50x50" class="artist-image" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="item-name">League of Legends</q-item-label>
            <q-item-label caption class="item-details">
              <span class="item-type">Artist</span>
            </q-item-label>
          </q-item-section>
        </q-item>

        <!-- Fairy Tail Theme -->
        <q-item clickable to="/track/fairy-tail-theme" class="library-item">
          <q-item-section avatar>
            <q-img src="https://via.placeholder.com/50x50" class="album-image" />
          </q-item-section>
          <q-item-section>
            <q-item-label class="item-name">Fairy Tail Theme</q-item-label>
            <q-item-label caption class="item-details">
              <span class="item-type">Song</span> • <span class="item-artist">Taylor Davis</span>
            </q-item-label>
          </q-item-section>
        </q-item>
      </q-list>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useMusicPlayerStore } from '../stores/musicPlayer';

const router = useRouter();
const musicPlayer = useMusicPlayerStore();
const searchQuery = ref('');
</script>

<style lang="scss">
.library-page {
  padding: 0;
  background-color: #121212;
  height: 100%;
  display: flex;
  flex-direction: column;

  .library-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 16px 0 16px;

    .page-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      color: white;
    }

    .action-buttons {
      display: flex;
    }
  }

  .library-filters {
    display: flex;
    justify-content: space-between;
    padding: 16px 16px 8px 16px;

    .filter-tabs {
      display: flex;
      gap: 8px;

      .filter-tab {
        background-color: rgba(255, 255, 255, 0.1);
        color: white;
        border-radius: 20px;
        padding: 4px 12px;
        font-size: 14px;

        &.active {
          background-color: white;
          color: black;
        }
      }
    }

    .filter-sort {
      .recent-btn {
        color: white;
        font-size: 14px;
        display: flex;
        align-items: center;
      }
    }
  }

  .search-box {
    padding: 0 16px 8px 16px;

    .search-input {
      :deep(.q-field__control) {
        height: 32px;
        border-radius: 4px;
      }
    }
  }

  .library-content {
    flex: 1;
    overflow-y: auto;

    .library-list {
      padding: 0;

      .library-item {
        padding: 8px 16px;

        .liked-songs-image {
          width: 48px;
          height: 48px;
          background: linear-gradient(135deg, #450af5, #c4efd9);
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 4px;
        }

        .album-image,
        .artist-image {
          width: 48px;
          height: 48px;
          border-radius: 4px;
        }

        .artist-image {
          border-radius: 50%;
        }

        .item-name {
          font-size: 16px;
          font-weight: 500;
          color: white;
        }

        .item-details {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
        }
      }
    }
  }
}
</style>
