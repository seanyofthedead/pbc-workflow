import { useEffect, useState, type ReactNode } from 'react'
import {
  signInWithRedirect,
  signOut,
  getCurrentUser,
  fetchUserAttributes,
} from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'

type AuthState =
  | { status: 'loading' }
  | { status: 'signedOut' }
  | { status: 'signedIn'; email: string }

export function AuthGate({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ status: 'loading' })

  useEffect(() => {
    let cancelled = false

    async function refresh() {
      try {
        await getCurrentUser()
        const attrs = await fetchUserAttributes()
        if (!cancelled) {
          setAuth({ status: 'signedIn', email: attrs.email ?? '(no email)' })
        }
      } catch {
        if (!cancelled) setAuth({ status: 'signedOut' })
      }
    }

    refresh()
    const stop = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signedIn' || payload.event === 'signedOut') refresh()
    })

    return () => {
      cancelled = true
      stop()
    }
  }, [])

  if (auth.status === 'loading') {
    return (
      <div className="grid min-h-screen place-items-center text-slate-500">
        Loading…
      </div>
    )
  }

  if (auth.status === 'signedOut') {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50">
        <div className="max-w-sm rounded-2xl bg-white p-8 shadow">
          <h1 className="mb-2 text-2xl font-semibold">PBC Workflow</h1>
          <p className="mb-6 text-slate-600">Sign in to continue.</p>
          <button
            onClick={() => signInWithRedirect()}
            className="w-full rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800"
          >
            Sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      {children}
      <button
        onClick={() => signOut()}
        title={`Signed in as ${auth.email}`}
        className="fixed top-3 right-4 z-50 rounded-lg border border-slate-300 bg-white/90 px-3 py-1 text-sm text-slate-700 shadow-sm backdrop-blur hover:bg-slate-100"
      >
        Sign out
      </button>
    </>
  )
}
