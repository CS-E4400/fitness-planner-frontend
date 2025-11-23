import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { RootState } from '../store';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: API_BASE_URL,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.session?.access_token;
            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }
            return headers;
        },
    }),
    tagTypes: ['MealTemplate', 'Food', 'Meal', 'User', 'Workout', 'Exercise', 'WorkoutTemplate', 'PersonalRecord', 'BodyWeight'],
    endpoints: () => ({}),
});
