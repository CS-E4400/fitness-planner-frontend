export interface Workout {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  exercises: WorkoutExercise[];
  duration_minutes?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  created_at: string;
  updated_at: string;
}

export interface WorkoutExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weight_kg?: number;
  rest_seconds?: number;
  notes?: string;
}

export interface CreateWorkoutRequest {
  name: string;
  description?: string;
  exercises: Omit<WorkoutExercise, 'id'>[];
  duration_minutes?: number;
  difficulty: Workout['difficulty'];
}

export interface UpdateWorkoutRequest extends Partial<CreateWorkoutRequest> {
  id: string;
}

export interface ExerciseFromDB {
  id: string;
  name: string;
  muscle_group: string;
  equipment?: string;
  video_url?: string;
  instructions?: string;
}

export interface WorkoutTemplate {
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
    exercise: {
      id: string;
      name: string;
      muscle_group: string;
    };
  }>;
}

export interface CreateWorkoutTemplateRequest {
  name: string;
  description?: string;
  exercises: Array<{
    exercise_id: string;
    sets: number;
    reps: number;
    weight?: number;
    rest_seconds?: number;
    notes?: string;
    order_index: number;
  }>;
}