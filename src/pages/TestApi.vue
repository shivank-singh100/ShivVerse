<template>
    <q-page class="test-api-page">
        <div class="q-pa-md">
            <h2 class="text-h4 q-mb-md">API Connection Test</h2>

            <!-- Spotify Test -->
            <q-card class="q-mb-md">
                <q-card-section>
                    <div class="text-h6">Spotify API Test</div>
                    <q-input v-model="spotifyQuery" label="Search for a song" class="q-mb-sm" />
                    <q-btn color="primary" label="Test Spotify Search" @click="testSpotify" />
                    <div v-if="spotifyResults.length" class="q-mt-md">
                        <div class="text-subtitle2">Results:</div>
                        <q-list bordered separator>
                            <q-item v-for="track in spotifyResults" :key="track.id">
                                <q-item-section>
                                    <q-item-label>{{ track.name }}</q-item-label>
                                    <q-item-label caption>{{ track.artists[0].name }}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </div>
                    <div v-if="spotifyError" class="text-negative q-mt-sm">
                        Error: {{ spotifyError }}
                    </div>
                </q-card-section>
            </q-card>

            <!-- YouTube Test -->
            <q-card>
                <q-card-section>
                    <div class="text-h6">YouTube API Test</div>
                    <q-input v-model="youtubeQuery" label="Search for a video" class="q-mb-sm" />
                    <q-btn color="primary" label="Test YouTube Search" @click="testYouTube" />
                    <div v-if="youtubeResults.length" class="q-mt-md">
                        <div class="text-subtitle2">Results:</div>
                        <q-list bordered separator>
                            <q-item v-for="video in youtubeResults" :key="video.id.videoId">
                                <q-item-section>
                                    <q-item-label>{{ video.snippet.title }}</q-item-label>
                                    <q-item-label caption>{{ video.snippet.channelTitle }}</q-item-label>
                                </q-item-section>
                            </q-item>
                        </q-list>
                    </div>
                    <div v-if="youtubeError" class="text-negative q-mt-sm">
                        Error: {{ youtubeError }}
                    </div>
                </q-card-section>
            </q-card>
        </div>
    </q-page>
</template>

<script setup>
import { ref } from 'vue';
import spotifyService from '../services/spotifyService';
import youtubeService from '../services/youtubeService';

const spotifyQuery = ref('');
const youtubeQuery = ref('');
const spotifyResults = ref([]);
const youtubeResults = ref([]);
const spotifyError = ref('');
const youtubeError = ref('');

const testSpotify = async () => {
    try {
        spotifyError.value = '';
        const results = await spotifyService.searchTracks(spotifyQuery.value);
        spotifyResults.value = results;
    } catch (error) {
        spotifyError.value = error.message;
        console.error('Spotify API Error:', error);
    }
};

const testYouTube = async () => {
    try {
        youtubeError.value = '';
        const results = await youtubeService.searchVideos(youtubeQuery.value);
        youtubeResults.value = results;
    } catch (error) {
        youtubeError.value = error.message;
        console.error('YouTube API Error:', error);
    }
};
</script>

<style scoped>
.test-api-page {
    background: #f5f5f5;
    min-height: 100vh;
}
</style>
