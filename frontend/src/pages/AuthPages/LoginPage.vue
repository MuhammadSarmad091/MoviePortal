<template>
  <div class="login-page">
    <h2>Welcome Back</h2>

    <form
      @submit.prevent="handleLogin"
      class="login-form"
    >
      <!-- Email Field -->
      <div class="form-group">
        <label
          for="email"
          class="form-label"
        >Email Address</label>
        <input
          id="email"
          v-model="form.email"
          @input="onEmailInput"
          @blur="validateEmail"
          type="text"
          placeholder="you@example.com"
          class="form-input"
          :class="{ 'input-error': errors.email }"
          required
        >
        <p
          v-if="errors.email"
          class="error-message"
        >
          {{ errors.email }}
        </p>
      </div>

      <!-- Password Field -->
      <div class="form-group">
        <label
          for="password"
          class="form-label"
        >Password</label>
        <input
          id="password"
          v-model="form.password"
          @input="onPasswordInput"
          @blur="validatePassword"
          type="password"
          placeholder="Enter your password"
          class="form-input"
          :class="{ 'input-error': errors.password }"
          required
        >
        <p
          v-if="errors.password"
          class="error-message"
        >
          {{ errors.password }}
        </p>
      </div>

      <!-- Remember Me Checkbox -->
      <div class="form-group checkbox-group">
        <input
          id="rememberMe"
          v-model="form.rememberMe"
          type="checkbox"
          class="form-checkbox"
        >
        <label
          for="rememberMe"
          class="checkbox-label"
        >Remember me for 30 days</label>
      </div>

      <!-- General Error -->
      <div
        v-if="authError"
        class="error-box"
      >
        {{ authError }}
      </div>

      <!-- Submit Button -->
      <button
        type="submit"
        class="btn-primary btn-block"
        :disabled="isLoading"
      >
        <span v-if="!isLoading">Sign In</span>
        <span
          v-else
          class="button-loading"
        >Signing in...</span>
      </button>

      <!-- Signup Link -->
      <p class="signup-section">
        Don't have an account?
        <RouterLink
          to="/auth/register"
          class="signup-link"
        >
          Sign up here
        </RouterLink>
      </p>

      <!-- Demo Credentials -->
      <div class="demo-info">
        <p class="demo-title">
          Demo Credentials (Test Account):
        </p>
        <p class="demo-cred">
          <strong>Email:</strong> abc@gmail.com<br>
          <strong>Password:</strong> 12344321
        </p>
      </div>
    </form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuth } from '../../composables/useAuth';
import { sanitizeEmail } from '../../composables/useInputSanitize';
import { validateLoginForm } from '../../utils/validation';

const router = useRouter();
const route = useRoute();
const { login, loading: isLoading, error: authError, clearError } = useAuth();

const form = reactive({
  email: '',
  password: '',
  rememberMe: false
});

const errors = reactive({
  email: '',
  password: ''
});

const validateEmail = () => {
  const { errors: validationErrors } = validateLoginForm(form);
  errors.email = validationErrors.email || '';
};

const validatePassword = () => {
  const { errors: validationErrors } = validateLoginForm(form);
  errors.password = validationErrors.password || '';
};

const validateForm = () => {
  const { isValid, errors: validationErrors } = validateLoginForm(form);
  errors.email = validationErrors.email || '';
  errors.password = validationErrors.password || '';
  return isValid;
};

const handleLogin = async () => {
  if (!validateForm()) {
    return;
  }

  try {
    await login(form.email, form.password);
    // Only redirect on successful login
    const redirectTo = route.query.redirect || '/';
    await router.push(redirectTo);
  } catch (err) {
    // Error is already set in authError via authStore
    // No need to console.error, error is reactive and will display
  }
};

// input handlers to sanitize while typing
const onEmailInput = (e) => {
  form.email = sanitizeEmail(e.target.value);
  // Clear auth error when user starts typing
  if (authError.value) {
    clearError();
  }
};

const onPasswordInput = () => {
  // Clear auth error when user starts typing password
  if (authError.value) {
    clearError();
  }
};
</script>

<style scoped>
.login-page {
  width: 100%;
}

.login-page h2 {
  font-size: var(--font-size-2xl);
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  text-align: center;
  font-weight: var(--font-weight-bold);
}

.login-form {
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
  transition:
    border-color var(--transition-fast),
    background-color var(--transition-fast);
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
}

.checkbox-group {
  flex-direction: row;
  align-items: center;
  gap: 0.5rem;
}

.form-checkbox {
  width: 1.125rem;
  height: 1.125rem;
  cursor: pointer;
  accent-color: var(--accent-gold);
}

.checkbox-label {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  cursor: pointer;
  user-select: none;
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

.signup-section {
  text-align: center;
  margin: 0;
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
}

.signup-link {
  color: var(--accent-gold);
  text-decoration: none;
  font-weight: var(--font-weight-semibold);
  transition: opacity var(--transition-fast);
}

.signup-link:hover {
  opacity: 0.8;
  text-decoration: underline;
}

.demo-info {
  margin-top: 1rem;
  padding: 1rem;
  background-color: rgba(255, 193, 7, 0.05);
  border: 1px solid rgba(255, 193, 7, 0.2);
  border-radius: var(--radius-sm);
}

.demo-title {
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--accent-gold);
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.demo-cred {
  font-size: var(--font-size-xs);
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.6;
  font-family: var(--font-mono);
}

/* Responsive */
@media (max-width: 480px) {
  .login-page h2 {
    font-size: var(--font-size-xl);
    margin-bottom: 1rem;
  }

  .login-form {
    gap: 1rem;
  }

  .demo-info {
    margin-top: 0.75rem;
    padding: 0.75rem;
  }
}
</style>
