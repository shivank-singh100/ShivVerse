<template>
    <q-page class="playlist-detail-page">
        <!-- Playlist Header -->
        <div class="playlist-header"
            :style="{ background: `linear-gradient(180deg, ${playlist.color} 0%, #121212 100%)` }">
            <div class="playlist-info">
                <div class="playlist-image">
                    <q-img :src="playlist.image" class="rounded-borders" />
                </div>
                <div class="playlist-details">
                    <div class="playlist-type">PLAYLIST</div>
                    <h1 class="playlist-title">{{ playlist.name }}</h1>
                    <div class="playlist-description">{{ playlist.description }}</div>
                    <div class="playlist-meta">
                        <span class="creator">{{ playlist.creator }}</span>
                        <span class="dot">•</span>
                        <span class="followers">{{ playlist.followers }} followers</span>
                        <span class="dot">•</span>
                        <span class="tracks">{{ playlist.tracks.length }} songs</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Playlist Content -->
        <div class="playlist-content">
            <div class="playlist-actions">
                <q-btn round color="primary" icon="play_arrow" size="lg" @click="playPlaylist" />
                <q-btn flat round color="white" icon="favorite" size="lg" @click="toggleLike"
                    :class="{ 'liked': playlist.isLiked }" />
                <q-btn flat round color="white" icon="more_horiz" size="lg">
                    <q-menu anchor="bottom right" self="top right" dark class="bg-dark">
                        <q-list style="min-width: 200px">
                            <q-item clickable v-close-popup @click="addToQueue">
                                <q-item-section>Add to Queue</q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup @click="addToPlaylist">
                                <q-item-section>Add to Playlist</q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup @click="sharePlaylist">
                                <q-item-section>Share</q-item-section>
                            </q-item>
                        </q-list>
                    </q-menu>
                </q-btn>
            </div>

            <!-- Tracks Table -->
            <q-table flat dark :rows="playlist.tracks" :columns="columns" row-key="id" hide-pagination
                :pagination="{ rowsPerPage: 0 }" class="tracks-table">
                <template v-slot:body-cell-index="props">
                    <q-td :props="props">
                        <div class="track-index">
                            <span v-if="!props.row.isPlaying">{{ props.row.index }}</span>
                            <q-icon v-else name="volume_up" color="primary" />
                        </div>
                    </q-td>
                </template>

                <template v-slot:body-cell-title="props">
                    <q-td :props="props">
                        <div class="track-info">
                            <q-img :src="props.row.image" class="track-image" />
                            <div class="track-details">
                                <div class="track-name" :class="{ 'playing': props.row.isPlaying }">
                                    {{ props.row.name }}
                                </div>
                                <div class="track-artist">{{ props.row.artist }}</div>
                            </div>
                        </div>
                    </q-td>
                </template>

                <template v-slot:body-cell-duration="props">
                    <q-td :props="props">
                        <div class="track-duration">
                            <q-btn flat round dense icon="favorite" size="sm" @click="toggleTrackLike(props.row)" />
                            <span>{{ formatDuration(props.row.duration) }}</span>
                        </div>
                    </q-td>
                </template>
            </q-table>
        </div>
    </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMusicPlayerStore } from '../stores/musicPlayer'

const route = useRoute()
const musicPlayer = useMusicPlayerStore()

// Mock playlist data - Replace with API call
const playlist = ref({
    id: route.params.id,
    name: 'Liked Songs',
    type: 'playlist',
    image: 'https://misc.scdn.co/liked-songs/liked-songs-640.png',
    creator: 'Your Library',
    followers: '1.2M',
    description: 'All your liked songs in one place',
    color: '#1db954',
    isLiked: true,
    tracks: [
        {
            id: '1',
            index: 1,
            name: 'Believer',
            artist: 'Imagine Dragons',
            image: 'https://i.scdn.co/image/ab67616d00001e02c8a11e48c91a982d086afc69',
            duration: 204,
            isPlaying: false,
            isLiked: true
        },
        {
            id: '2',
            index: 2,
            name: 'Thunder',
            artist: 'Imagine Dragons',
            image: 'https://i.scdn.co/image/ab67616d00001e02c8a11e48c91a982d086afc69',
            duration: 187,
            isPlaying: false,
            isLiked: false
        },
        // Add more tracks...
    ]
})

