import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Trophy, Edit2, Save, X, Search } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Switch } from '../ui/switch';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { useTheme } from '@/contexts/ThemeProvider';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { supabase } from '@/lib/supabase';

interface PersonalRecord {
  id: string;
  exercise_id: string;
  max_weight: number;
  reps_at_max: number;
  achieved_at: string;
  exercises: {
    id: string;
    name: string;
    muscle_group: string;
  };
}

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
  Forearms: "bg-teal-200 text-teal-800",
};

export default function AppSettingsMenu() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [personalRecords, setPersonalRecords] = useState<PersonalRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<PersonalRecord[]>([]);
  const [isLoadingPRs, setIsLoadingPRs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPR, setEditingPR] = useState<PersonalRecord | null>(null);
  const [editWeight, setEditWeight] = useState(0);
  const [editReps, setEditReps] = useState(0);
  
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadPersonalRecords();
    }
  }, [user]);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredRecords(personalRecords);
    } else {
      const filtered = personalRecords.filter(pr =>
        pr.exercises.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pr.exercises.muscle_group.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRecords(filtered);
    }
  }, [searchTerm, personalRecords]);

  const loadPersonalRecords = async () => {
    if (!user?.id) return;

    setIsLoadingPRs(true);
    try {
      const { data, error } = await supabase
        .from('exercise_personal_records')
        .select(`
          id,
          exercise_id,
          max_weight,
          reps_at_max,
          achieved_at,
          exercises (
            id,
            name,
            muscle_group
          )
        `)
        .eq('user_id', user.id)
        .order('achieved_at', { ascending: false });

      if (error) throw error;

      setPersonalRecords(data || []);
      setFilteredRecords(data || []);
    } catch (error) {
      console.error('Error loading personal records:', error);
    } finally {
      setIsLoadingPRs(false);
    }
  };

  const handleEditPR = (pr: PersonalRecord) => {
    setEditingPR(pr);
    setEditWeight(pr.max_weight);
    setEditReps(pr.reps_at_max);
    setIsEditDialogOpen(true);
  };

  const handleSavePR = async () => {
    if (!editingPR || !user?.id) return;

    try {
      const { error } = await supabase
        .from('exercise_personal_records')
        .update({
          max_weight: editWeight,
          reps_at_max: editReps,
          achieved_at: new Date().toISOString()
        })
        .eq('id', editingPR.id);

      if (error) throw error;

      setIsEditDialogOpen(false);
      setEditingPR(null);
      loadPersonalRecords();
      
      setSuccessMessage('Personal record updated successfully!');
      setIsSuccessDialogOpen(true);
    } catch (error) {
      console.error('Error updating PR:', error);
      setSuccessMessage('Error updating personal record. Please try again.');
      setIsSuccessDialogOpen(true);
    }
  };

  const getMuscleGroupColor = (group: string) => {
    return muscleGroupColors[group] || 'bg-gray-200 text-gray-800';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-4 space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/account')}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-semibold">App Settings</h1>
        </div>

        {/* Appearance Section */}
        <Card className="p-6">
          <h3 className="font-medium mb-4">Appearance</h3>
          
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'light' ? (
                  <Sun className="w-5 h-5 text-yellow-500" />
                ) : (
                  <Moon className="w-5 h-5 text-blue-500" />
                )}
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">
                    {theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
                  </p>
                </div>
              </div>
              <Switch
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </Card>
        </Card>

        {/* Personal Records Section */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-5 h-5 text-yellow-500" />
            <h3 className="font-medium">Personal Records</h3>
          </div>

          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* PRs List */}
            <div className="max-h-96 overflow-y-auto space-y-2">
              {isLoadingPRs ? (
                <p className="text-center text-muted-foreground py-8">Loading personal records...</p>
              ) : filteredRecords.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-2">
                    {searchTerm ? 'No records found' : 'No personal records yet'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {searchTerm ? 'Try a different search term' : 'Complete workouts to set your first records!'}
                  </p>
                </div>
              ) : (
                filteredRecords.map(pr => (
                  <Card key={pr.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-2">
                          <h4 className="font-medium">{pr.exercises.name}</h4>
                          <Badge className={`text-xs ${getMuscleGroupColor(pr.exercises.muscle_group)}`}>
                            {pr.exercises.muscle_group}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Weight: </span>
                            <span className="font-semibold">{pr.max_weight} kg</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Reps: </span>
                            <span className="font-semibold">{pr.reps_at_max}</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Achieved on {formatDate(pr.achieved_at)}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditPR(pr)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </Card>
      </div>

      {/* Edit PR Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Personal Record</DialogTitle>
            <DialogDescription>
              {editingPR && `Update your PR for ${editingPR.exercises.name}`}
            </DialogDescription>
          </DialogHeader>
          {editingPR && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={`text-xs ${getMuscleGroupColor(editingPR.exercises.muscle_group)}`}>
                  {editingPR.exercises.muscle_group}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Weight (kg)</label>
                  <Input
                    type="number"
                    value={editWeight}
                    onChange={(e) => setEditWeight(Number(e.target.value))}
                    min={0}
                    step={0.5}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Reps</label>
                  <Input
                    type="number"
                    value={editReps}
                    onChange={(e) => setEditReps(Number(e.target.value))}
                    min={1}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingPR(null);
                  }}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSavePR}
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {successMessage.includes('Error') ? 'Error' : 'Success'}
            </DialogTitle>
            <DialogDescription>
              {successMessage}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button onClick={() => setIsSuccessDialogOpen(false)}>
              OK
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}