import { apiClient } from '#/lib/apiClient'
import type { AuthUser } from '#/store/authStore'

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
