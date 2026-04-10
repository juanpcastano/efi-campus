import { apiClient } from '#/lib/apiClient'

export interface Course {
  id: string
  name: string
  description: string
  portrait_url: string
  created_at: string
  updated_at: string
}

interface CourseApiResponse {
  course: Course
}

export async function fetchCourses(): Promise<Course[]> {
  const response = await apiClient.get<{ courses: Course[] }>('/courses')
  return response.courses
}

export async function createCourse(data: {
  name: string
  description: string
}): Promise<Course> {
  const response = await apiClient.post<CourseApiResponse>('/courses', data)
  return response.course
}

export async function updateCourse(
  id: string,
  data: { name?: string; description?: string },
): Promise<Course> {
  const response = await apiClient.patch<CourseApiResponse>(
    `/courses/${id}`,
    data,
  )
  return response.course
}

export async function deleteCourse(id: string): Promise<void> {
  await apiClient.delete(`/courses/${id}`)
}
