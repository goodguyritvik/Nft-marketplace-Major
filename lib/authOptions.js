import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'

const providers = [
  CredentialsProvider({
    id: 'demo',
    name: 'Demo Login',
    credentials: {
      username: { label: 'Username', type: 'text', placeholder: 'student' },
    },
    async authorize(credentials) {
      const name = (credentials?.username || 'demo_user').trim().slice(0, 32)
      if (!name) return null
      const image = `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`
      return {
        id: `demo:${name}`,
        name,
        email: `${name}@demo.local`,
        image,
      }
    },
  }),
]

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.unshift(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  )
}

export const authOptions = {
  providers,
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.picture = user.image
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub || token.id
        if (token.picture) session.user.image = token.picture
      }
      return session
    },
  },
  pages: {
    signIn: '/auth/signin',
  },
  secret: process.env.NEXTAUTH_SECRET || 'development-secret-change-me',
}
