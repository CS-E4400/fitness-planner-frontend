import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signOut } from '@/redux/features/authSlice';
import { AppDispatch, RootState } from '@/redux/store';
import TopNavigation from '../layers/TopNavigation';
import Header from '../layers/header';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface HomeLayoutProps {
  children: React.ReactNode;
}

export default function HomeLayout({ children }: HomeLayoutProps) {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isLoading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('today');

  useEffect(() => {
    if (location.pathname === '/') {
      setActiveTab('today');
    } else if (location.pathname === '/session') {
      setActiveTab('session');
    } else if (location.pathname === '/account' || 
               location.pathname === '/profile-settings' || 
               location.pathname === '/app-settings') {
      setActiveTab('account');
    } else if (location.pathname.startsWith('/nutrition')) {
      setActiveTab('nutrition');
    } else if (location.pathname === '/progress') {
      setActiveTab('progress');
    }
  }, [location.pathname]);

  const handleSignOut = () => {
    dispatch(signOut());
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'today') {
      navigate('/');
    } else if (tab === 'session') {
      navigate('/session');
    } else if (tab === 'account') {
      navigate('/account');
    } else if (tab === 'nutrition') {
      navigate('/nutrition');
    } else if (tab === 'progress') {
      navigate('/progress');
    }
  };

  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const initials = user?.name
    ?.split(' ')
    .filter(n => n.length > 0)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || user?.email?.slice(0, 2).toUpperCase() || '??';

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-foreground">
              Fitness Planner
            </h1>
            <div className="flex items-center gap-4">
              {user && (
                <div className="flex items-center gap-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar_url || ''} alt={displayName} />
                    <AvatarFallback className="text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-foreground hidden sm:block">
                    {displayName}
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

      <main className="flex-1 overflow-auto bg-background">
        {children}
      </main>
    </div>
  );
}