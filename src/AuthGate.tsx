import { useEffect, useRef, useState, type ReactNode } from 'react'
import {
  signInWithRedirect,
  signOut,
  fetchUserAttributes,
} from 'aws-amplify/auth'
import { Hub } from 'aws-amplify/utils'

type AuthState =
  | { status: 'loading' }
  | { status: 'redirecting' }
  | { status: 'error'; code: string; description: string }
  | { status: 'signedIn'; email: string }

function readOAuthErrorFromUrl(): { code: string; description: string } | null {
  const params = new URLSearchParams(window.location.search)
  const code = params.get('error')
  if (!code) return null
  return { code, description: params.get('error_description') ?? '' }
}

function isOAuthCallback(): boolean {
  const params = new URLSearchParams(window.location.search)
  return params.has('code') && params.has('state')
}

function cleanOAuthParamsFromUrl(): void {
  const params = new URLSearchParams(window.location.search)
  for (const k of ['code', 'state', 'error', 'error_description']) params.delete(k)
  const qs = params.toString()
  const cleaned =
    window.location.pathname + (qs ? `?${qs}` : '') + window.location.hash
  window.history.replaceState({}, '', cleaned)
}

export function AuthGate({ children }: { children: ReactNode }) {
  const [auth, setAuth] = useState<AuthState>({ status: 'loading' })
  const redirectingRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function checkUser() {
      try {
        const attrs = await fetchUserAttributes()
        if (!cancelled) {
          setAuth({ status: 'signedIn', email: attrs.email ?? '(no email)' })
        }
      } catch {
        if (cancelled || redirectingRef.current) return
        redirectingRef.current = true
        setAuth({ status: 'redirecting' })
        try {
          await signInWithRedirect()
        } catch (err) {
          if (cancelled) return
          const description = err instanceof Error ? err.message : String(err)
          console.error('[auth] signInWithRedirect failed:', err)
          setAuth({ status: 'error', code: 'redirect_failed', description })
          redirectingRef.current = false
        }
      }
    }

    // 1) If the URL has an OAuth error, render it instead of redirecting again.
    const oauthError = readOAuthErrorFromUrl()
    if (oauthError) {
      cleanOAuthParamsFromUrl()
      setAuth({ status: 'error', ...oauthError })
      return () => {
        cancelled = true
      }
    }

    // 2) Listen for the SDK's auth events. When the OAuth code exchange
    //    finishes, the SDK fires 'signInWithRedirect' — that's our cue to
    //    look up the user. Without this, calling fetchUserAttributes too
    //    early throws and we'd loop back into another redirect.
    const stop = Hub.listen('auth', ({ payload }) => {
      if (payload.event === 'signInWithRedirect') {
        cleanOAuthParamsFromUrl()
        redirectingRef.current = false
        checkUser()
      } else if (payload.event === 'signInWithRedirect_failure') {
        const data = (payload as { data?: { error?: unknown } }).data
        const err = data?.error
        const description = err instanceof Error ? err.message : String(err ?? 'unknown')
        setAuth({ status: 'error', code: 'signInWithRedirect_failure', description })
        redirectingRef.current = false
      } else if (payload.event === 'signedOut') {
        redirectingRef.current = false
        checkUser()
      }
    })

    // 3) If we're handling an OAuth callback, sit at 'loading' and wait for
    //    the Hub event above. Otherwise check the user immediately.
    if (isOAuthCallback()) {
      setAuth({ status: 'loading' })
    } else {
      checkUser()
    }

    return () => {
      cancelled = true
      stop()
    }
  }, [])

  if (auth.status === 'loading' || auth.status === 'redirecting') {
    return (
      <div className="grid min-h-screen place-items-center text-slate-500">
        {auth.status === 'redirecting' ? 'Redirecting to sign in…' : 'Loading…'}
      </div>
    )
  }

  if (auth.status === 'error') {
    return (
      <div className="grid min-h-screen place-items-center bg-slate-50 p-6">
        <div className="w-full max-w-lg rounded-2xl bg-white p-8 shadow">
          <h1 className="mb-2 text-2xl font-semibold text-rose-600">Sign-in error</h1>
          <p className="mb-1 text-sm text-slate-500">Code</p>
          <pre className="mb-4 overflow-auto rounded bg-slate-100 p-3 text-xs text-slate-800">
            {auth.code}
          </pre>
          <p className="mb-1 text-sm text-slate-500">Description</p>
          <pre className="mb-6 overflow-auto rounded bg-slate-100 p-3 text-xs text-slate-800">
            {auth.description || '(none provided)'}
          </pre>
          <div className="flex gap-2">
            <button
              onClick={() => {
                redirectingRef.current = false
                window.location.replace(window.location.pathname)
              }}
              className="rounded-lg bg-slate-900 px-4 py-2 font-medium text-white hover:bg-slate-800"
            >
              Retry
            </button>
            <button
              onClick={() => signOut()}
              className="rounded-lg border border-slate-300 px-4 py-2 font-medium text-slate-700 hover:bg-slate-100"
            >
              Sign out
            </button>
          </div>
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
