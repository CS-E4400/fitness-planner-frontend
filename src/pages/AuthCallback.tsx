import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { supabase } from '@/lib/supabase'
import { setSession, setLoading } from '@/redux/features/authSlice'
import { AppDispatch } from '@/redux/store'

const AuthCallback = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch<AppDispatch>()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        dispatch(setLoading(true))

        const { data, error } = await supabase.auth.getSession()

        if (error) {
          console.error('Auth callback error:', error)
          navigate('/login?error=auth_callback_error')
          return
        }

        if (data.session) {
          dispatch(setSession({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
            expires_at: data.session.expires_at || 0,
            user: {
              id: data.session.user.id,
              email: data.session.user.email || '',
              name: data.session.user.user_metadata?.full_name,
              avatar_url: data.session.user.user_metadata?.avatar_url,
              created_at: data.session.user.created_at,
              updated_at: data.session.user.updated_at
            }
          }))
          navigate('/')
        } else {
          navigate('/login?error=no_session')
        }
      } catch (error) {
        console.error('Auth callback failed:', error)
        navigate('/login?error=auth_callback_failed')
      } finally {
        dispatch(setLoading(false))
      }
    }

    handleAuthCallback()
  }, [navigate, dispatch])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Completing sign in...</p>
      </div>
    </div>
  )
}

export default AuthCallback