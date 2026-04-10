import { apiClient } from '#/lib/apiClient'

export interface Professor {
  id: string
  firstName: string
  lastName: string
  dictationId?: string
}

export interface Group {
  id: string
  course_id: string
  schedule: string
  day_of_week: string
  term: string
  open: boolean
  structure_id: string | null
  professors: Professor[]
  created_at: string
  updated_at: string
}

interface GroupApiResponse {
  groups: Group[]
}

export async function fetchGroup(id: string): Promise<Group> {
  const response = await apiClient.get<{ group: Group }>(`/groups/${id}`)
  return response.group
}

export async function fetchGroups(): Promise<Group[]> {
  const response = await apiClient.get<GroupApiResponse>('/groups')
  return response.groups
}

export async function createGroup(data: {
  course_id: string
  schedule: string
  day_of_week: string
  term: string
}): Promise<Group> {
  const response = await apiClient.post<{ group: Group }>('/groups', data)
  return response.group
}

export async function updateGroup(
  id: string,
  data: { schedule?: string; day_of_week?: string; term?: string },
): Promise<Group> {
  const response = await apiClient.patch<{ group: Group }>(
    `/groups/${id}`,
    data,
  )
  return response.group
}

export async function toggleGroupOpen(id: string): Promise<void> {
  await apiClient.patch(`/groups/${id}/open`, {})
}

export async function deleteGroup(id: string): Promise<void> {
  await apiClient.delete(`/groups/${id}`)
}

export async function addDictation(
  groupId: string,
  userId: string,
): Promise<void> {
  await apiClient.post(`/groups/${groupId}/dictations`, { user_id: userId })
}

export async function deleteDictation(
  groupId: string,
  dictationId: string,
): Promise<void> {
  await apiClient.delete(`/groups/${groupId}/dictations/${dictationId}`)
}
