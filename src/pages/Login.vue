<template>
  <v-container fluid class="login-container">
    <v-row justify="center" align="center" class="fill-height">
      <v-col cols="12" sm="8" md="6" lg="4" xl="3">
        <v-card class="login-card" elevation="8" rounded="lg">
          <!-- Header Section -->
          <v-card-text class="text-center pa-8">
            <div class="login-header mb-6">
              <!-- <v-avatar size="64" class="mb-4" color="primary">
                <v-icon size="32" color="white">mdi-account-circle</v-icon>
              </v-avatar> -->
              <!-- <h1 class="text-h4 font-weight-bold mb-2">Welcome Back</h1> -->
              <p class="text-body-1 text-medium-emphasis">
                Please sign in to your account
              </p>
            </div>

            <!-- Login Form -->
            <v-form 
              @submit.prevent="handleLogin" 
              ref="form"
              v-model="valid"
            >
              <v-text-field
                v-model="username"
                label="username"
                type="username"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-account-outline"
                class="mb-4"
                color="primary"
                required
              />

              <v-text-field
                v-model="password"
                label="Password"
                :type="showPassword ? 'text' : 'password'"
                variant="outlined"
                density="comfortable"
                prepend-inner-icon="mdi-lock-outline"
                :append-inner-icon="showPassword ? 'mdi-eye' : 'mdi-eye-off'"
                @click:append-inner="showPassword = !showPassword"
                :rules="passwordRules"
                class="mb-4"
                color="primary"
                required
              />

              <!-- Remember me and Forgot password -->
              <!-- <v-row class="mb-4">
                <v-col cols="6">
                  <v-checkbox
                    v-model="rememberMe"
                    label="Remember me"
                    color="primary"
                    density="compact"
                    hide-details
                  />
                </v-col>
                <v-col cols="6" class="text-right">
                  <v-btn
                    variant="text"
                    color="primary"
                    size="small"
                    class="text-caption"
                    @click="forgotPassword"
                  >
                    Forgot Password?
                  </v-btn>
                </v-col>
              </v-row> -->

              <!-- Login Button -->
              <v-btn
                type="submit"
                color="primary"
                size="large"
                block
                class="mb-4"
                :loading="loading"
                :disabled="!valid || loading"
                rounded="lg"
                elevation="2"
              >
                <v-icon start>mdi-login</v-icon>
                Sign In
              </v-btn>

            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Error Alert -->
    <v-snackbar
      v-model="showError"
      color="error"
      timeout="5000"
      location="top"
    >
      <v-icon start>mdi-alert-circle</v-icon>
      {{ error }}
      <template v-slot:actions>
        <v-btn
          variant="text"
          @click="showError = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>

    <!-- Success Alert -->
    <v-snackbar
      v-model="showSuccess"
      color="success"
      timeout="3000"
      location="top"
    >
      <v-icon start>mdi-check-circle</v-icon>
      Login successful! Redirecting...
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Reactive variables
const username = ref('')
const password = ref('')
const error = ref(null)
const loading = ref(false)
const showPassword = ref(false)
const rememberMe = ref(false)
const valid = ref(false)
const form = ref(null)

// Computed for alerts
const showError = computed({
  get: () => !!error.value,
  set: (value) => {
    if (!value) error.value = null
  }
})

const showSuccess = ref(false)

const passwordRules = [
  v => !!v || 'Password is required',
  v => v.length >= 6 || 'Password must be at least 6 characters',
]

const auth = useAuthStore()
const router = useRouter()

// Login handler
async function handleLogin() {
  if (!valid.value) return
  
  loading.value = true
  error.value = null
  
  try {
    const res = await fetch('http://10.3.4.45:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        username: username.value, 
        password: password.value,
        rememberMe: rememberMe.value
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.msg || 'Login failed')

    auth.setToken(data.access_token)
    auth.setUser(data.user)
    
    // Show success message
    showSuccess.value = true
    
    // Redirect after a brief delay
    setTimeout(() => {
      router.push('/')
    }, 1500)
    
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

// Additional handlers
function forgotPassword() {
  router.push('/forgot-password')
}

function goToSignup() {
  router.push('/signup')
}

function loginWithGoogle() {
  // Implement Google OAuth
  console.log('Login with Google')
}

function loginWithGithub() {
  // Implement GitHub OAuth
  console.log('Login with GitHub')
}

// Watch for form validation
watch([username, password], () => {
  if (form.value) {
    form.value.validate()
  }
})
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.5) 0%,
    rgba(0, 0, 0, 0.5) 100%
  );
  display: flex;
  align-items: center;
}

.login-card {
  backdrop-filter: blur(10px);
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;
}

.login-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15) !important;
}

.login-header {
  animation: fadeInUp 0.6s ease;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom scrollbar for the container */
:deep(.v-container) {
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}

:deep(.v-container)::-webkit-scrollbar {
  width: 6px;
}

:deep(.v-container)::-webkit-scrollbar-track {
  background: transparent;
}

:deep(.v-container)::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
}

/* Form field animations */
:deep(.v-text-field) {
  transition: all 0.3s ease;
}

:deep(.v-text-field:hover) {
  transform: translateY(-1px);
}

/* Button hover effects */
:deep(.v-btn) {
  transition: all 0.3s ease;
}

:deep(.v-btn:hover) {
  transform: translateY(-1px);
}

/* Responsive adjustments */
@media (max-width: 600px) {
  .login-card {
    margin: 16px;
  }
  
  :deep(.v-card-text) {
    padding: 24px 16px !important;
  }
}
</style>
