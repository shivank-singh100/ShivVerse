<template>
    <q-page class="about-page">
        <div class="q-pa-md">
            <h1 class="text-h4 text-white q-mb-md">About ShivVerse</h1>

            <q-card class="about-card">
                <q-card-section>
                    <div class="text-h6 text-white q-mb-md">Welcome to ShivVerse</div>
                    <p class="text-white">
                        ShivVerse is your ultimate destination for discovering and enjoying music.
                        Our platform brings together the best of music streaming with a beautiful,
                        intuitive interface designed for music lovers.
                    </p>
                </q-card-section>

                <q-separator />

                <q-card-section>
                    <div class="text-h6 text-white q-mb-md">Features</div>
                    <ul class="text-white">
                        <li>Discover new music with our advanced search</li>
                        <li>Create and manage your playlists</li>
                        <li>Save your favorite songs</li>
                        <li>Customize your listening experience</li>
                        <li>Beautiful, modern interface</li>
                    </ul>
                </q-card-section>

                <q-separator />

                <q-card-section>
                    <div class="text-h6 text-white q-mb-md">Version</div>
                    <p class="text-white">ShivVerse v1.0.0</p>
                </q-card-section>
            </q-card>
        </div>
    </q-page>
</template>

<script setup>
defineOptions({
    name: 'AboutPage'
})
</script>

<style lang="scss">
.about-page {
    background: linear-gradient(to bottom, #1a1a1a, #121212);
    min-height: 100vh;
    padding-bottom: 90px;
}

.about-card {
    background: #282828;
    border-radius: 8px;
    max-width: 600px;
    margin: 0 auto;

    ul {
        list-style-type: none;
        padding-left: 0;

        li {
            margin-bottom: 8px;
            padding-left: 24px;
            position: relative;

            &:before {
                content: "•";
                color: #1DB954;
                position: absolute;
                left: 0;
            }
        }
    }
}
</style>
