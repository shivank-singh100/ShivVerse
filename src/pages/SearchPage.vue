<template>
    <q-page class="search-page">
        <div class="search-container">
            <div class="search-header">
                <h1>Search</h1>
                <div class="search-input-wrapper">
                    <q-input v-model="searchQuery" outlined dark placeholder="What do you want to listen to?"
                        class="search-input" @input="handleSearch" clearable>
                        <template v-slot:prepend>
                            <q-icon name="search" />
                        </template>
                    </q-input>
                </div>
            </div>

            <!-- Recent Searches - Show when there's no active search -->
            <div v-if="!searchQuery" class="recent-searches-section">
                <h2>Recent searches</h2>
                <div class="recent-searches-grid">
                    <div v-for="item in recentSearches" :key="item.id" class="search-history-item"
                        @click="navigateToItem(item)">
                        <div class="history-item-image" :class="{ 'rounded': item.type === 'artist' }">
                            <q-img :src="item.image" />
                        </div>
                        <div class="history-item-info">
                            <div class="history-item-name">{{ item.name }}</div>
                            <div class="history-item-type">{{ item.type }}</div>
                        </div>
                        <q-btn flat round dense color="grey" icon="close" class="remove-history-btn"
                            @click.stop="removeFromHistory(item)" />
                    </div>
                </div>
            </div>

            <!-- Browse All Categories - Show when there's no active search -->
            <div v-if="!searchQuery" class="browse-categories-section">
                <h2>Browse all</h2>
                <div class="categories-grid">
                    <div v-for="category in categories" :key="category.id" class="category-card"
                        :style="{ backgroundColor: category.color }" @click="selectCategory(category)">
                        <div class="category-name">{{ category.name }}</div>
                        <div class="category-image">
                            <q-img :src="category.image" class="rotated-image" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Search Results - Show when there's an active search -->
            <div v-if="searchQuery" class="search-results">
                <!-- Top Result -->
                <div class="search-results-section top-result-and-songs">
                    <div class="top-result-section">
                        <h2>Top result</h2>
                        <div class="top-result-card" @click="navigateToItem(topResult)">
                            <div class="top-result-image" :class="{ 'rounded': topResult.type === 'artist' }">
                                <q-img :src="topResult.image" />
                            </div>
                            <div class="top-result-name">{{ topResult.name }}</div>
                            <div class="top-result-type">{{ topResult.type }}</div>
                            <q-btn round color="primary" icon="play_arrow" class="play-button"
                                @click.stop="playItem(topResult)" />
                        </div>
                    </div>

                    <div class="songs-section">
                        <h2>Songs</h2>
                        <div class="songs-list">
                            <div v-for="track in tracks.slice(0, 4)" :key="track.id" class="song-item"
                                @click="playTrack(track)">
                                <div class="song-image">
                                    <q-img :src="track.image" />
                                </div>
                                <div class="song-info">
                                    <div class="song-name">{{ track.name }}</div>
                                    <div class="song-artist">{{ track.artist }}</div>
                                </div>
                                <div class="song-duration">{{ formatDuration(track.duration) }}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Artists -->
                <div class="search-results-section">
                    <h2>Artists</h2>
                    <div class="search-results-grid">
                        <div v-for="artist in artists.slice(0, 6)" :key="artist.id" class="result-card"
                            @click="navigateToArtist(artist.id)">
                            <div class="result-image rounded">
                                <q-img :src="artist.image" />
                                <div class="play-overlay">
                                    <q-btn round color="primary" icon="play_arrow" @click.stop="playItem(artist)" />
                                </div>
                            </div>
                            <div class="result-name">{{ artist.name }}</div>
                            <div class="result-type">Artist</div>
                        </div>
                    </div>
                </div>

                <!-- Albums -->
                <div class="search-results-section">
                    <h2>Albums</h2>
                    <div class="search-results-grid">
                        <div v-for="album in albums.slice(0, 6)" :key="album.id" class="result-card"
                            @click="navigateToAlbum(album.id)">
                            <div class="result-image">
                                <q-img :src="album.image" />
                                <div class="play-overlay">
                                    <q-btn round color="primary" icon="play_arrow" @click.stop="playItem(album)" />
                                </div>
                            </div>
                            <div class="result-name">{{ album.name }}</div>
                            <div class="result-type">Album • {{ album.artist }}</div>
                        </div>
                    </div>
                </div>

                <!-- Playlists -->
                <div class="search-results-section">
                    <h2>Playlists</h2>
                    <div class="search-results-grid">
                        <div v-for="playlist in playlists.slice(0, 6)" :key="playlist.id" class="result-card"
                            @click="navigateToPlaylist(playlist.id)">
                            <div class="result-image">
                                <q-img :src="playlist.image" />
                                <div class="play-overlay">
                                    <q-btn round color="primary" icon="play_arrow" @click.stop="playItem(playlist)" />
                                </div>
                            </div>
                            <div class="result-name">{{ playlist.name }}</div>
                            <div class="result-type">Playlist • {{ playlist.creator }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </q-page>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useMusicPlayerStore } from '../stores/musicPlayer'

