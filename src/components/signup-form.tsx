import { cn } from '#/lib/utils'
import { Button } from '#/components/ui/button'
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
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
import { useState } from 'react'
import {
  getExampleNumber,
  isValidPhoneNumber,
  AsYouType,
  type CountryCode,
  getCountries,
  getCountryCallingCode,
} from 'libphonenumber-js'
import examples from 'libphonenumber-js/mobile/examples'
import { confirmSignUp, initiateLogin, signUp, verifyOtp } from '#/lib/cognito'
import { useAuthStore } from '#/store/authStore'
import { GoogleSignInButton } from './google-signin-button'

function getMaxLength(countryCode: CountryCode): number {
  const example = getExampleNumber(countryCode, examples)
  return example?.formatNational().length ?? 15
}

const countryNames = new Intl.DisplayNames(['es'], { type: 'region' })

const COUNTRIES = getCountries()
  .map((code) => ({
    code,
    label: countryNames.of(code) ?? code,
    prefix: `+${getCountryCallingCode(code)}`,
  }))
  .sort((a, b) => a.label.localeCompare(b.label, 'es'))

function getPlaceholder(countryCode: CountryCode): string {
  const example = getExampleNumber(countryCode, examples)
  return example?.formatNational() ?? ''
}

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)

  const [step, setStep] = useState<'form' | 'otp'>('form')
  const [countryCode, setCountryCode] = useState<CountryCode>('CO')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [phoneError, setPhoneError] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [session, setSession2] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedCountry = COUNTRIES.find((c) => c.code === countryCode)!

  function handleCountryChange(value: string) {
    const country = COUNTRIES.find((c) => c.code === value)
    if (country) {
      setCountryCode(country.code)
      setPhoneNumber('')
      setPhoneError(false)
    }
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = new AsYouType(countryCode).input(e.target.value)
    setPhoneNumber(formatted)
    setPhoneError(false)
  }

  function handlePhoneBlur() {
    if (!phoneNumber) return
    const fullNumber = selectedCountry.prefix + phoneNumber.replace(/\s/g, '')
    setPhoneError(!isValidPhoneNumber(fullNumber))
  }

  async function handleSignUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (phoneError) return

    const fullPhoneNumber = `${selectedCountry.prefix}${phoneNumber.replace(/\s/g, '')}`

    setIsLoading(true)
    setError(null)

    try {
      await signUp({ email, firstName, lastName, phoneNumber: fullPhoneNumber })
      setStep('otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la cuenta')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      // 1. Verificar el email con el código
      await confirmSignUp(email, otp)

      // 2. Iniciar login para obtener la session
      const loginSession = await initiateLogin(email)
      setSession2(loginSession)

      // 3. Verificar OTP de login (Cognito manda uno nuevo)
      const tokens = await verifyOtp(email, otp, loginSession)

      // 4. Guardar sesión y redirigir
      setSession(tokens)
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
              <span className="font-medium text-foreground">{email}</span>
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
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              className="bg-background"
            />
          </Field>
          <Field>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Verificando...' : 'Verificar'}
            </Button>
          </Field>
          <FieldDescription className="text-center">
            ¿No recibiste el código?{' '}
            <button
              type="button"
              className="underline underline-offset-4"
              onClick={() => handleSignUp({ preventDefault: () => {} } as any)}
            >
              Reenviar
            </button>
            <br />
            <Link to="/login">Regresar al login</Link>
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
          <FieldLabel htmlFor="name">Nombre(s)</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="Jhon"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="bg-background"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="lastname">Apellido(s)</FieldLabel>
          <Input
            id="lastname"
            type="text"
            placeholder="Doe"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="bg-background"
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="number">Número Celular</FieldLabel>
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
              id="number"
              type="tel"
              placeholder={getPlaceholder(countryCode)}
              value={phoneNumber}
              onChange={handlePhoneChange}
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
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        <FieldSeparator>O continúa con tu cuenta de Google</FieldSeparator>
        <Field>
          <GoogleSignInButton />
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
