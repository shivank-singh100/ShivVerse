<template>
    <q-page class="home-page">
        <div class="content-container">
            <!-- Daily mixes section (Made For You) -->
            <DailyMixes />

            <!-- Browse categories section -->
            <BrowseCategories />

            <!-- Top playlists section -->
            <section class="section-container">
                <div class="section-header">
                    <h2 class="section-title">Your Top Playlists</h2>
                    <div class="see-all">SEE ALL</div>
                </div>
                <div class="items-grid">
                    <!-- Today's Top Hits -->
                    <div class="playlist-card">
                        <div class="playlist-image">
                            <q-img src="https://via.placeholder.com/180x180" ratio="1"></q-img>
                        </div>
                        <div class="playlist-title">Today's Top Hits</div>
                        <div class="playlist-description">The most popular songs right now</div>
                    </div>

                    <!-- RapCaviar -->
                    <div class="playlist-card">
                        <div class="playlist-image">
                            <q-img src="https://via.placeholder.com/180x180" ratio="1"></q-img>
                        </div>
                        <div class="playlist-title">RapCaviar</div>
                        <div class="playlist-description">New music from Kendrick Lamar, Drake and more</div>
                    </div>

                    <!-- All Out 2010s -->
                    <div class="playlist-card">
                        <div class="playlist-image">
                            <q-img src="https://via.placeholder.com/180x180" ratio="1"></q-img>
                        </div>
                        <div class="playlist-title">All Out 2010s</div>
                        <div class="playlist-description">The biggest songs of the 2010s</div>
                    </div>

                    <!-- Rock Classics -->
                    <div class="playlist-card">
                        <div class="playlist-image">
                            <q-img src="https://via.placeholder.com/180x180" ratio="1"></q-img>
                        </div>
                        <div class="playlist-title">Rock Classics</div>
                        <div class="playlist-description">Rock legends & epic songs</div>
                    </div>

                    <!-- Chill Hits -->
                    <div class="playlist-card">
                        <div class="playlist-image">
                            <q-img src="https://via.placeholder.com/180x180" ratio="1"></q-img>
                        </div>
                        <div class="playlist-title">Chill Hits</div>
                        <div class="playlist-description">Kick back to the best new chill hits</div>
                    </div>
                </div>
            </section>

            <!-- New releases section -->
            <section class="section-container">
                <div class="section-header">
                    <h2 class="section-title">New Releases</h2>
                    <div class="see-all">SEE ALL</div>
                </div>
                <div class="items-grid">
                    <!-- Evolve -->
                    <div class="album-card" @click="navigateTo('/album/evolve')">
                        <div class="album-image">
                            <q-img src="https://via.placeholder.com/180x180" ratio="1"></q-img>
                        </div>
                        <div class="album-title">Evolve</div>
                        <div class="album-artist">Imagine Dragons</div>
                    </div>

                    <!-- Night Visions -->
                    <div class="album-card" @click="navigateTo('/album/night-visions')">
                        <div class="album-image">
                            <q-img src="https://via.placeholder.com/180x180" ratio="1"></q-img>
                        </div>
                        <div class="album-title">Night Visions</div>
                        <div class="album-artist">Imagine Dragons</div>
                    </div>

                    <!-- After Hours -->
                    <div class="album-card" @click="navigateTo('/album/after-hours')">
                        <div class="album-image">
                            <q-img src="https://via.placeholder.com/180x180" ratio="1"></q-img>
                        </div>
                        <div class="album-title">After Hours</div>
                        <div class="album-artist">The Weeknd</div>
                    </div>

                    <!-- ÷ (Divide) -->
                    <div class="album-card" @click="navigateTo('/album/divide')">
                        <div class="album-image">
                            <q-img src="https://via.placeholder.com/180x180" ratio="1"></q-img>
                        </div>
                        <div class="album-title">÷ (Divide)</div>
                        <div class="album-artist">Ed Sheeran</div>
                    </div>

                    <!-- The Kids Are Coming -->
                    <div class="album-card" @click="navigateTo('/album/the-kids-are-coming')">
                        <div class="album-image">
                            <q-img src="https://via.placeholder.com/180x180" ratio="1"></q-img>
                        </div>
                        <div class="album-title">The Kids Are Coming</div>
                        <div class="album-artist">Tones and I</div>
                    </div>
                </div>
            </section>

            <!-- Podcasts section -->
            <PodcastsSection />

            <!-- Recently played section -->
            <section class="section-container">
                <div class="section-header">
                    <h2 class="section-title">Recently Played</h2>
                </div>
                <div class="items-grid">
                    <div v-for="track in recentlyPlayed" :key="track.id" class="track-card" @click="playTrack(track)">
                        <div class="track-image">
                            <q-img :src="track.album && track.album.images && track.album.images.length > 0
                                ? track.album.images[0].url
                                : 'https://via.placeholder.com/80?text=Track'" ratio="1"></q-img>
                        </div>
                        <div class="track-title">{{ track.name }}</div>
                        <div class="track-artist">{{ track.artists && track.artists.length ? track.artists[0].name :
                            'Unknown Artist' }}</div>
                    </div>
                </div>
            </section>

            <!-- Featured Artists -->
            <section class="section-container">
                <div class="section-header">
                    <h2 class="section-title">Featured Artists</h2>
                    <router-link to="/artists" class="see-all">SEE ALL</router-link>
                </div>
                <div class="items-grid artist-grid">
                    <div v-for="artist in featuredArtists" :key="artist.id" class="artist-item">
                        <router-link :to="`/artist/${artist.id}`" class="artist-link">
                            <div class="image-container artist-image-container">
                                <q-img
                                    :src="artist.images && artist.images.length > 0 ? artist.images[0].url : 'https://via.placeholder.com/150?text=Artist'"
                                    @error="(err) => handleImageError(err, artist)" class="cover-image artist-image"
                                    :ratio="1" spinner-color="primary" />
                                <div class="play-overlay">
                                    <q-btn round color="primary" icon="play_arrow" class="play-button" size="md"
                                        @click.prevent="playArtist(artist)" />
                                </div>
                            </div>
                            <div class="item-title">{{ artist.name }}</div>
                            <div class="item-description">Artist</div>
                        </router-link>
                    </div>
                </div>
            </section>
        </div>
    </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useMusicPlayerStore } from '../stores/musicPlayer'