const router = useRouter()
const musicPlayer = useMusicPlayerStore()

const searchQuery = ref('')
const searchResults = ref({})

// Mock data
const recentSearches = ref([
    {
        id: '1',
        name: 'Imagine Dragons',
        type: 'artist',
        image: 'https://i.scdn.co/image/ab6761610000e5eb920dc1e0f00bad3853499362'
    },
    {
        id: '2',
        name: 'Evolve',
        type: 'album',
        artist: 'Imagine Dragons',
        image: 'https://i.scdn.co/image/ab67616d00001e02c8a11e48c91a982d086afc69'
    },
    {
        id: '3',
        name: 'Today\'s Top Hits',
        type: 'playlist',
        image: 'https://i.scdn.co/image/ab67706f000000024e0520f8746ad50fa552e5b0'
    }
])

const categories = ref([
    {
        id: '1',
        name: 'Pop',
        color: '#8D67AB',
        image: 'https://i.scdn.co/image/ab67fb8200005caf474a464e11f41760f9c8b2f2'
    },
    {
        id: '2',
        name: 'Hip-Hop',
        color: '#BA5D07',
        image: 'https://i.scdn.co/image/ab67fb8200005cafa1a252e3a815b65778d8c2aa'
    },
    {
        id: '3',
        name: 'Rock',
        color: '#E61E32',
        image: 'https://i.scdn.co/image/ab67fb8200005cafae7e69beb88f16969641b53e'
    },
    {
        id: '4',
        name: 'Electronic',
        color: '#0D73EC',
        image: 'https://i.scdn.co/image/ab67fb8200005cafb2cdd7a95b4a308374ef0ac2'
    },
    {
        id: '5',
        name: 'Indie',
        color: '#608108',
        image: 'https://i.scdn.co/image/ab67fb8200005cafdfdaac1cf9574a196ca25196'
    },
    {
        id: '6',
        name: 'Jazz',
        color: '#DC148C',
        image: 'https://i.scdn.co/image/ab67fb8200005cafcbf80f8ea695536eace4fd2c'
    },
    {
        id: '7',
        name: 'R&B',
        color: '#1E3264',
        image: 'https://i.scdn.co/image/ab67fb8200005cafa59f90c077c9f618fd0dde30'
    },
    {
        id: '8',
        name: 'Classical',
        color: '#7D4B32',
        image: 'https://i.scdn.co/image/ab67fb8200005cafef2187ffca4242ec5da84aca'
    }
])

// Mock search results
const artists = ref([
    {
        id: '1',
        name: 'Imagine Dragons',
        image: 'https://i.scdn.co/image/ab6761610000e5eb920dc1e0f00bad3853499362'
    },
    {
        id: '2',
        name: 'Imogen Heap',
        image: 'https://i.scdn.co/image/ab6761610000e5eb920dc1e0f00bad3853499362'
    },
    {
        id: '3',
        name: 'Imperial Circus Dead Decadence',
        image: 'https://i.scdn.co/image/ab6761610000e5eb920dc1e0f00bad3853499362'
    }
])

const albums = ref([
    {
        id: '1',
        name: 'Evolve',
        artist: 'Imagine Dragons',
        image: 'https://i.scdn.co/image/ab67616d00001e02c8a11e48c91a982d086afc69'
    },
    {
        id: '2',
        name: 'Origins',
        artist: 'Imagine Dragons',
        image: 'https://i.scdn.co/image/ab67616d00001e02c8a11e48c91a982d086afc69'
    },
    {
        id: '3',
        name: 'Night Visions',
        artist: 'Imagine Dragons',
        image: 'https://i.scdn.co/image/ab67616d00001e02c8a11e48c91a982d086afc69'
    }
])

