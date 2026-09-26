type Status = 'open' | 'full' | 'past' | 'cancelled'

const COPY: Record<Status, string> = {
  open: 'Open',
  full: 'Full',
  past: 'Past',
  cancelled: 'Cancelled',
}

const CLASSES: Record<Status, string> = {
  open: 'bg-secondary-container text-primary',
  full: 'bg-error-container text-error',
  past: 'bg-surface-variant text-on-surface-variant',
  cancelled: 'bg-error-container text-error',
}

export default function StatusBadge({ status }: { status: Status }) {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-label-md font-label-md ${CLASSES[status]}`}
    >
      {COPY[status]}
    </span>
  )
}