import spotifyService from '../services/spotifyService'
import DailyMixes from '../components/DailyMixes.vue'
import BrowseCategories from '../components/BrowseCategories.vue'
import PodcastsSection from '../components/PodcastsSection.vue'

const router = useRouter()
const musicPlayer = useMusicPlayerStore()
const featuredPlaylists = ref([])
const newReleases = ref([])
const recentlyPlayed = ref([])
const featuredArtists = ref([])
const loading = ref(true)

// Methods
const navigateTo = (path) => {
    router.push(path)
}

// Fallback functions
const handleImageError = (err, item) => {
    console.error(`Image loading error for ${item.type || 'item'} ${item.id}:`, err)
    // The fallback is handled directly in the template
}

onMounted(async () => {
    loading.value = true

    try {
        // Load featured playlists
        try {
            const playlists = await spotifyService.getFeaturedPlaylists()
            featuredPlaylists.value = playlists.slice(0, 6)
        } catch (error) {
            console.error('Error loading playlists:', error)
            featuredPlaylists.value = generateMockPlaylists(6)
        }

        // Load new releases
        try {
            const releases = await spotifyService.getNewReleases()
            newReleases.value = releases.slice(0, 6)
        } catch (error) {
            console.error('Error loading new releases:', error)
            newReleases.value = generateMockAlbums(6)
        }

        // Get recently played
        recentlyPlayed.value = musicPlayer.recentlyPlayed.slice(0, 6)
        if (recentlyPlayed.value.length === 0) {
            try {
                const tracks = await spotifyService.getRecentlyPlayed()
                recentlyPlayed.value = tracks.slice(0, 6)
            } catch (error) {
                console.error('Error loading recently played:', error)
                recentlyPlayed.value = generateMockTracks(6)
            }
        }

        // Get featured artists
        try {
            const artists = await spotifyService.getTopArtists()
            featuredArtists.value = artists.slice(0, 6)
        } catch (error) {
            console.error('Error loading artists:', error)
            featuredArtists.value = generateMockArtists(6)
        }
    } catch (error) {
        console.error('Error loading homepage data:', error)
    } finally {
        loading.value = false
    }
})

const playPlaylist = (playlist) => {
    if (!playlist || !playlist.id) return

    spotifyService.getPlaylistTracks(playlist.id)
        .then(tracks => {
            if (tracks && tracks.length > 0) {
                // Play first track
                musicPlayer.playTrack(tracks[0])

                // Add rest to queue
                tracks.slice(1).forEach(track => {
                    musicPlayer.addToQueue(track)
                })
            }
        })
        .catch(error => {
            console.error('Error loading playlist tracks:', error)
        })
}

const playAlbum = (album) => {
    if (!album || !album.id) return

    spotifyService.getAlbumTracks(album.id)
        .then(tracks => {
            if (tracks && tracks.length > 0) {
                // Play first track
                musicPlayer.playTrack(tracks[0])

                // Add rest to queue
                tracks.slice(1).forEach(track => {
                    musicPlayer.addToQueue(track)
                })
            }
        })
        .catch(error => {
            console.error('Error loading album tracks:', error)
        })
}

const playArtist = (artist) => {
    if (!artist || !artist.id) return

    spotifyService.getArtistTopTracks(artist.id)
        .then(tracks => {
            if (tracks && tracks.length > 0) {
                // Play first track
                musicPlayer.playTrack(tracks[0])

                // Add rest to queue
                tracks.slice(1).forEach(track => {
                    musicPlayer.addToQueue(track)
                })
            }
        })
        .catch(error => {
            console.error('Error loading artist tracks:', error)
        })
}

const playTrack = (track) => {
    musicPlayer.playTrack(track)
}

