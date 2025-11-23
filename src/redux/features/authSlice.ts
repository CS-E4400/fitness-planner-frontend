import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { supabase } from '@/lib/supabase'
import { apiSlice } from '@/redux/api/apiSlice'
import { AuthState, User, Session } from '@/types'
import { AuthError } from '@supabase/supabase-js'

const initialState: AuthState = {
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false
}

// Async thunks for auth operations
export const signInWithGoogle = createAsyncThunk(
  'auth/signInWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      return rejectWithValue((error as AuthError).message)
    }
  }
)

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      dispatch(apiSlice.util.resetApiState())
    } catch (error) {
      return rejectWithValue((error as AuthError).message)
    }
  }
)

export const getSession = createAsyncThunk(
  'auth/getSession',
  async (_, { rejectWithValue }) => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      if (error) throw error

      if (!session) return null

      // Fetch user profile from backend (creates if not exists)
      // We use fetch directly here because the session is not yet in the Redux store,
      // so apiSlice (which relies on getState().auth.session) would fail with 401.
      let userData = null
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
        const response = await fetch(`${API_BASE_URL}/api/users/me`, {
          headers: {
            'Authorization': `Bearer ${session.access_token}`
          }
        })

        if (response.ok) {
          const result = await response.json()
          userData = result.data
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }

      // Merge data
      const enrichedUser: User = {
        id: session.user.id,
        email: session.user.email,
        name: userData?.name || session.user.user_metadata?.name || null,
        avatar_url: userData?.avatar_url || session.user.user_metadata?.avatar_url || null,
        created_at: session.user.created_at || new Date().toISOString(),
        updated_at: session.user.updated_at
      }

      return {
        ...session,
        user: enrichedUser
      }
    } catch (error) {
      return rejectWithValue((error as AuthError).message)
    }
  }
)

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User | null>) => {
      state.user = action.payload
      state.isAuthenticated = !!action.payload
    },
    setSession: (state, action: PayloadAction<Session | null>) => {
      state.session = action.payload
      state.user = action.payload?.user || null
      state.isAuthenticated = !!action.payload
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(signInWithGoogle.pending, (state) => {
        state.isLoading = true
      })
      .addCase(signInWithGoogle.fulfilled, (state) => {
        state.isLoading = false
      })
      .addCase(signInWithGoogle.rejected, (state, action) => {
        state.isLoading = false
        console.error('Google sign in failed:', action.payload)
      })
      .addCase(signOut.pending, (state) => {
        state.isLoading = true
      })
      .addCase(signOut.fulfilled, (state) => {
        state.user = null
        state.session = null
        state.isAuthenticated = false
        state.isLoading = false
      })
      .addCase(signOut.rejected, (state, action) => {
        state.isLoading = false
        console.error('Sign out failed:', action.payload)
      })
      .addCase(getSession.pending, (state) => {
        state.isLoading = true
      })
      .addCase(getSession.fulfilled, (state, action) => {
        state.session = action.payload
        state.user = action.payload?.user || null
        state.isAuthenticated = !!action.payload
        state.isLoading = false
      })
      .addCase(getSession.rejected, (state, action) => {
        state.isLoading = false
        console.error('Get session failed:', action.payload)
      })
  }
})

export const { setUser, setSession, setLoading } = authSlice.actions
export default authSlice.reducer