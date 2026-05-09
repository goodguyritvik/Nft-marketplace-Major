import clsx from 'clsx'

export default function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled,
  type = 'button',
  ...rest
}) {
  const base =
    'inline-flex items-center justify-center font-semibold rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    primary:
      'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02]',
    secondary:
      'bg-slate-200 text-slate-900 dark:bg-white/10 dark:text-white border border-slate-300 dark:border-white/15 hover:bg-slate-300 dark:hover:bg-white/15',
    ghost: 'bg-transparent text-slate-700 dark:text-slate-200 hover:bg-slate-200/80 dark:hover:bg-white/10',
  }
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-7 py-3.5 text-base',
  }
  return (
    <button
      type={type}
      disabled={disabled}
      className={clsx(base, variants[variant], sizes[size], className)}
      {...rest}
    >
      {children}
    </button>
  )
}
