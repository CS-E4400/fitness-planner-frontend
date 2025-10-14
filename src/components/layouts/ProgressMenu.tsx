import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card } from '../ui/card';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from 'recharts';

interface ProgressMenuProps {
}

export default function ProgressMenu({}: ProgressMenuProps) {
  // Mock weight data
  const weightData = [
    { week: 'W1', weight: 75 },
    { week: 'W2', weight: 74.5 },
    { week: 'W3', weight: 74.2 },
    { week: 'W4', weight: 73.8 },
    { week: 'W5', weight: 73.5 },
    { week: 'W6', weight: 73.2 },
  ];

  const lifts = [
    { name: 'Bench', current: '80kg', previous: '75kg' },
    { name: 'Deadlift', current: '120kg', previous: '115kg' },
    { name: 'Squat', current: '100kg', previous: '95kg' },
    { name: 'OHP', current: '55kg', previous: '52kg' },
  ];

  return (
    <div className="p-4 space-y-6">
      <h1>Progress</h1>

      <Tabs defaultValue="weight" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weight">Weight</TabsTrigger>
          <TabsTrigger value="lifts">Lifts</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
        </TabsList>

        <TabsContent value="weight" className="space-y-4">
          <Card className="p-4">
            <h3 className="mb-4">Weight Progress</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weightData}>
                  <XAxis dataKey="week" />
                  <YAxis domain={['dataMin-1', 'dataMax+1']} />
                  <Line 
                    type="monotone" 
                    dataKey="weight" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 text-center">
              <p className="text-2xl">73.2kg</p>
              <p className="text-sm text-muted-foreground">Current Weight</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-2xl text-green-600">-1.8kg</p>
              <p className="text-sm text-muted-foreground">Lost this month</p>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="lifts" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {lifts.map((lift) => (
              <Card key={lift.name} className="p-4 text-center">
                <h3>{lift.name}</h3>
                <p className="text-2xl">{lift.current}</p>
                <p className="text-sm text-muted-foreground">
                  +{parseInt(lift.current) - parseInt(lift.previous)}kg from last
                </p>
              </Card>
            ))}
            </div>
        </TabsContent>

        <TabsContent value="streaks" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 text-center">
              <p className="text-3xl">12</p>
              <p className="text-sm text-muted-foreground">Workout Streak</p>
            </Card>
            <Card className="p-4 text-center">
              <p className="text-3xl">8</p>
              <p className="text-sm text-muted-foreground">Meal Logged</p>
            </Card>
          </div>
          
          <Card className="p-4">
            <h3 className="mb-3">This Week</h3>
            <div className="flex justify-between items-center">
              <span>Workouts completed</span>
              <span>4/5</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Meals logged</span>
              <span>18/21</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Water intake</span>
              <span>2.1L avg</span>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}