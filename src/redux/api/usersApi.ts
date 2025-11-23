import { apiSlice } from './apiSlice';
import { User } from '@/types';

export const usersApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getProfile: builder.query<User, void>({
            query: () => '/api/users/me',
            transformResponse: (response: { data: User } | User) => {
                if ('data' in response) return (response as { data: User }).data;
                return response as User;
            },
            providesTags: ['User'],
        }),
        updateProfile: builder.mutation<User, Partial<User>>({
            query: (data) => ({
                url: '/api/users/me',
                method: 'PUT',
                body: data,
            }),
            transformResponse: (response: { data: User } | User) => {
                if ('data' in response) return (response as { data: User }).data;
                return response as User;
            },
            invalidatesTags: ['User'],
        }),
        checkUsername: builder.mutation<{ available: boolean }, string>({
            query: (username) => ({
                url: `/api/users/check-username?name=${encodeURIComponent(username)}`,
                method: 'GET',
            }),
        }),
    }),
});

export const {
    useGetProfileQuery,
    useUpdateProfileMutation,
    useCheckUsernameMutation,
} = usersApi;
