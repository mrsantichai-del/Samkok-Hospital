import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const { user, token, setUser, switchRoleDemo, logout } = useAuthStore();
  return {
    user,
    token,
    isAuthenticated: Boolean(user),
    setUser,
    switchRoleDemo,
    logout,
  };
}
