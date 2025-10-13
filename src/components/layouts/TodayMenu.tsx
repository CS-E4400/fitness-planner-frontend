import { Play, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { useNavigate } from 'react-router-dom';

interface TodayMenuProps {
  onAddMeal: () => void;
  onLogWorkout: () => void;
}

export default function TodayMenu({ onAddMeal, onLogWorkout }: TodayMenuProps) {
  const navigate = useNavigate();

  const handleStartWorkout = () => {
    navigate('/session');
  };

  return (
    <div className="p-4 space-y-6">
      <Card className="p-4">
        <div className="text-center space-y-3">
          <h2 className="text-lg">Leg Day – Start</h2>
          
          <button 
            onClick={handleStartWorkout}
            className="w-14 h-14 rounded-full bg-primary flex items-center justify-center hover:bg-primary/90 transition-colors mx-auto"
          >
            <Play className="w-5 h-5 text-primary-foreground fill-current ml-1" />
          </button>
        </div>
      </Card>

      <div className="flex gap-3">
        <Button 
          variant="outline" 
          onClick={onAddMeal}
          className="flex-1"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Meal
        </Button>
        <Button 
          variant="outline" 
          onClick={onLogWorkout}
          className="flex-1"
        >
          Log Workout
        </Button>
      </div>

      <div className="space-y-3">
        <h3>Today's Plan</h3>
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p>Upper Body Strength</p>
              <p className="text-sm text-muted-foreground">45 min • 6 exercises</p>
            </div>
            <Button size="sm" variant="ghost">View</Button>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p>Meal Prep Sunday</p>
              <p className="text-sm text-muted-foreground">1800 calories planned</p>
            </div>
            <Button size="sm" variant="ghost">View</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}