import { useBreadcrumbStore } from '#/store/breadcrumbStore'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/notifications')({
  component: RouteComponent,
})

function RouteComponent() {
  useBreadcrumbStore((store) => store.setPage)('Notificaciones')
  useBreadcrumbStore((store) => store.setPath)([])
  return <div>Hello "/_authenticated/notifications"!</div>
}
