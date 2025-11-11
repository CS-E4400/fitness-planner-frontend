import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/tabs';
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

interface Workout {
  id: string;
  name: string;
  exercises: Exercise[];
}

interface SessionMenuProps {
  onFinish: () => void;
}

export default function SessionMenu({ onFinish }: SessionMenuProps) {
  const navigate = useNavigate();

  // Example workouts (can later come from backend)
  const workouts: Workout[] = [
    {
      id: 'w1',
      name: 'Upper Body — Week 2 Day 1',
      exercises: [
        { id: '1', name: 'Bench Press', sets: 3, reps: 10, weight: 80, lastTime: '80kg x 10 - Set' },
        { id: '2', name: 'Lat Pulldown', sets: 3, reps: 12, weight: 60 },
        { id: '3', name: 'Shoulder Press', sets: 3, reps: 8, weight: 40 }
      ]
    },
    {
      id: 'w2',
      name: 'Lower Body — Week 2 Day 2',
      exercises: [
        { id: '4', name: 'Squat', sets: 4, reps: 8, weight: 100 },
        { id: '5', name: 'Leg Curl', sets: 3, reps: 12, weight: 50 },
        { id: '6', name: 'Calf Raise', sets: 3, reps: 15, weight: 40 }
      ]
    },
    {
      id: 'w3',
      name: 'Push Day — Strength Focus',
      exercises: [
        { id: '7', name: 'Incline Dumbbell Press', sets: 4, reps: 8, weight: 32 },
        { id: '8', name: 'Overhead Press', sets: 3, reps: 10, weight: 45 },
        { id: '9', name: 'Triceps Dips', sets: 3, reps: 12 }
      ]
    },
    {
      id: 'w4',
      name: 'Pull Day — Hypertrophy Focus',
      exercises: [
        { id: '10', name: 'Barbell Row', sets: 4, reps: 10, weight: 70 },
        { id: '11', name: 'Seated Cable Row', sets: 3, reps: 12, weight: 55 },
        { id: '12', name: 'Bicep Curl', sets: 3, reps: 10, weight: 20 }
      ]
    },
    {
      id: 'w5',
      name: 'Full Body — Conditioning',
      exercises: [
        { id: '13', name: 'Deadlift', sets: 3, reps: 8, weight: 110 },
        { id: '14', name: 'Push-Up', sets: 3, reps: 15 },
        { id: '15', name: 'Pull-Up', sets: 3, reps: 8 }
      ]
    }
  ];

  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
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
      <h1 className="text-xl font-semibold">Workout Session</h1>

      <Tabs defaultValue="workout" className="w-full">
        {/* Tabs header (now full-width like ProgressMenu) */}
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="select">Choose Workout</TabsTrigger>
          <TabsTrigger value="workout">Current Workout</TabsTrigger>
        </TabsList>

        {/* CHOOSE WORKOUT TAB */}
        <TabsContent value="select" className="space-y-4 pt-4">
          <h2 className="text-xl font-semibold">Select your workout</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {workouts.map((workout) => (
              <Card
                key={workout.id}
                className={`p-4 cursor-pointer hover:bg-accent transition ${
                  selectedWorkout?.id === workout.id ? 'border-primary border-2' : ''
                }`}
                onClick={() => setSelectedWorkout(workout)}
              >
                <h3 className="font-medium">{workout.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {workout.exercises.length} exercises
                </p>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* CURRENT WORKOUT TAB */}
        <TabsContent value="workout" className="pt-4">
          {selectedWorkout ? (
            <div className="space-y-4">
              <h1 className="text-2xl font-semibold">{selectedWorkout.name}</h1>
              {selectedWorkout.exercises.map((exercise) => (
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

              <div className="flex gap-3 pt-4">
                <Button variant="outline" className="flex-1">Save</Button>
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
          ) : (
            <p className="text-muted-foreground">
              No workout selected. Please choose one from the "Choose Workout" tab.
            </p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
