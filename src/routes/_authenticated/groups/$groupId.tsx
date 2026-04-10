import { useBreadcrumbStore } from '#/store/breadcrumbStore'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { fetchGroup, fetchGroupInscriptions } from '#/lib/groupService'
import type { Group, Inscription } from '#/lib/groupService'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '#/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Loader2, Calendar, Clock, User } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/groups/$groupId')({
  component: GroupDetailComponent,
})

function GroupDetailComponent() {
  const { groupId } = Route.useParams()
  const [group, setGroup] = useState<Group | null>(null)
  const [inscriptions, setInscriptions] = useState<Inscription[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [groupData, inscriptionsData] = await Promise.all([
        fetchGroup(groupId),
        fetchGroupInscriptions(groupId),
      ])
      setGroup(groupData)
      setInscriptions(inscriptionsData)
    } catch (error) {
      console.error('Failed to load group details:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    useBreadcrumbStore.getState().setPage('Detalle del Grupo')
    useBreadcrumbStore
      .getState()
      .setPath([{ displayName: 'Mis Cursos', link: '/courses' }])
    loadData()
  }, [groupId])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!group) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Grupo no encontrado.</p>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          {group.course?.name || 'Curso sin nombre'}
        </h1>
        <p className="text-lg text-muted-foreground">
          {group.course?.description}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Información del Grupo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">
                  Día de la semana
                </p>
                <p className="font-medium capitalize">{group.day_of_week}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Hora</p>
                <p className="font-medium">{group.schedule}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Profesor</p>
                <p className="font-medium">
                  {group.professors.length > 0
                    ? group.professors
                        .map((p) => `${p.firstName} ${p.lastName}`)
                        .join(', ')
                    : 'Sin profesor asignado'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Estudiantes</CardTitle>
            <CardDescription>
              {group.open
                ? 'La lista de estudiantes estará disponible una vez que el grupo se cierre.'
                : 'Lista de alumnos matriculados en este grupo.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!group.open ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {inscriptions.map((ins) => (
                  <div
                    key={ins.id}
                    className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                  >
                    <Avatar>
                      <AvatarImage src={ins.user.profilePictureUrl || ''} />
                      <AvatarFallback>
                        {ins.user.firstName[0]}
                        {ins.user.lastName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-sm">
                      <p className="font-medium">
                        {ins.user.firstName} {ins.user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Inscrito el{' '}
                        {new Date(ins.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
                {inscriptions.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center col-span-full py-4">
                    No hay estudiantes inscritos.
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground">
                  Este grupo aún está abierto para inscripciones.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
