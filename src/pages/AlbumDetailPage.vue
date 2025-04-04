<template>
    <q-page class="album-detail-page">
        <!-- Album Header -->
        <div class="album-header" :style="headerStyle">
            <div class="album-header-content">
                <div class="album-image-container">
                    <q-img :src="albumImage" :ratio="1" spinner-color="primary" class="album-artwork q-mb-md"
                        @error="handleImageError" />
                </div>
                <div class="album-info">
                    <div class="album-type">ALBUM</div>
                    <h1 class="album-title">{{ album.name || 'Album Name' }}</h1>
                    <div class="album-meta">
                        <q-avatar size="24px" v-if="artistImage">
                            <q-img :src="artistImage" @error="handleArtistImageError" />
                        </q-avatar>
                        <router-link :to="`/artist/${artist.id}`" class="artist-name">{{ artist.name || 'Artist Name'
                        }}</router-link> •
                        <span>{{ releaseYear }}</span> •
                        <span>{{ album.total_tracks || tracks.length }} songs</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Album Content -->
        <div class="album-content">
            <!-- Album Actions -->
            <div class="album-actions q-mb-lg">
                <q-btn round icon="play_arrow" color="primary" size="lg" class="play-button" @click="playAlbum" />
                <q-btn flat round :icon="isLiked ? 'favorite' : 'favorite_border'"
                    :color="isLiked ? 'pink-6' : 'grey-5'" @click="toggleLike" />
                <q-btn flat round icon="more_horiz" color="grey-5">
                    <q-menu dark content-class="bg-dark">
                        <q-list style="min-width: 200px">
                            <q-item clickable v-close-popup @click="addToQueue">
                                <q-item-section>Add to Queue</q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup>
                                <q-item-section>Add to Playlist</q-item-section>
                            </q-item>
                            <q-item clickable v-close-popup>
                                <q-item-section>Share</q-item-section>
                            </q-item>
                        </q-list>
                    </q-menu>
                </q-btn>
            </div>

            <!-- Tracks Table -->
            <div class="tracks-section">
                <q-table :rows="tracks" :columns="columns" row-key="id" dark class="album-tracks-table"
                    :pagination="{ rowsPerPage: 0 }" hide-bottom :loading="loading">
                    <!-- Track Number/Play Column -->
                    <template v-slot:body-cell-index="props">
                        <q-td :props="props" class="track-index-cell">
                            <div class="track-index-wrapper">
                                <span class="track-number"
                                    v-show="!isHovered(props.row.id) && props.row.id !== currentTrackId">{{
                                        props.row.track_number }}</span>
                                <q-btn flat round size="sm" icon="play_arrow" color="white"
                                    v-show="isHovered(props.row.id) || props.row.id === currentTrackId"
                                    @click="playTrack(props.row)" />
                            </div>
                        </q-td>
                    </template>

                    <!-- Title Column -->
                    <template v-slot:body-cell-title="props">
                        <q-td :props="props" class="track-title-cell">
                            <div class="track-title-wrapper">
                                <div :class="['track-title', { 'playing': props.row.id === currentTrackId }]">{{
                                    props.row.name }}</div>
                                <div class="track-artist" v-if="props.row.artists && props.row.artists.length">
                                    {{ props.row.artists[0].name }}
                                </div>
                            </div>
                        </q-td>
                    </template>

                    <!-- Duration Column -->
                    <template v-slot:body-cell-duration="props">
                        <q-td :props="props" class="track-duration-cell">
                            <div class="duration-wrapper">
                                <q-btn flat round size="sm" icon="favorite" v-if="isTrackLiked(props.row.id)"
                                    color="primary" @click="toggleTrackLike(props.row)" class="like-button" />
                                <q-btn flat round size="sm" icon="favorite_border" v-else class="like-button"
                                    color="grey-5" @click="toggleTrackLike(props.row)" />
                                <span class="duration">{{ formatDuration(props.row.duration_ms) }}</span>
                            </div>
                        </q-td>
                    </template>
                </q-table>
            </div>

            <!-- Album Credits -->
            <div class="album-credits">
                <p class="release-date">{{ formatDate(album.release_date) }}</p>
                <p v-if="album.label" class="album-label">© {{ releaseYear }} {{ album.label }}</p>
                <p v-if="album.copyrights && album.copyrights.length" class="copyright">
                    {{ album.copyrights[0].text }}
                </p>
            </div>
        </div>
    </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMusicPlayerStore } from '../stores/musicPlayer'
