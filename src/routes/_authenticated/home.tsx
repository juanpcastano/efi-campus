import { useBreadcrumbStore } from '#/store/breadcrumbStore'
import { useAuthStore } from '#/store/authStore'
import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

const MOCK_DATA = {
  events: [
    {
      id: 1,
      title: 'Cierre de inscripciones',
      date: '2026-04-15',
      time: '18:00',
    },
    {
      id: 2,
      title: 'Inicio de Clases',
      date: '2026-04-20',
      time: '19:00',
    },
  ],
  notifications: [
    { id: 1, message: 'Tu tarea fue calificada', date: 'Hace 2 horas' },
  ],
}

export const Route = createFileRoute('/_authenticated/home')({
  component: RouteComponent,
})

function RouteComponent() {
  const user = useAuthStore((state) => state.user)
  useBreadcrumbStore((store) => store.setPage)('Inicio')
  useBreadcrumbStore((store) => store.setPath)([])

  return (
    <div className="p-6 space-y-6">
      <h1 className="font-bold text-3xl md:text-5xl">
        Bienvenido a Efi Campus {user?.firstName}!
      </h1>
      <Card>
        <CardContent className="text-center py-4">
          <p className="text-muted-foreground">
            Esta es una versión preliminar de la aplicación. En caso de ver
            algún error, por favor infórmalo al correo{' '}
            <a
              href="mailto:jpc4stano@gmail.com"
              className="text-primary underline"
            >
              jpc4stano@gmail.com
            </a>
          </p>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Próximos Eventos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCK_DATA.events.map((event) => (
              <div
                key={event.id}
                className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0"
              >
                <span>{event.title}</span>
                <span className="text-muted-foreground text-xs">
                  {event.date} - {event.time}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCK_DATA.notifications.map((notification) => (
              <div
                key={notification.id}
                className="flex justify-between items-center border-b pb-2 last:border-0 last:pb-0"
              >
                <span>{notification.message}</span>
                <span className="text-muted-foreground text-xs">
                  {notification.date}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
