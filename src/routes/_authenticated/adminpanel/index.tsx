import { Link, createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Label } from '#/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import { Plus, Pencil, Trash2 } from 'lucide-react'
import {
  fetchCourses,
  createCourse,
  updateCourse,
  deleteCourse,
} from '#/lib/courseService'
import type { Course } from '#/lib/courseService'
import { Textarea } from '#/components/ui/textarea'
import { useBreadcrumbStore } from '#/store/breadcrumbStore'

const columnHelper = createColumnHelper<Course>()

export const Route = createFileRoute('/_authenticated/adminpanel/')({
  component: CourseListComponent,
})

function CourseListComponent() {
  const [courses, setCourses] = useState<Course[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null)

  const loadCourses = async () => {
    setIsLoading(true)
    try {
      const data = await fetchCourses()
      setCourses(data)
    } catch (error) {
      console.error('Failed to load courses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    useBreadcrumbStore.getState().setPage('Panel de Administración')
    useBreadcrumbStore.getState().setPath([])
    loadCourses()
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isAdding) {
        await createCourse(formData)
      } else if (editingCourse) {
        await updateCourse(editingCourse.id, formData)
      }
      await loadCourses()
      setIsAdding(false)
      setEditingCourse(null)
      setFormData({ name: '', description: '' })
    } catch (error) {
      console.error('Failed to save course:', error)
    }
  }

  const handleDelete = async () => {
    if (!courseToDelete) return
    try {
      await deleteCourse(courseToDelete)
      await loadCourses()
      setDeleteDialogOpen(false)
      setCourseToDelete(null)
    } catch (error) {
      console.error('Failed to delete course:', error)
    }
  }

  const startEdit = (course: Course) => {
    setEditingCourse(course)
    setFormData({ name: course.name, description: course.description })
    setIsAdding(false)
  }

  const startAdd = () => {
    setIsAdding(true)
    setEditingCourse(null)
    setFormData({ name: '', description: '' })
  }

  const columns = [
    columnHelper.accessor('name', {
      header: 'Nombre',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('description', {
      header: 'Descripción',
      cell: (info) => (
        <div className="max-w-50 whitespace-normal wrap-break-words">
          {info.getValue()}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: 'Acciones',
      cell: (info) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => startEdit(info.row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Link
            to="/adminpanel/courses/$courseId"
            params={{ courseId: info.row.original.id }}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-9 px-3 py-2"
          >
            Grupos
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setCourseToDelete(info.row.original.id)
              setDeleteDialogOpen(true)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data: courses,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Administración de Cursos</h1>
        <Button onClick={startAdd}>
          <Plus className="h-4 w-4 mr-2" /> Agregar Curso
        </Button>
      </div>

      {(isAdding || editingCourse) && (
        <Card>
          <CardHeader>
            <CardTitle>{isAdding ? 'Agregar Curso' : 'Editar Curso'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  required
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setIsAdding(false)
                    setEditingCourse(null)
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit">Guardar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-4"
                >
                  Cargando cursos...
                </TableCell>
              </TableRow>
            ) : courses.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-4"
                >
                  No hay cursos disponibles.
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Eliminar curso</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este curso? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setCourseToDelete(null)
              }}
            >
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
