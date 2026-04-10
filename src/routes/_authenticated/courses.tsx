import { useBreadcrumbStore } from '#/store/breadcrumbStore'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/_authenticated/courses')({
  component: RouteComponent,
})

function RouteComponent() {
  useEffect(() => {
    useBreadcrumbStore.getState().setPage('Mis Cursos')
    useBreadcrumbStore.getState().setPath([])
  }, [])
  return <div>Hello "/_authenticated/courses"!</div>
}
