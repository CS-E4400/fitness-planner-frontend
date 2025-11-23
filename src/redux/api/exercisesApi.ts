import { apiSlice } from './apiSlice';
import { ExerciseFromDB } from '@/types';

export const exercisesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getExercises: builder.query<ExerciseFromDB[], void>({
            query: () => '/api/exercises',
            transformResponse: (response: { data: ExerciseFromDB[] } | ExerciseFromDB[]) => {
                if (Array.isArray(response)) return response;
                return (response as { data: ExerciseFromDB[] }).data || [];
            },
            providesTags: ['Exercise'],
        }),
    }),
});

export const { useGetExercisesQuery } = exercisesApi;
