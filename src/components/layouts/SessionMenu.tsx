import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Plus, Search, X, Save, Edit2, Trash2, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { RootState } from '@/redux/store';
import { useGetExercisesQuery } from '@/redux/api/exercisesApi';
import { useGetTemplatesQuery, useCreateTemplateMutation, useDeleteTemplateMutation } from '@/redux/api/workoutTemplatesApi';
import { useCreateWorkoutMutation } from '@/redux/api/workoutsApi';
import { useGetPersonalRecordsQuery } from '@/redux/api/personalRecordsApi';
import { ExerciseFromDB, WorkoutTemplate } from '@/types';

interface ExerciseSet {
  weight: number;
  reps: number;
  completed: boolean;
}

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
  setsData: ExerciseSet[];
  selectedSet: number;
  personalRecord?: {
    max_weight: number;
    reps_at_max: number;
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

interface SessionMenuProps {
  onFinish?: () => void;
}

export default function SessionMenu({ onFinish }: SessionMenuProps) {
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  // RTK Query hooks
  const { data: exercises = [], isLoading: isLoadingExercises } = useGetExercisesQuery();
  const { data: publicTemplates = [], isLoading: isLoadingPublicTemplates } = useGetTemplatesQuery({ public: true });
  const { data: userTemplates = [], isLoading: isLoadingUserTemplates } = useGetTemplatesQuery({ public: false });
  const { data: personalRecords = [] } = useGetPersonalRecordsQuery();

  const [createWorkout, { isLoading: isCreatingWorkout }] = useCreateWorkoutMutation();
  const [createTemplate] = useCreateTemplateMutation();
  const [deleteTemplate] = useDeleteTemplateMutation();

  const [selectedExercises, setSelectedExercises] = useState<Exercise[]>([]);
  const [isAddExerciseOpen, setIsAddExerciseOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const isLoadingTemplates = isLoadingPublicTemplates || isLoadingUserTemplates;

  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [activeTab, setActiveTab] = useState('create');

  // Create PR map for easy lookup
  const prMap = personalRecords.reduce((acc: Record<string, any>, pr: any) => {
    acc[pr.exercise_id] = {
      max_weight: pr.max_weight,
      reps_at_max: pr.reps_at_max
    };
    return acc;
  }, {});

  const loadTemplate = (template: WorkoutTemplate) => {
    const formattedExercises: Exercise[] = template.template_exercises.map(te => {
      const numSets = te.sets;
      const setsData: ExerciseSet[] = Array.from({ length: numSets }, () => ({
        weight: te.weight || 0,
        reps: te.reps,
        completed: false
      }));

      return {
        id: `temp_${Date.now()}_${te.id}`,
        exercise_id: te.exercise_id,
        name: te.exercise?.name || 'Unknown Exercise',
        muscle_group: te.exercise?.muscle_group || 'Unknown',
        sets: numSets,
        reps: te.reps,
        weight: te.weight || 0,
        rest_seconds: te.rest_seconds,
        notes: te.notes,
        setsData,
        selectedSet: 0,
        personalRecord: prMap[te.exercise_id]
      };
    });

    setSelectedExercises(formattedExercises);
    setActiveTab('create');
  };

  const addExerciseToWorkout = (exercise: ExerciseFromDB) => {
    const setsData: ExerciseSet[] = Array.from({ length: 3 }, () => ({
      weight: 0,
      reps: 10,
      completed: false
    }));

    const newExercise: Exercise = {
      id: `temp_${Date.now()}`,
      exercise_id: exercise.id,
      name: exercise.name,
      muscle_group: exercise.muscle_group,
      sets: 3,
      reps: 10,
      weight: 0,
      rest_seconds: 60,
      notes: '',
      setsData,
      selectedSet: 0,
      personalRecord: prMap[exercise.id]
    };

    setSelectedExercises(prev => [...prev, newExercise]);
    setIsAddExerciseOpen(false);
    setSearchTerm('');
  };

  const removeExercise = (id: string) => {
    setSelectedExercises(prev => prev.filter(ex => ex.id !== id));
  };

  const updateExerciseSets = (id: string, newSetsCount: number) => {
    if (newSetsCount < 1) return;

    setSelectedExercises(prev =>
      prev.map(ex => {
        if (ex.id !== id) return ex;

        const currentSets = ex.setsData.length;
        let newSetsData = [...ex.setsData];

        if (newSetsCount > currentSets) {
          const lastSet = ex.setsData[currentSets - 1] || { weight: ex.weight, reps: ex.reps, completed: false };
          for (let i = currentSets; i < newSetsCount; i++) {
            newSetsData.push({ ...lastSet, completed: false });
          }
        } else {
          newSetsData = newSetsData.slice(0, newSetsCount);
        }

        return {
          ...ex,
          sets: newSetsCount,
          setsData: newSetsData,
          selectedSet: Math.min(ex.selectedSet, newSetsCount - 1)
        };
      })
    );
  };

  const updateSetData = (exerciseId: string, setIndex: number, field: 'weight' | 'reps', value: number) => {
    setSelectedExercises(prev =>
      prev.map(ex => {
        if (ex.id !== exerciseId) return ex;

        const newSetsData = [...ex.setsData];
        newSetsData[setIndex] = {
          ...newSetsData[setIndex],
          [field]: value
        };

        return { ...ex, setsData: newSetsData };
      })
    );
  };

  const toggleSetComplete = (exerciseId: string, setIndex: number) => {
    setSelectedExercises(prev =>
      prev.map(ex => {
        if (ex.id !== exerciseId) return ex;

        const newSetsData = [...ex.setsData];
        newSetsData[setIndex] = {
          ...newSetsData[setIndex],
          completed: !newSetsData[setIndex].completed
        };

        // If marked as complete AND it's not the last set, automatically advance
        const isMarkingComplete = !newSetsData[setIndex].completed === false;
        const isLastSet = setIndex === ex.setsData.length - 1;
        const shouldAdvance = isMarkingComplete && !isLastSet;

        return {
          ...ex,
          setsData: newSetsData,
          selectedSet: shouldAdvance ? setIndex + 1 : ex.selectedSet
        };
      })
    );
  };

  const selectSet = (exerciseId: string, setIndex: number) => {
    setSelectedExercises(prev =>
      prev.map(ex =>
        ex.id === exerciseId ? { ...ex, selectedSet: setIndex } : ex
      )
    );
  };

  const handleSaveTemplate = async () => {
    if (!user?.id || !templateName.trim() || selectedExercises.length === 0) return;

    try {
      await createTemplate({
        name: templateName,
        description: templateDescription,
        exercises: selectedExercises.map((ex, i) => {
          const avgWeight = ex.setsData.reduce((sum, s) => sum + s.weight, 0) / ex.setsData.length;
          const avgReps = Math.round(ex.setsData.reduce((sum, s) => sum + s.reps, 0) / ex.setsData.length);
          return {
            exercise_id: ex.exercise_id,
            sets: ex.sets,
            reps: avgReps,
            weight: avgWeight,
            rest_seconds: ex.rest_seconds,
            notes: ex.notes,
            order_index: i + 1
          };
        })
      }).unwrap();

      setIsSaveDialogOpen(false);
      setTemplateName('');
      setTemplateDescription('');

      setSuccessMessage('Workout template saved successfully!');
      setIsSuccessDialogOpen(true);
    } catch (error: any) {
      console.error('Error saving template:', error);
      setSuccessMessage(error.data?.message || error.message || 'Error saving template. Please try again.');
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
      await deleteTemplate(templateToDelete).unwrap();

      setIsDeleteDialogOpen(false);
      setTemplateToDelete(null);

      setSuccessMessage('Workout template deleted successfully!');
      setIsSuccessDialogOpen(true);
    } catch (error: any) {
      console.error('Error deleting template:', error);
      setSuccessMessage(error.data?.message || error.message || 'Error deleting template. Please try again.');
      setIsSuccessDialogOpen(true);
    }
  };

  const handleFinish = async () => {
    if (!user?.id || selectedExercises.length === 0) return;

    try {
      const exercisesToSave = selectedExercises.map(ex => {
        const completedSets = ex.setsData.filter(set => set.completed);
        if (completedSets.length === 0) return null;

        const avgWeight = completedSets.reduce((sum, s) => sum + s.weight, 0) / completedSets.length;
        const avgReps = Math.round(completedSets.reduce((sum, s) => sum + s.reps, 0) / completedSets.length);

        return {
          name: ex.name,
          muscle_group: ex.muscle_group,
          sets: completedSets.length,
          reps: avgReps,
          weight_kg: avgWeight,
          rest_seconds: ex.rest_seconds,
          notes: ex.notes
        };
      }).filter(Boolean);

      if (exercisesToSave.length === 0) {
        setSuccessMessage('No completed sets to save.');
        setIsSuccessDialogOpen(true);
        return;
      }

      await createWorkout({
        name: 'Workout Session',
        difficulty: 'intermediate',
        duration_minutes: 60, // Estimate or track
        exercises: exercisesToSave as any
      }).unwrap();

      setSuccessMessage('Workout completed successfully!');
      setIsSuccessDialogOpen(true);

      setTimeout(() => {
        onFinish?.();
        navigate('/');
      }, 1500);
    } catch (error: any) {
      console.error('Error finishing workout:', error);
      setSuccessMessage(error.data?.message || error.message || 'Error saving workout. Please try again.');
      setIsSuccessDialogOpen(true);
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium">{exercise.name}</h3>
                            <Badge className={`text-xs ${getMuscleGroupColor(exercise.muscle_group)}`}>
                              {exercise.muscle_group}
                            </Badge>
                            {exercise.personalRecord && (
                              <Badge variant="outline" className="text-xs">
                                PR: {exercise.personalRecord.max_weight}kg × {exercise.personalRecord.reps_at_max}
                              </Badge>
                            )}
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

                      <div className="flex items-center gap-2">
                        <label className="text-xs text-muted-foreground whitespace-nowrap">Number of Sets:</label>
                        <Input
                          type="number"
                          value={exercise.sets}
                          onChange={e => updateExerciseSets(exercise.id, Number(e.target.value))}
                          className="h-8 w-20"
                          min={1}
                        />
                      </div>

                      <div className="flex gap-2 flex-wrap">
                        {exercise.setsData.map((setData, index) => (
                          <Button
                            key={index}
                            variant={exercise.selectedSet === index ? "default" : "outline"}
                            size="sm"
                            className={`relative ${setData.completed ? 'border-green-500' : ''}`}
                            onClick={() => selectSet(exercise.id, index)}
                          >
                            {setData.completed && (
                              <Check className="w-3 h-3 absolute top-0 right-0 text-green-500" />
                            )}
                            Set {index + 1}
                          </Button>
                        ))}
                      </div>

                      {exercise.selectedSet !== null && exercise.setsData[exercise.selectedSet] && (
                        <div className="border-t pt-3 space-y-3">
                          <p className="text-sm font-medium">Set {exercise.selectedSet + 1} Details</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-xs text-muted-foreground">Weight (kg)</label>
                              <Input
                                type="number"
                                value={exercise.setsData[exercise.selectedSet].weight}
                                onChange={e =>
                                  updateSetData(exercise.id, exercise.selectedSet, 'weight', Number(e.target.value))
                                }
                                className="h-8"
                              />
                            </div>
                            <div>
                              <label className="text-xs text-muted-foreground">Reps</label>
                              <Input
                                type="number"
                                value={exercise.setsData[exercise.selectedSet].reps}
                                onChange={e =>
                                  updateSetData(exercise.id, exercise.selectedSet, 'reps', Number(e.target.value))
                                }
                                className="h-8"
                                min={1}
                              />
                            </div>
                          </div>
                          <Button
                            variant={exercise.setsData[exercise.selectedSet].completed ? "outline" : "default"}
                            size="sm"
                            className="w-full"
                            onClick={() => toggleSetComplete(exercise.id, exercise.selectedSet)}
                          >
                            {exercise.setsData[exercise.selectedSet].completed ? 'Mark Incomplete' : 'Mark Complete'}
                          </Button>
                        </div>
                      )}
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