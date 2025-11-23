import { apiSlice } from './apiSlice';

export interface BodyWeight {
    id: string;
    user_id: string;
    weight: number;
    date: string;
    created_at: string;
}

export interface LogBodyWeightRequest {
    weight: number;
    date: string;
}

export const bodyWeightApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getBodyWeight: builder.query<BodyWeight[], void>({
            query: () => '/api/body-weight',
            transformResponse: (response: { data: BodyWeight[] } | BodyWeight[]) => {
                if (Array.isArray(response)) return response;
                return (response as { data: BodyWeight[] }).data || [];
            },
            providesTags: ['BodyWeight'],
        }),
        logBodyWeight: builder.mutation<BodyWeight, LogBodyWeightRequest>({
            query: (data) => ({
                url: '/api/body-weight',
                method: 'POST',
                body: data,
            }),
            transformResponse: (response: { data: BodyWeight } | BodyWeight) => {
                if ('data' in response) return (response as { data: BodyWeight }).data;
                return response as BodyWeight;
            },
            invalidatesTags: ['BodyWeight'],
        }),
    }),
});

export const { useGetBodyWeightQuery, useLogBodyWeightMutation } = bodyWeightApi;
