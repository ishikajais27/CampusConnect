'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { getRegistrationsForStudent } from '@/data/registrations'
import { getEventById } from '@/data/events'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'

export default function RegistrationsPage() {
  const { currentUser } = useAuth()

  if (currentUser.role !== 'student') {
    return (
      <section className="shell" style={{ padding: '56px 0' }}>
        <EmptyState
          title="This page is for students"
          description="Switch to a student account from the top-right menu to see registered events."
        />
      </section>
    )
  }

  const myRegistrations = getRegistrationsForStudent(currentUser.id).filter(
    (registration) => {
      const event = getEventById(registration.eventId)
      return event && !event.cancelled && registration.status !== 'cancelled'
    },
  )

  return (
    <section className="shell" style={{ padding: '40px 0 64px' }}>
      <div style={{ marginBottom: 28 }}>
        <span className="eyebrow-tag">signed up as {currentUser.name}</span>
        <h1 style={{ fontSize: 30, marginTop: 10 }}>My registrations</h1>
        <p style={{ marginTop: 8 }}>
          Everything you've registered for. This starter shows seed data —
          {/* PARTICIPANT TASK (Task 3): split into upcoming/past sections,
              and add a working cancel button. */}{' '}
          separating upcoming from past, and cancelling, are Task 3.
        </p>
      </div>

      {myRegistrations.length === 0 ? (
        <EmptyState
          title="No registrations yet"
          description="Once you register for an event, it'll show up here."
          action={
            <Link href="/events" className="btn btn-primary">
              Browse events
            </Link>
          }
        />
      ) : (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {myRegistrations.map((reg) => {
            const event = getEventById(reg.eventId)
            if (!event) return null
            return (
              <li
                key={reg.id}
                className="card-surface"
                style={{
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  flexWrap: 'wrap',
                }}
              >
                <div>
                  <Link
                    href={`/events/${event.id}`}
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 600,
                      fontSize: 17,
                      textDecoration: 'none',
                    }}
                  >
                    {event.name}
                  </Link>
                  <div
                    style={{
                      fontSize: 13.5,
                      color: 'var(--ink-soft)',
                      marginTop: 4,
                    }}
                  >
                    {new Date(event.date).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}{' '}
                    · {event.venue}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <StatusBadge
                    status={reg.status === 'cancelled' ? 'cancelled' : 'open'}
                  />
                  {/* PARTICIPANT TASK (Task 3): wire this up to
                      DELETE /api/registrations/[id] and update seats. */}
                  <button
                    className="btn btn-secondary"
                    disabled
                    title="Cancellation isn't wired up yet — that's Task 3"
                  >
                    Cancel
                  </button>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
