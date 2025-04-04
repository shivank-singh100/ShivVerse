<template>
    <q-page class="settings-page">
        <div class="q-pa-md">
            <h1 class="text-h4 text-white q-mb-md">Settings</h1>

            <q-card class="settings-card">
                <q-card-section>
                    <div class="text-h6 text-white q-mb-md">Appearance</div>
                    <q-toggle v-model="darkMode" label="Dark Mode" color="primary" class="text-white" />
                </q-card-section>

                <q-separator />

                <q-card-section>
                    <div class="text-h6 text-white q-mb-md">Audio</div>
                    <div class="row items-center">
                        <span class="text-white q-mr-md">Volume</span>
                        <q-slider v-model="volume" :min="0" :max="100" color="primary" class="col-6" />
                    </div>
                </q-card-section>

                <q-separator />

                <q-card-section>
                    <div class="text-h6 text-white q-mb-md">About</div>
                    <div class="text-white">
                        <p>ShivVerse v1.0.0</p>
                        <p>© 2024 ShivVerse. All rights reserved.</p>
                    </div>
                </q-card-section>
            </q-card>
        </div>
    </q-page>
</template>

<script setup>
import { ref } from 'vue'

defineOptions({
    name: 'SettingsPage'
})

const darkMode = ref(true)
const volume = ref(50)
</script>

<style lang="scss">
.settings-page {
    background: linear-gradient(to bottom, #1a1a1a, #121212);
    min-height: 100vh;
    padding-bottom: 90px;
}

.settings-card {
    background: #282828;
    border-radius: 8px;
    max-width: 600px;
    margin: 0 auto;
}
</style>
