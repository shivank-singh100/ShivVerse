<template>
    <q-page class="playlists-page">
        <div class="q-pa-md">
            <h1 class="text-h4 text-white q-mb-md">Your Playlists</h1>
            <div class="row q-col-gutter-md">
                <div v-for="n in 6" :key="n" class="col-12 col-sm-6 col-md-4">
                    <q-card class="playlist-card">
                        <q-skeleton height="200px" square />
                        <q-card-section>
                            <q-skeleton type="text" width="80%" />
                            <q-skeleton type="text" width="60%" />
                        </q-card-section>
                    </q-card>
                </div>
            </div>
        </div>
    </q-page>
</template>

<script setup>
defineOptions({
    name: 'PlaylistsPage'
})
</script>

<style lang="scss">
.playlists-page {
    background: linear-gradient(to bottom, #1a1a1a, #121212);
    min-height: 100vh;
    padding-bottom: 90px;
}

.playlist-card {
    background: #282828;
    border-radius: 8px;
    overflow: hidden;
    transition: transform 0.2s ease, background-color 0.2s ease;
    cursor: pointer;

    &:hover {
        transform: translateY(-4px);
        background: #383838;
    }
}
</style>
