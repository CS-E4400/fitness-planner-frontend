import { apiSlice } from './apiSlice';
import { WorkoutTemplate, CreateWorkoutTemplateRequest } from '@/types';

export const workoutTemplatesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getTemplates: builder.query<WorkoutTemplate[], { public?: boolean } | void>({
            query: (params) => ({
                url: '/api/workout-templates',
                params: params || undefined,
            }),
            transformResponse: (response: { data: WorkoutTemplate[] }) => response.data,
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'WorkoutTemplate' as const, id })),
                        { type: 'WorkoutTemplate', id: 'LIST' },
                    ]
                    : [{ type: 'WorkoutTemplate', id: 'LIST' }],
        }),
        createTemplate: builder.mutation<WorkoutTemplate, CreateWorkoutTemplateRequest>({
            query: (template) => ({
                url: '/api/workout-templates',
                method: 'POST',
                body: template,
            }),
            invalidatesTags: [{ type: 'WorkoutTemplate', id: 'LIST' }],
        }),
        deleteTemplate: builder.mutation<{ success: boolean }, string>({
            query: (id) => ({
                url: `/api/workout-templates/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'WorkoutTemplate', id },
                { type: 'WorkoutTemplate', id: 'LIST' },
            ],
        }),
    }),
});

export const {
    useGetTemplatesQuery,
    useCreateTemplateMutation,
    useDeleteTemplateMutation,
} = workoutTemplatesApi;
