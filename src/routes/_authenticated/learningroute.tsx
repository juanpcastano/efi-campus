import { useBreadcrumbStore } from '#/store/breadcrumbStore'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/learningroute')({
  component: RouteComponent,
})

function RouteComponent() {
  useBreadcrumbStore((store) => store.setPage)('Ruta de Aprendizaje')
  useBreadcrumbStore((store) => store.setPath)([])
  return <div>Hello "/_authenticated/learningroute"!</div>
}