const playlists = ref([
    {
        id: '1',
        name: 'Imagine Dragons Radio',
        creator: 'Spotify',
        image: 'https://i.scdn.co/image/ab67706f000000024e0520f8746ad50fa552e5b0'
    },
    {
        id: '2',
        name: 'This is Imagine Dragons',
        creator: 'Spotify',
        image: 'https://i.scdn.co/image/ab67706f000000024e0520f8746ad50fa552e5b0'
    }
])

const tracks = ref([
    {
        id: '1',
        name: 'Believer',
        artist: 'Imagine Dragons',
        album: 'Evolve',
        duration: 204,
        image: 'https://i.scdn.co/image/ab67616d00001e02c8a11e48c91a982d086afc69'
    },
    {
        id: '2',
        name: 'Thunder',
        artist: 'Imagine Dragons',
        album: 'Evolve',
        duration: 187,
        image: 'https://i.scdn.co/image/ab67616d00001e02c8a11e48c91a982d086afc69'
    },
    {
        id: '3',
        name: 'Natural',
        artist: 'Imagine Dragons',
        album: 'Origins',
        duration: 190,
        image: 'https://i.scdn.co/image/ab67616d00001e02c8a11e48c91a982d086afc69'
    },
    {
        id: '4',
        name: 'Whatever It Takes',
        artist: 'Imagine Dragons',
        album: 'Evolve',
        duration: 201,
        image: 'https://i.scdn.co/image/ab67616d00001e02c8a11e48c91a982d086afc69'
    }
])

// Computed properties
const topResult = computed(() => {
    return artists.value[0] || {}
})

// Methods
const handleSearch = () => {
    // In a real app, this would trigger an API call
    // For now, we're using the mock data
    if (searchQuery.value && searchQuery.value.length > 1) {
        // Filter mock data based on search query
        // In a real app, you'd replace this with API calls
    }
}

const navigateToItem = (item) => {
    if (item.type === 'artist') {
        navigateToArtist(item.id)
    } else if (item.type === 'album') {
        navigateToAlbum(item.id)
    } else if (item.type === 'playlist') {
        navigateToPlaylist(item.id)
    }
}

const navigateToArtist = (id) => {
    router.push(`/artist/${id}`)
}

const navigateToAlbum = (id) => {
    router.push(`/album/${id}`)
}

const navigateToPlaylist = (id) => {
    router.push(`/playlist/${id}`)
}

const playItem = (item) => {
    musicPlayer.playContext(item)
}

const playTrack = (track) => {
    musicPlayer.playTrack(track)
}

const selectCategory = (category) => {
    // In a real app, this would navigate to a category page or filter results
    searchQuery.value = category.name
    handleSearch()
}

const removeFromHistory = (item) => {
    const index = recentSearches.value.findIndex(search => search.id === item.id)
    if (index !== -1) {
        recentSearches.value.splice(index, 1)
    }
}

const formatDuration = (seconds) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// Add current search to recent searches when search changes
watch(searchQuery, (newValue, oldValue) => {
    if (!newValue || newValue === oldValue) return

    // Simulated delay to represent search completion
    setTimeout(() => {
        if (searchQuery.value && topResult.value && topResult.value.id) {
            // Check if already in recent searches
            const existingIndex = recentSearches.value.findIndex(item =>
                item.id === topResult.value.id && item.type === 'artist'
            )

            // If not in recent searches, add it
            if (existingIndex === -1) {
                recentSearches.value.unshift({
                    id: topResult.value.id,
                    name: topResult.value.name,
                    type: 'artist',
                    image: topResult.value.image
                })

                // Keep only the 6 most recent searches
                if (recentSearches.value.length > 6) {
                    recentSearches.value.pop()
                }
            }
        }
    }, 1000)
})
</script>

<style lang="scss">
.search-page {
    background: #121212;
    min-height: 100vh;
    padding-bottom: 90px; // Space for player
}

.search-container {
    padding: 24px 32px;
}

.search-header {
    margin-bottom: 24px;

    h1 {
        color: white;
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 16px;
    }
}

.search-input-wrapper {
    max-width: 364px;

    .search-input {
        .q-field__control {
            background: #ffffff;
            height: 48px;

            .q-field__marginal {
                color: #121212;
            }
        }

        .q-field__native {
            color: #121212;
            font-size: 0.875rem;

            &::placeholder {
                color: #727272;
            }
        }
    }
}

// Recent searches styling
.recent-searches-section {
    margin-bottom: 48px;

    h2 {
        color: white;
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 16px;
    }
}

.recent-searches-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 24px;
}

