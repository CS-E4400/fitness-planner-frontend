import { apiSlice } from './apiSlice';
import { FoodFromDB } from '@/types';

export const foodsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getFoods: builder.query<FoodFromDB[], void>({
            query: () => '/api/foods',
            transformResponse: (response: { data: FoodFromDB[] } | FoodFromDB[]) => {
                if (Array.isArray(response)) return response;
                return (response as { data: FoodFromDB[] }).data || [];
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ id }) => ({ type: 'Food' as const, id })),
                        { type: 'Food', id: 'LIST' },
                    ]
                    : [{ type: 'Food', id: 'LIST' }],
        }),
    }),
});

export const { useGetFoodsQuery } = foodsApi;
