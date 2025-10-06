import { supabase } from './supabase'
import { ApiResponse } from 'fitness-planner-shared'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

class ApiClient {
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const { data: { session } } = await supabase.auth.getSession()

    if (!session?.access_token) {
      throw new Error('No authentication token available')
    }

    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    }
  }

  async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    const headers = await this.getAuthHeaders()

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const headers = await this.getAuthHeaders()

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: data ? JSON.stringify(data) : undefined
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    const headers = await this.getAuthHeaders()

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: data ? JSON.stringify(data) : undefined
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const headers = await this.getAuthHeaders()

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }
}

export const apiClient = new ApiClient()

// Workout API functions
export const workoutApi = {
  getWorkouts: () => apiClient.get('/api/workouts'),
  createWorkout: (workout: any) => apiClient.post('/api/workouts', workout),
  updateWorkout: (id: string, workout: any) => apiClient.put(`/api/workouts/${id}`, workout),
  deleteWorkout: (id: string) => apiClient.delete(`/api/workouts/${id}`)
}