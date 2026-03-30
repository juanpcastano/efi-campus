import { useBreadcrumbStore } from '#/store/breadcrumbStore'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/courses')({
  component: RouteComponent,
})

function RouteComponent() {
  useBreadcrumbStore((store) => store.setPage)('Mis Cursos')
  useBreadcrumbStore((store) => store.setPath)([])
  return <div>Hello "/_authenticated/courses"!</div>
}
