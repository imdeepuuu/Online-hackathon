
import { loginOrRegister } from '@/app/auth/actions'
import Link from 'next/link'

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams

  const errorMessages: Record<string, string> = {
    invalid: 'Check your usertag and four-digit PIN, then try again.',
    unavailable: 'CampusFind is temporarily unavailable. Please try again.',
    exists: 'That usertag was just registered. Please sign in with its PIN.',
    setup: 'This account needs setup. Please contact the administrator.',
  }

  const errorMessage = error ? errorMessages[error] : null

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <section className="w-full max-w-md rounded-3xl border border-border bg-surface p-8 shadow-lg">
        <Link
          href="/"
          className="text-sm font-semibold text-primary hover:underline"
        >
          ← CampusFind
        </Link>

        <div className="mt-8">
          <p className="text-sm font-medium text-primary">
            YOUR CAMPUS, CONNECTED
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight">
            Welcome to CampusFind
          </h1>

          <p className="mt-3 text-muted-foreground">
            Enter your usertag and four-digit PIN to access your account.
          </p>
        </div>

        {errorMessage && (
          <p
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {errorMessage}
          </p>
        )}

        <form action={loginOrRegister} className="mt-8 space-y-5">
          <div>
            <label
              htmlFor="userTag"
              className="mb-2 block text-sm font-medium"
            >
              Usertag
            </label>

            <input
              id="userTag"
              name="userTag"
              type="text"
              autoComplete="username"
              placeholder="e.g. Deepu"
              required
              minLength={3}
              maxLength={24}
              pattern="[A-Za-z0-9_]{3,24}"
              title="Use 3–24 letters, numbers, or underscores."
              className="h-12 w-full rounded-xl border border-border bg-background px-4 outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="pin"
              className="mb-2 block text-sm font-medium"
            >
              Four-digit PIN
            </label>

            <input
              id="pin"
              name="pin"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              pattern="[0-9]{4}"
              maxLength={4}
              minLength={4}
              placeholder="••••"
              required
              title="Enter exactly four digits."
              className="h-12 w-full rounded-xl border border-border bg-background px-4 tracking-[0.4em] outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            className="h-12 w-full rounded-xl bg-primary font-semibold text-primary-foreground"
          >
            Continue
          </button>
        </form>

        <p className="mt-5 text-xs leading-relaxed text-muted-foreground">
          New here? Enter a new usertag and choose a PIN to create your
          account. Existing users must enter their correct PIN.
        </p>
      </section>
    </main>
  )
}