// Mock data generators in case API fails
const generateMockPlaylists = (count) => {
    return Array.from({ length: count }, (_, i) => ({
        id: `mock-playlist-${i}`,
        name: `Playlist ${i + 1}`,
        description: 'Mock playlist data',
        images: [{ url: `https://via.placeholder.com/150?text=Playlist+${i + 1}` }],
        tracks: { total: 10 }
    }))
}

const generateMockAlbums = (count) => {
    return Array.from({ length: count }, (_, i) => ({
        id: `mock-album-${i}`,
        name: `Album ${i + 1}`,
        artists: [{ id: `mock-artist-${i}`, name: `Artist ${i + 1}` }],
        images: [{ url: `https://via.placeholder.com/150?text=Album+${i + 1}` }],
        release_date: new Date().toISOString().substring(0, 10)
    }))
}

const generateMockTracks = (count) => {
    return Array.from({ length: count }, (_, i) => ({
        id: `mock-track-${i}`,
        name: `Track ${i + 1}`,
        artists: [{ id: `mock-artist-${i}`, name: `Artist ${i + 1}` }],
        album: {
            id: `mock-album-${i}`,
            name: `Album ${i + 1}`,
            images: [{ url: `https://via.placeholder.com/80?text=Track+${i + 1}` }]
        },
        duration_ms: 180000 + (i * 10000)
    }))
}

const generateMockArtists = (count) => {
    return Array.from({ length: count }, (_, i) => ({
        id: `mock-artist-${i}`,
        name: `Artist ${i + 1}`,
        images: [{ url: `https://via.placeholder.com/150?text=Artist+${i + 1}` }],
        genres: ['pop', 'rock'],
        followers: { total: 10000 + (i * 1000) }
    }))
}
</script>

<style lang="scss">
.home-page {
    background-color: #121212;
    padding: 24px;

    .content-container {
        max-width: 1800px;
        margin: 0 auto;
    }

    .section-container {
        margin-bottom: 40px;
    }

    .section-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 16px;
    }

    .section-title {
        color: white;
        font-size: 24px;
        font-weight: 700;
        margin: 0;
    }

    .see-all {
        color: #b3b3b3;
        font-size: 14px;
        font-weight: 700;
        text-decoration: none;

        &:hover {
            color: white;
            text-decoration: underline;
        }
    }

    .items-grid {
        display: grid;
        grid-gap: 24px;

        &.playlist-grid,
        &.album-grid,
        &.artist-grid {
            grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
        }

        &.track-grid {
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        }
    }

    .playlist-item,
    .album-item,
    .artist-item {
        background-color: #181818;
        border-radius: 8px;
        padding: 16px;
        transition: background-color 0.3s ease;

        &:hover {
            background-color: #282828;

            .play-overlay {
                opacity: 1;
            }
        }
    }

    .track-item {
        .track-card {
            display: flex;
            align-items: center;
            background-color: #181818;
            border-radius: 4px;
            padding: 8px;
            cursor: pointer;
            transition: background-color 0.3s ease;

            &:hover {
                background-color: #282828;

                .track-play-btn {
                    opacity: 1;
                }
            }
        }

        .track-image {
            width: 40px;
            height: 40px;
            margin-right: 12px;

            .cover-image {
                border-radius: 4px;
            }
        }

        .track-info {
            flex: 1;
            min-width: 0;
        }

        .track-name {
            color: white;
            font-size: 14px;
            font-weight: 500;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .track-artist {
            color: #b3b3b3;
            font-size: 12px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        .track-actions {
            margin-left: 8px;
        }

        .track-play-btn {
            opacity: 0;
            transition: opacity 0.3s ease;
        }
    }

    .playlist-link,
    .album-link,
    .artist-link {
        text-decoration: none;
        display: block;
    }

    .image-container {
        position: relative;
        margin-bottom: 16px;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);

        &.artist-image-container {
            border-radius: 50%;

            .artist-image {
                border-radius: 50%;
            }
        }
    }

    .cover-image {
        width: 100%;
        aspect-ratio: 1;
        object-fit: cover;
    }

    .play-overlay {
        position: absolute;
        bottom: 8px;
        right: 8px;
        opacity: 0;
        transition: opacity 0.3s ease, transform 0.3s ease;
    }

    .play-button {
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
        transition: transform 0.2s ease;

        &:hover {
            transform: scale(1.05);
        }
    }

    .item-title {
        color: white;
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 4px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .item-description {
        color: #b3b3b3;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    @media (max-width: 768px) {
        padding: 16px;

        .section-title {
            font-size: 20px;
        }

        .items-grid {
            grid-gap: 16px;

            &.playlist-grid,
            &.album-grid,
            &.artist-grid {
                grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
            }

            &.track-grid {
                grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            }
        }

        .playlist-item,
        .album-item,
        .artist-item {
            padding: 12px;
        }

        .item-title {
            font-size: 14px;
        }

        .item-description {
            font-size: 12px;
        }
    }
}
</style>
