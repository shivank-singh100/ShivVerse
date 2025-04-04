<template>
 <q-page class="signup-page">
    <div class="signup-container">
      <div class="logo-section">
        <img src="/icons/shivverse_icon.png" class="logo-image" />
        <h1 class="logo-text">ShivVerse</h1>
      </div>

      <q-card class="signup-card">
        <q-card-section>
          <div class="text-h5 text-center q-mb-md">Create your account</div>

          <q-form @submit.prevent="handleSignup" class="q-gutter-md">
            <q-input
              v-model="signupForm.username"
              label="Username"
              filled
              :rules="[
                val => !!val || 'Username is required',
                val => val.length >= 3 || 'Username must be at least 3 characters'
              ]"
            />

            <q-input
              v-model="signupForm.email"
              label="Email"
              filled
              type="email"
              :rules="[
                val => !!val || 'Email is required',
                val => /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(val) || 'Please enter a valid email'
              ]"
            />

            <q-input
              v-model="signupForm.password"
              label="Password"
              filled
              :type="showPassword ? 'text' : 'password'"
              :rules="[
                val => !!val || 'Password is required',
                val => val.length >= 6 || 'Password must be at least 6 characters',
                val => /[A-Z]/.test(val) || 'Password must contain at least one uppercase letter',
                val => /[0-9]/.test(val) || 'Password must contain at least one number'
              ]"
            >
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <q-input
              v-model="signupForm.confirmPassword"
              label="Confirm Password"
              filled
              :type="showConfirmPassword ? 'text' : 'password'"
              :rules="[
                val => !!val || 'Please confirm your password',
                val => val === signupForm.password || 'Passwords do not match'
              ]"
            >
              <template v-slot:append>
                <q-icon
                  :name="showConfirmPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showConfirmPassword = !showConfirmPassword"
                />
              </template>
            </q-input>

            <div class="q-mt-md">
              <q-checkbox v-model="signupForm.agreeTerms"
                :rules="[val => val === true || 'You must agree to the terms']">
                <span class="text-caption">
                  I agree to the
                  <a href="#" class="text-primary" @click.prevent="showTerms">Terms and Conditions</a>
                  and
                  <a href="#" class="text-primary" @click.prevent="showPrivacy">Privacy Policy</a>
                </span>
              </q-checkbox>
            </div>

            <q-btn
              :loading="loading"
              type="submit"
              color="primary"
              class="full-width q-mt-md"
              label="Sign Up"
              unelevated
              rounded
            />

            <div class="text-center q-mt-md">
              Already have an account?
              <router-link to="/auth/login" class="text-primary">Sign in</router-link>
            </div>
          </q-form>
        </q-card-section>

        <q-card-section class="social-signup">
          <div class="text-center q-mb-sm">or sign up with</div>
          <div class="social-buttons">
            <q-btn flat round color="red-6" icon="fa-brands fa-google" @click="signupWithGoogle" :loading="googleLoading" />
            <q-btn flat round color="blue-9" icon="fa-brands fa-facebook" @click="socialSignup('facebook')" disabled />
            <q-btn flat round color="black" icon="fa-brands fa-apple" @click="socialSignup('apple')" disabled />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter, useRoute } from 'vue-router';
import authService from '../services/authService';

const $q = useQuasar();
const router = useRouter();
const route = useRoute();
const loading = ref(false);
const googleLoading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);

const signupForm = ref({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  agreeTerms: false
});

// Handle signup form submission
const handleSignup = async () => {
  // Validate form
  if (!signupForm.value.agreeTerms) {
    $q.notify({
      color: 'negative',
      message: 'You must agree to the terms and conditions',
      position: 'top'
    });
    return;
  }

  loading.value = true;

  try {
    await authService.signup({
      username: signupForm.value.username,
      email: signupForm.value.email,
      password: signupForm.value.password
    });

    // Show success notification
    $q.notify({
      color: 'positive',
      message: 'Account created successfully!',
      icon: 'check',
      position: 'top'
    });

    // Redirect to home page or intended page
    const redirectPath = route.query.redirect || '/';
    router.push(redirectPath);
  } catch (error) {
    // Show error notification
    $q.notify({
      color: 'negative',
      message: error.message || 'Signup failed',
      icon: 'error',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

// Google signup handler
const signupWithGoogle = async () => {
  googleLoading.value = true;

  try {
    await authService.loginWithGoogle();

    // Show success notification
    $q.notify({
      color: 'positive',
      message: 'Account created with Google!',
      icon: 'check',
      position: 'top'
    });

    // Redirect to home page or intended page
    const redirectPath = route.query.redirect || '/';
    router.push(redirectPath);
  } catch (error) {
    // Show error notification
    $q.notify({
      color: 'negative',
      message: error.message || 'Google signup failed',
      icon: 'error',
      position: 'top'
    });
  } finally {
    googleLoading.value = false;
  }
};

// Social signup handler (placeholder)
const socialSignup = (provider) => {
  $q.notify({
    color: 'info',
    message: `${provider} signup functionality coming soon!`,
    position: 'top'
  });
};

// Show terms dialog
const showTerms = () => {
  $q.dialog({
    title: 'Terms and Conditions',
    message: 'These terms and conditions outline the rules and regulations for the use of ShivVerse Music.\n\nBy using this application, we assume you accept these terms and conditions in full. Do not continue to use ShivVerse Music if you do not accept all of the terms and conditions stated on this page.',
    persistent: true,
    ok: 'Close'
  });
};

// Show privacy dialog
const showPrivacy = () => {
  $q.dialog({
    title: 'Privacy Policy',
    message: 'At ShivVerse, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our application and tell you about your privacy rights and how the law protects you.',
    persistent: true,
    ok: 'Close'
  });
};
</script>

<style lang="scss" scoped>
.signup-page {
  background: linear-gradient(135deg, #0f0f0f 0%, #1e1e1e 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.signup-container {
  width: 100%;
  max-width: 450px;
}

.logo-section {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 32px;

  .logo-image {
    width: 48px;
    height: 48px;
    margin-right: 12px;
  }

  .logo-text {
    color: white;
    font-size: 28px;
    font-weight: 700;
    margin: 0;
  }
}

.signup-card {
  background-color: rgba(30, 30, 30, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
}

.social-signup {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding-top: 16px;

  .social-buttons {
    display: flex;
    justify-content: center;
    gap: 16px;
    margin-top: 12px;
  }
}
</style>
