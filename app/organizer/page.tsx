"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";
import {
  cancelEvent,
  CampusEvent,
  createEvent,
  EventCategory,
  EventInput,
  events,
  isRegistrationClosed,
  updateEvent,
  validateEventInput,
} from "@/data/events";
import EmptyState from "@/components/EmptyState";
import StatusBadge from "@/components/StatusBadge";

const CATEGORIES: EventCategory[] = [
  "Tech",
  "Cultural",
  "Sports",
  "Workshop",
  "Career",
  "Music",
];
const EMPTY_FORM: EventInput = {
  name: "",
  description: "",
  date: "",
  registrationDeadline: "",
  venue: "",
  category: "Tech",
  capacity: 1,
};

function toLocalInputValue(date: string) {
  const value = new Date(date);
  const offset = value.getTimezoneOffset() * 60_000;
  return new Date(value.getTime() - offset).toISOString().slice(0, 16);
}

export default function OrganizerPage() {
  const { currentUser } = useAuth();
  const [, setRevision] = useState(0);
  const [form, setForm] = useState<EventInput>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  if (currentUser.role !== "organizer") {
    return (
      <section className="shell" style={{ padding: "56px 0" }}>
        <EmptyState
          title="This page is for organizers"
          description="Switch to an organizer account from the top-right menu to manage events."
        />
      </section>
    );
  }

  const myEvents = events.filter(
    (event) => event.organizerId === currentUser.id,
  );

  function startCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError("");
    setNotice("");
  }

  function startEdit(event: CampusEvent) {
    setEditingId(event.id);
    setForm({
      name: event.name,
      description: event.description,
      date: toLocalInputValue(event.date),
      registrationDeadline: event.registrationDeadline
        ? toLocalInputValue(event.registrationDeadline)
        : "",
      venue: event.venue,
      category: event.category,
      capacity: event.capacity,
    });
    setFormError("");
    setNotice("");
  }

  function submitEvent(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const existing = editingId
      ? events.find((event) => event.id === editingId)
      : undefined;
    const occupied = existing ? existing.capacity - existing.seatsAvailable : 0;
    const validationError = validateEventInput(form, occupied);
    if (validationError) {
      setFormError(validationError);
      return;
    }

    if (editingId) updateEvent(editingId, form);
    else createEvent(form, currentUser.id);
    setRevision((revision) => revision + 1);
    setFormError("");
    setNotice(editingId ? "Event updated." : "Event created.");
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  function handleCancel(event: CampusEvent) {
    if (
      event.cancelled ||
      !window.confirm(
        `Cancel “${event.name}”? Students will no longer see it or its registrations.`,
      )
    )
      return;
    cancelEvent(event.id);
    setRevision((revision) => revision + 1);
  }

  return (
    <section className="shell" style={{ padding: "40px 0 64px" }}>
      <div
        style={{
          marginBottom: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <span className="eyebrow-tag">organizer console</span>
          <h1 style={{ fontSize: 30, marginTop: 10 }}>Manage your events</h1>
          <p style={{ marginTop: 8 }}>
            Create and maintain events posted by you.
          </p>
        </div>
        <button className="btn btn-primary" onClick={startCreate}>
          + New event
        </button>
      </div>

      {notice && (
        <p role="status" style={{ marginBottom: 16, color: "var(--green)" }}>
          {notice}
        </p>
      )}

      <form
        onSubmit={submitEvent}
        className="card-surface"
        style={{
          padding: 20,
          marginBottom: 24,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 14,
        }}
      >
        <h2 style={{ gridColumn: "1 / -1", fontSize: 19 }}>
          {editingId ? "Edit event" : "New event"}
        </h2>
        <label className="organizer-field">
          Event name
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </label>
        <label className="organizer-field">
          Date and time
          <input
            required
            type="datetime-local"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
          />
        </label>
        <label className="organizer-field">
          Registration closes
          <input
            required
            type="datetime-local"
            max={form.date || undefined}
            value={form.registrationDeadline}
            onChange={(e) =>
              setForm({ ...form, registrationDeadline: e.target.value })
            }
          />
        </label>
        <label className="organizer-field">
          Venue
          <input
            required
            value={form.venue}
            onChange={(e) => setForm({ ...form, venue: e.target.value })}
          />
        </label>
        <label className="organizer-field">
          Category
          <select
            value={form.category}
            onChange={(e) =>
              setForm({ ...form, category: e.target.value as EventCategory })
            }
          >
            {CATEGORIES.map((category) => (
              <option key={category}>{category}</option>
            ))}
          </select>
        </label>
        <label className="organizer-field">
          Capacity
          <input
            required
            type="number"
            min="1"
            step="1"
            value={form.capacity}
            onChange={(e) =>
              setForm({ ...form, capacity: Number(e.target.value) })
            }
          />
        </label>
        <label className="organizer-field" style={{ gridColumn: "1 / -1" }}>
          Description
          <textarea
            rows={3}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        {formError && (
          <p
            role="alert"
            style={{ gridColumn: "1 / -1", color: "var(--rust)" }}
          >
            {formError}
          </p>
        )}
        <div style={{ gridColumn: "1 / -1", display: "flex", gap: 8 }}>
          <button className="btn btn-primary" type="submit">
            {editingId ? "Save changes" : "Create event"}
          </button>
          {editingId && (
            <button
              className="btn btn-secondary"
              type="button"
              onClick={startCreate}
            >
              Stop editing
            </button>
          )}
        </div>
      </form>

      {myEvents.length === 0 ? (
        <EmptyState
          title="No events posted yet"
          description="Once you create an event, it'll show up here."
        />
      ) : (
        <ul style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {myEvents.map((event) => {
            const status = event.cancelled
              ? "cancelled"
              : isRegistrationClosed(event)
                ? "closed"
                : event.seatsAvailable <= 0
                ? "full"
                : "open";
            return (
              <li
                key={event.id}
                className="card-surface"
                style={{
                  padding: "18px 20px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 16,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <Link
                    href={`/events/${event.id}`}
                    style={{
                      fontFamily: "var(--font-display)",
                      fontWeight: 600,
                      fontSize: 17,
                      textDecoration: "none",
                    }}
                  >
                    {event.name}
                  </Link>
                  <div
                    style={{
                      fontSize: 13.5,
                      color: "var(--ink-soft)",
                      marginTop: 4,
                    }}
                  >
                    {new Date(event.date).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    · {event.venue} · {event.seatsAvailable}/{event.capacity}{" "}
                    seats
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <StatusBadge status={status} />
                  {!event.cancelled && (
                    <>
                      <button
                        className="btn btn-secondary"
                        onClick={() => startEdit(event)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-secondary"
                        onClick={() => handleCancel(event)}
                      >
                        Cancel event
                      </button>
                    </>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
