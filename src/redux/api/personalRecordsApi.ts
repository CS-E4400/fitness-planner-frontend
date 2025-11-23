import { apiSlice } from './apiSlice';

export const personalRecordsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getPersonalRecords: builder.query<any[], void>({
            query: () => '/api/personal-records',
            transformResponse: (response: { data: any[] } | any[]) => {
                if (Array.isArray(response)) return response;
                return (response as { data: any[] }).data || [];
            },
            providesTags: ['PersonalRecord'],
        }),
    }),
});

export const { useGetPersonalRecordsQuery } = personalRecordsApi;
