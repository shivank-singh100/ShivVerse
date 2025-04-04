<template>
    <q-page class="liked-songs-page">
        <!-- Header Section -->
        <div class="header-section">
            <div class="header-info">
                <div class="header-image">
                    <div class="liked-songs-icon">
                        <q-icon name="favorite" size="64px" />
                    </div>
                </div>
                <div class="header-details">
                    <h6 class="header-type">PLAYLIST</h6>
                    <h1 class="header-title">Liked Songs</h1>
                    <div class="header-meta">
                        <span>{{ likedSongs.length }} songs</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
            <q-btn round color="primary" icon="play_arrow" size="lg" @click="playLikedSongs" />
            <q-btn flat round color="white" icon="more_horiz" size="md">
                <q-menu anchor="bottom right" self="top right" dark class="bg-dark">
                    <q-list style="min-width: 200px">
                        <q-item clickable v-close-popup @click="addToQueue">
                            <q-item-section>Add to Queue</q-item-section>
                        </q-item>
                    </q-list>
                </q-menu>
            </q-btn>
        </div>

        <!-- Tracks Table -->
        <div class="tracks-container">
            <div class="tracks-header">
                <div class="tracks-header-row">
                    <div class="header-index">#</div>
                    <div class="header-title">TITLE</div>
                    <div class="header-album">ALBUM</div>
                    <div class="header-date-added">DATE ADDED</div>
                    <div class="header-duration">
                        <q-icon name="schedule" size="20px" />
                    </div>
                </div>
            </div>

            <div class="tracks-divider"></div>

            <div class="tracks-list">
                <div v-for="(track, index) in likedSongs" :key="track.id" class="track-item" @click="playTrack(track)"
                    :class="{ 'is-playing': track.isPlaying }">
                    <div class="track-index">
                        <span v-if="!track.isPlaying && !isHovering[index]">{{ index + 1 }}</span>
                        <q-icon v-else-if="track.isPlaying" name="volume_up" color="primary" size="16px" />
                        <q-btn v-else flat round dense icon="play_arrow" size="sm" color="white" />
                    </div>
                    <div class="track-info">
                        <div class="track-image">
                            <q-img :src="track.image" />
                        </div>
                        <div class="track-details">
                            <div class="track-name" :class="{ 'playing': track.isPlaying }">{{ track.name }}</div>
                            <div class="track-artist">{{ track.artist }}</div>
                        </div>
                    </div>
                    <div class="track-album">{{ track.album }}</div>
                    <div class="track-date-added">{{ formatDate(track.dateAdded) }}</div>
                    <div class="track-duration">
                        <q-btn flat round dense icon="favorite" color="primary" size="sm" class="liked-button"
                            @click.stop="unlikeTrack(track)" />
                        <span>{{ formatDuration(track.duration) }}</span>
                    </div>
                </div>
            </div>
        </div>
    </q-page>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMusicPlayerStore } from 'src/stores/musicPlayer'
import spotifyService from 'src/services/spotifyService'
import { date } from 'quasar'

const router = useRouter()
const musicPlayer = useMusicPlayerStore()
const likedSongs = ref([])
const isLoading = ref(true)
const totalDuration = computed(() => {
    return likedSongs.value.reduce((total, track) => total + (track.duration_ms || 0), 0)
})
const isHovering = reactive({})

const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    return date.formatDate(new Date(dateString), 'MMMM D, YYYY')
}

const playAllSongs = () => {
    if (likedSongs.value.length > 0) {
        musicPlayer.playSong(likedSongs.value[0], likedSongs.value)
    }
}

const playSong = (track, index) => {
    musicPlayer.playSong(track, likedSongs.value, index)
}

const unlikeSong = (trackId) => {
    likedSongs.value = likedSongs.value.filter(track => track.id !== trackId)
}

