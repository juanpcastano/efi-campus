import { useBreadcrumbStore } from '#/store/breadcrumbStore'
import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { fetchAvailableGroups, enrollInGroup } from '#/lib/groupService'
import type { Group } from '#/lib/groupService'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '#/components/ui/card'
import { Button } from '#/components/ui/button'
import { Loader2 } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/learningroute')({
  component: RouteComponent,
})

function RouteComponent() {
  const [availableGroups, setAvailableGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isEnrolling, setIsEnrolling] = useState<string | null>(null)

  const loadAvailableGroups = async () => {
    setIsLoading(true)
    try {
      const groups = await fetchAvailableGroups()
      setAvailableGroups(groups)
    } catch (error) {
      console.error('Failed to load available groups:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    useBreadcrumbStore.getState().setPage('Ruta de Aprendizaje')
    useBreadcrumbStore.getState().setPath([])
    loadAvailableGroups()
  }, [])

  const handleEnroll = async (groupId: string) => {
    setIsEnrolling(groupId)
    try {
      await enrollInGroup(groupId)
      await loadAvailableGroups()
    } catch (error) {
      console.error('Failed to enroll in group:', error)
    } finally {
      setIsEnrolling(null)
    }
  }

  const groupedCourses = availableGroups.reduce((acc, group) => {
    const course = group.course
    if (!course) return acc
    const existing = acc.get(course.id)
    if (existing) {
      existing.groups.push(group)
    } else {
      acc.set(course.id, {
        ...course,
        groups: [group],
      })
    }
    return acc
  }, new Map<string, { id: string; name: string; description: string; groups: Group[] }>())

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  const courses = Array.from(groupedCourses.values())

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Cursos Disponibles</h1>
        <p className="text-muted-foreground">
          Inscríbete en los grupos disponibles para comenzar tu aprendizaje.
        </p>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              No hay grupos disponibles para inscripción en este momento.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="flex flex-col">
              <CardHeader>
                <CardTitle>{course.name}</CardTitle>
                <CardDescription>{course.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 flex-1">
                <p className="text-sm font-medium text-muted-foreground">
                  Grupos Disponibles:
                </p>
                <div className="grid gap-2">
                  {course.groups.map((group) => (
                    <div
                      key={group.id}
                      className="flex gap-2 items-center justify-between p-3 rounded-lg border bg-muted/50"
                    >
                      <div className="text-sm">
                        <span className="font-medium capitalize">
                          {group.day_of_week}
                        </span>
                        <span className="mx-2">•</span>
                        <span>{group.schedule}</span>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleEnroll(group.id)}
                        disabled={isEnrolling !== null}
                      >
                        {isEnrolling === group.id ? (
                          <Loader2 className="h-3 w-3 animate-spin mr-1" />
                        ) : (
                          'Inscribirme'
                        )}
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
