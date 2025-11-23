import { apiSlice } from './apiSlice';
import { MealTemplate, CreateMealTemplateRequest } from '@/types';

export const mealTemplatesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMealTemplates: builder.query<MealTemplate[], { public?: boolean } | void>({
            query: (params) => ({
                url: '/api/meal-templates',
                params: params || undefined,
            }),
            transformResponse: (response: { data: MealTemplate[] } | MealTemplate[]) => {
                if (Array.isArray(response)) return response;
                return (response as { data: MealTemplate[] }).data || [];
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'MealTemplate' as const, id })),
                        { type: 'MealTemplate', id: 'LIST' },
                    ]
                    : [{ type: 'MealTemplate', id: 'LIST' }],
        }),
        createMealTemplate: builder.mutation<MealTemplate, CreateMealTemplateRequest>({
            query: (template) => ({
                url: '/api/meal-templates',
                method: 'POST',
                body: template,
            }),
            transformResponse: (response: { data: MealTemplate } | MealTemplate) => {
                if ('data' in response) return (response as { data: MealTemplate }).data;
                return response as MealTemplate;
            },
            invalidatesTags: [{ type: 'MealTemplate', id: 'LIST' }],
        }),
        deleteMealTemplate: builder.mutation<void, string>({
            query: (id) => ({
                url: `/api/meal-templates/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'MealTemplate', id: 'LIST' }],
        }),
    }),
});

export const {
    useGetMealTemplatesQuery,
    useCreateMealTemplateMutation,
    useDeleteMealTemplateMutation,
} = mealTemplatesApi;
