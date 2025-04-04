<template>
    <div class="right-panel" :class="{ 'panel-open': isOpen }">
        <div class="panel-content">
            <div class="panel-header">
                <div class="panel-title">
                    {{ activePanel === 'queue' ? 'Queue' : 'Related Songs' }}
                </div>
                <q-btn flat round icon="close" size="sm" color="white" @click="close" />
            </div>

            <!-- Queue Panel -->
            <div v-if="activePanel === 'queue'" class="panel-body">
                <div v-if="queue.length === 0" class="empty-state">
                    <q-icon name="queue_music" size="48px" color="primary" />
                    <div class="text-center q-mt-md">Your queue is empty</div>
                    <div class="text-center text-caption q-mt-sm">
                        Add songs to your queue by clicking the "Add to Queue" button on a song.
                    </div>
                </div>
                <div v-else class="queue-list">
                    <q-list>
                        <q-item v-for="(track, index) in queue" :key="track.id" class="track-item">
                            <q-item-section avatar>
                                <q-img :src="track.album.images[0].url" class="track-image" />
                            </q-item-section>
                            <q-item-section>
                                <q-item-label class="track-name">{{ track.name }}</q-item-label>
                                <q-item-label caption class="track-artist">{{ track.artists[0].name }}</q-item-label>
                            </q-item-section>
                            <q-item-section side>
                                <q-btn flat round icon="play_arrow" size="sm" color="primary"
                                    @click="playTrack(track)" />
                                <q-btn flat round icon="delete" size="sm" color="grey-5"
                                    @click="removeFromQueue(index)" />
                            </q-item-section>
                        </q-item>
                    </q-list>
                    <div class="queue-actions">
                        <div class="continuous-playback q-mb-md">
                            <q-toggle v-model="continuousPlayback" color="primary"
                                label="Play related songs when queue ends" dense />
                        </div>
                        <q-btn flat color="primary" class="full-width" @click="clearQueue">
                            Clear Queue
                        </q-btn>
                    </div>
                </div>
            </div>

            <!-- Related Songs Panel -->
            <div v-if="activePanel === 'related'" class="panel-body">
                <div v-if="relatedSongs.length === 0" class="empty-state">
                    <q-icon name="recommend" size="48px" color="primary" />
                    <div class="text-center q-mt-md">No related songs found</div>
                    <div class="text-center text-caption q-mt-sm">
                        Play a song to see related recommendations.
                    </div>
                </div>
                <div v-else class="related-grid">
                    <div v-for="track in relatedSongs" :key="track.id" class="related-card">
                        <div class="card-image-container">
                            <q-img :src="track.album.images[0].url" class="card-image" />
                            <div class="card-overlay">
                                <q-btn round color="primary" icon="play_arrow" size="md" @click="playTrack(track)" />
                            </div>
                        </div>
                        <div class="card-content">
                            <div class="card-title" :title="track.name">{{ track.name }}</div>
                            <div class="card-subtitle" :title="track.artists[0].name">{{ track.artists[0].name }}</div>
                            <q-btn flat round icon="add" size="sm" color="primary" class="add-queue-btn"
                                @click="addToQueue(track)" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { useMusicPlayerStore } from '../stores/musicPlayer';

const musicPlayer = useMusicPlayerStore();

const activePanel = computed(() => musicPlayer.activeRightPanel);
const isOpen = computed(() => !!musicPlayer.activeRightPanel);
const queue = computed(() => musicPlayer.queue);
const relatedSongs = computed(() => musicPlayer.relatedSongs);
const continuousPlayback = ref(true);

// Set initial continuousPlayback value from store
watch(() => isOpen.value, (newVal) => {
    if (newVal && activePanel.value === 'queue') {
        continuousPlayback.value = musicPlayer.continuousPlayback;
    }
}, { immediate: true });

// Update store when continuousPlayback changes
watch(() => continuousPlayback.value, (newVal) => {
    musicPlayer.setContinuousPlayback(newVal);
});

const close = () => {
    musicPlayer.activeRightPanel = null;
};

const playTrack = (track) => {
    musicPlayer.playTrack(track);
};

const addToQueue = (track) => {
    musicPlayer.addToQueue(track);
    // Show the queue panel after adding a song
    musicPlayer.activeRightPanel = 'queue';
};

const removeFromQueue = (index) => {
    musicPlayer.removeFromQueue(index);
};

const clearQueue = () => {
    musicPlayer.clearQueue();
};
</script>

