'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import {
  events,
  EventCategory,
  CampusEvent,
  createEvent,
  editEvent,
  cancelEvent,
  deleteEvent,
} from '@/data/events'
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

const EMPTY_FORM = {
  name: '',
  description: '',
  date: '',
  venue: '',
  category: 'Tech' as EventCategory,
  capacity: '',
}

export default function OrganizerPage() {
  const { currentUser } = useAuth()

  // --- feedback state -----------------------------------------------
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // --- create-form state --------------------------------------------
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [createForm, setCreateForm] = useState({ ...EMPTY_FORM })
  const [createErrors, setCreateErrors] = useState<string[]>([])

  // --- edit state ----------------------------------------------------
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ ...EMPTY_FORM })
  const [editErrors, setEditErrors] = useState<string[]>([])

  // --- force re-render after mutations ------------------------------
  const [, setTick] = useState(0)
  const bump = () => setTick((t) => t + 1)

  // ---- access control: students cannot use this page ---------------
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

  // NOTE: The single seeded organizer (org-1) is treated as able to
  // manage ALL seeded events (whose organizerIds are org-1 through
  // org-4) because only one organizer account exists in the seed data.
  const allEvents = [...events]

  // --- handlers -----------------------------------------------------

  function handleCreate() {
    setCreateErrors([])
    const cap = Number(createForm.capacity)
    const result = createEvent({
      name: createForm.name,
      description: createForm.description,
      date: createForm.date,
      venue: createForm.venue,
      category: createForm.category,
      capacity: cap,
      organizerId: currentUser.id,
    })
    if (!result.success) {
      setCreateErrors(result.errors)
      setFeedback({ type: 'error', message: 'Validation failed — see errors below.' })
      return
    }
    setCreateForm({ ...EMPTY_FORM })
    setShowCreateForm(false)
    setFeedback({ type: 'success', message: `Event "${result.event.name}" created successfully!` })
    bump()
  }

  function startEdit(event: CampusEvent) {
    setEditingId(event.id)
    setEditForm({
      name: event.name,
      description: event.description,
      date: event.date.slice(0, 16), // trim to datetime-local format
      venue: event.venue,
      category: event.category,
      capacity: String(event.capacity),
    })
    setEditErrors([])
    setFeedback(null)
  }

  function handleEditSave() {
    if (!editingId) return
    setEditErrors([])
    const cap = Number(editForm.capacity)
    const result = editEvent(editingId, {
      name: editForm.name,
      description: editForm.description,
      date: editForm.date,
      venue: editForm.venue,
      category: editForm.category,
      capacity: cap,
    })
    if (!result.success) {
      setEditErrors(result.errors)
      setFeedback({ type: 'error', message: 'Validation failed — see errors below.' })
      return
    }
    setEditingId(null)
    setFeedback({ type: 'success', message: `Event "${result.event.name}" updated successfully!` })
    bump()
  }

  function handleCancel(eventId: string) {
    const result = cancelEvent(eventId)
    if (!result.success) {
      setFeedback({ type: 'error', message: result.errors.join(' ') })
      return
    }
    setFeedback({
      type: 'success',
      message: `Event "${result.event.name}" has been cancelled.`,
    })
    bump()
  }

  function handleDelete(eventId: string) {
    const evName = events.find((e) => e.id === eventId)?.name ?? eventId
    const result = deleteEvent(eventId)
    if (!result.success) {
      setFeedback({ type: 'error', message: result.errors.join(' ') })
      return
    }
    setFeedback({
      type: 'success',
      message: `Event "${evName}" has been deleted.`,
    })
    if (editingId === eventId) setEditingId(null)
    bump()
  }

  // --- render -------------------------------------------------------

  return (
    <section className="shell" style={{ padding: '40px 0 64px' }}>
      {/* ---- top-level feedback banner ---- */}
      {feedback && (
        <div
          role="alert"
          style={{
            padding: '12px 16px',
            marginBottom: 20,
            borderRadius: 'var(--radius)',
            fontSize: 14,
            fontWeight: 500,
            background:
              feedback.type === 'success'
                ? 'var(--green-bg)'
                : 'var(--rust-bg)',
            color:
              feedback.type === 'success'
                ? 'var(--green)'
                : 'var(--rust)',
          }}
        >
          {feedback.message}
        </div>
      )}

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
            Create, edit, or cancel events from this dashboard.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setShowCreateForm((v) => !v)
            setFeedback(null)
            setCreateErrors([])
          }}
        >
          {showCreateForm ? '✕ Close form' : '+ New event'}
        </button>
      </div>

      {/* ---- create event form ---- */}
      {showCreateForm && (
        <div
          className="card-surface"
          style={{ padding: 24, marginBottom: 24 }}
        >
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              marginBottom: 16,
            }}
          >
            Create a new event
          </h2>
          {createErrors.length > 0 && (
            <ul
              role="alert"
              style={{
                marginBottom: 12,
                padding: '10px 16px 10px 32px',
                background: 'var(--rust-bg)',
                color: 'var(--rust)',
                borderRadius: 'var(--radius)',
                fontSize: 13.5,
              }}
            >
              {createErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          )}
          <EventForm
            form={createForm}
            onChange={setCreateForm}
            onSubmit={handleCreate}
            submitLabel="Create event"
            onCancel={() => {
              setShowCreateForm(false)
              setCreateErrors([])
            }}
          />
        </div>
      )}

      {/* ---- event list ---- */}
      {allEvents.length === 0 ? (
        <EmptyState
          title="No events posted yet"
          description="Once you create an event, it'll show up here."
        />
      ) : (
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {allEvents.map((event) => {
            const status = event.cancelled
              ? 'cancelled'
              : event.seatsAvailable <= 0
                ? 'full'
                : 'open'

            const isEditing = editingId === event.id

            return (
              <li
                key={event.id}
                className="card-surface"
                style={{ padding: '18px 20px' }}
              >
                {isEditing ? (
                  /* ---------- inline edit form ---------- */
                  <div>
                    <h3
                      style={{
                        fontFamily: 'var(--font-display)',
                        fontWeight: 600,
                        fontSize: 17,
                        marginBottom: 12,
                      }}
                    >
                      Editing: {event.name}
                    </h3>
                    {editErrors.length > 0 && (
                      <ul
                        role="alert"
                        style={{
                          marginBottom: 12,
                          padding: '10px 16px 10px 32px',
                          background: 'var(--rust-bg)',
                          color: 'var(--rust)',
                          borderRadius: 'var(--radius)',
                          fontSize: 13.5,
                        }}
                      >
                        {editErrors.map((err, i) => (
                          <li key={i}>{err}</li>
                        ))}
                      </ul>
                    )}
                    <EventForm
                      form={editForm}
                      onChange={setEditForm}
                      onSubmit={handleEditSave}
                      submitLabel="Save changes"
                      onCancel={() => {
                        setEditingId(null)
                        setEditErrors([])
                      }}
                    />
                  </div>
                ) : (
                  /* ---------- normal row ---------- */
                  <div
                    style={{
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
                        · {event.venue} · {event.seatsAvailable}/
                        {event.capacity} seats
                      </div>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                      }}
                    >
                      <StatusBadge status={status} />
                      {!event.cancelled && (
                        <button
                          className="btn btn-secondary"
                          onClick={() => startEdit(event)}
                        >
                          Edit
                        </button>
                      )}
                      {!event.cancelled && (
                        <button
                          className="btn btn-secondary"
                          onClick={() => handleCancel(event.id)}
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleDelete(event.id)}
                        style={{
                          color: 'var(--rust)',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}

/* ================================================================== */
/*  Shared form component for create & edit                            */
/* ================================================================== */

function EventForm({
  form,
  onChange,
  onSubmit,
  submitLabel,
  onCancel,
}: {
  form: typeof EMPTY_FORM
  onChange: (f: typeof EMPTY_FORM) => void
  onSubmit: () => void
  submitLabel: string
  onCancel: () => void
}) {
  const fieldStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid var(--line)',
    borderRadius: 'var(--radius)',
    fontSize: 14.5,
    background: 'var(--paper-raised)',
    boxSizing: 'border-box',
  }

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--ink-soft)',
    marginBottom: 4,
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 14,
      }}
    >
      <div>
        <label style={labelStyle}>Event name *</label>
        <input
          style={fieldStyle}
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
          placeholder="e.g. Hack the Campus 2026"
        />
      </div>
      <div>
        <label style={labelStyle}>Date & time *</label>
        <input
          type="datetime-local"
          style={fieldStyle}
          value={form.date}
          onChange={(e) => onChange({ ...form, date: e.target.value })}
        />
      </div>
      <div>
        <label style={labelStyle}>Venue *</label>
        <input
          style={fieldStyle}
          value={form.venue}
          onChange={(e) => onChange({ ...form, venue: e.target.value })}
          placeholder="e.g. Innovation Lab, Block C"
        />
      </div>
      <div>
        <label style={labelStyle}>Category</label>
        <select
          style={fieldStyle}
          value={form.category}
          onChange={(e) =>
            onChange({ ...form, category: e.target.value as EventCategory })
          }
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label style={labelStyle}>Capacity *</label>
        <input
          type="number"
          min={1}
          style={fieldStyle}
          value={form.capacity}
          onChange={(e) => onChange({ ...form, capacity: e.target.value })}
          placeholder="e.g. 120"
        />
      </div>
      <div style={{ gridColumn: '1 / -1' }}>
        <label style={labelStyle}>Description</label>
        <textarea
          style={{ ...fieldStyle, minHeight: 72, resize: 'vertical' }}
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          placeholder="What's this event about?"
        />
      </div>
      <div
        style={{
          gridColumn: '1 / -1',
          display: 'flex',
          gap: 10,
          justifyContent: 'flex-end',
        }}
      >
        <button className="btn btn-secondary" type="button" onClick={onCancel}>
          Discard
        </button>
        <button className="btn btn-primary" type="button" onClick={onSubmit}>
          {submitLabel}
        </button>
      </div>
    </div>
  )
}
