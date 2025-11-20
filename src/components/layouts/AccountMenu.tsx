import { useState, useEffect } from 'react';
import { User, Settings, Dumbbell, UtensilsCrossed, TrendingUp } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { supabase } from '@/lib/supabase';

export default function AccountMenu() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [totalWorkouts, setTotalWorkouts] = useState(0);
  const [totalMeals, setTotalMeals] = useState(0);
  const [totalPRs, setTotalPRs] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      // Total de workouts
      const { data: workouts, error: workoutError } = await supabase
        .from('workouts')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('is_final', true);

      if (workoutError) throw workoutError;
      setTotalWorkouts(workouts?.length || 0);

      // Total de meals
      const { data: meals, error: mealError } = await supabase
        .from('meals')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id)
        .eq('is_final', true);

      if (mealError) throw mealError;
      setTotalMeals(meals?.length || 0);

      // Total de PRs
      const { data: prs, error: prError } = await supabase
        .from('exercise_personal_records')
        .select('id', { count: 'exact' })
        .eq('user_id', user.id);

      if (prError) throw prError;
      setTotalPRs(prs?.length || 0);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-8 mx-auto mb-1"></div>
              <div className="h-3 bg-muted rounded w-16 mx-auto"></div>
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold">{totalWorkouts}</p>
              <p className="text-xs text-muted-foreground">Workouts</p>
            </>
          )}
        </Card>
        <Card className="p-4 text-center">
          <UtensilsCrossed className="w-6 h-6 mx-auto mb-2 text-green-600 dark:text-green-400" />
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-8 mx-auto mb-1"></div>
              <div className="h-3 bg-muted rounded w-16 mx-auto"></div>
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold">{totalMeals}</p>
              <p className="text-xs text-muted-foreground">Meals</p>
            </>
          )}
        </Card>
        <Card className="p-4 text-center">
          <TrendingUp className="w-6 h-6 mx-auto mb-2 text-purple-600 dark:text-purple-400" />
          {isLoading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-muted rounded w-8 mx-auto mb-1"></div>
              <div className="h-3 bg-muted rounded w-16 mx-auto"></div>
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold">{totalPRs}</p>
              <p className="text-xs text-muted-foreground">PRs</p>
            </>
          )}
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
        </Card>
      </div>

      <div className="text-center text-xs text-muted-foreground pt-4">
        Fitness Planner v1.0.0
      </div>
    </div>
  );
}