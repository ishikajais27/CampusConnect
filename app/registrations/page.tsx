'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { getEventById, isPastEvent, CampusEvent } from '@/data/events'
import { Registration } from '@/data/registrations'
import StatusBadge from '@/components/StatusBadge'
import EmptyState from '@/components/EmptyState'

export default function RegistrationsPage() {
  const { currentUser } = useAuth()
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [eventsMap, setEventsMap] = useState<Record<string, CampusEvent>>({})
  const [cancellingId, setCancellingId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Fetch registrations for the current student
  const fetchRegistrations = () => {
    if (!currentUser || currentUser.role !== 'student') return
    fetch(`/api/registrations?studentId=${currentUser.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.registrations) {
          setRegistrations(data.registrations)
        }
      })
      .catch(() => {})

    fetch('/api/events?includeCancelled=true&includePast=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.events) {
          const map: Record<string, CampusEvent> = {}
          data.events.forEach((e: CampusEvent) => {
            map[e.id] = e
          })
          setEventsMap(map)
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchRegistrations()
    setFeedback(null)
  }, [currentUser])

  const handleCancelRegistration = async (regId: string, eventName: string) => {
    if (cancellingId) return

    setCancellingId(regId)
    setFeedback(null)

    try {
      const res = await fetch(`/api/registrations/${regId}?studentId=${currentUser.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        setFeedback({
          type: 'error',
          message: data.error || 'Failed to cancel registration.',
        })
      } else {
        setFeedback({
          type: 'success',
          message: `Registration for "${eventName}" has been cancelled and your seat released.`,
        })
        // Remove cancelled registration from display list
        setRegistrations((prev) => prev.filter((r) => r.id !== regId))
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'A network error occurred while cancelling. Please try again.',
      })
    } finally {
      setCancellingId(null)
    }
  }

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

  // Filter out any registrations for cancelled events or already cancelled registrations
  const validRegistrations = useMemo(() => {
    return registrations.filter((reg) => {
      if (reg.status === 'cancelled') return false
      const event = eventsMap[reg.eventId] || getEventById(reg.eventId)
      if (!event || event.cancelled) return false
      return true
    })
  }, [registrations, eventsMap])

  // Split into upcoming and past
  const { upcoming, past } = useMemo(() => {
    const up: Registration[] = []
    const pa: Registration[] = []

    validRegistrations.forEach((reg) => {
      const event = eventsMap[reg.eventId] || getEventById(reg.eventId)
      if (event && isPastEvent(event)) {
        pa.push(reg)
      } else {
        up.push(reg)
      }
    })

    // Sort upcoming soonest first, past most recent first
    up.sort((a, b) => {
      const evA = eventsMap[a.eventId] || getEventById(a.eventId)
      const evB = eventsMap[b.eventId] || getEventById(b.eventId)
      return new Date(evA?.date || 0).getTime() - new Date(evB?.date || 0).getTime()
    })
    pa.sort((a, b) => {
      const evA = eventsMap[a.eventId] || getEventById(a.eventId)
      const evB = eventsMap[b.eventId] || getEventById(b.eventId)
      return new Date(evB?.date || 0).getTime() - new Date(evA?.date || 0).getTime()
    })

    return { upcoming: up, past: pa }
  }, [validRegistrations, eventsMap])

  return (
    <section className="shell" style={{ padding: '40px 0 64px' }}>
      <div style={{ marginBottom: 28 }}>
        <span className="eyebrow-tag">signed up as {currentUser.name}</span>
        <h1 style={{ fontSize: 30, marginTop: 10 }}>My registrations</h1>
        <p style={{ marginTop: 8 }}>
          Everything you have registered for this semester. You can manage or cancel your upcoming reservations here.
        </p>
      </div>

      {feedback && (
        <div
          style={{
            marginBottom: 24,
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
          }}
        >
          {feedback.message}
        </div>
      )}

      {validRegistrations.length === 0 ? (
        <EmptyState
          title="No registrations yet"
          description="Once you register for an event, it will show up here."
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
              Upcoming events ({upcoming.length})
            </h2>
            {upcoming.length === 0 ? (
              <div
                className="card-surface"
                style={{ padding: '20px', color: 'var(--ink-soft)', fontSize: 14.5 }}
              >
                You have no upcoming events registered.{' '}
                <Link href="/events" style={{ fontWeight: 600, textDecoration: 'underline' }}>
                  Find an event to attend →
                </Link>
              </div>
            ) : (
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {upcoming.map((reg) => {
                  const event = eventsMap[reg.eventId] || getEventById(reg.eventId)
                  if (!event) return null
                  const isCancelling = cancellingId === reg.id

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
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}{' '}
                          · {event.venue}
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <StatusBadge status="open" />
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleCancelRegistration(reg.id, event.name)}
                          disabled={isCancelling}
                          title="Cancel your registration for this event"
                        >
                          {isCancelling ? 'Cancelling…' : 'Cancel'}
                        </button>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>

          {/* Past Section */}
          {past.length > 0 && (
            <div>
              <h2 style={{ fontSize: 20, marginBottom: 14 }}>
                Past events ({past.length})
              </h2>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {past.map((reg) => {
                  const event = eventsMap[reg.eventId] || getEventById(reg.eventId)
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
                        opacity: 0.85,
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
                        <StatusBadge status="past" />
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
