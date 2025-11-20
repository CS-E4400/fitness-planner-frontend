import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSession } from '@/redux/features/authSlice'
import { AppDispatch, RootState } from '@/redux/store'
import HomeLayout from "./components/layouts/HomeLayout"
import ProtectedRoute from './components/ProtectedRoute'
import { Outlet, useLocation } from 'react-router-dom'

const App = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { isLoading } = useSelector((state: RootState) => state.auth)
  const { pathname } = useLocation()

  useEffect(() => {
    dispatch(getSession())
  }, [dispatch])

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <HomeLayout>
        <Outlet />
      </HomeLayout>
    </ProtectedRoute>
  )
}

export default App