import spotifyService from '../services/spotifyService'

const route = useRoute()
const musicPlayer = useMusicPlayerStore()
const albumId = computed(() => route.params.id)

const album = ref({
    id: '',
    name: 'Loading album...',
    images: [],
    artists: [{ id: '', name: 'Artist' }],
    release_date: '',
    total_tracks: 0,
    label: '',
    copyrights: []
})

const artist = ref({
    id: '',
    name: 'Artist',
    images: []
})

const tracks = ref([])
const loading = ref(true)
const hoveredTrackId = ref(null)
const fallbackAlbumImage = 'https://via.placeholder.com/300?text=Album'
const fallbackArtistImage = 'https://via.placeholder.com/40?text=Artist'
const imageError = ref(false)
const artistImageError = ref(false)

// Album Image with fallback
const albumImage = computed(() => {
    if (imageError.value) return fallbackAlbumImage
    if (!album.value.images || album.value.images.length === 0) return fallbackAlbumImage
    return album.value.images[0]?.url || fallbackAlbumImage
})

// Artist Image with fallback
const artistImage = computed(() => {
    if (artistImageError.value) return fallbackArtistImage
    if (!artist.value.images || artist.value.images.length === 0) return fallbackArtistImage
    return artist.value.images[0]?.url || fallbackArtistImage
})

