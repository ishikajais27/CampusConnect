'use client'

import Link from 'next/link'
import { useState } from 'react'
import { getEventById, isPastEvent, isFullEvent } from '@/data/events'
import { registerStudent } from '@/data/registrations'
import { useAuth } from '@/components/AuthProvider'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function EventDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { currentUser } = useAuth()

  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<
    'success' | 'error' | ''
  >('')

  const event = getEventById(params.id)

  if (!event) {
    return (
      <section className="shell" style={{ padding: '56px 0' }}>
        <EmptyState
          title="This event isn't on the board"
          description="It may have been removed, or the link might be wrong. Head back to the full listing to find what you're looking for."
          action={
            <Link href="/events" className="btn btn-primary">
              Back to events
            </Link>
          }
        />
      </section>
    )
  }

  const past = isPastEvent(event)
  const full = isFullEvent(event)

  const status = event.cancelled
    ? 'cancelled'
    : past
      ? 'past'
      : full
        ? 'full'
        : 'open'

  const canRegister =
    !past &&
    !full &&
    !event.cancelled &&
    currentUser.role === 'student'

  function handleRegister() {
    setMessage('')
    setMessageType('')

    if (currentUser.role !== 'student') {
      setMessage('Only students can register for events.')
      setMessageType('error')
      return
    }

    const result = registerStudent(event.id, currentUser.id)

    setMessage(result.message)
    setMessageType(result.success ? 'success' : 'error')
  }

  return (
    <section className="shell" style={{ padding: '40px 0 64px' }}>
      <Link
        href="/events"
        style={{
          fontSize: 13.5,
          fontWeight: 600,
          textDecoration: 'none',
        }}
      >
        ← All events
      </Link>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.6fr 1fr',
          gap: 32,
          marginTop: 20,
        }}
        className="hero-grid"
      >
        <div>
          <span className="eyebrow-tag">{event.category}</span>

          <h1 style={{ fontSize: 32, marginTop: 12 }}>
            {event.name}
          </h1>

          <p style={{ marginTop: 16, fontSize: 15.5 }}>
            {event.description}
          </p>
        </div>

        <aside
          className="card-surface"
          style={{
            padding: 24,
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
            height: 'fit-content',
          }}
        >
          <StatusBadge status={status} />

          <Detail
            label="Date"
            value={formatDate(event.date)}
          />

          <Detail
            label="Time"
            value={formatTime(event.date)}
          />

          <Detail
            label="Venue"
            value={event.venue}
          />

          <Detail
            label="Seats"
            value={`${event.seatsAvailable} of ${event.capacity} available`}
          />

          <button
            className="btn btn-primary"
            disabled={!canRegister}
            onClick={handleRegister}
            style={{ marginTop: 4 }}
          >
            {canRegister
              ? 'Register'
              : status === 'full'
                ? 'Event full'
                : 'Registration closed'}
          </button>

          {message && (
            <div
              style={{
                padding: '10px 12px',
                borderRadius: 8,
                fontSize: 13.5,
                background:
                  messageType === 'success'
                    ? '#ecfdf3'
                    : '#fef2f2',
                color:
                  messageType === 'success'
                    ? '#166534'
                    : '#b91c1c',
              }}
            >
              {message}
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}

function Detail({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div>
      <div
        style={{
          fontSize: 12,
          color: 'var(--ink-soft)',
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 14.5,
          fontWeight: 500,
        }}
      >
        {value}
      </div>
    </div>
  )
}