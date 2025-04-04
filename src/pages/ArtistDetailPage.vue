<template>
  <q-page class="artist-detail-page">
    <!-- Artist Header -->
    <div class="artist-header" :style="headerStyle">
      <div class="header-overlay"></div>
      <div class="artist-info">
        <div class="verified-badge" v-if="artist.isVerified">
          <q-icon name="verified" size="16px" color="primary" class="verified-icon" />
          <span>Verified Artist</span>
        </div>
        <h1 class="artist-name">{{ artist.name || 'Artist Name' }}</h1>
        <div class="artist-stats">
          <span class="monthly-listeners">{{ formatNumber(artist.followers?.total || 0) }} followers</span>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="action-buttons">
      <q-btn round color="primary" icon="play_arrow" size="lg" @click="playArtist" />
      <q-btn flat round color="white" :icon="artist.isFollowing ? 'heart' : 'heart_plus'" size="md"
        @click="toggleFollow" />
      <q-btn flat round color="white" icon="more_horiz" size="md">
        <q-menu anchor="bottom right" self="top right" dark class="bg-dark">
          <q-list style="min-width: 200px">
            <q-item clickable v-close-popup @click="followArtist">
              <q-item-section>{{ artist.isFollowing ? 'Unfollow' : 'Follow' }}</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="addToQueue">
              <q-item-section>Add to Queue</q-item-section>
            </q-item>
            <q-item clickable v-close-popup @click="share">
              <q-item-section>Share</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>

    <!-- Popular Tracks Section -->
    <div class="content-section">
      <h2 class="section-title">Popular</h2>
      <div class="tracks-list">
        <div v-for="(track, index) in topTracks" :key="track.id" class="track-item" @click="playTrack(track)"
          :class="{ 'is-playing': track.isPlaying }">
          <div class="track-index">
            <span v-if="!track.isPlaying && !isHovering[index]">{{ index + 1 }}</span>
            <q-icon v-else-if="track.isPlaying" name="volume_up" color="primary" size="16px" />
            <q-btn v-else flat round dense icon="play_arrow" size="sm" color="white" />
          </div>
          <div class="track-info">
            <div class="track-image">
              <q-img :src="getTrackImage(track)" @error="(err) => handleImageError(err, track)" />
            </div>
            <div class="track-details">
              <div class="track-name" :class="{ 'playing': track.isPlaying }">{{ track.name }}</div>
            </div>
          </div>
          <div class="track-stats">{{ formatNumber(track.plays) }} plays</div>
          <div class="track-duration">
            <q-btn flat round dense :icon="track.isLiked ? 'favorite' : 'favorite_border'"
              :color="track.isLiked ? 'primary' : 'white'" size="sm" class="like-button"
              @click.stop="toggleLike(track)" />
            <span>{{ formatDuration(track.duration) }}</span>
          </div>
        </div>
      </div>
      <div class="see-more">
        <q-btn flat color="white" label="See more" class="see-more-btn" />
      </div>
    </div>

    <!-- Discography Section -->
    <div class="content-section">
      <div class="section-header">
        <h2 class="section-title">Discography</h2>
        <div class="section-tabs">
          <q-btn flat :outline="discographyFilter === 'all'" color="white" label="All" class="filter-btn"
            @click="discographyFilter = 'all'" />
          <q-btn flat :outline="discographyFilter === 'album'" color="white" label="Albums" class="filter-btn"
            @click="discographyFilter = 'album'" />
          <q-btn flat :outline="discographyFilter === 'single'" color="white" label="Singles & EPs" class="filter-btn"
            @click="discographyFilter = 'single'" />
        </div>
      </div>
      <div class="albums-grid">
        <div v-for="album in filteredDiscography" :key="album.id" class="album-card" @click="navigateToAlbum(album.id)">
          <div class="album-image">
            <q-img :src="getAlbumImage(album)" @error="(err) => handleImageError(err, album)" />
            <div class="play-overlay">
              <q-btn round color="primary" icon="play_arrow" @click.stop="playAlbum(album)" />
            </div>
          </div>
          <div class="album-name">{{ album.name }}</div>
          <div class="album-year">{{ album.year }} • {{ album.type }}</div>
        </div>
      </div>
    </div>

    <!-- Fans Also Like Section -->
    <div class="content-section">
      <h2 class="section-title">Fans also like</h2>
      <div class="artists-grid">
        <div v-for="relatedArtist in relatedArtists" :key="relatedArtist.id" class="artist-card"
          @click="navigateToArtist(relatedArtist.id)">
          <div class="related-artist-image">
            <q-img :src="getArtistImage(relatedArtist)" @error="(err) => handleImageError(err, relatedArtist)" />
            <div class="play-overlay">
              <q-btn round color="primary" icon="play_arrow" @click.stop="playArtist(relatedArtist)" />
            </div>
          </div>
          <div class="related-artist-name">{{ relatedArtist.name }}</div>
          <div class="related-artist-type">Artist</div>
        </div>
      </div>
    </div>

    <!-- About Section -->
    <div class="content-section">
      <h2 class="section-title">About</h2>
      <div class="about-section">
        <div class="about-image">
          <q-img :src="getArtistImage(artist)" @error="(err) => handleImageError(err, artist)" />
        </div>
        <div class="about-info">
          <div class="stats-section">
            <div class="stats-item">
              <div class="stats-value">{{ formatNumber(artist.followers?.total || 0) }}</div>
              <div class="stats-label">Followers</div>
            </div>
          </div>
          <div class="bio-section">
            <p v-for="(paragraph, index) in artist.bio" :key="index" class="bio-paragraph">
              {{ paragraph }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMusicPlayerStore } from '../stores/musicPlayer'
