import { useSession } from 'next-auth/react'
import Button from '../Button'
import { getBio, setBio } from '../../lib/profileBio'
import { useEffect, useState } from 'react'

export default function ProfileHeader({ username, userStub }) {
  const { data: session } = useSession()
  const [bio, setBioState] = useState('')
  const [editing, setEditing] = useState(false)
  const isSelf = session?.user?.name === username

  useEffect(() => {
    setBioState(getBio(username))
  }, [username])

  const displayName = userStub?.name || username
  const image =
    userStub?.image ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(username)}`

  return (
    <div className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white/80 dark:bg-white/5 p-8 backdrop-blur-xl">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image}
          alt=""
          className="h-28 w-28 rounded-2xl border border-slate-200 dark:border-white/10 object-cover shadow-lg"
        />
        <div className="flex-1 min-w-0">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white truncate">{displayName}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">@{username}</p>

          {editing && isSelf ? (
            <div className="mt-4 space-y-2">
              <textarea
                rows={3}
                className="w-full rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 px-3 py-2 text-sm text-slate-900 dark:text-white"
                value={bio}
                onChange={(e) => setBioState(e.target.value)}
                placeholder="Tell collectors about yourself…"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    setBio(username, bio)
                    setEditing(false)
                  }}
                >
                  Save
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
              {bio || 'No bio yet.'}
            </p>
          )}

          {isSelf && !editing && (
            <Button className="mt-4" size="sm" variant="secondary" onClick={() => setEditing(true)}>
              Edit bio
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
