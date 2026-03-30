import { AppSidebar } from '#/components/app-sidebar'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '#/components/ui/breadcrumb'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '#/components/ui/sidebar'
import { useAuthStore } from '#/store/authStore'
import { useBreadcrumbStore } from '#/store/breadcrumbStore'
import { createFileRoute, Outlet, redirect, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      console.log('redirecting to login')
      throw redirect({ to: '/login' })
    }
  },
  component: RouteComponent,
})

function RouteComponent() {
  const breadcrumbStore = useBreadcrumbStore()
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbStore.path.map((node) => {
                  return (
                    <>
                      <BreadcrumbItem className="hidden md:block">
                        <Link to={node.link}>
                          <BreadcrumbLink>{node.displayName}</BreadcrumbLink>
                        </Link>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className="hidden md:block" />
                    </>
                  )
                })}
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbPage>{breadcrumbStore.page}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
