'use client'

import * as React from 'react'

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
import { HouseIcon, NotebookPen, Route, Bell } from 'lucide-react'

const data = {
  user: {
    name: 'Juan Pablo Castaño',
    email: 'jpc4stano@gmail.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
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
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
        <NavMain items={data.navMain} />
        {/*<NavProjects projects={data.projects} />*/}
        {/*<NavSecondary items={data.navSecondary} className="mt-auto" />*/}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
