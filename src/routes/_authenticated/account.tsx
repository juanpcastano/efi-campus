import { useBreadcrumbStore } from '#/store/breadcrumbStore'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated/account')({
  component: RouteComponent,
})

function RouteComponent() {
  useBreadcrumbStore((store) => store.setPage)('Mi Cuenta')
  useBreadcrumbStore((store) => store.setPath)([])
  return <div>Hello "/_authenticated/account"!</div>
}
