'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { getEventById, isPastEvent, isFullEvent, CampusEvent } from '@/data/events'
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
  const [event, setEvent] = useState<CampusEvent | null>(() => getEventById(params.id) || null)
  const [isRegistered, setIsRegistered] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Re-fetch event and check registration status for current student
  useEffect(() => {
    fetch(`/api/events/${params.id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found')
        return res.json()
      })
      .then((data) => {
        if (data.event) {
          setEvent(data.event)
        }
      })
      .catch(() => {})

    if (currentUser && currentUser.role === 'student') {
      fetch(`/api/registrations?studentId=${currentUser.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.registrations) {
            const hasReg = data.registrations.some(
              (r: any) => r.eventId === params.id && r.status === 'confirmed',
            )
            setIsRegistered(hasReg)
          }
        })
        .catch(() => {})
    } else {
      setIsRegistered(false)
    }
    setFeedback(null)
  }, [params.id, currentUser])

  if (!event || (event.cancelled && currentUser.role === 'student')) {
    return (
      <section className="shell" style={{ padding: '56px 0' }}>
        <EmptyState
          title="This event isn't on the board"
          description="It may have been removed, cancelled, or the link might be wrong. Head back to the full listing to find what you're looking for."
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
  const isStudent = currentUser && currentUser.role === 'student'
  const canRegister = !past && !full && !event.cancelled && isStudent && !isRegistered

  const status = event.cancelled
    ? 'cancelled'
    : past
      ? 'past'
      : full
        ? 'full'
        : 'open'

  const handleRegister = async () => {
    if (!canRegister || submitting) return
    setSubmitting(true)
    setFeedback(null)

    try {
      const res = await fetch('/api/registrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentUser.id,
          eventId: event.id,
        }),
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        setFeedback({
          type: 'error',
          message: data.error || 'Failed to register for this event.',
        })
      } else {
        setIsRegistered(true)
        setEvent((prev) =>
          prev
            ? { ...prev, seatsAvailable: Math.max(0, prev.seatsAvailable - 1) }
            : prev,
        )
        setFeedback({
          type: 'success',
          message: 'Registration successful! You are now confirmed for this event.',
        })
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'A network error occurred. Please try again.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section className="shell" style={{ padding: '40px 0 64px' }}>
      <Link
        href="/events"
        style={{ fontSize: 13.5, fontWeight: 600, textDecoration: 'none' }}
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
          <h1 style={{ fontSize: 32, marginTop: 12 }}>{event.name}</h1>
          <p style={{ marginTop: 16, fontSize: 15.5 }}>{event.description}</p>

          {feedback && (
            <div
              style={{
                marginTop: 24,
                padding: '12px 16px',
                borderRadius: 'var(--radius)',
                border:
                  feedback.type === 'success'
                    ? '1.5px solid var(--green)'
                    : '1.5px solid var(--rust)',
                background:
                  feedback.type === 'success'
                    ? 'var(--green-bg)'
                    : 'var(--rust-bg)',
                color:
                  feedback.type === 'success' ? 'var(--green)' : 'var(--rust)',
                fontSize: 14.5,
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
              }}
            >
              <span>{feedback.message}</span>
              {feedback.type === 'success' && (
                <Link
                  href="/registrations"
                  style={{
                    fontWeight: 600,
                    textDecoration: 'underline',
                    color: 'inherit',
                  }}
                >
                  View registrations →
                </Link>
              )}
            </div>
          )}
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
          <Detail label="Date" value={formatDate(event.date)} />
          <Detail label="Time" value={formatTime(event.date)} />
          <Detail label="Venue" value={event.venue} />
          <Detail
            label="Seats"
            value={`${event.seatsAvailable} of ${event.capacity} available`}
          />

          {!isStudent && (
            <div
              style={{
                fontSize: 13,
                color: 'var(--ink-soft)',
                background: 'var(--slate-bg)',
                padding: '8px 10px',
                borderRadius: 'var(--radius)',
              }}
            >
              Signed in as <strong>{currentUser.name}</strong> (Organizer). Switch to a student account to register.
            </div>
          )}

          {isStudent && isRegistered ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 4 }}>
              <button
                className="btn btn-secondary"
                disabled
                style={{
                  background: 'var(--green-bg)',
                  borderColor: 'var(--green)',
                  color: 'var(--green)',
                  cursor: 'default',
                  opacity: 1,
                }}
              >
                ✓ Registered
              </button>
              <Link
                href="/registrations"
                style={{
                  fontSize: 13,
                  color: 'var(--ink-soft)',
                  textAlign: 'center',
                  textDecoration: 'none',
                }}
              >
                Manage in My Registrations →
              </Link>
            </div>
          ) : (
            <button
              className="btn btn-primary"
              disabled={!canRegister || submitting}
              onClick={handleRegister}
              style={{ marginTop: 4 }}
            >
              {submitting
                ? 'Registering…'
                : !isStudent
                  ? 'Students only'
                  : event.cancelled
                    ? 'Event cancelled'
                    : past
                      ? 'Event closed'
                      : full
                        ? 'Event full'
                        : 'Register for event'}
            </button>
          )}
        </aside>
      </div>
    </section>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: 12, color: 'var(--ink-soft)' }}>{label}</div>
      <div style={{ fontSize: 14.5, fontWeight: 500 }}>{value}</div>
    </div>
  )
}
