import { useBreadcrumbStore } from '#/store/breadcrumbStore'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { fetchMyInscriptions } from '#/lib/groupService'
import type { Group } from '#/lib/groupService'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Loader2, BookOpen } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/courses')({
  component: RouteComponent,
})

function RouteComponent() {
  const [enrolledGroups, setEnrolledGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadInscriptions = async () => {
    setIsLoading(true)
    try {
      const groups = await fetchMyInscriptions()
      setEnrolledGroups(groups)
    } catch (error) {
      console.error('Failed to load inscriptions:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    useBreadcrumbStore.getState().setPage('Mis Cursos')
    useBreadcrumbStore.getState().setPath([])
    loadInscriptions()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Mis Cursos</h1>
        <p className="text-muted-foreground">
          Aquí puedes ver los cursos y grupos en los que estás matriculado.
        </p>
      </div>

      {enrolledGroups.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              Aún no estás matriculado en ningún curso.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {enrolledGroups.map((group) => (
            <Card key={group.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>
                  {group.course?.name || 'Curso sin nombre'}
                </CardTitle>
                <div className="text-sm text-muted-foreground">
                  <span className="capitalize">{group.day_of_week}</span>
                  <span className="mx-2">•</span>
                  <span>{group.schedule}</span>
                </div>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button asChild className="w-full">
                  <Link to="/groups/$groupId" params={{ groupId: group.id }}>
                    <BookOpen className="h-4 w-4 mr-2" /> Ir al Grupo
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
