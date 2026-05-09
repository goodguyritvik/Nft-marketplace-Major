import { Moon, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'
import Button from './Button'

function applyTheme(mode) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (mode === 'dark') root.classList.add('dark')
  else root.classList.remove('dark')
}

export default function ThemeToggle() {
  const [mode, setMode] = useState('dark')

  useEffect(() => {
    const stored =
      typeof window !== 'undefined' ? localStorage.getItem('theme') : null
    const prefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
    const initial = stored || (prefersDark ? 'dark' : 'light')
    setMode(initial)
    applyTheme(initial)
  }, [])

  function toggle() {
    const next = mode === 'dark' ? 'light' : 'dark'
    setMode(next)
    localStorage.setItem('theme', next)
    applyTheme(next)
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={toggle}
      className="!p-2 rounded-xl border border-slate-300/80 dark:border-white/10"
      aria-label="Toggle dark mode"
    >
      {mode === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </Button>
  )
}
