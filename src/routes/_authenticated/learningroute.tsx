import { useBreadcrumbStore } from '#/store/breadcrumbStore'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect } from 'react'

export const Route = createFileRoute('/_authenticated/learningroute')({
  component: RouteComponent,
})

function RouteComponent() {
  useEffect(() => {
    useBreadcrumbStore.getState().setPage('Ruta de Aprendizaje')
    useBreadcrumbStore.getState().setPath([])
  }, [])
  return <div>Hello "/_authenticated/learningroute"!</div>
}
