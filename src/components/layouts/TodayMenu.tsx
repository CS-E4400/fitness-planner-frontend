import { useState, useEffect } from 'react';
import { Dumbbell, UtensilsCrossed, TrendingUp, Calendar } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { supabase } from '@/lib/supabase';

export default function TodayMenu() {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const [workoutCount, setWorkoutCount] = useState(0);
  const [mealCount, setMealCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadWeeklyStats();
    }
  }, [user]);

  const loadWeeklyStats = async () => {
    if (!user?.id) return;

    setIsLoading(true);
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    try {
      // Workouts esta semana
      const { data: workouts, error: workoutError } = await supabase
        .from('workouts')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_final', true)
        .gte('date', startOfWeek.toISOString().split('T')[0]);

      if (workoutError) throw workoutError;
      setWorkoutCount(workouts?.length || 0);

      // Meals esta semana
      const { data: meals, error: mealError } = await supabase
        .from('meals')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_final', true)
        .gte('date', startOfWeek.toISOString().split('T')[0]);

      if (mealError) throw mealError;
      setMealCount(meals?.length || 0);
    } catch (error) {
      console.error('Error loading weekly stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 18) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-primary/5">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">{greeting()}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!</h2>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4" />
            <p className="text-sm">{today}</p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Card 
          className="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
          onClick={() => navigate('/session')}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Dumbbell className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold">Start Workout</h3>
              <p className="text-xs text-muted-foreground mt-1">Track your exercises</p>
            </div>
          </div>
        </Card>

        <Card 
          className="p-6 cursor-pointer hover:shadow-lg transition-all hover:scale-105"
          onClick={() => navigate('/nutrition')}
        >
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <UtensilsCrossed className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold">Log Meal</h3>
              <p className="text-xs text-muted-foreground mt-1">Track your nutrition</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Progress Card */}
      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold">Your Progress</h3>
              <p className="text-sm text-muted-foreground">Track your journey</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/progress')}
          >
            View All
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-12 mx-auto mb-1"></div>
                <div className="h-3 bg-muted rounded w-24 mx-auto"></div>
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold text-primary">{workoutCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Workouts This Week</p>
              </>
            )}
          </div>
          <div className="text-center p-3 rounded-lg bg-muted/50">
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-8 bg-muted rounded w-12 mx-auto mb-1"></div>
                <div className="h-3 bg-muted rounded w-24 mx-auto"></div>
              </div>
            ) : (
              <>
                <p className="text-2xl font-bold text-primary">{mealCount}</p>
                <p className="text-xs text-muted-foreground mt-1">Meals This Week</p>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}