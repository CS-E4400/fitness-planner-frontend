import { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { workoutApi } from '@/lib/api'
import { Workout } from 'fitness-planner-shared'

const Home = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setLoading(true)
        const response = await workoutApi.getWorkouts()
        if (response.data) {
          setWorkouts(response.data)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch workouts')
      } finally {
        setLoading(false)
      }
    }

    fetchWorkouts()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading workouts...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Workouts</h1>
        <Button>Add Workout</Button>
      </div>

      {workouts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">No workouts yet. Create your first workout!</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {workouts.map((workout) => (
            <div key={workout.id} className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {workout.name}
              </h3>
              {workout.description && (
                <p className="text-gray-600 mb-3">{workout.description}</p>
              )}
              <div className="flex items-center justify-between text-sm text-gray-500">
                <span>{workout.exercises.length} exercises</span>
                <span className="capitalize">{workout.difficulty}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default Home

