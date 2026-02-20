<template>
  <div class="register-page">
    <h2>Create Your Account</h2>
    
    <form @submit.prevent="handleRegister" class="register-form">
      <!-- Username Field -->
      <div class="form-group">
        <label for="username" class="form-label">Username</label>
        <input
          id="username"
          v-model="form.username"
          @input="onUsernameInput"
          type="text"
          placeholder="Choose a username"
          class="form-input"
          :class="{ 'input-error': errors.username }"
          required
        />
        <p v-if="errors.username" class="error-message">{{ errors.username }}</p>
      </div>

      <!-- Email Field -->
      <div class="form-group">
        <label for="email" class="form-label">Email Address</label>
        <input
          id="email"
          v-model="form.email"
          @input="onEmailInput"
          type="email"
          placeholder="you@example.com"
          class="form-input"
          :class="{ 'input-error': errors.email }"
          required
        />
        <p v-if="errors.email" class="error-message">{{ errors.email }}</p>
      </div>

      <!-- Password Field -->
      <div class="form-group">
        <label for="password" class="form-label">Password</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          placeholder="At least 6 characters"
          class="form-input"
          :class="{ 'input-error': errors.password }"
          required
        />
        <p v-if="errors.password" class="error-message">{{ errors.password }}</p>
        <p v-if="!errors.password" class="password-hint">
          ✓ Use a strong password with uppercase, lowercase, numbers
        </p>
      </div>

      <!-- Confirm Password Field -->
      <div class="form-group">
        <label for="confirmPassword" class="form-label">Confirm Password</label>
        <input
          id="confirmPassword"
          v-model="form.confirmPassword"
          type="password"
          placeholder="Confirm your password"
          class="form-input"
          :class="{ 'input-error': errors.confirmPassword }"
          required
        />
        <p v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</p>
      </div>

      <!-- General Error -->
      <div v-if="authError" class="error-box">
        {{ authError }}
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="btn-primary btn-block"
        :disabled="isLoading"
      >
        <span v-if="!isLoading">Create Account</span>
        <span v-else class="button-loading">Creating...</span>
      </button>

      <!-- Terms -->
      <p class="terms-text">
        By creating an account, you agree to our
        <a href="#" class="terms-link">Terms of Service</a>
        and
        <a href="#" class="terms-link">Privacy Policy</a>
      </p>

      <!-- Login Link -->
      <p class="login-section">
        Already have an account? 
        <RouterLink to="/auth/login" class="login-link">Sign in here</RouterLink>
      </p>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../../composables/useAuth'
import { sanitizeUsername, sanitizeEmail } from '../../composables/useInputSanitize'

const router = useRouter()
const { register, loading: isLoading, error: authError } = useAuth()

const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const errors = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateForm = () => {
  let isValid = true

  // Reset errors
  errors.username = ''
  errors.email = ''
  errors.password = ''
  errors.confirmPassword = ''

  // Username validation
  if (!form.username.trim()) {
    errors.username = 'Username is required'
    isValid = false
  } else if (form.username.length < 3) {
    errors.username = 'Username must be at least 3 characters'
    isValid = false
  } else if (form.username.length > 20) {
    errors.username = 'Username must not exceed 20 characters'
    isValid = false
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!form.email.trim()) {
    errors.email = 'Email is required'
    isValid = false
  } else if (!emailRegex.test(form.email)) {
    errors.email = 'Please enter a valid email address'
    isValid = false
  }

  // Password validation
  if (!form.password) {
    errors.password = 'Password is required'
    isValid = false
  } else if (form.password.length < 6) {
    errors.password = 'Password must be at least 6 characters'
    isValid = false
  } else if (form.password.length > 100) {
    errors.password = 'Password is too long'
    isValid = false
  }

  // Confirm password validation
  if (!form.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password'
    isValid = false
  } else if (form.password !== form.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match'
    isValid = false
  }

  return isValid
}

const handleRegister = async () => {
  if (!validateForm()) {
    return
  }

  try {
    await register(form.username, form.email, form.password)
    // Redirect to home page after successful registration
    await router.push('/')
  } catch (err) {
    console.error('Registration error:', err)
  }
}

// sanitize as user types
const onUsernameInput = (e) => {
  form.username = sanitizeUsername(e.target.value)
}

const onEmailInput = (e) => {
  form.email = sanitizeEmail(e.target.value)
}
</script>

<style scoped>
.register-page {
  width: 100%;
}

.register-page h2 {
  font-size: var(--font-size-2xl);
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: var(--font-weight-bold);
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--text-primary);
  letter-spacing: 0.3px;
}

.form-input {
  padding: 0.75rem 1rem;
  font-size: var(--font-size-base);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: var(--radius-sm);
  transition: border-color var(--transition-fast), background-color var(--transition-fast);
}

.form-input::placeholder {
  color: var(--text-tertiary);
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-gold);
  background-color: rgba(255, 193, 7, 0.05);
}

.form-input.input-error {
  border-color: var(--danger);
  background-color: rgba(244, 67, 54, 0.05);
}

.error-message {
  font-size: var(--font-size-xs);
  color: var(--danger);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.password-hint {
  font-size: var(--font-size-xs);
  color: var(--success);
  margin: 0;
}

.error-box {
  background-color: rgba(244, 67, 54, 0.1);
  border: 1px solid var(--danger);
  border-radius: var(--radius-sm);
  padding: 0.75rem 1rem;
  color: #ff6b6b;
  font-size: var(--font-size-sm);
  text-align: center;
  margin-top: 0.5rem;
}

.btn-primary {
  padding: 0.875rem;
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-semibold);
  letter-spacing: 0.5px;
  margin-top: 0.5rem;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.button-loading {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.button-loading::after {
  content: '';
  display: inline-block;
  width: 12px;
  height: 12px;
  border: 2px solid rgba(0, 0, 0, 0.3);
  border-top-color: #000;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.terms-text {
  font-size: var(--font-size-xs);
  color: var(--text-tertiary);
  text-align: center;
  margin: 0;
  line-height: 1.5;
}

.terms-link {
  color: var(--accent-gold);
  text-decoration: none;
  transition: opacity var(--transition-fast);
}

.terms-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.login-section {
  text-align: center;
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.login-link {
  color: var(--accent-gold);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  transition: opacity var(--transition-fast);
}

.login-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 480px) {
  .register-page h2 {
    font-size: var(--font-size-xl);
    margin-bottom: 1rem;
  }

  .register-form {
    gap: 1rem;
  }
}
</style>
