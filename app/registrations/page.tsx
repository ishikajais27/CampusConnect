'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import {
  getRegistrationsForStudent,
  cancelRegistration,
  Registration,
} from '@/data/registrations'
import { getEventById, isPastEvent } from '@/data/events'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'

export default function RegistrationsPage() {
  const { currentUser } = useAuth()
  const [, setRefreshKey] = useState(0)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

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

  const allStudentRegistrations = getRegistrationsForStudent(currentUser.id)

  // Filter out registrations for cancelled events
  const validRegistrations = allStudentRegistrations.filter((reg) => {
    const event = getEventById(reg.eventId)
    return event && !event.cancelled
  })

  const upcomingRegistrations = validRegistrations.filter((reg) => {
    const event = getEventById(reg.eventId)
    return event && !isPastEvent(event)
  })

  const pastRegistrations = validRegistrations.filter((reg) => {
    const event = getEventById(reg.eventId)
    return event && isPastEvent(event)
  })

  const handleCancel = (registrationId: string, eventName: string) => {
    if (
      !confirm(
        `Are you sure you want to cancel your registration for "${eventName}"?`,
      )
    ) {
      return
    }

    const result = cancelRegistration(registrationId, currentUser.id)
    if (result.success) {
      setFeedback({
        type: 'success',
        message: `Cancelled registration for ${eventName}. 1 seat freed.`,
      })
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
      <div style={{ marginBottom: 28 }}>
        <span className="eyebrow-tag">signed up as {currentUser.name}</span>
        <h1 style={{ fontSize: 30, marginTop: 10 }}>My registrations</h1>
        <p style={{ marginTop: 8 }}>
          Manage your upcoming event registrations and view past attendance history.
        </p>
      </div>

      {feedback && (
        <div
          style={{
            marginBottom: 24,
            padding: '12px 16px',
            borderRadius: 'var(--radius)',
            border: `1.5px solid ${
              feedback.type === 'success' ? 'var(--green)' : 'var(--rust)'
            }`,
            background:
              feedback.type === 'success' ? 'var(--green-bg)' : 'var(--rust-bg)',
            color: feedback.type === 'success' ? '#1c4d34' : '#792411',
            fontSize: 14.5,
            fontWeight: 500,
          }}
        >
          {feedback.message}
        </div>
      )}

      {validRegistrations.length === 0 ? (
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: 36 }}>
          {/* Upcoming Section */}
          <div>
            <h2 style={{ fontSize: 20, marginBottom: 14 }}>
              Upcoming Events ({upcomingRegistrations.length})
            </h2>
            {upcomingRegistrations.length === 0 ? (
              <p style={{ fontSize: 14, color: 'var(--ink-soft)' }}>
                No upcoming event registrations.
              </p>
            ) : (
              <RegistrationList
                registrations={upcomingRegistrations}
                onCancel={handleCancel}
                isUpcoming={true}
              />
            )}
          </div>

          {/* Past Section */}
          {pastRegistrations.length > 0 && (
            <div>
              <h2 style={{ fontSize: 20, marginBottom: 14 }}>
                Past Events ({pastRegistrations.length})
              </h2>
              <RegistrationList
                registrations={pastRegistrations}
                onCancel={handleCancel}
                isUpcoming={false}
              />
            </div>
          )}
        </div>
      )}
    </section>
  )
}

function RegistrationList({
  registrations,
  onCancel,
  isUpcoming,
}: {
  registrations: Registration[]
  onCancel: (id: string, name: string) => void
  isUpcoming: boolean
}) {
  return (
    <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {registrations.map((reg) => {
        const event = getEventById(reg.eventId)
        if (!event) return null
        const isCancelled = reg.status === 'cancelled'

        const statusLabel = isCancelled
          ? 'cancelled'
          : isUpcoming
            ? 'open'
            : 'past'

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
              opacity: isCancelled ? 0.7 : 1,
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
                  hour: 'numeric',
                  minute: '2-digit',
                })}{' '}
                · {event.venue}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <StatusBadge status={statusLabel} />

              {isUpcoming && !isCancelled && (
                <button
                  className="btn btn-secondary"
                  onClick={() => onCancel(reg.id, event.name)}
                >
                  Cancel Registration
                </button>
              )}
            </div>
          </li>
        )
      })}
    </ul>
  )
}

