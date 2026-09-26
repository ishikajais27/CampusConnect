import Link from 'next/link'
import { CampusEvent, isPastEvent, isFullEvent } from '@/data/events'

function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function EventCard({ event }: { event: CampusEvent }) {
  const past = isPastEvent(event)
  const full = isFullEvent(event)
  const status = event.cancelled
    ? 'cancelled'
    : past ? 'past' : full ? 'full' : 'open'

  const statusBadge = {
    open: (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-secondary font-label-md text-label-md">
        <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
        <span>Open</span>
      </span>
    ),
    full: (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-label-md text-label-md">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
        <span>At Capacity</span>
      </span>
    ),
    past: (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container text-tertiary font-label-md text-label-md">
        <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
        <span>Past</span>
      </span>
    ),
    cancelled: (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-error-container text-error font-label-md text-label-md">
        <span className="w-1.5 h-1.5 rounded-full bg-error" />
        <span>Cancelled</span>
      </span>
    ),
  }

  return (
    <Link
      href={`/events/${event.id}`}
      className="group relative bg-surface-container-lowest rounded-xl p-space-lg flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200"
    >
      <div className="space-y-space-md">
        <div className="flex items-center justify-between gap-space-xs">
          <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider bg-surface-container-high px-2 py-0.5 rounded">
            {event.category.toUpperCase()}
          </span>
          {statusBadge[status]}
        </div>
        <div className="relative py-1">
          <div className="w-full border-t border-dashed border-outline-variant/60" />
        </div>
        <h2 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors leading-tight">
          {event.name}
        </h2>
        <div className="space-y-space-xs text-on-surface-variant font-body-sm text-body-sm">
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[18px] text-tertiary shrink-0">calendar_today</span>
            <span>{formatEventDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[18px] text-tertiary shrink-0">location_on</span>
            <span>{event.venue}</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[18px] text-tertiary shrink-0">chair</span>
            <span className="text-secondary font-medium">{event.seatsAvailable}</span>
            <span className="text-tertiary text-caption">/ {event.capacity} seats</span>
          </div>
        </div>
      </div>
      <div className="pt-space-lg flex items-center justify-end mt-auto">
        <span className="inline-flex items-center gap-1 font-label-md text-label-md text-primary group-hover:translate-x-0.5 transition-transform">
          <span>View Details</span>
          <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
        </span>
      </div>
    </Link>
  )
}