<style lang="scss">
.right-panel {
    position: fixed;
    top: 64px; // Header height
    right: 0;
    bottom: 90px; // Player height
    width: 400px;
    background: #121212;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 990; // Below search but above content
    border-left: 1px solid #282828;
    box-shadow: -2px 0 10px rgba(0, 0, 0, 0.3);
    display: flex;
    flex-direction: column;
    overflow: hidden;

    &.panel-open {
        transform: translateX(0);
    }
}

.panel-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    overflow: hidden;
}

.panel-header {
    padding: 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #282828;
    background: #121212;
}

.panel-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: white;
}

.panel-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    scrollbar-width: thin;
    scrollbar-color: #535353 #121212;
    background: #121212;

    &::-webkit-scrollbar {
        width: 8px;
    }

    &::-webkit-scrollbar-track {
        background: #121212;
        border-radius: 4px;
    }

    &::-webkit-scrollbar-thumb {
        background-color: #535353;
        border-radius: 4px;

        &:hover {
            background-color: #b3b3b3;
        }
    }
}

.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #b3b3b3;
    padding: 24px;
    text-align: center;

    .q-icon {
        opacity: 0.8;
        margin-bottom: 16px;
    }
}

.track-item {
    border-radius: 4px;
    margin-bottom: 8px;
    transition: all 0.2s ease;
    position: relative;
    overflow: hidden;

    &:hover {
        background: #282828;

        .track-image {
            transform: scale(1.05);
        }

        .q-btn {
            opacity: 1;
        }
    }

    .q-item__section--side .q-btn {
        opacity: 0.7;
        transform: scale(0.9);
        transition: all 0.2s ease;
        margin: 0 2px;

        &:hover {
            transform: scale(1.1);
        }
    }
}

.track-image {
    width: 40px;
    height: 40px;
    border-radius: 4px;
    transition: all 0.3s ease;
}

.track-name {
    color: white;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.track-artist {
    color: #b3b3b3;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

// Grid layout for related songs
.related-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    padding: 4px 4px 16px 4px;
}

.related-card {
    background: #181818;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    transition: all 0.3s ease;
    position: relative;

    &:hover {
        background: #282828;
        transform: translateY(-4px);

        .card-overlay {
            opacity: 1;
        }

        .add-queue-btn {
            opacity: 1;
            transform: scale(1);
        }
    }
}

.card-image-container {
    position: relative;
    width: 100%;
    padding-top: 100%;
    overflow: hidden;
}

.card-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transition: transform 0.5s ease;
}

.related-card:hover .card-image {
    transform: scale(1.05);
}

.card-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;

    .q-btn {
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
        transition: all 0.2s ease;
        background: #1db954;

        &:hover {
            transform: scale(1.1);
            background: #1ed760;
        }
    }
}

.card-content {
    padding: 12px;
    position: relative;
}

.card-title {
    color: white;
    font-weight: 500;
    font-size: 0.85rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-right: 32px;
}

.card-subtitle {
    color: #b3b3b3;
    font-size: 0.75rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.add-queue-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    opacity: 0.7;
    transform: scale(0.9);
    transition: all 0.3s ease;
    background: rgba(0, 0, 0, 0.7);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);

    &:hover {
        opacity: 1;
        transform: scale(1.1) !important;
        background: rgba(29, 185, 84, 0.3);
    }
}

.queue-actions {
    margin-top: 20px;
    display: flex;
    flex-direction: column;
}

.continuous-playback {
    background: #181818;
    border-radius: 4px;
    padding: 12px 16px;
    border: 1px solid #282828;
    transition: all 0.3s ease;

    &:hover {
        background: #282828;
    }

    :deep(.q-toggle__label) {
        font-size: 0.85rem;
        color: white;
    }

    :deep(.q-toggle__inner) {
        margin-right: 10px;
    }
}

@media (max-width: 768px) {
    .right-panel {
        width: 100%;
        top: 54px; // Adjusted for smaller header
    }

    .panel-header {
        padding: 12px;
    }

    .related-grid {
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        padding: 2px 2px 12px 2px;
    }

    .card-content {
        padding: 8px;
    }

    .card-title {
        font-size: 0.8rem;
    }

    .card-subtitle {
        font-size: 0.7rem;
    }

    .track-item {
        margin-bottom: 8px;
    }

    .track-image {
        width: 40px;
        height: 40px;
    }
}
</style>
