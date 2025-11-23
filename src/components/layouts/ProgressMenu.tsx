import { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import { Plus, TrendingDown, TrendingUp, Calendar } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useGetMealsQuery } from '@/redux/api/mealsApi';
import { useGetWorkoutsQuery } from '@/redux/api/workoutsApi';
import { useGetPersonalRecordsQuery } from '@/redux/api/personalRecordsApi';
import { useGetBodyWeightQuery, useLogBodyWeightMutation } from '@/redux/api/bodyWeightApi';


type TimePeriod = 'week' | 'month' | 'quarter' | 'semester' | 'year';

const muscleGroupColors: Record<string, string> = {
  Chest: "bg-red-200 text-red-800",
  Back: "bg-blue-200 text-blue-800",
  Shoulders: "bg-purple-200 text-purple-800",
  Biceps: "bg-green-200 text-green-800",
  Triceps: "bg-orange-200 text-orange-800",
  Quadriceps: "bg-yellow-200 text-yellow-800",
  Hamstrings: "bg-amber-200 text-amber-800",
  Glutes: "bg-pink-200 text-pink-800",
  Calves: "bg-lime-200 text-lime-800",
  Core: "bg-cyan-200 text-cyan-800",
};

export default function ProgressMenu() {
  const { user } = useSelector((state: RootState) => state.auth);
  const weightUnit = user?.weight_unit || 'kg';

  // Conversion helpers
  const kgToLbs = (kg: number) => kg * 2.20462;
  const lbsToKg = (lbs: number) => lbs / 2.20462;

  const convertWeight = (weight: number, toDisplay: boolean = true) => {
    if (toDisplay) {
      // Convert stored kg to display unit
      return weightUnit === 'lbs' ? kgToLbs(weight) : weight;
    } else {
      // Convert display unit to kg for storage
      return weightUnit === 'lbs' ? lbsToKg(weight) : weight;
    }
  };

  const formatWeight = (weight: number) => {
    const displayed = convertWeight(weight, true);
    return `${displayed.toFixed(1)} ${weightUnit}`;
  };
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('month');
  const [isAddWeightOpen, setIsAddWeightOpen] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [newWeightDate, setNewWeightDate] = useState(new Date().toISOString().split('T')[0]);

  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const dateRange = useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);

    return {
      startDate: startOfWeek.toISOString(),
      endDate: endOfWeek.toISOString()
    };
  }, []);

  const { data: meals } = useGetMealsQuery(dateRange, { skip: !user?.id });
  const { data: workouts } = useGetWorkoutsQuery({ startDate: dateRange.startDate.split('T')[0] }, { skip: !user?.id });
  const { data: prs, isLoading: isLoadingPRs } = useGetPersonalRecordsQuery(undefined, { skip: !user?.id });
  const { data: weightRecordsData, isLoading: isLoadingWeight } = useGetBodyWeightQuery(undefined, { skip: !user?.id });
  const [logBodyWeight] = useLogBodyWeightMutation();

  const mealCount = meals?.length || 0;
  const workoutCount = workouts?.length || 0;
  const weightRecords = weightRecordsData || [];

  const personalRecords = useMemo(() => {
    return (prs || []).map((record: any) => ({
      exercise_name: record.exercise?.name || 'Unknown Exercise',
      muscle_group: record.exercise?.muscle_group || 'Unknown',
      max_weight: record.max_weight,
      reps_at_max: record.reps_at_max
    }));
  }, [prs]);

  const handleAddWeight = async () => {
    if (!user?.id || !newWeight) return;

    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight <= 0) {
      setDialogMessage('Please enter a valid weight');
      setIsSuccessDialogOpen(true);
      return;
    }

    try {
      // Convert to kg for storage
      const weightInKg = convertWeight(weight, false);

      await logBodyWeight({
        weight: weightInKg,
        date: newWeightDate
      }).unwrap();

      setDialogMessage('Weight added successfully!');
      setNewWeight('');
      setNewWeightDate(new Date().toISOString().split('T')[0]);

      setIsSuccessDialogOpen(true);
      setIsAddWeightOpen(false);
    } catch (error: any) {
      console.error('Error adding weight:', error);
      if (error.data?.message?.includes('duplicate key') || error.data?.message?.includes('23505') || error.message?.includes('duplicate key')) {
        setDialogMessage('You already have a weight record for this date');
      } else {
        setDialogMessage('Error adding weight. Please try again.');
      }
      setIsSuccessDialogOpen(true);
    }
  };

  const getFilteredWeightData = () => {
    if (weightRecords.length === 0) return [];

    const now = new Date();
    let cutoffDate = new Date();

    switch (timePeriod) {
      case 'week':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        cutoffDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        cutoffDate.setMonth(now.getMonth() - 3);
        break;
      case 'semester':
        cutoffDate.setMonth(now.getMonth() - 6);
        break;
      case 'year':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
    }

    const filtered = weightRecords.filter(record => {
      const recordDate = new Date(record.date);
      return recordDate >= cutoffDate;
    });

    return filtered.map(record => ({
      date: new Date(record.date).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short'
      }),
      weight: convertWeight(record.weight, true)
    }));
  };

  const getCurrentWeight = () => {
    if (weightRecords.length === 0) return null;
    return convertWeight(weightRecords[weightRecords.length - 1].weight, true);
  };

  const getWeightChange = () => {
    const filtered = getFilteredWeightData();
    if (filtered.length < 2) return null;

    const firstWeight = filtered[0].weight;
    const lastWeight = filtered[filtered.length - 1].weight;
    return lastWeight - firstWeight;
  };

  const currentWeight = getCurrentWeight();
  const weightChange = getWeightChange();
  const chartData = getFilteredWeightData();

  const getMuscleGroupColor = (group: string) => {
    return muscleGroupColors[group] || 'bg-gray-200 text-gray-800';
  };

  const periodLabels: Record<TimePeriod, string> = {
    week: 'Week',
    month: 'Month',
    quarter: 'Quarter',
    semester: 'Semester',
    year: 'Year'
  };

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Progress</h1>

      <Tabs defaultValue="weight" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="weight">Weight</TabsTrigger>
          <TabsTrigger value="lifts">Lifts</TabsTrigger>
          <TabsTrigger value="streaks">Streaks</TabsTrigger>
        </TabsList>

        <TabsContent value="weight" className="space-y-4">
          {/* Header with Log Weight button */}
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Weight Tracking</h3>
            <Button
              size="sm"
              onClick={() => setIsAddWeightOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Log Weight
            </Button>
          </div>

          {/* Time Period Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {(Object.keys(periodLabels) as TimePeriod[]).map(period => (
              <Button
                key={period}
                variant={timePeriod === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTimePeriod(period)}
              >
                {periodLabels[period]}
              </Button>
            ))}
          </div>

          {/* Weight Chart */}
          <Card className="p-4">
            <h3 className="mb-4 font-semibold">Weight Progress</h3>
            {isLoadingWeight ? (
              <div className="h-48 flex items-center justify-center">
                <p className="text-muted-foreground">Loading...</p>
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-48 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-muted-foreground mb-2">No weight data available</p>
                  <Button size="sm" onClick={() => setIsAddWeightOpen(true)}>
                    Add First Weight Entry
                  </Button>
                </div>
              </div>
            ) : (
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis
                      dataKey="date"
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                    />
                    <YAxis
                      domain={['dataMin - 1', 'dataMax + 1']}
                      stroke="hsl(var(--muted-foreground))"
                      style={{ fontSize: '12px' }}
                      tickFormatter={(value) => `${value.toFixed(0)}`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: any) => [`${value.toFixed(1)} ${weightUnit}`, 'Weight']}
                    />
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))' }}
                    />
                  </LineChart >
                </ResponsiveContainer >
              </div >
            )
            }
          </Card >

          {/* Weight Stats */}
          < div className="grid grid-cols-2 gap-4" >
            <Card className="p-4 text-center">
              <p className="text-2xl font-bold">
                {currentWeight ? `${currentWeight.toFixed(1)} ${weightUnit}` : '--'}
              </p>
              <p className="text-sm text-muted-foreground">Current Weight</p>
            </Card>
            <Card className="p-4 text-center">
              {weightChange !== null ? (
                <>
                  <div className="flex items-center justify-center gap-1">
                    {weightChange < 0 ? (
                      <TrendingDown className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingUp className="w-5 h-5 text-red-600" />
                    )}
                    <p className={`text-2xl font-bold ${weightChange < 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} {weightUnit}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">This {periodLabels[timePeriod].toLowerCase()}</p>
                </>
              ) : (
                <>
                  <p className="text-2xl font-bold">--</p>
                  <p className="text-sm text-muted-foreground">No change data</p>
                </>
              )}
            </Card>
          </div >
        </TabsContent >

        <TabsContent value="lifts" className="space-y-4">
          {isLoadingPRs ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading personal records...</p>
            </div>
          ) : personalRecords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-2">No personal records yet</p>
              <p className="text-sm text-muted-foreground">Complete workouts to set your PRs!</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {personalRecords.map((lift: any) => (
                <Card key={lift.exercise_name} className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-sm">{lift.exercise_name}</h3>
                      <Badge className={`text-xs ${getMuscleGroupColor(lift.muscle_group)}`}>
                        {lift.muscle_group}
                      </Badge>
                    </div>
                    <p className="text-2xl font-bold">{formatWeight(lift.max_weight)}</p>
                    <p className="text-sm text-muted-foreground">
                      {lift.reps_at_max} {lift.reps_at_max === 1 ? 'rep' : 'reps'}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="streaks" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-6 text-center">
              <p className="text-4xl font-bold text-primary">{workoutCount}</p>
              <p className="text-sm text-muted-foreground mt-2">Workouts This Week</p>
            </Card>
            <Card className="p-6 text-center">
              <p className="text-4xl font-bold text-primary">{mealCount}</p>
              <p className="text-sm text-muted-foreground mt-2">Meals Logged This Week</p>
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Weekly Summary</h3>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">Workouts completed</span>
                <span className="font-semibold">{workoutCount}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm">Meals logged</span>
                <span className="font-semibold">{mealCount}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-sm">Total activities</span>
                <span className="font-semibold text-primary">{workoutCount + mealCount}</span>
              </div>
            </div>
          </Card>

          {(workoutCount > 0 || mealCount > 0) && (
            <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
              <div className="space-y-2">
                <h3 className="font-semibold text-green-900 dark:text-green-100">🎉 Great Job!</h3>
                <p className="text-sm text-green-800 dark:text-green-200">
                  You're staying consistent this week. Keep up the excellent work!
                </p>
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs >

      {/* Add Weight Dialog */}
      < Dialog open={isAddWeightOpen} onOpenChange={setIsAddWeightOpen} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Your Weight</DialogTitle>
            <DialogDescription>
              Track your weight progress over time
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Weight (kg)</label>
              <Input
                type="number"
                step="0.1"
                placeholder="e.g., 75.5"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Date</label>
              <Input
                type="date"
                value={newWeightDate}
                onChange={(e) => setNewWeightDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setIsAddWeightOpen(false);
                  setNewWeight('');
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleAddWeight}
                disabled={!newWeight}
              >
                Add Weight
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog >

      {/* Success Dialog */}
      < Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen} >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {dialogMessage.includes('Error') || dialogMessage.includes('already') ? 'Error' : 'Success'}
            </DialogTitle>
            <DialogDescription>
              {dialogMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setIsSuccessDialogOpen(false)}>
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog >
    </div >
  );
}