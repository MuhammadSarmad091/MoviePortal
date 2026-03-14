import { storeToRefs } from 'pinia';
import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const store = useAuthStore();

  // Use storeToRefs to properly expose reactive refs from the store
  const { user, loading, error, isAuthenticated } = storeToRefs(store);

  const getCurrentUser = () => {
    return user.value;
  };

  return {
    // State (properly reactive refs)
    user,
    loading,
    error,

    // Computed
    isAuthenticated,
    currentUser: user, // Same as user.value in a computed way

    // Actions
    login: store.login,
    register: store.register,
    logout: store.logout,
    clearError: store.clearError,

    // Methods
    getCurrentUser
  };
}
