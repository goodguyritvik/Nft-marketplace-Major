import { getServerSession } from 'next-auth/next'
import { authOptions } from '../../lib/authOptions'

export default function ProfileMeRedirect() {
  return null
}

export async function getServerSideProps(ctx) {
  const session = await getServerSession(ctx.req, ctx.res, authOptions)
  if (!session?.user?.name) {
    return {
      redirect: {
        destination: '/auth/signin?callbackUrl=/profile/me',
        permanent: false,
      },
    }
  }
  return {
    redirect: {
      destination: `/profile/${encodeURIComponent(session.user.name)}`,
      permanent: false,
    },
  }
}
