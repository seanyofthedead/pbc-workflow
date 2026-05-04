import { Amplify } from 'aws-amplify'

const userPoolId = import.meta.env.VITE_COGNITO_USER_POOL_ID
const userPoolClientId = import.meta.env.VITE_COGNITO_USER_POOL_CLIENT_ID
const domain = import.meta.env.VITE_COGNITO_DOMAIN
const redirectSignIn = import.meta.env.VITE_REDIRECT_SIGN_IN
const redirectSignOut = import.meta.env.VITE_REDIRECT_SIGN_OUT

if (!userPoolId || !userPoolClientId || !domain || !redirectSignIn || !redirectSignOut) {
  throw new Error('Missing Cognito env vars. Check VITE_COGNITO_* are set at build time.')
}

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId,
      userPoolClientId,
      loginWith: {
        oauth: {
          domain,
          scopes: ['openid', 'email', 'profile'],
          redirectSignIn: [redirectSignIn],
          redirectSignOut: [redirectSignOut],
          responseType: 'code',
        },
      },
    },
  },
})
