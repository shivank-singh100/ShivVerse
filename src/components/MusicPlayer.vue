<template>
  <div class="music-player" v-show="currentTrack">
    <div class="player-background"></div>
    <div class="player-content">
      <!-- Track Info -->
      <div class="track-info">
        <div class="image-container">
          <q-img :src="getAlbumImage" class="track-image" :ratio="1" @error="handleImageError" />
        </div>
        <div class="track-details">
          <div class="track-name">{{ currentTrack?.name || 'No track playing' }}</div>
          <div class="track-artist">{{ getArtistName }}</div>
        </div>
        <q-btn v-if="currentTrack" flat round :icon="isLiked ? 'favorite' : 'favorite_border'"
          :color="isLiked ? 'pink-6' : 'white'" size="sm" @click="toggleLike" class="like-btn" />
      </div>

      <!-- Player Controls -->
      <div class="player-controls">
        <div class="control-buttons">
          <q-btn flat round icon="shuffle" :color="isShuffled ? 'primary' : 'white'" @click="toggleShuffle" size="sm" class="control-btn" />
          <q-btn flat round icon="skip_previous" color="white" @click="previousTrack" size="sm" class="control-btn" />
          <q-btn flat round :icon="isPlaying ? 'pause_circle_filled' : 'play_circle_filled'" color="white" size="md"
            @click="togglePlay" class="play-button" />
          <q-btn flat round icon="skip_next" color="white" @click="nextTrack" size="sm" class="control-btn" />
          <q-btn flat round :icon="isRepeated ? 'repeat_one' : 'repeat'" :color="isRepeated ? 'primary' : 'white'"
            @click="toggleRepeat" size="sm" class="control-btn" />
        </div>

        <!-- Progress Bar -->
        <div class="progress-container">
          <span class="time">{{ formatTime(progress) }}</span>
          <q-slider v-model="progressValue" :min="0" :max="duration || 1" color="green" class="progress-slider"
            @update:model-value="handleProgressChange" @mousedown="handleProgressStart"
            @mouseup="handleProgressChange(progressValue)" />
          <span class="time">{{ formatTime(duration) }}</span>
        </div>
      </div>

      <!-- Volume and Additional Controls -->
      <div class="additional-controls">
        <div class="volume-container">
          <q-btn flat round :icon="volume > 0 ? 'volume_up' : 'volume_off'" size="sm" color="white"
            @click="toggleMute" />
          <q-slider v-model="volume" :min="0" :max="100" color="green" class="volume-slider"
            @update:model-value="setVolume" />
        </div>
        <div class="panel-buttons">
          <q-btn flat round icon="queue_music" color="white" :class="{ 'active-btn': activeRightPanel === 'queue' }"
            @click="toggleQueue" />
          <q-btn flat round icon="recommend" color="white" :class="{ 'active-btn': activeRightPanel === 'related' }"
            @click="toggleRelated" />
        </div>
        <q-btn flat round icon="devices" color="white" @click="toggleDevices" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useMusicPlayerStore } from '../stores/musicPlayer';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const musicPlayer = useMusicPlayerStore();
const currentTrack = computed(() => musicPlayer.currentTrack);
const isPlaying = computed(() => musicPlayer.isPlaying);
const isShuffled = computed(() => musicPlayer.isShuffled);
const isRepeated = computed(() => musicPlayer.isRepeated);
const volume = computed({
  get: () => musicPlayer.volume,
  set: (value) => musicPlayer.setVolume(value)
});
const progress = computed(() => musicPlayer.progress);
const duration = computed(() => musicPlayer.duration);
const activeRightPanel = computed(() => musicPlayer.activeRightPanel);
const isLiked = computed(() => {
  if (!currentTrack.value) return false;
  return musicPlayer.isLiked(currentTrack.value?.id);
});

const progressValue = ref(0);
const isSeeking = ref(false);
const fallbackImage = 'https://via.placeholder.com/80?text=No+Image';

// Default album image if none available
const getAlbumImage = computed(() => {
  if (!currentTrack.value) return fallbackImage;
  if (!currentTrack.value.album) return fallbackImage;
  if (!currentTrack.value.album.images || currentTrack.value.album.images.length === 0) return fallbackImage;
  return currentTrack.value.album.images[0]?.url || fallbackImage;
});

// Get artist name with fallback
const getArtistName = computed(() => {
  if (!currentTrack.value) return 'Unknown artist';
  if (!currentTrack.value.artists || currentTrack.value.artists.length === 0) return 'Unknown artist';
  return currentTrack.value.artists[0]?.name || 'Unknown artist';
});

const handleImageError = (err) => {
  console.error('Image loading error:', err);
  // The fallback is handled by the computed property
};

onMounted(() => {
  console.log('MusicPlayer component mounted');

  // Make sure YouTube player div exists
  if (!document.getElementById('youtube-player')) {
    const playerDiv = document.createElement('div');
    playerDiv.id = 'youtube-player';
    playerDiv.classList.add('youtube-player');
    document.body.appendChild(playerDiv);
    console.log('YouTube player div created in MusicPlayer component');

    // Ensure YouTube API is loaded
    if (!window.YT && !document.getElementById('youtube-api')) {
      console.log('Loading YouTube API script from MusicPlayer component');
      const tag = document.createElement('script');
      tag.id = 'youtube-api';
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }
  }

  // Set up progress tracking
  const updateInterval = setInterval(() => {
    if (!isSeeking.value) {
      progressValue.value = progress.value;
    }
  }, 100);

  onUnmounted(() => {
    clearInterval(updateInterval);
  });
});

