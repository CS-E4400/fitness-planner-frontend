import { Plus, Search, X, Save, Edit2, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { supabase } from '@/lib/supabase';

interface Exercise {
  id: string;
  exercise_id: string;
  name: string;
  muscle_group: string;
  sets: number;
  reps: number;
  weight: number;
  rest_seconds?: number;
  notes?: string;
}

interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  is_public: boolean;
  template_exercises: Array<{
    id: string;
    exercise_id: string;
    sets: number;
    reps: number;
    weight?: number;
    rest_seconds?: number;
    notes?: string;
    order_index: number;
    exercises: {
      id: string;
      name: string;
      muscle_group: string;
    };
  }>;
}

interface ExerciseFromDB {
  id: string;
  name: string;
  muscle_group: string;
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

interface SessionMenuProps {
  onFinish?: () => void;
}

export default function SessionMenu({ onFinish }: SessionMenuProps) {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  
  const [exercises, setExercises] = useState<ExerciseFromDB[]>([]);
  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [isLoadingExercises, setIsLoadingExercises] = useState(false);
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [publicTemplates, setPublicTemplates] = useState<WorkoutTemplate[]>([]);
  const [userTemplates, setUserTemplates] = useState<WorkoutTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [activeTab, setActiveTab] = useState('create');

  useEffect(() => {
    loadExercises();
    loadTemplates();
  }, []);

  useEffect(() => {
    if (user) {
      loadTemplates();
    }
  }, [user]);

  const loadExercises = async () => {
    setIsLoadingExercises(true);
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('name');

      if (error) throw error;
      setExercises(data || []);
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setIsLoadingExercises(false);
    }
  };

