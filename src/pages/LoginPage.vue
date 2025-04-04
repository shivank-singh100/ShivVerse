<template>
  <q-page class="login-page">
    <div class="login-container">
      <div class="logo-section">
        <img src="/icons/shivverse_icon.png" class="logo-image" />
        <h1 class="logo-text">ShivVerse</h1>
      </div>

      <q-card class="login-card">
        <q-card-section>
          <div class="text-h5 text-center q-mb-md">Sign In</div>

          <q-form @submit.prevent="handleLogin" class="q-gutter-md">
            <q-input
              v-model="loginForm.email"
              label="Email"
              filled
              type="email"
              :rules="[val => !!val || 'Email is required']"
            />

            <q-input
              v-model="loginForm.password"
              label="Password"
              filled
              :type="showPassword ? 'text' : 'password'"
              :rules="[val => !!val || 'Password is required']"
            >
              <template v-slot:append>
                <q-icon
                  :name="showPassword ? 'visibility_off' : 'visibility'"
                  class="cursor-pointer"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>

            <div class="flex justify-between items-center q-mt-md">
              <q-checkbox v-model="loginForm.rememberMe" label="Remember me" />
              <q-btn
                flat
                color="primary"
                label="Forgot Password?"
                @click="forgotPassword"
                no-caps
              />
            </div>

            <q-btn
              :loading="loading"
              type="submit"
              color="primary"
              class="full-width q-mt-md"
              label="Sign In"
              unelevated
              rounded
            />

            <div class="text-center q-mt-md">
              Don't have an account?
              <router-link to="/auth/signup" class="text-primary">Sign up</router-link>
            </div>
          </q-form>
        </q-card-section>

        <q-card-section class="social-login">
          <div class="text-center q-mb-sm">or continue with</div>
          <div class="social-buttons">
            <q-btn flat round color="red-6" icon="fa-brands fa-google" @click="loginWithGoogle" :loading="googleLoading" />
            <q-btn flat round color="blue-9" icon="fa-brands fa-facebook" @click="socialLogin('facebook')" disabled />
            <q-btn flat round color="black" icon="fa-brands fa-apple" @click="socialLogin('apple')" disabled />
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

const loginForm = ref({
  email: '',
  password: '',
  rememberMe: false
});

// Handle login form submission
const handleLogin = async () => {
  loading.value = true;

  try {
    await authService.login(loginForm.value.email, loginForm.value.password);

    // Show success notification
    $q.notify({
      color: 'positive',
      message: 'Login successful',
      icon: 'check',
      position: 'top'
    });

    // Store remember me setting
    if (loginForm.value.rememberMe) {
      localStorage.setItem('rememberLogin', 'true');
    } else {
      localStorage.removeItem('rememberLogin');
    }

    // Redirect to intended page or home
    const redirectPath = route.query.redirect || '/';
    router.push(redirectPath);
  } catch (error) {
    // Show error notification
    $q.notify({
      color: 'negative',
      message: error.message || 'Login failed',
      icon: 'error',
      position: 'top'
    });
  } finally {
    loading.value = false;
  }
};

// Google login handler
const loginWithGoogle = async () => {
  googleLoading.value = true;

  try {
    await authService.loginWithGoogle();

    // Show success notification
    $q.notify({
      color: 'positive',
      message: 'Google login successful',
      icon: 'check',
      position: 'top'
    });

    // Redirect to intended page or home
    const redirectPath = route.query.redirect || '/';
    router.push(redirectPath);
  } catch (error) {
    console.error('Google login error:', error);

    // Show error notification
    $q.notify({
      color: 'negative',
      message: error.message || 'Google login failed',
      icon: 'error',
      position: 'top'
    });
  } finally {
    googleLoading.value = false;
  }
};

// Social login handler (placeholder)
const socialLogin = (provider) => {
  $q.notify({
    color: 'info',
    message: `${provider} login functionality coming soon!`,
    position: 'top'
  });
};

// Forgot password handler
const forgotPassword = async () => {
  if (!loginForm.value.email) {
    $q.notify({
      color: 'warning',
      message: 'Please enter your email first',
      position: 'top'
    });
    return;
  }

  try {
    await authService.sendPasswordResetEmail(loginForm.value.email);

    $q.notify({
      color: 'positive',
      message: 'Password reset email sent. Please check your inbox.',
      position: 'top'
    });
  } catch (error) {
    $q.notify({
      color: 'negative',
      message: error.message || 'Failed to send password reset email',
      position: 'top'
    });
  }
};
</script>

<style lang="scss" scoped>
.login-page {
  background: linear-gradient(135deg, #0f0f0f 0%, #1e1e1e 100%);
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.login-container {
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

.login-card {
  background-color: rgba(30, 30, 30, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 12px;
}

.social-login {
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
