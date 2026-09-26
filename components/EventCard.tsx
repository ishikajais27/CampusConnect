import Link from 'next/link'
import { CampusEvent, isPastEvent, isFullEvent } from '@/data/events'
import StatusBadge from './StatusBadge'

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }) + ' • ' + d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

export default function EventCard({ event }: { event: CampusEvent }) {
  const past = isPastEvent(event)
  const full = isFullEvent(event)
  const status = event.cancelled
    ? 'cancelled'
    : past
      ? 'past'
      : full
        ? 'full'
        : 'open'

  return (
    <Link href={`/events/${event.id}`} className="group cursor-pointer flex flex-col h-full bg-surface-container-lowest border border-outline-variant hover:border-primary transition-colors">
      <div className="p-4 flex-grow flex flex-col">
        <div className="flex justify-between items-start mb-2">
          <span className="px-2 py-1 border border-outline text-label-sm font-label-caps uppercase tracking-wider text-on-surface-variant">
            {event.category}
          </span>
          <StatusBadge status={status} />
        </div>
        <h3 className="font-headline-sm text-headline-sm text-on-surface mb-1 group-hover:text-primary transition-colors">
          {event.name}
        </h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant line-clamp-2 mb-4 flex-grow">
          {event.description}
        </p>
        <div className="flex flex-col gap-1 text-caption font-caption text-on-surface-variant pt-2 border-t border-surface-dim">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">calendar_today</span>
            <span>{formatDateTime(event.date)}</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">location_on</span>
            <span>{event.venue}</span>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="material-symbols-outlined text-[16px]">event_seat</span>
            <span>{event.seatsAvailable}/{event.capacity} seats left</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