  const loadTemplates = async () => {
    setIsLoadingTemplates(true);
    try {
      const { data: publicData, error: publicError } = await supabase
        .from('workout_templates')
        .select(`
          id,
          name,
          description,
          is_public,
          template_exercises (
            id,
            exercise_id,
            sets,
            reps,
            weight,
            rest_seconds,
            notes,
            order_index,
            exercises (
              id,
              name,
              muscle_group
            )
          )
        `)
        .eq('is_public', true)
        .order('name');

      if (publicError) throw publicError;

      if (user) {
        const { data: userData, error: userError } = await supabase
          .from('workout_templates')
          .select(`
            id,
            name,
            description,
            is_public,
            template_exercises (
              id,
              exercise_id,
              sets,
              reps,
              weight,
              rest_seconds,
              notes,
              order_index,
              exercises (
                id,
                name,
                muscle_group
              )
            )
          `)
          .eq('user_id', user.id)
          .eq('is_public', false)
          .order('name');

        if (userError) throw userError;
        setUserTemplates(formatTemplates(userData || []));
      }

      setPublicTemplates(formatTemplates(publicData || []));
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  const formatTemplates = (data: any[]): WorkoutTemplate[] => {
    return data.map(template => ({
      ...template,
      template_exercises: (template.template_exercises || []).sort((a: any, b: any) => a.order_index - b.order_index)
    }));
  };

  const loadTemplate = (template: WorkoutTemplate) => {
    const formattedExercises: Exercise[] = template.template_exercises.map(te => ({
      id: `temp_${Date.now()}_${te.id}`,
      exercise_id: te.exercise_id,
      name: te.exercises.name,
      muscle_group: te.exercises.muscle_group,
      sets: te.sets,
      reps: te.reps,
      weight: te.weight || 0,
      rest_seconds: te.rest_seconds,
      notes: te.notes
    }));
    
    setSelectedExercises(formattedExercises);
    setActiveTab('create');
  };

  const addExerciseToWorkout = (exercise: ExerciseFromDB) => {
    const newExercise: Exercise = {
      id: `temp_${Date.now()}`,
      exercise_id: exercise.id,
      name: exercise.name,
      muscle_group: exercise.muscle_group,
      sets: 3,
      reps: 10,
      weight: 0,
      rest_seconds: 60,
      notes: ''
    };

    setSelectedExercises(prev => [...prev, newExercise]);
    setIsAddExerciseOpen(false);
    setSearchTerm('');
  };

  const removeExercise = (id: string) => {
    setSelectedExercises(prev => prev.filter(ex => ex.id !== id));
  };

  const updateExercise = (id: string, field: string, value: number | string) => {
    setSelectedExercises(prev =>
      prev.map(ex =>
        ex.id === id ? { ...ex, [field]: value } : ex
      )
    );
  };

  const handleSaveTemplate = async () => {
    if (!user?.id || !templateName.trim() || selectedExercises.length === 0) return;

    try {
      const { data: templateData, error: templateError } = await supabase
        .from('workout_templates')
        .insert({
          user_id: user.id,
          name: templateName,
          description: templateDescription,
          is_public: false
        })
        .select()
        .single();

      if (templateError) throw templateError;

      for (let i = 0; i < selectedExercises.length; i++) {
        const ex = selectedExercises[i];
        const { error: teError } = await supabase
          .from('template_exercises')
          .insert({
            template_id: templateData.id,
            exercise_id: ex.exercise_id,
            sets: ex.sets,
            reps: ex.reps,
            weight: ex.weight,
            rest_seconds: ex.rest_seconds,
            notes: ex.notes,
            order_index: i + 1
          });

        if (teError) throw teError;
      }

      setIsSaveDialogOpen(false);
      setTemplateName('');
      setTemplateDescription('');
      loadTemplates();
      
      setSuccessMessage('Workout template saved successfully!');
      setIsSuccessDialogOpen(true);
    } catch (error) {
      console.error('Error saving template:', error);
      setSuccessMessage('Error saving template. Please try again.');
      setIsSuccessDialogOpen(true);
    }
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplateToDelete(templateId);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      const { error } = await supabase
        .from('workout_templates')
        .delete()
        .eq('id', templateToDelete);

      if (error) throw error;

      setIsDeleteDialogOpen(false);
      setTemplateToDelete(null);
      loadTemplates();
      
      setSuccessMessage('Workout template deleted successfully!');
      setIsSuccessDialogOpen(true);
    } catch (error) {
      console.error('Error deleting template:', error);
      setSuccessMessage('Error deleting template. Please try again.');
      setIsSuccessDialogOpen(true);
    }
  };

  const handleFinish = async () => {
    if (!user?.id || selectedExercises.length === 0) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert({
          user_id: user.id,
          date: today,
          is_final: true
        })
        .select()
        .single();

      if (workoutError) throw workoutError;

      for (const ex of selectedExercises) {
        for (let i = 0; i < ex.sets; i++) {
          const { error: setError } = await supabase
            .from('workout_sets')
            .insert({
              workout_id: workoutData.id,
              exercise_id: ex.exercise_id,
              weight: ex.weight,
              reps: ex.reps,
              rpe: null
            });

          if (setError) throw setError;
        }
      }

      onFinish?.();
      navigate('/');
    } catch (error) {
      console.error('Error finishing workout:', error);
    }
  };

