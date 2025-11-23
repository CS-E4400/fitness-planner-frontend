import { apiSlice } from './apiSlice';

export const mealsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMeals: builder.query<any[], { date?: string; startDate?: string; endDate?: string } | void>({
            query: (params) => ({
                url: '/api/meals',
                params: params || undefined,
            }),
            transformResponse: (response: { data: any[] } | any[]) => {
                if (Array.isArray(response)) return response;
                return (response as { data: any[] }).data || [];
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'Meal' as const, id })),
                        { type: 'Meal', id: 'LIST' },
                    ]
                    : [{ type: 'Meal', id: 'LIST' }],
        }),
        createMeal: builder.mutation<any, any>({
            query: (meal) => ({
                url: '/api/meals',
                method: 'POST',
                body: meal,
            }),
            transformResponse: (response: { data: any } | any) => {
                if ('data' in response) return (response as { data: any }).data;
                return response;
            },
            invalidatesTags: [{ type: 'Meal', id: 'LIST' }],
        }),
        deleteMeals: builder.mutation<void, { date?: string; id?: string }>({
            query: (params) => ({
                url: '/api/meals',
                method: 'DELETE',
                params,
            }),
            invalidatesTags: [{ type: 'Meal', id: 'LIST' }],
        }),
    }),
});

export const { useGetMealsQuery, useCreateMealMutation, useDeleteMealsMutation } = mealsApi;
