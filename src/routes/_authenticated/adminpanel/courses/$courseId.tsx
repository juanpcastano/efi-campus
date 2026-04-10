import { useEffect, useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '#/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { Plus, Pencil, Trash2, Eye, EyeOff } from 'lucide-react'
import {
  fetchGroups,
  createGroup,
  updateGroup,
  toggleGroupOpen,
  deleteGroup,
  addDictation,
  deleteDictation,
  fetchGroup,
} from '#/lib/groupService'
import { fetchUsers } from '#/lib/userService'
import type { Group, Professor } from '#/lib/groupService'
import type { User } from '#/lib/userService'
import { useBreadcrumbStore } from '#/store/breadcrumbStore'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'

function getTerms() {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const actualTermNum = month <= 6 ? 1 : 2
  const actual = `${year}-${actualTermNum}`

  let next
  if (actualTermNum === 1) {
    next = `${year}-2`
  } else {
    next = `${year + 1}-1`
  }

  return { actual, next }
}

const columnHelper = createColumnHelper<Group>()

export const Route = createFileRoute(
  '/_authenticated/adminpanel/courses/$courseId',
)({
  component: GroupsComponent,
})

function GroupsComponent() {
  const { courseId } = Route.useParams()

  const [groups, setGroups] = useState<Group[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingGroup, setEditingGroup] = useState<Group | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [selectedProfessor, setSelectedProfessor] = useState<string>('')
  const [formData, setFormData] = useState({
    schedule: '',
    day_of_week: 'monday',
    term: '',
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [groupToDelete, setGroupToDelete] = useState<string | null>(null)

  const loadGroups = async () => {
    setIsLoading(true)
    try {
      const allGroups = await fetchGroups()
      const filtered = allGroups.filter((g) => g.course_id === courseId)
      setGroups(filtered)
    } catch (error) {
      console.error('Failed to load groups:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = async () => {
    try {
      const allUsers = await fetchUsers()
      // console.log('All users:', allUsers)
      setUsers(allUsers) // Quitamos el filtro por 'admin' temporalmente para ver si aparecen todos
    } catch (error) {
      console.error('Failed to load users:', error)
    }
  }

  useEffect(() => {
    useBreadcrumbStore.getState().setPage(courseId)
    useBreadcrumbStore
      .getState()
      .setPath([
        { displayName: 'Panel de Administración', link: '/adminpanel' },
      ])
    loadGroups()
    loadUsers()
  }, [courseId])

  const handleAddProfessor = async () => {
    if (!editingGroup || !selectedProfessor) return
    try {
      await addDictation(editingGroup.id, selectedProfessor)
      const updatedGroup = await fetchGroup(editingGroup.id)
      setEditingGroup(updatedGroup)
      setSelectedProfessor('')
      await loadGroups()
    } catch (error) {
      console.error('Failed to add professor:', error)
    }
  }

  const handleDeleteProfessor = async (dictationId: string) => {
    if (!editingGroup) return
    try {
      await deleteDictation(editingGroup.id, dictationId)
      const updatedGroup = await fetchGroup(editingGroup.id)
      setEditingGroup(updatedGroup)
      await loadGroups()
    } catch (error) {
      console.error('Failed to delete professor:', error)
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (isAdding) {
        await createGroup({
          ...formData,
          course_id: courseId,
        })
      } else if (editingGroup) {
        await updateGroup(editingGroup.id, {
          schedule: formData.schedule,
          day_of_week: formData.day_of_week,
          term: formData.term,
        })
      }
      await loadGroups()
      setIsAdding(false)
      setEditingGroup(null)
      setFormData({ schedule: '', day_of_week: 'monday', term: '' })
    } catch (error) {
      console.error('Failed to save group:', error)
    }
  }

  const handleToggleOpen = async (id: string) => {
    try {
      await toggleGroupOpen(id)
      await loadGroups()
    } catch (error) {
      console.error('Failed to toggle group open state:', error)
    }
  }

  const handleDelete = async () => {
    if (!groupToDelete) return
    try {
      await deleteGroup(groupToDelete)
      await loadGroups()
      setDeleteDialogOpen(false)
      setGroupToDelete(null)
    } catch (error) {
      console.error('Failed to delete group:', error)
    }
  }

  const startEdit = (group: Group) => {
    setEditingGroup(group)
    setFormData({
      schedule: group.schedule,
      day_of_week: group.day_of_week,
      term: group.term,
    })
    setIsAdding(false)
  }

  const startAdd = () => {
    setIsAdding(true)
    setEditingGroup(null)
    setFormData({ schedule: '', day_of_week: 'monday', term: '' })
  }

  const days = [
    { value: 'monday', label: 'Lunes' },
    { value: 'tuesday', label: 'Martes' },
    { value: 'wednesday', label: 'Miércoles' },
    { value: 'thursday', label: 'Jueves' },
    { value: 'friday', label: 'Viernes' },
    { value: 'saturday', label: 'Sábado' },
    { value: 'sunday', label: 'Domingo' },
  ]

  const columns = [
    columnHelper.accessor('day_of_week', {
      header: 'Día',
      cell: (info) => {
        const day = days.find((d) => d.value === info.getValue())
        return day?.label || info.getValue()
      },
    }),
    columnHelper.accessor('schedule', {
      header: 'Horario',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('professors', {
      header: 'Profesores',
      cell: (info) =>
        info
          .getValue()
          .map((p) => `${p.firstName} ${p.lastName}`)
          .join(', ') || 'Sin asignar',
    }),
    columnHelper.accessor('term', {
      header: 'Término',
      cell: (info) => info.getValue(),
    }),
    columnHelper.accessor('open', {
      header: 'Estado',
      cell: (info) => (
        <Button
          variant={info.getValue() ? 'default' : 'outline'}
          size="sm"
          onClick={() => handleToggleOpen(info.row.original.id)}
          className="w-24"
        >
          {info.getValue() ? (
            <>
              <Eye className="h-3 w-3 mr-1" /> Abierto
            </>
          ) : (
            <>
              <EyeOff className="h-3 w-3 mr-1" /> Cerrado
            </>
          )}
        </Button>
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
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              setGroupToDelete(info.row.original.id)
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
    data: groups,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Grupos del Curso</h1>
        <Button onClick={startAdd}>
          <Plus className="h-4 w-4 mr-2" /> Crear Grupo
        </Button>
      </div>

      {(isAdding || editingGroup) && (
        <Card>
          <CardHeader>
            <CardTitle>{isAdding ? 'Crear Grupo' : 'Editar Grupo'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="day_of_week">Día de la Semana</Label>
                  <Select
                    value={formData.day_of_week}
                    onValueChange={(v) =>
                      setFormData({ ...formData, day_of_week: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Días</SelectLabel>
                        {days.map((d) => (
                          <SelectItem key={d.value} value={d.value}>
                            {d.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schedule">Hora</Label>
                  <Input
                    type="time"
                    id="schedule"
                    value={formData.schedule}
                    onChange={(e) =>
                      setFormData({ ...formData, schedule: e.target.value })
                    }
                    className="appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="term">Semestre</Label>
                  <Select
                    value={
                      formData.term === getTerms().actual
                        ? 'actual'
                        : formData.term === getTerms().next
                          ? 'next'
                          : undefined
                    }
                    onValueChange={(value) => {
                      const { actual, next } = getTerms()
                      const termValue = value === 'actual' ? actual : next
                      setFormData({ ...formData, term: termValue })
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccione semestre" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Semestres</SelectLabel>
                        <SelectItem value="actual">
                          Actual ({getTerms().actual})
                        </SelectItem>
                        <SelectItem value="next">
                          Próximo ({getTerms().next})
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {editingGroup && (
                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-semibold">Profesores Asignados</h3>
                  <div className="flex flex-wrap gap-2">
                    {editingGroup.professors.map((p) => (
                      <Card
                        key={p.id}
                        className="flex items-center gap-2 bg-secondary p-2 rounded"
                      >
                        <span>
                          {p.firstName} {p.lastName}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProfessor(p.dictationId!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </Card>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="professor_select">Asignar Profesor</Label>
                      <Select
                        value={selectedProfessor}
                        onValueChange={setSelectedProfessor}
                      >
                        <SelectTrigger id="professor_select">
                          <SelectValue placeholder="Seleccionar profesor" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Usuarios</SelectLabel>
                            {users
                              .filter(
                                (u) =>
                                  !editingGroup.professors.find(
                                    (p) => p.id === u.id,
                                  ),
                              )
                              .map((u) => (
                                <SelectItem key={u.id} value={u.id}>
                                  {u.first_name} {u.last_name}
                                </SelectItem>
                              ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button
                        type="button"
                        onClick={handleAddProfessor}
                        disabled={!selectedProfessor}
                      >
                        Agregar
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setIsAdding(false)
                    setEditingGroup(null)
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
                  Cargando grupos...
                </TableCell>
              </TableRow>
            ) : groups.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="text-center py-4"
                >
                  No hay grupos creados para este curso.
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
            <DialogTitle>Eliminar grupo</DialogTitle>
            <DialogDescription>
              ¿Estás seguro de que deseas eliminar este grupo? Esta acción no se
              puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteDialogOpen(false)
                setGroupToDelete(null)
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
