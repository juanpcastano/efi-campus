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
import { useState } from 'react'
import { initiateLogin, verifyOtp } from '#/lib/cognito'
import { useAuthStore } from '#/store/authStore'
import { fetchCurrentUser } from '#/lib/userService'

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'form'>) {
  const navigate = useNavigate()
  const setSession = useAuthStore((state) => state.setSession)
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [session, setSession2] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleRequestOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const cognitoSession = await initiateLogin(email)
      setSession2(cognitoSession)
      setStep('otp')
    } catch (err: any) {
      if (
        err.message?.includes('SilentValidationFail') ||
        err.name === 'UserNotFoundException'
      ) {
        setStep('otp')
      } else {
        setError('Ocurrió un error inesperado. Intenta más tarde.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  async function handleVerifyOtp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!session) return
    setIsLoading(true)
    setError(null)

    try {
      const tokens = await verifyOtp(email, otp, session)
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
            <h1 className="text-2xl font-bold">Revisa tu email</h1>
            <p className="text-sm text-balance text-muted-foreground">
              Ingresa el código que enviamos a{' '}
              <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>
          {error && (
            <p className="text-sm text-destructive text-center">{error}</p>
          )}
          <Field>
            <FieldLabel htmlFor="otp">Código de autenticación</FieldLabel>
            <Input
              id="otp"
              type="text"
              placeholder="123456"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              autoComplete="one-time-code"
              className="bg-background"
            />
            <FieldDescription className="text-center">
              Si este correo no está registrado o no fue verificado cuando se
              registró, el código nunca llegará,{' '}
              <Link className="underline underline-offset-4" to="/signup">
                haz click aquí para registrarte
              </Link>
            </FieldDescription>
          </Field>
          <Field>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Verificando...' : 'Ingresar'}
            </Button>
          </Field>
          <FieldDescription className="text-center mt-0">
            <button
              type="button"
              className="underline underline-offset-4 hover:text-primary hover:cursor-pointer"
              onClick={() => {
                setStep('email')
                setOtp('')
                setError(null)
              }}
            >
              Cambiar email
            </button>
          </FieldDescription>
        </FieldGroup>
      </form>
    )
  }
  return (
    <form
      className={cn('flex flex-col gap-6', className)}
      onSubmit={handleRequestOtp}
      {...props}
    >
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Bienvenido a Efi Campus</h1>

          <p className="text-sm text-balance text-muted-foreground">
            Ingresa usando tu email
          </p>
        </div>
        {error && (
          <p className="text-sm text-destructive text-center">{error}</p>
        )}
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
        </Field>
        <Field>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Enviando código...' : 'Ingresar'}
          </Button>
        </Field>
        {/*<FieldSeparator>O ingresa con tu cuenta de Google</FieldSeparator>
          <GoogleSignInButton />*/}
        <Field>
          <FieldDescription className="text-center">
            ¿Aún no tienes una cuenta?{' '}
            <Link to="/signup" className="underline underline-offset-4">
              Registrarse
            </Link>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