  const filteredExercises = exercises.filter(ex =>
    ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ex.muscle_group.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getMuscleGroupColor = (group: string) => {
    return muscleGroupColors[group] || 'bg-gray-200 text-gray-800';
  };

  const getTotalSets = (exercises: any[]) => {
    return exercises.reduce((sum, ex) => sum + ex.sets, 0);
  };

  return (
    <div className="p-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="public">Workout Templates</TabsTrigger>
          <TabsTrigger value="my">My Workouts</TabsTrigger>
          <TabsTrigger value="create">Create Workout</TabsTrigger>
        </TabsList>

        <TabsContent value="public" className="space-y-4 mt-4">
          <h2 className="text-xl font-semibold">Pre-made Templates</h2>
          {isLoadingTemplates ? (
            <p className="text-center text-muted-foreground">Loading templates...</p>
          ) : publicTemplates.length === 0 ? (
            <p className="text-center text-muted-foreground">No templates available</p>
          ) : (
            <div className="space-y-3">
              {publicTemplates.map(template => (
                <Card key={template.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {template.template_exercises.length} exercises • {getTotalSets(template.template_exercises)} total sets
                      </p>
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => loadTemplate(template)}
                    >
                      Select
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="my" className="space-y-4 mt-4">
          <h2 className="text-xl font-semibold">My Saved Workouts</h2>
          {isLoadingTemplates ? (
            <p className="text-center text-muted-foreground">Loading your templates...</p>
          ) : userTemplates.length === 0 ? (
            <p className="text-center text-muted-foreground">You haven't saved any workouts yet</p>
          ) : (
            <div className="space-y-3">
              {userTemplates.map(template => (
                <Card key={template.id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">{template.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {template.template_exercises.length} exercises • {getTotalSets(template.template_exercises)} total sets
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => loadTemplate(template)}
                      >
                        Select
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => loadTemplate(template)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="create" className="mt-4">
          <div className="space-y-6">
            <div className="space-y-3">
              {selectedExercises.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground mb-4">No exercises added yet</p>
                  <Button onClick={() => setIsAddExerciseOpen(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Exercise
                  </Button>
                </Card>
              ) : (
                selectedExercises.map(exercise => (
                  <Card key={exercise.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{exercise.name}</h3>
                            <Badge className={`text-xs ${getMuscleGroupColor(exercise.muscle_group)}`}>
                              {exercise.muscle_group}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeExercise(exercise.id)}
                          className="text-red-500"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-xs text-muted-foreground">Weight (kg)</label>
                          <Input
                            type="number"
                            value={exercise.weight}
                            onChange={e => updateExercise(exercise.id, 'weight', Number(e.target.value))}
                            className="h-8"
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Sets</label>
                          <Input
                            type="number"
                            value={exercise.sets}
                            onChange={e => updateExercise(exercise.id, 'sets', Number(e.target.value))}
                            className="h-8"
                            min={1}
                          />
                        </div>
                        <div>
                          <label className="text-xs text-muted-foreground">Reps</label>
                          <Input
                            type="number"
                            value={exercise.reps}
                            onChange={e => updateExercise(exercise.id, 'reps', Number(e.target.value))}
                            className="h-8"
                            min={1}
                          />
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>

            {selectedExercises.length > 0 && (
              <>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsAddExerciseOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Exercise
                </Button>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setIsSaveDialogOpen(true)}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    Save as Template
                  </Button>
                  <Button onClick={handleFinish} className="flex-1">
                    Finish
                  </Button>
                </div>
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={isAddExerciseOpen} onOpenChange={setIsAddExerciseOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Exercise</DialogTitle>
            <DialogDescription>
              Search and select exercises to add to your workout
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search exercises..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {isLoadingExercises ? (
                <p className="text-center text-muted-foreground">Loading exercises...</p>
              ) : filteredExercises.length === 0 ? (
                <p className="text-center text-muted-foreground">No exercises found</p>
              ) : (
                filteredExercises.map(exercise => (
                  <Card
                    key={exercise.id}
                    className="p-3 cursor-pointer hover:bg-accent transition-colors relative"
                    onClick={() => addExerciseToWorkout(exercise)}
                  >
                    <Badge className={`absolute top-2 right-2 text-xs ${getMuscleGroupColor(exercise.muscle_group)}`}>
                      {exercise.muscle_group}
                    </Badge>
                    <div className="pr-20">
                      <h4 className="font-medium">{exercise.name}</h4>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isSaveDialogOpen} onOpenChange={setIsSaveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Save as Template</DialogTitle>
            <DialogDescription>
              Save this workout to reuse later
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Template Name</label>
              <Input
                placeholder="e.g., My Push Day"
                value={templateName}
                onChange={e => setTemplateName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description (optional)</label>
              <Input
                placeholder="e.g., Chest and triceps focused workout"
                value={templateDescription}
                onChange={e => setTemplateDescription(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsSaveDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={handleSaveTemplate}
                disabled={!templateName.trim() || selectedExercises.length === 0}
              >
                Save Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Workout Template</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this workout template? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setIsDeleteDialogOpen(false);
                setTemplateToDelete(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="flex-1"
              onClick={confirmDeleteTemplate}
            >
              Delete
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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