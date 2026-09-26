import { ReactNode } from 'react'

export default function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="w-full max-w-xl mx-auto py-space-xl text-center space-y-space-md">
      <div className="w-20 h-20 mx-auto rounded-full bg-surface-container-high flex items-center justify-center text-primary shadow-sm">
        <span className="material-symbols-outlined text-[36px]">history_edu</span>
      </div>
      <div className="space-y-space-xs">
        <p className="font-label-caps text-label-caps uppercase text-primary tracking-widest font-semibold">
          ✦ NO MATCHING GATHERINGS FOUND ✦
        </p>
        <h3 className="font-headline-md text-headline-md text-on-surface">{title}</h3>
        <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      </div>
      {action && (
        <div className="pt-space-sm flex items-center justify-center gap-space-md">
          {action}
        </div>
      )}
    </div>
  )
}
