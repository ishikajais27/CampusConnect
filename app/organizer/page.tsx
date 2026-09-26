'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { events as initialEvents, CampusEvent, EventCategory, TODAY } from '@/data/events'
import EmptyState from '@/components/EmptyState'
import StatusBadge from '@/components/StatusBadge'

const CATEGORIES: EventCategory[] = [
  'Tech',
  'Cultural',
  'Sports',
  'Workshop',
  'Career',
  'Music',
]

interface EventFormData {
  name: string
  category: EventCategory
  date: string
  venue: string
  capacity: number | string
  description: string
}

const defaultFormData: EventFormData = {
  name: '',
  category: 'Tech',
  date: '2026-10-15T10:00',
  venue: '',
  capacity: 50,
  description: '',
}

export default function OrganizerPage() {
  const { currentUser } = useAuth()
  const [eventsList, setEventsList] = useState<CampusEvent[]>(initialEvents)
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null)
  const [editingEventId, setEditingEventId] = useState<string | null>(null)
  const [formData, setFormData] = useState<EventFormData>(defaultFormData)
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const fetchEvents = () => {
    fetch('/api/events?includeCancelled=true&includePast=true')
      .then((res) => res.json())
      .then((data) => {
        if (data.events) {
          setEventsList(data.events)
        }
      })
      .catch(() => {})
  }

  useEffect(() => {
    fetchEvents()
  }, [])

  if (currentUser.role !== 'organizer') {
    return (
      <section className="shell" style={{ padding: '56px 0' }}>
        <EmptyState
          title="This page is for organizers"
          description="Switch to an organizer account from the top-right menu to manage events."
        />
      </section>
    )
  }

  // Filter events belonging to this organizer (or seeded organizer)
  const myEvents = eventsList.filter((e) => e.organizerId === currentUser.id)

  const openCreateModal = () => {
    setFormData(defaultFormData)
    setFormError(null)
    setModalMode('create')
    setEditingEventId(null)
  }

  const openEditModal = (event: CampusEvent) => {
    // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
    let formattedDate = event.date
    if (formattedDate.length > 16) {
      formattedDate = formattedDate.slice(0, 16)
    }
    setFormData({
      name: event.name,
      category: event.category,
      date: formattedDate,
      venue: event.venue,
      capacity: event.capacity,
      description: event.description,
    })
    setFormError(null)
    setEditingEventId(event.id)
    setModalMode('edit')
  }

  const closeModal = () => {
    setModalMode(null)
    setEditingEventId(null)
    setFormError(null)
  }

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setFormError('Event name is required.')
      return false
    }
    if (!formData.venue.trim()) {
      setFormError('Venue is required.')
      return false
    }
    if (!formData.date) {
      setFormError('Event date and time are required.')
      return false
    }
    const eventTime = new Date(formData.date).getTime()
    if (isNaN(eventTime)) {
      setFormError('Please enter a valid date.')
      return false
    }
    if (eventTime < TODAY.getTime()) {
      setFormError(
        `Event date must be in the future (after ${TODAY.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}).`,
      )
      return false
    }
    const cap = Number(formData.capacity)
    if (!cap || cap <= 0 || !Number.isInteger(cap)) {
      setFormError('Capacity must be a positive whole number.')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm() || submitting) return
    setSubmitting(true)
    setFormError(null)
    setFeedback(null)

    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            capacity: Number(formData.capacity),
            organizerId: currentUser.id,
          }),
        })
        const data = await res.json()
        if (!res.ok || !data.success) {
          setFormError(data.error || 'Failed to create event.')
        } else {
          setFeedback({
            type: 'success',
            message: `Event "${formData.name}" created successfully!`,
          })
          closeModal()
          fetchEvents()
        }
      } else if (modalMode === 'edit' && editingEventId) {
        const res = await fetch(`/api/events/${editingEventId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            capacity: Number(formData.capacity),
          }),
        })
        const data = await res.json()
        if (!res.ok || !data.success) {
          setFormError(data.error || 'Failed to update event.')
        } else {
          setFeedback({
            type: 'success',
            message: `Event "${formData.name}" updated successfully!`,
          })
          closeModal()
          fetchEvents()
        }
      }
    } catch {
      setFormError('A network error occurred. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancelEvent = async (event: CampusEvent) => {
    setFeedback(null)
    try {
      const res = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
      })
      const data = await res.json()
      if (!res.ok || !data.success) {
        setFeedback({
          type: 'error',
          message: data.error || 'Failed to cancel event.',
        })
      } else {
        setFeedback({
          type: 'success',
          message: `Event "${event.name}" has been cancelled.`,
        })
        fetchEvents()
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'A network error occurred while cancelling event.',
      })
    }
  }

  return (
    <section className="shell" style={{ padding: '40px 0 64px' }}>
      <div
        style={{
          marginBottom: 28,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <span className="eyebrow-tag">organizer console</span>
          <h1 style={{ fontSize: 30, marginTop: 10 }}>Manage your events</h1>
          <p style={{ marginTop: 8 }}>
            Create new campus events, update capacity or details, and manage cancellations.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={openCreateModal}
          title="Create a new event"
        >
          + New event
        </button>
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

      {myEvents.length === 0 ? (
        <EmptyState
          title="No events posted yet"
          description="You haven't posted any events yet. Click '+ New event' above to create your first event."
          action={
            <button className="btn btn-primary" onClick={openCreateModal}>
              + New event
            </button>
          }
        />
      ) : (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {myEvents.map((event) => {
            const status = event.cancelled
              ? 'cancelled'
              : event.seatsAvailable <= 0
                ? 'full'
                : 'open'
            return (
              <li
                key={event.id}
                className="card-surface"
                style={{
                  padding: '18px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                  flexWrap: 'wrap',
                  opacity: event.cancelled ? 0.75 : 1,
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                    <span
                      style={{
                        fontSize: 12,
                        padding: '2px 8px',
                        background: 'var(--slate-bg)',
                        borderRadius: 'var(--radius)',
                        color: 'var(--ink-soft)',
                      }}
                    >
                      {event.category}
                    </span>
                  </div>
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
                    · {event.venue} · {event.seatsAvailable}/{event.capacity}{' '}
                    seats available
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <StatusBadge status={status} />
                  <button
                    className="btn btn-secondary"
                    onClick={() => openEditModal(event)}
                    title="Edit event details"
                  >
                    Edit
                  </button>
                  {!event.cancelled && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleCancelEvent(event)}
                      title="Cancel event and release registrations"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {/* Modal for Create / Edit */}
      {modalMode && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: 16,
          }}
          onClick={closeModal}
        >
          <div
            className="card-surface"
            style={{
              width: '100%',
              maxWidth: 540,
              padding: 28,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 20,
              }}
            >
              <h2 style={{ fontSize: 22 }}>
                {modalMode === 'create' ? 'Create new event' : 'Edit event'}
              </h2>
              <button
                type="button"
                onClick={closeModal}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 22,
                  cursor: 'pointer',
                  color: 'var(--ink-soft)',
                }}
              >
                ✕
              </button>
            </div>

            {formError && (
              <div
                style={{
                  padding: '10px 14px',
                  background: 'var(--rust-bg)',
                  border: '1.5px solid var(--rust)',
                  color: 'var(--rust)',
                  borderRadius: 'var(--radius)',
                  fontSize: 14,
                  marginBottom: 16,
                }}
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13.5,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Event Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. AI Hackathon 2026"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid var(--line)',
                    borderRadius: 'var(--radius)',
                    fontSize: 14.5,
                    background: 'var(--paper)',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13.5,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        category: e.target.value as EventCategory,
                      })
                    }
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid var(--line)',
                      borderRadius: 'var(--radius)',
                      fontSize: 14.5,
                      background: 'var(--paper)',
                    }}
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13.5,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    Capacity (Seats) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.capacity}
                    onChange={(e) =>
                      setFormData({ ...formData, capacity: e.target.value })
                    }
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid var(--line)',
                      borderRadius: 'var(--radius)',
                      fontSize: 14.5,
                      background: 'var(--paper)',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13.5,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid var(--line)',
                      borderRadius: 'var(--radius)',
                      fontSize: 14.5,
                      background: 'var(--paper)',
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: 13.5,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    Venue *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.venue}
                    onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                    placeholder="e.g. Auditorium Hall"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1.5px solid var(--line)',
                      borderRadius: 'var(--radius)',
                      fontSize: 14.5,
                      background: 'var(--paper)',
                    }}
                  />
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 13.5,
                    fontWeight: 600,
                    marginBottom: 6,
                  }}
                >
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Tell students what this event is about…"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1.5px solid var(--line)',
                    borderRadius: 'var(--radius)',
                    fontSize: 14.5,
                    background: 'var(--paper)',
                    resize: 'vertical',
                  }}
                />
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'flex-end',
                  gap: 12,
                  marginTop: 12,
                }}
              >
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeModal}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting
                    ? 'Saving…'
                    : modalMode === 'create'
                      ? 'Create event'
                      : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  )
}