watch(currentTrack, (newTrack) => {
  console.log('Current track changed:', newTrack);
  progressValue.value = 0;

  // Show notification
  if (newTrack) {
    $q.notify({
      message: `Now playing: ${newTrack.name} by ${getArtistName.value}`,
      color: 'primary',
      position: 'bottom-right',
      timeout: 2000,
      icon: 'music_note'
    });
  }
});

const formatTime = (seconds) => {
  if (!seconds) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

const togglePlay = () => {
  musicPlayer.togglePlay();
};

const previousTrack = () => {
  musicPlayer.playPrevious();
};

const nextTrack = () => {
  musicPlayer.playNext();
};

const toggleShuffle = () => {
  musicPlayer.toggleShuffle();
};

const toggleRepeat = () => {
  musicPlayer.toggleRepeat();
};

const toggleMute = () => {
  musicPlayer.toggleMute();
};

const setVolume = (value) => {
  musicPlayer.setVolume(value);
};

const toggleQueue = () => {
  if (activeRightPanel.value === 'queue') {
    musicPlayer.activeRightPanel = null;
  } else {
    musicPlayer.activeRightPanel = 'queue';
  }
};

const toggleRelated = () => {
  if (activeRightPanel.value === 'related') {
    musicPlayer.activeRightPanel = null;
  } else {
    musicPlayer.activeRightPanel = 'related';
  }
};

const toggleDevices = () => {
  musicPlayer.toggleDevices();
};

const toggleLike = () => {
  if (currentTrack.value) {
    musicPlayer.toggleLike(currentTrack.value);
  }
};

const handleProgressStart = () => {
  isSeeking.value = true;
};

const handleProgressChange = (value) => {
  isSeeking.value = false;
  musicPlayer.seek(value);
};
</script>

<style lang="scss">
.music-player {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 90px;
  background: #181818;
  border-top: 1px solid #282828;
  z-index: 1000;
  display: flex;
  align-items: center;
  padding: 0 16px;
}

.player-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  max-width: 1600px;
  margin: 0 auto;
  gap: 16px;
}

.track-info {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 180px;
  max-width: 30%;
  flex: 1;
}

.image-container {
  position: relative;
  width: 56px;
  height: 56px;
  overflow: hidden;
}

.track-image {
  width: 56px;
  height: 56px;
  border-radius: 4px;
}

.track-details {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-width: 180px;
  overflow: hidden;
}

.track-name {
  color: white;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.9rem;
}

.track-artist {
  color: #b3b3b3;
  font-size: 0.8rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.player-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  flex: 2;
  max-width: 722px;
}

.control-buttons {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
}

.control-btn {
  opacity: 0.7;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}

.play-button {
  font-size: 2rem;
  margin: 0 8px;
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.1);
  }
}

.progress-container {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 8px;
}

.time {
  color: #b3b3b3;
  font-size: 0.7rem;
  width: 35px;
  text-align: center;
}

.progress-slider {
  flex: 1;

  .q-slider__track {
    background: #535353;
  }

  .q-slider__track-container {
    background: #535353;
  }

  &:hover .q-slider__thumb {
    transform: scale(1);
    opacity: 1;
  }

  .q-slider__thumb {
    opacity: 0;
    transition: opacity 0.2s, transform 0.2s;
  }
}

.additional-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 180px;
  max-width: 30%;
  flex: 1;
  justify-content: flex-end;
}

.volume-container {
  display: flex;
  align-items: center;
  width: 140px;
}

.volume-slider {
  width: 100px;

  .q-slider__track {
    background: #535353;
  }

  .q-slider__track-container {
    background: #535353;
  }

  &:hover .q-slider__thumb {
    transform: scale(1);
    opacity: 1;
  }

  .q-slider__thumb {
    opacity: 0;
    transition: opacity 0.2s, transform 0.2s;
  }
}

.panel-buttons {
  display: flex;
  gap: 4px;
}

.active-btn {
  color: #1db954 !important;
}

.like-btn {
  opacity: 0.8;
  transition: opacity 0.2s;

  &:hover {
    opacity: 1;
  }
}

.player-glow {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 10px;
  background: linear-gradient(to top, rgba(29, 185, 84, 0.3), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}

.music-player:hover .player-glow {
  opacity: 1;
}

.youtube-player {
  position: fixed;
  left: -9999px;
  top: -9999px;
  width: 1px;
  height: 1px;
}

/* Responsive design */
@media (max-width: 768px) {
  .music-player {
    height: 130px;
    padding: 8px;
  }

  .player-content {
    flex-direction: column;
    gap: 8px;
  }

  .track-info {
    width: 100%;
    max-width: 100%;
    justify-content: space-between;
  }

  .player-controls {
    width: 100%;
  }

  .additional-controls {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
