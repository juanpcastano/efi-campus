import { create } from 'zustand'

interface node {
  displayName: string
  link: string
}
interface breadcrumbState {
  path: node[]
  page: string
  setPath: (path: node[]) => void
  setPage: (page: string) => void
}

export const useBreadcrumbStore = create<breadcrumbState>()((set) => ({
  path: [],
  page: '',
  setPath: (path: node[]) => set({ path: path }),
  setPage: (page: string) => set({ page: page }),
}))
