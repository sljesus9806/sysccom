"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  company?: string | null;
  rfc?: string | null;
  role: string;
  createdAt: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;

  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,

      setAuth: (user: AuthUser, token: string) =>
        set({ user, token, isLoading: false }),

      logout: () => set({ user: null, token: null, isLoading: false }),

      setLoading: (isLoading: boolean) => set({ isLoading }),
    }),
    {
      name: "sysccom-auth",
    }
  )
);
