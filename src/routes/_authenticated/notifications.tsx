import { useBreadcrumbStore } from '#/store/breadcrumbStore'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/_authenticated/notifications')({
  component: RouteComponent,
})

function RouteComponent() {
  useEffect(() => {
    useBreadcrumbStore.getState().setPage('Notificaciones')
    useBreadcrumbStore.getState().setPath([])
  }, [])
  return <div>Hello "/_authenticated/notifications"!</div>
}
