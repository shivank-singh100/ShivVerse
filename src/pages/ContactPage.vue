<template>
    <q-page class="contact-page">
        <div class="q-pa-md">
            <h1 class="text-h4 text-white q-mb-md">Contact Us</h1>

            <q-card class="contact-card">
                <q-card-section>
                    <div class="text-h6 text-white q-mb-md">Get in Touch</div>
                    <p class="text-white">
                        Have questions or feedback? We'd love to hear from you. Fill out the form below
                        and we'll get back to you as soon as possible.
                    </p>
                </q-card-section>

                <q-separator />

                <q-card-section>
                    <q-form @submit="onSubmit" class="q-gutter-md">
                        <q-input v-model="name" label="Name" dark outlined
                            :rules="[val => !!val || 'Name is required']" />

                        <q-input v-model="email" label="Email" dark outlined type="email" :rules="[
                            val => !!val || 'Email is required',
                            val => isValidEmail(val) || 'Please enter a valid email'
                        ]" />

                        <q-input v-model="message" label="Message" dark outlined type="textarea"
                            :rules="[val => !!val || 'Message is required']" />

                        <div class="row justify-end">
                            <q-btn label="Send Message" type="submit" color="primary" :loading="loading" />
                        </div>
                    </q-form>
                </q-card-section>

                <q-separator />

                <q-card-section>
                    <div class="text-h6 text-white q-mb-md">Other Ways to Reach Us</div>
                    <div class="row q-gutter-md">
                        <q-btn flat color="white" icon="email" label="support@shivverse.com" />
                        <q-btn flat color="white" icon="phone" label="+1 (555) 123-4567" />
                    </div>
                </q-card-section>
            </q-card>
        </div>
    </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()
const name = ref('')
const email = ref('')
const message = ref('')
const loading = ref(false)

const isValidEmail = (val) => {
    const emailPattern = /^(?=[a-zA-Z0-9@._%+-]{6,254}$)[a-zA-Z0-9._%+-]{1,64}@(?:[a-zA-Z0-9-]{1,63}\.){1,8}[a-zA-Z]{2,63}$/
    return emailPattern.test(val) || 'Invalid email'
}

const onSubmit = () => {
    loading.value = true
    // Simulate form submission
    setTimeout(() => {
        loading.value = false
        $q.notify({
            color: 'positive',
            message: 'Message sent successfully!',
            icon: 'check'
        })
        name.value = ''
        email.value = ''
        message.value = ''
    }, 2000)
}
</script>

<style lang="scss">
.contact-page {
    background: linear-gradient(to bottom, #1a1a1a, #121212);
    min-height: 100vh;
    padding-bottom: 90px;
}

.contact-card {
    background: #282828;
    border-radius: 8px;
    max-width: 600px;
    margin: 0 auto;
}
</style>
