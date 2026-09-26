'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getEventById, isPastEvent, isFullEvent } from '@/data/events'
import {
  registerStudentForEvent,
  isStudentRegistered,
} from '@/data/registrations'
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
  const [, setRefreshKey] = useState(0)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [department, setDepartment] = useState('')
  const [showRegistrationForm, setShowRegistrationForm] = useState(false)

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
  const cancelled = event.cancelled
  const status = cancelled
    ? 'cancelled'
    : past
      ? 'past'
      : full
        ? 'full'
        : 'open'

  const isLoggedInStudent = currentUser?.role === 'student'
  const alreadyRegistered =
    isLoggedInStudent && isStudentRegistered(currentUser.id, event.id)
  const canRegister =
    !past && !full && !cancelled && isLoggedInStudent && !alreadyRegistered

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    setFeedback(null)

    if (!isLoggedInStudent) {
      setFeedback({
        type: 'error',
        message: 'Registration failed: You must be logged in as a student.',
      })
      return
    }

    setIsSubmitting(true)

    // Execute registration with validation, store write & seat deduction
    const result = registerStudentForEvent(currentUser.id, event.id)

    setIsSubmitting(false)

    if (result.success) {
      setFeedback({
        type: 'success',
        message: result.message,
      })
      setShowRegistrationForm(false)
      // Trigger re-render to update UI with latest seatsAvailable
      setRefreshKey((prev) => prev + 1)
    } else {
      setFeedback({
        type: 'error',
        message: result.message,
      })
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

      {/* Success / Error Feedback Banner */}
      {feedback && (
        <div
          style={{
            marginTop: 20,
            padding: '14px 18px',
            borderRadius: 'var(--radius)',
            border: `1.5px solid ${
              feedback.type === 'success' ? 'var(--green)' : 'var(--rust)'
            }`,
            background:
              feedback.type === 'success' ? 'var(--green-bg)' : 'var(--rust-bg)',
            color: feedback.type === 'success' ? '#1c4d34' : '#792411',
            fontSize: 14.5,
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{feedback.message}</span>
          {feedback.type === 'success' && (
            <Link
              href="/registrations"
              style={{
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'underline',
                marginLeft: 12,
              }}
            >
              View My Registrations →
            </Link>
          )}
        </div>
      )}

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

          {!isLoggedInStudent && (
            <div
              style={{
                fontSize: 13,
                padding: '10px 12px',
                background: '#fef3c7',
                border: '1px solid #fde68a',
                borderRadius: 'var(--radius)',
                color: '#92400e',
              }}
            >
              🔒 <strong>Student Login Required</strong>: Please switch to a student account in the navigation bar to register.
            </div>
          )}

          {alreadyRegistered && (
            <div
              style={{
                fontSize: 13.5,
                padding: '10px 12px',
                background: 'var(--green-bg)',
                border: '1.5px solid var(--green)',
                borderRadius: 'var(--radius)',
                color: '#1c4d34',
                fontWeight: 600,
              }}
            >
              ✓ You are registered for this event
            </div>
          )}

          {canRegister && !showRegistrationForm && (
            <button
              className="btn btn-primary"
              onClick={() => setShowRegistrationForm(true)}
              style={{ marginTop: 4 }}
            >
              Register for Event
            </button>
          )}

          {canRegister && showRegistrationForm && (
            <form
              onSubmit={handleRegister}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
                marginTop: 8,
                paddingTop: 12,
                borderTop: '1.5px dashed var(--line)',
              }}
            >
              <h3 style={{ fontSize: 16 }}>Confirm Registration</h3>
              <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>
                Registering as <strong>{currentUser.name}</strong> ({currentUser.id})
              </div>
              <label style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                <span>Department / Branch (Optional)</span>
                <input
                  type="text"
                  placeholder="e.g. Computer Science, 3rd Year"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  style={{
                    padding: '8px 10px',
                    border: '1.5px solid var(--line)',
                    borderRadius: 'var(--radius)',
                    fontSize: 13.5,
                    background: 'var(--paper-raised)',
                  }}
                />
              </label>

              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ flex: 1 }}
                >
                  {isSubmitting ? 'Registering...' : 'Submit Registration'}
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowRegistrationForm(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {!canRegister && !alreadyRegistered && (
            <button
              className="btn btn-primary"
              disabled
              style={{ marginTop: 4 }}
            >
              {cancelled
                ? 'Event Cancelled'
                : past
                  ? 'Registration Closed'
                  : full
                    ? 'Event Full'
                    : 'Login Required'}
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

