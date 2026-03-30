import { useBreadcrumbStore } from '#/store/breadcrumbStore'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/home')({
  component: RouteComponent,
})

function RouteComponent() {
  useBreadcrumbStore((store) => store.setPage)('Inicio')
  useBreadcrumbStore((store) => store.setPath)([])
  return <div>Hello "/_authenticated/home"!</div>
}
