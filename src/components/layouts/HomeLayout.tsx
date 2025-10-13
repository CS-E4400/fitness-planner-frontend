import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from '@/redux/features/authSlice';
import { AppDispatch, RootState } from '@/redux/store';
import TopNavigation from '../layers/TopNavigation';
import Header from '../layers/header';
import { Button } from '@/components/ui/button'

interface HomeLayoutProps {
  children: React.ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  const dispatch = useDispatch<AppDispatch>()
  const { user, isLoading } = useSelector((state: RootState) => state.auth)
  const location = useLocation()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('today')

  useEffect(() => {
    if (location.pathname === '/') {
      setActiveTab('today')
    } else if (location.pathname === '/session') {
      setActiveTab('session')
    } else if (location.pathname === '/account') {
      setActiveTab('account')
    }
  }, [location.pathname])

  const handleSignOut = () => {
    dispatch(signOut())
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === 'today') {
      navigate('/')
    } else if (tab === 'session') {
      navigate('/session')
    } else if (tab === 'account') {
      navigate('/account')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">
              Fitness Planner
            </h1>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-3">
                  {user.avatar_url && (
                    <img
                      src={user.avatar_url}
                      alt={user.name || user.email}
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <span className="text-sm text-gray-700">
                    {user.name || user.email}
                  </span>
                </div>
              )}
              <Button
                onClick={handleSignOut}
                disabled={isLoading}
                variant="outline"
                size="sm"
              >
                {isLoading ? 'Signing out...' : 'Sign Out'}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <Header activeTab={activeTab} userRole="user" />
      <TopNavigation activeTab={activeTab} onTabChange={handleTabChange} />

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}