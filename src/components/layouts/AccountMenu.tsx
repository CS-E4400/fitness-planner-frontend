import { User, Settings, HelpCircle, Dumbbell, UtensilsCrossed, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

export default function AccountMenu() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const initials = user?.name
    ?.split(' ')
    .filter(n => n.length > 0)
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || user?.email?.slice(0, 2).toUpperCase() || '??';
  
  const displayName = user?.name || 'User';
  const displayEmail = user?.email || 'No email';

  const handleProfileSettings = () => {
    navigate('/profile-settings');
  };

  const handleAppSettings = () => {
    navigate('/app-settings');
  };

  return (
    <div className="p-4 space-y-6">
      {/* Profile Card */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Avatar className="w-20 h-20">
            <AvatarImage src={user?.avatar_url || ''} alt={displayName} />
            <AvatarFallback className="text-2xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{displayName}</h2>
            <p className="text-sm text-muted-foreground">{displayEmail}</p>
            <Button 
              variant="outline" 
              size="sm"
              className="mt-3"
              onClick={handleProfileSettings}
            >
              Edit Profile
            </Button>
          </div>
        </div>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 text-center">
          <Dumbbell className="w-6 h-6 mx-auto mb-2 text-blue-600 dark:text-blue-400" />
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs text-muted-foreground">Workouts</p>
        </Card>
        <Card className="p-4 text-center">
          <UtensilsCrossed className="w-6 h-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs text-muted-foreground">Meals</p>
        </Card>
        <Card className="p-4 text-center">
          <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
          <p className="text-2xl font-bold">0</p>
          <p className="text-xs text-muted-foreground">PRs</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="font-medium">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col gap-2"
            onClick={() => navigate('/session')}
          >
            <Dumbbell className="w-5 h-5" />
            <span className="text-sm">Start Workout</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col gap-2"
            onClick={() => navigate('/nutrition')}
          >
            <UtensilsCrossed className="w-5 h-5" />
            <span className="text-sm">Log Meal</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col gap-2"
            onClick={() => navigate('/progress')}
          >
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm">View Progress</span>
          </Button>
          <Button
            variant="outline"
            className="h-auto py-4 flex flex-col gap-2"
            onClick={handleAppSettings}
          >
            <Settings className="w-5 h-5" />
            <span className="text-sm">App Settings</span>
          </Button>
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-3">
        <h3 className="font-medium">Account</h3>
        <Card className="p-4 space-y-1">
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={handleProfileSettings}
          >
            <User className="w-4 h-4 mr-3" />
            Profile Settings
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            onClick={handleAppSettings}
          >
            <Settings className="w-4 h-4 mr-3" />
            App Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start">
            <HelpCircle className="w-4 h-4 mr-3" />
            Help & Support
          </Button>
        </Card>
      </div>

      <div className="text-center text-xs text-muted-foreground pt-4">
        Fitness Planner v1.0.0
      </div>
    </div>
  );
}