const columns = [
    {
        name: 'index',
        label: '#',
        field: 'index',
        align: 'left',
        style: 'width: 50px'
    },
    {
        name: 'title',
        label: 'TITLE',
        field: 'name',
        align: 'left',
        style: 'width: 40%'
    },
    {
        name: 'duration',
        label: '',
        field: 'duration',
        align: 'right',
        style: 'width: 100px'
    }
]

// Methods
const playPlaylist = () => {
    musicPlayer.playContext(playlist.value)
}

const toggleLike = () => {
    playlist.value.isLiked = !playlist.value.isLiked
}

const toggleTrackLike = (track) => {
    track.isLiked = !track.isLiked
}

const addToQueue = () => {
    // Implement add to queue logic
}

const addToPlaylist = () => {
    // Implement add to playlist logic
}

const sharePlaylist = () => {
    // Implement share logic
}

const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

onMounted(() => {
    // Fetch playlist data from API
    // const response = await fetchPlaylist(route.params.id)
    // playlist.value = response.data
})
</script>

<style lang="scss">
.playlist-detail-page {
    background: #121212;
    min-height: 100vh;
    padding-bottom: 90px; // Space for player
}

.playlist-header {
    padding: 40px 32px;
    display: flex;
    align-items: flex-end;
    min-height: 340px;
}

.playlist-info {
    display: flex;
    gap: 24px;
    align-items: flex-end;
}

.playlist-image {
    width: 232px;
    height: 232px;
    box-shadow: 0 4px 60px rgba(0, 0, 0, 0.5);

    .q-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}

.playlist-details {
    flex: 1;
    color: white;

    .playlist-type {
        text-transform: uppercase;
        font-size: 0.75rem;
        font-weight: 700;
        margin-bottom: 8px;
    }

    .playlist-title {
        font-size: 3rem;
        font-weight: 700;
        margin: 0 0 16px;
        line-height: 1.2;
    }

    .playlist-description {
        color: #b3b3b3;
        font-size: 0.875rem;
        margin-bottom: 16px;
    }

    .playlist-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.875rem;
        color: #b3b3b3;

        .dot {
            font-size: 0.5rem;
        }
    }
}

.playlist-content {
    padding: 24px 32px;
}

.playlist-actions {
    display: flex;
    gap: 24px;
    margin-bottom: 32px;

    .q-btn {
        &.liked {
            color: #1db954;
        }
    }
}

.tracks-table {
    background: transparent;

    .q-table__top {
        padding: 0;
    }

    .q-table__bottom {
        display: none;
    }

    th {
        font-size: 0.75rem;
        font-weight: 500;
        text-transform: uppercase;
        color: #b3b3b3;
        border: none;
    }

    td {
        border: none;
        padding: 12px 16px;
    }

    tbody tr {
        &:hover {
            background: rgba(255, 255, 255, 0.1);

            .track-index {
                span {
                    display: none;
                }

                .q-btn {
                    display: block;
                }
            }
        }
    }
}

.track-index {
    color: #b3b3b3;
    font-size: 0.875rem;
    text-align: center;

    .q-btn {
        display: none;
        color: white;
    }
}

.track-info {
    display: flex;
    align-items: center;
    gap: 16px;
}

.track-image {
    width: 40px;
    height: 40px;
}

.track-details {
    .track-name {
        color: white;
        font-size: 1rem;
        margin-bottom: 4px;

        &.playing {
            color: #1db954;
        }
    }

    .track-artist {
        color: #b3b3b3;
        font-size: 0.875rem;
    }
}

.track-duration {
    display: flex;
    align-items: center;
    gap: 16px;
    color: #b3b3b3;
    font-size: 0.875rem;

    .q-btn {
        opacity: 0;
        transition: opacity 0.2s ease;
    }

    tr:hover & .q-btn {
        opacity: 1;
    }
}

// Dark theme overrides for q-menu
.q-menu.bg-dark {
    background: #282828 !important;

    .q-item {
        color: #fff;

        &:hover {
            background: rgba(255, 255, 255, 0.1);
        }
    }
}
</style>
