import clsx from 'clsx'

export default function EmptyState({ title, description, action, className }) {
  return (
    <div
      className={clsx(
        'rounded-3xl border border-slate-200 dark:border-white/10 bg-white/60 dark:bg-white/5 p-16 text-center backdrop-blur-xl',
        className
      )}
    >
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-slate-600 dark:text-slate-400 max-w-lg mx-auto">
          {description}
        </p>
      )}
      {action && <div className="mt-8 flex justify-center">{action}</div>}
    </div>
  )
}
