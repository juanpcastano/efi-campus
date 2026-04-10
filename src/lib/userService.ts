import { apiClient } from '#/lib/apiClient'
import type { AuthUser } from '#/store/authStore'

export interface User {
  id: string
  first_name: string
  last_name: string
  email: string
  role: 'admin' | 'student'
  phone_number?: string
}

interface UserApiResponse {
  user: {
    created_at: string
    email: string
    first_name: string
    id: string
    last_name: string
    phone_number: string
    profile_picture_url: string | null
    role: 'admin' | 'student'
    updated_at: string
  }
}

interface UsersApiResponse {
  users: User[]
}

export async function fetchCurrentUser(): Promise<Partial<AuthUser>> {
  const response = await apiClient.get<UserApiResponse>('/users/me')

  return {
    firstName: response.user.first_name,
    lastName: response.user.last_name,
    role: response.user.role,
    profilePictureUrl: response.user.profile_picture_url ?? undefined,
    phoneNumber: response.user.phone_number,
  }
}

export async function fetchUsers(): Promise<User[]> {
  const response = await apiClient.get<UsersApiResponse>('/users')
  return response.users
}

export async function updateCurrentUser(data: {
  firstName?: string
  lastName?: string
  phoneNumber?: string
  profilePictureUrl?: string
}): Promise<void> {
  await apiClient.patch('/users/me', {
    first_name: data.firstName,
    last_name: data.lastName,
    phone_number: data.phoneNumber,
    profile_picture_url: data.profilePictureUrl,
  })
}
