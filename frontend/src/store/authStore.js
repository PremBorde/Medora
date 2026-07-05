import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { setToken, clearToken, setUser } from '@/lib/auth';

const useAuthStore = create(
  persist(
    (set) => ({
      user: { firstName: 'Demo', lastName: 'User', email: 'demo@medora.ai', chronicConditions: 'Hypertension', currentMedications: 'Lisinopril 10mg' },
      token: 'demo-token',
      isAuthenticated: true,

      login: (token, user) => {
        setToken(token);
        setUser(user);
        set({ token, user, isAuthenticated: true });
      },

      logout: () => {
        clearToken();
        set({ token: null, user: null, isAuthenticated: false });
      },

      updateUser: (updatedUser) => {
        set((state) => ({
          user: { ...state.user, ...updatedUser },
        }));
      },
    }),
    {
      name: 'medora-auth',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
