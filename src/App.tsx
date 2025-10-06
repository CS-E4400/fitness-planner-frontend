import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getSession } from '@/redux/features/authSlice'
import { AppDispatch, RootState } from '@/redux/store'
import MainLayout from "./components/layouts/MainLayout"
import ProtectedRoute from './components/ProtectedRoute'

const App = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { isLoading } = useSelector((state: RootState) => state.auth)

  useEffect(() => {
    dispatch(getSession())
  }, [dispatch])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>
  )
}

export default App
