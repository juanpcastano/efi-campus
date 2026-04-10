import { useState } from 'react'
import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from '#/components/ui/field'
import { Input } from '#/components/ui/input'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './ui/select'
import { confirmSignUp, loginWithPassword, signUp } from '#/lib/cognito'
import { useAuthStore } from '#/store/authStore'
import { fetchCurrentUser } from '#/lib/userService'
import {
  COUNTRIES,
  usePhonePrefix,
  getMaxLength,
  getPlaceholder,
  validatePhoneNumber,
} from '#/hooks/use-phone-prefix'

interface FormData {
  firstName: string
  lastName: string
  email: string
  otp: string
}

interface SignupFormProps extends React.ComponentProps<'form'> {
  className?: string
}

export function SignupForm({ className, ...props }: SignupFormProps) {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)

  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    otp: '',
  })
  const [tempPassword, setTempPassword] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    countryCode,
    phoneNumber,
    selectedCountry,
    handleCountryChange,
    handlePhoneChange,
    getFullPhoneNumber,
  } = usePhonePrefix()

  function handleInputChange(field: keyof FormData) {
    return (e: React.ChangeEvent<HTMLInputElement> | string) => {
      const value = typeof e === 'string' ? e : e.target.value
      setFormData((prev) => ({ ...prev, [field]: value }))
    }
  }

  function handlePhoneBlur() {
    const isValid = validatePhoneNumber(phoneNumber, countryCode)
    setPhoneError(!isValid)
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (phoneError) return

    const fullPhoneNumber = getFullPhoneNumber()

    setIsLoading(true)
    setError(null)

    try {
      const generatedPassword = await signUp({
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phoneNumber: fullPhoneNumber,
      })

      setTempPassword(generatedPassword)
      setStep('otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta')
    } finally {
      setIsLoading(false)
    }
  }
  async function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!tempPassword) return

    setIsLoading(true)
    setError(null)

    try {
      // 1. Confirmar el código OTP
      await confirmSignUp(formData.email, formData.otp)

      // 2. Autologin usando la contraseña generada
      const tokens = await loginWithPassword(formData.email, tempPassword)
      setSession(tokens)
      const userProfile = await fetchCurrentUser()
      useAuthStore.getState().setProfile(userProfile)
      navigate({ to: '/' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Código inválido')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'otp') {
    return (
      <form
        className={cn('flex flex-col gap-6', className)}
        onSubmit={handleVerifyOtp}
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Verifica tu email</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Ingresa el código que enviamos a{' '}
              <span className="font-medium text-foreground">
                {formData.email}
              </span>
            </p>
          </div>
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          <Field>
            <FieldLabel htmlFor="otp">Código de verificación</FieldLabel>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              value={formData.otp}
              onChange={handleInputChange('otp')}
              required
              className="bg-background"
            />
          </Field>
          <Field>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Verificando...' : 'Verificar'}
            </Button>
          </Field>
          <FieldDescription className="flex flex-col items-center gap-3 text-center mt-2">
            <button
              type="button"
              className="underline underline-offset-4 hover:text-primary hover:cursor-pointer"
              onClick={() => {
                setStep('form')
                setFormData((prev) => ({ ...prev, otp: '' }))
                setError(null)
              }}
            >
              Corregir mis datos
            </button>
            <Link
              to="/login"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Regresar al login
            </Link>
          </FieldDescription>
        </FieldGroup>
      </form>
    )
  }

  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleSignUp}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Regístrate en Efi Campus</h1>
          <p className="text-sm text-balance text-muted-foreground">
            Completa los campos correspondientes
          </p>
        </div>
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
        <Field>
          <FieldLabel htmlFor="firstName">Nombre(s)</FieldLabel>
          <Input
            id="firstName"
            type="text"
            placeholder="Jhon"
            required
            value={formData.firstName}
            onChange={handleInputChange('firstName')}
            className="bg-background"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="lastName">Apellido(s)</FieldLabel>
          <Input
            id="lastName"
            type="text"
            placeholder="Doe"
            required
            value={formData.lastName}
            onChange={handleInputChange('lastName')}
            className="bg-background"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="phoneNumber">Número Celular</FieldLabel>
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
              required
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
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="alianza@tdv.com"
            required
            value={formData.email}
            onChange={handleInputChange('email')}
            className="bg-background"
          />
          <FieldDescription>
            Se usará únicamente para la verificación de identidad y para
            contactarte, en ningún momento compartiremos esta información con
            terceros
          </FieldDescription>
        </Field>
        <Field>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </Button>
        </Field>
        {/* <FieldSeparator>O continúa con tu cuenta de Google</FieldSeparator>
          <GoogleSignInButton />*/}
        <Field>
          <FieldDescription className="px-6 text-center">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="underline underline-offset-4">
              Iniciar Sesión
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