import spotifyService from '../services/spotifyService'

const route = useRoute()
const router = useRouter()
const musicPlayer = useMusicPlayerStore()
const isHovering = reactive({})
const discographyFilter = ref('all')

// State
const artist = ref({
  id: '',
  name: 'Loading artist...',
  images: [],
  followers: { total: 0 },
  genres: [],
  popularity: 0,
  bio: null
})
const topTracks = ref([])
const albums = ref([])
const relatedArtists = ref([])
const isFollowing = ref(false)
const hoveredTrackId = ref(null)
const loading = ref(true)
const imageErrors = ref(new Map())

// Default fallback images
const fallbackArtistImage = 'https://via.placeholder.com/300?text=Artist'
const fallbackAlbumImage = 'https://via.placeholder.com/200?text=Album'
const fallbackTrackImage = 'https://via.placeholder.com/64?text=Track'

// Computed styles
const headerStyle = computed(() => {
  return {
    background: `linear-gradient(rgba(0,0,0,0.4), rgb(18, 18, 18) 85%),
                    url(${getArtistImage(artist.value)})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center 30%'
  }
})

// Image handling with fallbacks
const getArtistImage = (artist) => {
  if (!artist || imageErrors.value.get(artist.id)) return fallbackArtistImage
  if (!artist.images || artist.images.length === 0) return fallbackArtistImage
  return artist.images[0]?.url || fallbackArtistImage
}

const getAlbumImage = (album) => {
  if (!album || imageErrors.value.get(album.id)) return fallbackAlbumImage
  if (!album.images || album.images.length === 0) return fallbackAlbumImage
  return album.images[0]?.url || fallbackAlbumImage
}

const getTrackImage = (track) => {
  if (!track || imageErrors.value.get(track.id)) return fallbackTrackImage
  if (!track.album || !track.album.images || track.album.images.length === 0) return fallbackTrackImage
  return track.album.images[track.album.images.length > 2 ? 2 : 0]?.url || fallbackTrackImage
}

// Error handling for images
const handleImageError = (err, item) => {
  if (item && item.id) {
    console.error(`Image error for ${item.type || 'item'} ${item.id}:`, err)
    imageErrors.value.set(item.id, true)
  }
}

const handleArtistBioImageError = (err) => {
  console.error('Artist bio image error:', err)
  // The fallback is already handled by getArtistImage
}

// Utility functions
const formatNumber = (num) => {
  if (!num) return '0'
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  } else if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

const formatDuration = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

const getAlbumYear = (album) => {
  if (!album.release_date) return ''
  return new Date(album.release_date).getFullYear()
}

// Loading data
onMounted(async () => {
  if (!route.params.id) {
    loading.value = false
    return
  }

  try {
    loading.value = true

    // Load artist details
    try {
      const artistData = await spotifyService.getArtist(route.params.id)
      if (artistData) {
        artist.value = {
          ...artistData,
          bio: generateArtistBio(artistData) // Generate mock bio if not returned by API
        }
      }
    } catch (error) {
      console.error('Error fetching artist:', error)
      // Use mock data
      artist.value = {
        id: route.params.id,
        name: 'Artist Name',
        images: [{ url: fallbackArtistImage }],
        followers: { total: 10000 },
        genres: ['pop', 'rock'],
        popularity: 75,
        bio: 'This is a placeholder biography for the artist when the API request fails.'
      }
    }

    // Load top tracks
    try {
      const tracksData = await spotifyService.getArtistTopTracks(route.params.id)
      if (tracksData) {
        topTracks.value = tracksData
      }
    } catch (error) {
      console.error('Error fetching top tracks:', error)
      // Generate mock tracks
      topTracks.value = Array.from({ length: 5 }, (_, i) => ({
        id: `mock-track-${i}`,
        name: `Top Track ${i + 1}`,
        duration_ms: 180000 + (i * 10000),
        popularity: 80 - (i * 5),
        album: {
          id: `mock-album-${i}`,
          name: `Album ${i + 1}`,
          images: [{ url: fallbackTrackImage }]
        }
      }))
    }

    // Load albums
    try {
      const albumsData = await spotifyService.getArtistAlbums(route.params.id)
      if (albumsData) {
        albums.value = albumsData
      }
    } catch (error) {
      console.error('Error fetching albums:', error)
      // Generate mock albums
      albums.value = Array.from({ length: 4 }, (_, i) => ({
        id: `mock-album-${i}`,
        name: `Album ${i + 1}`,
        release_date: `${2020 - i}-01-01`,
        images: [{ url: fallbackAlbumImage }]
      }))
    }

    // Load related artists
    try {
      const relatedData = await spotifyService.getRelatedArtists(route.params.id)
      if (relatedData) {
        relatedArtists.value = relatedData
      }
    } catch (error) {
      console.error('Error fetching related artists:', error)
      // Generate mock related artists
      relatedArtists.value = Array.from({ length: 6 }, (_, i) => ({
        id: `mock-related-${i}`,
        name: `Related Artist ${i + 1}`,
        images: [{ url: fallbackArtistImage }]
      }))
    }

    // Check if following
    if (musicPlayer.likedSongs.some(item =>
      item.type === 'artist' && item.id === route.params.id
    )) {
      isFollowing.value = true
    }
  } catch (error) {
    console.error('Error loading artist data:', error)
  } finally {
    loading.value = false
  }
})

// Generate a random bio for artists that don't have one
const generateArtistBio = (artist) => {
  if (!artist || !artist.name) return null

  const genres = artist.genres && artist.genres.length > 0
    ? artist.genres.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(', ')
    : 'various genres'

  return `
        <p>${artist.name} is an acclaimed music artist known for their contributions to ${genres}.
        With ${formatNumber(artist.followers?.total || 0)} followers, they have established a significant
        presence in the music industry.</p>

        <p>Their unique sound and consistent output have earned them a dedicated fanbase
        around the world. ${artist.name} continues to push boundaries and explore new musical directions
        with each release.</p>
    `
}

// Player controls
const playArtist = () => {
  if (topTracks.value.length > 0) {
    // Play first track
    musicPlayer.playTrack(topTracks.value[0])

    // Add rest to queue
    topTracks.value.slice(1).forEach(track => {
      musicPlayer.addToQueue(track)
    })
  }
}

const playTrack = (track) => {
  musicPlayer.playTrack(track)
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

const navigateToAlbum = (albumId) => {
  router.push(`/album/${albumId}`)
}

const navigateToArtist = (artistId) => {
  router.push(`/artist/${artistId}`)
}

// Like/follow controls
const toggleFollow = () => {
  isFollowing.value = !isFollowing.value
  // In a real app, would save this to user's profile
}

const followArtist = () => {
  isFollowing.value = !isFollowing.value
}

const addToQueue = () => {
  // Add top tracks to queue
  topTracks.value.forEach(track => {
    musicPlayer.addToQueue(track)
  })
}

const share = () => {
  // Implementation for sharing
  console.log('Share artist:', artist.value.name)
}

// Like controls
const toggleLike = (track) => {
  track.isLiked = !track.isLiked

  if (track.isLiked) {
    // Add to liked songs in the music player store
    musicPlayer.toggleLike(track)
  } else {
    // Remove from liked songs in the music player store
    musicPlayer.toggleLike(track)
  }
}

// Computed property for filtered discography
const filteredDiscography = computed(() => {
  if (discographyFilter.value === 'all') {
    return albums.value
  }
  return albums.value.filter(album => album.type.toLowerCase().includes(discographyFilter.value))
})
</script>

<style lang="scss">
.artist-detail-page {
  background: #121212;
  min-height: 100vh;
  padding-bottom: 90px; // Space for player
  color: #fff;
}

.artist-header {
  position: relative;
  padding: 140px 32px 32px;
  height: 400px;
  background-size: cover;
  background-position: center 30%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.header-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(transparent 0%, rgba(0, 0, 0, 0.4) 70%, rgba(0, 0, 0, 0.8) 100%);
}

.artist-info {
  position: relative;
  z-index: 1;
}

.verified-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 12px;

  span {
    font-size: 0.875rem;
    color: #1db954;
  }
}

.artist-name {
  font-size: 6rem;
  font-weight: 700;
  margin: 0 0 16px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
  line-height: 1;

  @media (max-width: 768px) {
    font-size: 4rem;
  }

  @media (max-width: 480px) {
    font-size: 3rem;
  }
}

.artist-stats {
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
}

.action-buttons {
  padding: 24px 32px;
  display: flex;
  gap: 16px;
  position: relative;
  z-index: 2;
}

.content-section {
  padding: 0 32px 40px;
}

.section-title {
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}

.section-tabs {
  display: flex;
  gap: 16px;

  .filter-btn {
    border-radius: 50px;
    text-transform: none;
    font-weight: 700;

    &.q-btn--outline {
      border: 1px solid rgba(255, 255, 255, 0.3);
    }
  }
}

.tracks-list {
  margin-bottom: 16px;
}

.track-item {
  display: grid;
  grid-template-columns: 48px 4fr 2fr 100px;
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

      &.playing {
        color: #1db954;
      }
    }
  }
}

.track-stats {
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

  .like-button {
    opacity: 0;
    transition: opacity 0.2s ease;
  }

  .track-item:hover & .like-button {
    opacity: 1;
  }
}

.see-more {
  text-align: center;

  .see-more-btn {
    text-transform: none;
    font-weight: 700;
  }
}

.albums-grid,
.artists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px;
}

.album-card,
.artist-card {
  background: #181818;
  padding: 16px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background: #282828;

    .play-overlay {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

.album-image,
.related-artist-image {
  position: relative;
  width: 100%;
  padding-bottom: 100%;
  margin-bottom: 16px;

  .q-img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  }
}

.related-artist-image .q-img {
  border-radius: 50%;
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

.album-name,
.related-artist-name {
  color: white;
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.album-year,
.related-artist-type {
  color: #b3b3b3;
  font-size: 0.875rem;
}

.about-section {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.about-image {
  .q-img {
    width: 100%;
    border-radius: 8px;
  }
}

.stats-section {
  display: flex;
  gap: 32px;
  margin-bottom: 24px;

  .stats-item {
    .stats-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
      margin-bottom: 4px;
    }

    .stats-label {
      font-size: 0.875rem;
      color: #b3b3b3;
    }
  }
}

.bio-section {
  .bio-paragraph {
    margin-bottom: 16px;
    line-height: 1.6;
    color: #b3b3b3;
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
