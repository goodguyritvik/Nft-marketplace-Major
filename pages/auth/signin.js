import { getProviders, signIn } from 'next-auth/react'
import { useState } from 'react'
import Link from 'next/link'
import Layout from '../../components/Layout'
import Button from '../../components/Button'

export default function SignIn({ providers }) {
  const [username, setUsername] = useState('demo_user')

  return (
    <Layout title="Sign in">
      <div className="mx-auto max-w-md px-4 py-20">
        <div className="rounded-3xl border border-slate-200 dark:border-white/10 bg-white/80 dark:bg-white/5 p-8 backdrop-blur-xl shadow-xl">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Sign in</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Use demo login for presentations or Google when configured.
          </p>

          <div className="mt-8 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Demo username
              </label>
              <input
                name="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 px-4 py-3 text-slate-900 dark:text-white"
              />
            </div>
            <Button
              type="button"
              className="w-full"
              onClick={() => signIn('demo', { username, callbackUrl: '/' })}
            >
              Continue with demo
            </Button>
          </div>

          {providers && providers.google && (
            <div className="mt-6">
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => signIn('google', { callbackUrl: '/' })}
              >
                Continue with Google
              </Button>
            </div>
          )}

          <p className="mt-8 text-center text-sm">
            <Link href="/" className="text-indigo-600 dark:text-indigo-400 hover:underline">
              Back to home
            </Link>
          </p>
        </div>
      </div>
    </Layout>
  )
}

export async function getServerSideProps() {
  const providers = await getProviders()
  return {
    props: {
      providers: providers || {},
    },
  }
}
