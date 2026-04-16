import { create } from "zustand";

export type AuthUser = {
  uid: string;
  name: string;
  email: string;
};

export const DEMO_SESSION_COOKIE = "taskmatrix_demo_session";
export const DEMO_SESSION_STORAGE_KEY = "taskmatrix_demo_user";

type AuthState = {
  user: AuthUser | null;
  hydrated: boolean;
  setUser: (user: AuthUser) => void;
  clearUser: () => void;
  setHydrated: (hydrated: boolean) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  hydrated: false,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
  setHydrated: (hydrated) => set({ hydrated })
}));