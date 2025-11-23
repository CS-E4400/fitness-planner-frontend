import { apiSlice } from './apiSlice';
import { Workout, CreateWorkoutRequest, UpdateWorkoutRequest } from '@/types';

export const workoutsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getWorkouts: builder.query<Workout[], { startDate?: string; endDate?: string } | void>({
            query: (params) => ({
                url: '/api/workouts',
                params: params || undefined,
            }),
            transformResponse: (response: { data: Workout[] } | Workout[]) => {
                if (Array.isArray(response)) return response;
                return (response as { data: Workout[] }).data || [];
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'Workout' as const, id })),
                        { type: 'Workout', id: 'LIST' },
                    ]
                    : [{ type: 'Workout', id: 'LIST' }],
        }),
        createWorkout: builder.mutation<Workout, CreateWorkoutRequest>({
            query: (workout) => ({
                url: '/api/workouts',
                method: 'POST',
                body: workout,
            }),
            transformResponse: (response: { data: Workout } | Workout) => {
                if ('data' in response) return (response as { data: Workout }).data;
                return response as Workout;
            },
            invalidatesTags: [
                { type: 'Workout', id: 'LIST' },
                'PersonalRecord'
            ],
        }),
        updateWorkout: builder.mutation<Workout, UpdateWorkoutRequest>({
            query: ({ id, ...patch }) => ({
                url: `/api/workouts/${id}`,
                method: 'PUT',
                body: patch,
            }),
            transformResponse: (response: { data: Workout } | Workout) => {
                if ('data' in response) return (response as { data: Workout }).data;
                return response as Workout;
            },
            invalidatesTags: (_result, _error, { id }) => [
                { type: 'Workout', id },
                { type: 'Workout', id: 'LIST' },
            ],
        }),
        deleteWorkout: builder.mutation<{ success: boolean }, string>({
            query: (id) => ({
                url: `/api/workouts/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'Workout', id },
                { type: 'Workout', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetWorkoutsQuery,
    useCreateWorkoutMutation,
    useUpdateWorkoutMutation,
    useDeleteWorkoutMutation,
} = workoutsApi;
