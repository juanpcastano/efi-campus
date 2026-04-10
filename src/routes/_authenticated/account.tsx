import { useAuthStore } from '#/store/authStore'
import { useBreadcrumbStore } from '#/store/breadcrumbStore'
import { createFileRoute } from '@tanstack/react-router'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/ui/avatar'
import { Button } from '#/components/ui/button'
import { Input } from '#/components/ui/input'
import { Field, FieldGroup, FieldLabel } from '#/components/ui/field'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '#/components/ui/select'
import { useState, useMemo, useEffect } from 'react'
import {
  COUNTRIES,
  usePhonePrefix,
  getMaxLength,
  getPlaceholder,
  validatePhoneNumber,
} from '#/hooks/use-phone-prefix'
import { cn } from '#/lib/utils'
import { parsePhoneNumber } from 'libphonenumber-js'
import { updateCurrentUser } from '#/lib/userService'

export const Route = createFileRoute('/_authenticated/account')({
  component: RouteComponent,
})

function RouteComponent() {
  useBreadcrumbStore((store) => store.setPage)('Mi Cuenta')
  useBreadcrumbStore((store) => store.setPath)([])

  const user = useAuthStore((state) => state.user)
  const setProfile = useAuthStore((state) => state.setProfile)

  const [firstName, setFirstName] = useState(user?.firstName || '')
  const [lastName, setLastName] = useState(user?.lastName || '')
  const [success, setSuccess] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [phoneError, setPhoneError] = useState(false)

  // Parse existing phone to pre-fill the form
  const initialParsedPhone = useMemo(() => {
    if (!user?.phoneNumber) return { country: 'CO', national: '' }
    try {
      const phoneNumber = parsePhoneNumber(user.phoneNumber)
      return {
        country: phoneNumber.country || 'CO',
        national: phoneNumber.nationalNumber,
      }
    } catch {
      return { country: 'CO', national: '' }
    }
  }, [user?.phoneNumber])

  const {
    countryCode,
    phoneNumber,
    selectedCountry,
    handleCountryChange,
    handlePhoneChange,
    getFullPhoneNumber,
  } = usePhonePrefix(initialParsedPhone.country as any)

  // Set the initial number once on load
  useEffect(() => {
    if (initialParsedPhone.national) {
      handlePhoneChange(initialParsedPhone.national)
    }
  }, [initialParsedPhone.national, handlePhoneChange])

  if (!user) {
    return <div>No usuario</div>
  }

  function handlePhoneBlur() {
    const isValid = validatePhoneNumber(phoneNumber, countryCode)
    setPhoneError(!isValid)
  }

  const handleUpdate = async () => {
    if (phoneError) return
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const fullPhoneNumber = getFullPhoneNumber()

      await updateCurrentUser({
        firstName,
        lastName,
        phoneNumber: fullPhoneNumber,
      })

      setProfile({
        firstName,
        lastName,
        phoneNumber: fullPhoneNumber,
      })

      setSuccess('Perfil actualizado correctamente')
    } catch (err: any) {
      if (err.message.includes('409')) {
        setError('El número de teléfono ya ha sido registrado.')
      } else {
        setError('Error al actualizar el perfil.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full flex justify-center">
      <div className="space-y-6 w-full max-w-120">
        <div className="w-full flex justify-center">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={user.profilePictureUrl || undefined}
                alt={user.firstName}
              />
              <AvatarFallback className="text-3xl">
                {user.firstName[0]}
                {user.lastName[0]}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        <div className="grid gap-4">
          <FieldGroup>
            <Field>
              <FieldLabel>Nombre</FieldLabel>
              <Input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="bg-background"
              />
            </Field>
            <Field>
              <FieldLabel>Apellido</FieldLabel>
              <Input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="bg-background"
              />
            </Field>
            <Field>
              <FieldLabel>Email</FieldLabel>
              <Input value={user.email} disabled />
            </Field>
            <Field>
              <FieldLabel htmlFor="phoneNumber">Teléfono</FieldLabel>
              <div className="flex gap-2">
                <Select value={countryCode} onValueChange={handleCountryChange}>
                  <SelectTrigger className="w-fit bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Prefijo</SelectLabel>
                      {COUNTRIES.map((c) => (
                        <SelectItem key={c.code} value={c.code}>
                          {c.label} ({c.prefix})
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder={getPlaceholder(countryCode)}
                  value={phoneNumber}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  onBlur={handlePhoneBlur}
                  maxLength={getMaxLength(countryCode)}
                  className={cn(
                    'bg-background w-full',
                    phoneError &&
                      'border-destructive focus-visible:ring-destructive',
                  )}
                />
              </div>
              {phoneError && (
                <p className="text-sm text-destructive">
                  Número inválido para {selectedCountry.label}
                </p>
              )}
            </Field>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}
            <Button onClick={handleUpdate} disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar cambios'}
            </Button>
          </FieldGroup>
        </div>
      </div>
    </div>
  )
}
