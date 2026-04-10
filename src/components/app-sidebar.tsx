import { NavMain } from '#/components/nav-main'
import { NavUser } from '#/components/nav-user'
import logo from '#/assets/logo.png'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '#/components/ui/sidebar'
import { HouseIcon, NotebookPen, Route, Bell, Box } from 'lucide-react'
import { useAuthStore } from '#/store/authStore'
import { useEffect } from 'react'
import { fetchCurrentUser } from '#/lib/userService'

const NAV_MAIN_BASE = [
  {
    title: 'Inicio',
    url: '/home',
    icon: <HouseIcon />,
    isActive: true,
    items: [],
  },
  {
    title: 'Mis Cursos',
    url: '/courses',
    icon: <NotebookPen />,
    items: [],
  },
  {
    title: 'Ruta de Aprendizaje',
    url: '/learningroute',
    icon: <Route />,
    items: [],
  },
  {
    title: 'Notificaciones',
    url: '/notifications',
    icon: <Bell />,
    items: [],
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const user = useAuthStore((state) => state.user)
  const setProfile = useAuthStore((state) => state.setProfile)

  useEffect(() => {
    const refreshUser = async () => {
      try {
        const updatedUser = await fetchCurrentUser()
        setProfile(updatedUser)
      } catch (error) {
        console.error('Failed to refresh user data:', error)
      }
    }
    refreshUser()
  }, [])

  const navMain =
    user?.role === 'admin'
      ? [
          ...NAV_MAIN_BASE,
          {
            title: 'Panel de Administración',
            url: '/adminpanel',
            icon: <Box />,
            items: [],
          },
        ]
      : NAV_MAIN_BASE

  const userData = user
    ? {
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        avatar: user.profilePictureUrl ?? '',
      }
    : null
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" variant="noAction" asChild>
              <div>
                <div className="flex aspect-square size-12 items-center justify-center">
                  <img src={logo} />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">Taller de Vida</span>
                  <span className="truncate text-xs">Efi Campus</span>
                </div>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        {/* <NavProjects projects={data.projects} /> */}
        {/* <NavSecondary items={data.secondary} className="mt-auto" /> */}
      </SidebarContent>
      <SidebarFooter>{userData && <NavUser user={userData} />}</SidebarFooter>
    </Sidebar>
  )
}
