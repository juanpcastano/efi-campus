import { apiClient } from '#/lib/apiClient'

export interface Professor {
  id: string
  firstName: string
  lastName: string
  dictationId?: string
}

export interface EnrolledUser {
  id: string
  firstName: string
  lastName: string
  profilePictureUrl: string | null
}

export interface Inscription {
  id: string
  user_id: string
  group_id: string
  created_at: string
  user: EnrolledUser
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
  course?: {
    id: string
    name: string
    description: string
    portrait_url: string
    created_at: string
    updated_at: string
  }
}

interface GroupApiResponse {
  groups: Group[]
}

interface InscriptionsApiResponse {
  inscriptions: Inscription[]
}

export async function fetchAvailableGroups(): Promise<Group[]> {
  const response = await apiClient.get<GroupApiResponse>('/groups/available')
  return response.groups
}

export async function enrollInGroup(groupId: string): Promise<void> {
  await apiClient.post(`/groups/${groupId}/inscriptions`, {})
}

interface MyInscriptionsApiResponse {
  inscriptions: {
    group: Group
    course: Group['course']
  }[]
}

export async function fetchMyInscriptions(): Promise<Group[]> {
  const response = await apiClient.get<MyInscriptionsApiResponse>(
    '/users/me/inscriptions',
  )
  return response.inscriptions.map((ins) => ({
    ...ins.group,
    course: ins.course,
  }))
}

export async function fetchGroupInscriptions(
  groupId: string,
): Promise<Inscription[]> {
  const response = await apiClient.get<InscriptionsApiResponse>(
    `/groups/${groupId}/inscriptions`,
  )
  return response.inscriptions
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