// Dynamic header background based on album art
const headerStyle = computed(() => {
    return {
        background: `linear-gradient(rgba(0,0,0,0.5), rgb(18, 18, 18) 85%),
                    url(${albumImage.value})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%'
    }
})

const isLiked = ref(false)
const releaseYear = computed(() => {
    if (!album.value.release_date) return ''
    return new Date(album.value.release_date).getFullYear()
})

const currentTrackId = computed(() => {
    return musicPlayer.currentTrack?.id || ''
})

const columns = [
    { name: 'index', label: '#', field: 'track_number', align: 'center', style: 'width: 70px' },
    { name: 'title', label: 'TITLE', field: 'name', style: 'width: 80%' },
    { name: 'duration', label: '', field: 'duration_ms', align: 'right' }
]

// Handle image load errors
const handleImageError = (err) => {
    console.error('Album image error:', err)
    imageError.value = true
}

const handleArtistImageError = (err) => {
    console.error('Artist image error:', err)
    artistImageError.value = true
}

onMounted(async () => {
    if (!albumId.value) {
        loading.value = false
        return
    }

    try {
        loading.value = true

        // Fetch album details
        try {
            const albumData = await spotifyService.getAlbum(albumId.value)
            if (albumData) {
                album.value = albumData

                // Set artist if available
                if (albumData.artists && albumData.artists.length > 0) {
                    artist.value = {
                        id: albumData.artists[0].id,
                        name: albumData.artists[0].name,
                        images: []
                    }

                    // Try to get artist details
                    try {
                        const artistData = await spotifyService.getArtist(albumData.artists[0].id)
                        if (artistData) {
                            artist.value = artistData
                        }
                    } catch (artistError) {
                        console.warn('Could not fetch artist details:', artistError)
                    }
                }
            }
        } catch (albumError) {
            console.error('Error fetching album:', albumError)
            // Use mock data as fallback
            album.value = {
                id: albumId.value,
                name: 'Album Name',
                images: [{ url: fallbackAlbumImage }],
                artists: [{ id: 'artist-1', name: 'Artist Name' }],
                release_date: '2023-01-01',
                total_tracks: 10,
                label: 'Record Label',
                copyrights: [{ text: '© 2023 Record Label' }]
            }
        }

        // Fetch album tracks
        try {
            const trackData = await spotifyService.getAlbumTracks(albumId.value)
            if (trackData && trackData.length > 0) {
                tracks.value = trackData.map((track, index) => ({
                    ...track,
                    track_number: index + 1
                }))
            }
        } catch (tracksError) {
            console.error('Error fetching album tracks:', tracksError)
            // Generate mock tracks as fallback
            tracks.value = Array.from({ length: 10 }, (_, i) => ({
                id: `mock-track-${i}`,
                name: `Track ${i + 1}`,
                track_number: i + 1,
                duration_ms: 180000 + (i * 10000),
                artists: [{ id: artist.value.id, name: artist.value.name }]
            }))
        }

        // Check if album is liked
        isLiked.value = musicPlayer.isLiked(albumId.value)
    } catch (error) {
        console.error('Error loading album data:', error)
    } finally {
        loading.value = false
    }
})

const isHovered = (trackId) => {
    return hoveredTrackId.value === trackId
}

const playAlbum = () => {
    if (tracks.value.length > 0) {
        // Play first track
        musicPlayer.playTrack(tracks.value[0])

        // Add rest of album to queue
        tracks.value.slice(1).forEach(track => {
            musicPlayer.addToQueue(track)
        })
    }
}

const playTrack = (track) => {
    musicPlayer.playTrack(track)
}

const toggleLike = () => {
    isLiked.value = !isLiked.value
    // In a real app, would save this preference
}

const addToQueue = () => {
    tracks.value.forEach(track => {
        musicPlayer.addToQueue(track)
    })
}

const isTrackLiked = (trackId) => {
    return musicPlayer.isLiked(trackId)
}

const toggleTrackLike = (track) => {
    musicPlayer.toggleLike(track)
}

const formatDuration = (ms) => {
    if (!ms) return '0:00'
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
}
</script>

<style lang="scss">
.album-detail-page {
    background: #121212;
    min-height: 100vh;
    padding-bottom: 90px; // Space for player
}

.album-header {
    padding: 40px 32px;
    display: flex;
    align-items: flex-end;
    min-height: 340px;
}

.album-info {
    display: flex;
    gap: 24px;
    align-items: flex-end;
}

.album-image {
    width: 232px;
    height: 232px;
    box-shadow: 0 4px 60px rgba(0, 0, 0, 0.5);

    .q-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}

.album-details {
    flex: 1;
    color: white;

    .album-type {
        text-transform: uppercase;
        font-size: 0.75rem;
        font-weight: 700;
        margin-bottom: 8px;
    }

    .album-title {
        font-size: 3rem;
        font-weight: 700;
        margin: 0 0 16px;
        line-height: 1.2;
    }

    .album-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 0.875rem;
        color: #b3b3b3;

        .album-artist {
            display: flex;
            align-items: center;
            gap: 8px;
            cursor: pointer;

            &:hover {
                text-decoration: underline;
            }
        }

        .artist-image {
            width: 24px;
            height: 24px;
            border-radius: 50%;
        }

        .dot {
            font-size: 0.5rem;
        }
    }
}

.album-content {
    padding: 24px 32px;
}

.album-actions {
    display: flex;
    gap: 24px;
    margin-bottom: 32px;

    .q-btn {
        &.liked {
            color: #1db954;
        }
    }
}

.tracks-section {
    margin-bottom: 32px;
}

.album-tracks-table {
    background-color: transparent;
    border-radius: 8px;

    .q-table__top,
    .q-table__bottom,
    thead tr:first-child th {
        background-color: transparent;
    }

    thead tr th {
        color: #b3b3b3;
        font-size: 12px;
        font-weight: 400;
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    tbody tr:hover {
        background-color: rgba(255, 255, 255, 0.1);
    }

    tbody tr td {
        color: #fff;
        border-bottom: none;
        padding: 8px 16px;
    }

    .track-index-cell {
        width: 50px;
        text-align: center;

        .track-index-wrapper {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 16px;
            margin: 0 auto;
        }

        .track-number {
            color: #b3b3b3;
            font-size: 16px;
        }
    }

    .track-title-cell {
        .track-title-wrapper {
            display: flex;
            flex-direction: column;
        }

        .track-title {
            font-size: 16px;
            font-weight: 400;

            &.playing {
                color: #1DB954;
            }
        }

        .track-artist {
            font-size: 14px;
            color: #b3b3b3;
        }
    }

    .track-duration-cell {
        text-align: right;
        width: 120px;

        .duration-wrapper {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            gap: 16px;
        }

        .duration {
            color: #b3b3b3;
            font-size: 14px;
            font-family: 'Roboto Mono', monospace;
        }

        .like-button {
            opacity: 0.7;

            &:hover {
                opacity: 1;
            }
        }
    }
}

.album-credits {
    margin-top: 48px;
    padding-top: 24px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);

    .credits-header {
        color: white;
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 24px;
    }

    .credits-content {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .credit-item {
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .credit-label {
        color: #b3b3b3;
        font-size: 0.875rem;
    }

    .credit-value {
        color: white;
        font-size: 1rem;
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
