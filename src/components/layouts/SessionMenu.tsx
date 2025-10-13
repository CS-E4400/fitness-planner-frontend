import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight?: number;
  lastTime?: string;
}

interface SessionMenuProps {
  onFinish: () => void;
}

export default function SessionMenu({ onFinish }: SessionMenuProps) {
  const navigate = useNavigate();
  const [exercises] = useState<Exercise[]>([
    {
      id: '1',
      name: 'Bench Press',
      sets: 3,
      reps: 10,
      weight: 80,
      lastTime: '80kg x 10 - Set'
    },
    {
      id: '2',
      name: 'Lat Pulldown',
      sets: 3,
      reps: 12,
      weight: 60
    },
    {
      id: '3',
      name: 'Shoulder Press',
      sets: 3,
      reps: 8,
      weight: 40
    }
  ]);

  const [sessionData, setSessionData] = useState<Record<string, { weight?: number; sets?: number; reps?: number }>>({});

  const handleInputChange = (exerciseId: string, field: string, value: string) => {
    setSessionData(prev => ({
      ...prev,
      [exerciseId]: {
        ...prev[exerciseId],
        [field]: value ? Number(value) : undefined
      }
    }));
  };

  return (
    <div className="p-4 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Upper Body — Week 2 Day 1</h1>
      </div>
      
      <div className="space-y-3">
        {exercises.map((exercise) => (
          <Card key={exercise.id} className="p-4">
            <div className="space-y-3">
              <h3 className="font-medium">{exercise.name}</h3>
              
              {exercise.lastTime && (
                <p className="text-sm text-muted-foreground">
                  Last time: {exercise.lastTime}
                </p>
              )}
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground">Weight (kg)</label>
                  <Input 
                    type="number" 
                    defaultValue={exercise.weight}
                    onChange={(e) => handleInputChange(exercise.id, 'weight', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Sets</label>
                  <Input 
                    type="number" 
                    defaultValue={exercise.sets}
                    onChange={(e) => handleInputChange(exercise.id, 'sets', e.target.value)}
                    className="h-8"
                  />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">Reps</label>
                  <Input 
                    type="number" 
                    defaultValue={exercise.reps}
                    onChange={(e) => handleInputChange(exercise.id, 'reps', e.target.value)}
                    className="h-8"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                {Array.from({ length: exercise.sets }).map((_, setIndex) => (
                  <Button
                    key={setIndex}
                    variant="outline"
                    size="sm"
                    className="flex-1"
                  >
                    Set {setIndex + 1}
                  </Button>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 pt-4">
        <Button 
          variant="outline" 
          className="flex-1"
        >
          Save
        </Button>
        <Button 
          onClick={() => {
            onFinish?.();
            navigate('/');
          }}
          className="flex-1"
        >
          Finish
        </Button>
      </div>
    </div>
  );
}