.search-history-item {
    background: #181818;
    border-radius: 4px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 16px;
    cursor: pointer;
    position: relative;

    &:hover {
        background: #282828;

        .remove-history-btn {
            opacity: 1;
        }
    }
}

.history-item-image {
    width: 48px;
    height: 48px;
    border-radius: 4px;
    overflow: hidden;

    &.rounded {
        border-radius: 50%;
    }

    .q-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}

.history-item-info {
    flex: 1;
    min-width: 0;

    .history-item-name {
        color: white;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .history-item-type {
        color: #b3b3b3;
        font-size: 0.75rem;
        text-transform: capitalize;
    }
}

.remove-history-btn {
    position: absolute;
    top: 8px;
    right: 8px;
    opacity: 0;
    transition: opacity 0.2s ease;
}

// Browse categories styling
.browse-categories-section {
    h2 {
        color: white;
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 16px;
    }
}

.categories-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 24px;
}

.category-card {
    height: 180px;
    border-radius: 8px;
    padding: 16px;
    position: relative;
    overflow: hidden;
    cursor: pointer;

    &:hover {
        .category-image {
            transform: scale(1.04) rotate(25deg);
        }
    }

    .category-name {
        color: white;
        font-size: 1.25rem;
        font-weight: 700;
        position: relative;
        z-index: 1;
    }

    .category-image {
        position: absolute;
        bottom: -5px;
        right: -15px;
        width: 100px;
        height: 100px;
        transform: rotate(25deg);
        transition: transform 0.3s ease;

        .q-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }
}

// Search results styling
.search-results {
    .search-results-section {
        margin-bottom: 48px;

        h2 {
            color: white;
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 16px;
        }
    }
}

.top-result-and-songs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;

    @media (max-width: 768px) {
        grid-template-columns: 1fr;
    }
}

.top-result-card {
    background: #181818;
    border-radius: 6px;
    padding: 20px;
    height: 100%;
    position: relative;
    cursor: pointer;

    &:hover {
        background: #282828;

        .play-button {
            opacity: 1;
            transform: translateY(0);
        }
    }

    .top-result-image {
        width: 92px;
        height: 92px;
        border-radius: 4px;
        margin-bottom: 16px;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);

        &.rounded {
            border-radius: 50%;
        }

        .q-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    .top-result-name {
        color: white;
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 4px;
    }

    .top-result-type {
        color: #b3b3b3;
        font-size: 0.875rem;
        text-transform: capitalize;
        background: rgba(0, 0, 0, 0.2);
        display: inline-block;
        padding: 4px 12px;
        border-radius: 16px;
        margin-top: 8px;
    }

    .play-button {
        position: absolute;
        bottom: 20px;
        right: 20px;
        opacity: 0;
        transform: translateY(8px);
        transition: all 0.3s ease;
        background: #1db954;

        &:hover {
            background: #1ed760;
            transform: scale(1.04) translateY(0);
        }
    }
}

.songs-list {
    background: #181818;
    border-radius: 6px;
    overflow: hidden;
}

.song-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    gap: 16px;
    cursor: pointer;

    &:hover {
        background: #282828;
    }

    .song-image {
        width: 40px;
        height: 40px;

        .q-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }
    }

    .song-info {
        flex: 1;
        min-width: 0;

        .song-name {
            color: white;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .song-artist {
            color: #b3b3b3;
            font-size: 0.75rem;
        }
    }

    .song-duration {
        color: #b3b3b3;
        font-size: 0.875rem;
    }
}

.search-results-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 24px;
}

.result-card {
    background: #181818;
    padding: 16px;
    border-radius: 6px;
    transition: background-color 0.3s ease;
    cursor: pointer;

    &:hover {
        background: #282828;

        .play-overlay {
            opacity: 1;
            transform: translateY(0);
        }
    }
}

.result-image {
    position: relative;
    width: 100%;
    padding-bottom: 100%;
    margin-bottom: 16px;
    border-radius: 4px;
    overflow: hidden;

    &.rounded {
        border-radius: 50%;
    }

    .q-img {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
    }
}

.play-overlay {
    position: absolute;
    bottom: 8px;
    right: 8px;
    opacity: 0;
    transform: translateY(8px);
    transition: all 0.3s ease;

    .q-btn {
        background: #1db954;
        color: black;

        &:hover {
            background: #1ed760;
            transform: scale(1.04);
        }
    }
}

.result-name {
    color: white;
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.result-type {
    color: #b3b3b3;
    font-size: 0.875rem;
}
</style>