onMounted(async () => {
    try {
        const response = await spotifyService.searchTracks('genre:pop', 20)
        if (response && response.tracks && response.tracks.items) {
            likedSongs.value = response.tracks.items.map(track => ({
                ...track,
                liked: true,
                album: {
                    ...track.album,
                    release_date: track.album.release_date
                }
            }))
        }
    } catch (error) {
        console.error('Error fetching liked songs:', error)
        likedSongs.value = [
            {
                id: '1',
                name: 'Blinding Lights',
                artists: [{ name: 'The Weeknd', id: 'artist1' }],
                album: { name: 'After Hours', images: [{ url: 'https://via.placeholder.com/80' }], release_date: '2020-03-20' },
                duration_ms: 200000,
                liked: true
            },
            {
                id: '2',
                name: 'Dance Monkey',
                artists: [{ name: 'Tones and I', id: 'artist2' }],
                album: { name: 'The Kids Are Coming', images: [{ url: 'https://via.placeholder.com/80' }], release_date: '2019-08-29' },
                duration_ms: 210000,
                liked: true
            },
            {
                id: '3',
                name: 'Watermelon Sugar',
                artists: [{ name: 'Harry Styles', id: 'artist3' }],
                album: { name: 'Fine Line', images: [{ url: 'https://via.placeholder.com/80' }], release_date: '2019-12-13' },
                duration_ms: 174000,
                liked: true
            }
        ]
    } finally {
        isLoading.value = false
    }
})

const playLikedSongs = () => {
    musicPlayer.playContext({ tracks: likedSongs.value })
}

const playTrack = (track) => {
    musicPlayer.playTrack(track)
}

const unlikeTrack = (track) => {
    const index = likedSongs.value.findIndex(t => t.id === track.id)
    if (index !== -1) {
        likedSongs.value.splice(index, 1)
    }
}

const addToQueue = () => {
    likedSongs.value.forEach(track => {
        musicPlayer.addToQueue(track)
    })
}

// Event listeners for hovering
onMounted(() => {
    const trackItems = document.querySelectorAll('.track-item')

    trackItems.forEach((item, index) => {
        item.addEventListener('mouseenter', () => {
            isHovering[index] = true
        })

        item.addEventListener('mouseleave', () => {
            isHovering[index] = false
        })
    })
})
</script>

<style lang="scss">
.liked-songs-page {
    background: linear-gradient(180deg, #5038a1 0%, #121212 100%);
    min-height: 100vh;
    padding-bottom: 90px; // Space for player
    color: #fff;
}

.header-section {
    padding: 100px 32px 24px;
}

.header-info {
    display: flex;
    align-items: flex-end;
    gap: 24px;
}

.header-image {
    width: 232px;
    height: 232px;
    box-shadow: 0 4px 60px rgba(0, 0, 0, 0.5);
    background: linear-gradient(135deg, #450af5, #c4efd9);
    display: flex;
    align-items: center;
    justify-content: center;
}

.liked-songs-icon {
    color: white;
}

.header-details {
    .header-type {
        font-size: 0.75rem;
        font-weight: 700;
        margin: 0 0 8px;
    }

    .header-title {
        font-size: 3rem;
        font-weight: 700;
        margin: 0 0 12px;
    }

    .header-meta {
        font-size: 0.875rem;
        color: rgba(255, 255, 255, 0.7);
    }
}

.action-buttons {
    padding: 24px 32px;
    display: flex;
    gap: 16px;
}

.tracks-container {
    padding: 0 32px;
}

.tracks-header {
    margin-bottom: 16px;

    .tracks-header-row {
        display: grid;
        grid-template-columns: 48px 4fr 2fr 2fr 1fr;
        align-items: center;
        padding: 0 16px;
        color: #b3b3b3;
        font-size: 0.85rem;
        text-transform: uppercase;
        font-weight: 500;
    }
}

.tracks-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin-bottom: 16px;
}

.track-item {
    display: grid;
    grid-template-columns: 48px 4fr 2fr 2fr 1fr;
    align-items: center;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;

    &:hover,
    &.is-playing {
        background: rgba(255, 255, 255, 0.1);
    }
}

.track-index {
    color: #b3b3b3;
    font-size: 1rem;
    display: flex;
    justify-content: center;
}

.track-info {
    display: flex;
    align-items: center;
    gap: 16px;

    .track-image {
        width: 40px;
        height: 40px;

        .q-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
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

            &:hover {
                color: white;
                text-decoration: underline;
            }
        }
    }
}

.track-album {
    color: #b3b3b3;
    font-size: 0.875rem;

    &:hover {
        color: white;
        text-decoration: underline;
    }
}

.track-date-added {
    color: #b3b3b3;
    font-size: 0.875rem;
}

.track-duration {
    display: flex;
    align-items: center;
    gap: 16px;
    color: #b3b3b3;
    font-size: 0.875rem;
    justify-content: flex-end;

    .liked-button {
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
