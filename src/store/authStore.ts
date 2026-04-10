import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { jwtDecode } from 'jwt-decode'
import type { AuthTokens } from '#/lib/cognito'

interface CognitoIdTokenPayload {
  sub: string
  email: string
  given_name: string
  family_name: string
}

export interface AuthUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role?: 'admin' | 'student'
  profilePictureUrl?: string
  phoneNumber?: string
}

interface AuthState {
  user: AuthUser | null
  tokens: AuthTokens | null
  isAuthenticated: boolean

  setSession: (tokens: AuthTokens) => void
  clearSession: () => void
  setProfile: (data: Partial<AuthUser>) => void
}

function parseUser(idToken: string): AuthUser {
  const payload = jwtDecode<CognitoIdTokenPayload>(idToken)

  return {
    id: payload.sub,
    email: payload.email,
    firstName: payload.given_name,
    lastName: payload.family_name,
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,

      setSession: (tokens) => {
        const user = parseUser(tokens.idToken)
        set({ tokens, user, isAuthenticated: true })
      },

      clearSession: () => {
        set({ tokens: null, user: null, isAuthenticated: false })
      },

      setProfile: (data) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        }))
      },
    }),
    {
      name: 'efi-auth',
      partialize: (state) => ({
        tokens: state.tokens,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
)
