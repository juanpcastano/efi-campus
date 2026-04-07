import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  InitiateAuthCommand,
  ChallengeNameType,
  RespondToAuthChallengeCommand,
  GlobalSignOutCommand,
  AuthFlowType,
  ConfirmSignUpCommand,
  ResendConfirmationCodeCommand,
} from '@aws-sdk/client-cognito-identity-provider'

const client = new CognitoIdentityProviderClient({ region: 'us-east-2' })

const CLIENT_ID = '2tlllc6ia4ncv5srnu22fa7qk3'

export interface AuthTokens {
  accessToken: string
  idToken: string
  refreshToken: string
}

export interface SignUpParams {
  email: string
  firstName: string
  lastName: string
  phoneNumber: string
}

export async function signUp({
  email,
  firstName,
  lastName,
  phoneNumber,
}: SignUpParams): Promise<string> {
  const tempPassword = `Tmp-${crypto.randomUUID()}-A1!`

  await client.send(
    new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      Password: tempPassword,
      UserAttributes: [
        { Name: 'email', Value: email },
        { Name: 'given_name', Value: firstName },
        { Name: 'family_name', Value: lastName },
        { Name: 'phone_number', Value: phoneNumber },
      ],
    }),
  )

  return tempPassword
}

export async function confirmSignUp(
  email: string,
  code: string,
): Promise<void> {
  await client.send(
    new ConfirmSignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: code,
    }),
  )
}

// 2. Nueva función para reenviar el código de registro
export async function resendSignUpCode(email: string): Promise<void> {
  await client.send(
    new ResendConfirmationCodeCommand({
      ClientId: CLIENT_ID,
      Username: email,
    }),
  )
}

// 3. Nueva función para login directo con contraseña (Auto-login post registro)
export async function loginWithPassword(
  email: string,
  password: string,
): Promise<AuthTokens> {
  const response = await client.send(
    new InitiateAuthCommand({
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH, // Asegúrate de tener ALLOW_USER_PASSWORD_AUTH habilitado en tu App Client
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    }),
  )

  const result = response.AuthenticationResult
  if (!result?.AccessToken || !result?.IdToken || !result?.RefreshToken) {
    throw new Error('Tokens incompletos en la respuesta de Cognito')
  }

  return {
    accessToken: result.AccessToken,
    idToken: result.IdToken,
    refreshToken: result.RefreshToken,
  }
}
export async function initiateLogin(email: string): Promise<string> {
  const response = await client.send(
    new InitiateAuthCommand({
      AuthFlow: AuthFlowType.USER_AUTH,
      ClientId: CLIENT_ID,
      AuthParameters: {
        USERNAME: email,
        PREFERRED_CHALLENGE: 'EMAIL_OTP',
      },
    }),
  )

  if (!response.Session) {
    throw new Error('No se recibió sesión de Cognito')
  }

  return response.Session
}

export async function verifyOtp(
  email: string,
  otp: string,
  session: string,
): Promise<AuthTokens> {
  const response = await client.send(
    new RespondToAuthChallengeCommand({
      ClientId: CLIENT_ID,
      ChallengeName: ChallengeNameType.EMAIL_OTP,
      Session: session,
      ChallengeResponses: {
        USERNAME: email,
        EMAIL_OTP_CODE: otp,
      },
    }),
  )

  const result = response.AuthenticationResult

  if (!result?.AccessToken || !result?.IdToken || !result?.RefreshToken) {
    throw new Error('Tokens incompletos en la respuesta de Cognito')
  }

  return {
    accessToken: result.AccessToken,
    idToken: result.IdToken,
    refreshToken: result.RefreshToken,
  }
}

export async function refreshTokens(refreshToken: string): Promise<AuthTokens> {
  const response = await client.send(
    new InitiateAuthCommand({
      AuthFlow: AuthFlowType.REFRESH_TOKEN_AUTH,
      ClientId: CLIENT_ID,
      AuthParameters: {
        REFRESH_TOKEN: refreshToken,
      },
    }),
  )

  const result = response.AuthenticationResult

  if (!result?.AccessToken || !result?.IdToken) {
    throw new Error('No se pudieron refrescar los tokens')
  }

  return {
    accessToken: result.AccessToken,
    idToken: result.IdToken,
    refreshToken,
  }
}

export async function signOut(accessToken: string): Promise<void> {
  await client.send(new GlobalSignOutCommand({ AccessToken: accessToken }))
}
