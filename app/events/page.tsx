'use client'

import { useState } from 'react'
import {
  events,
  EventCategory,
  filterEventsByCategory,
  isPastEvent,
  searchEventsByName,
} from '@/data/events'
import EventCard from '@/components/EventCard'

const CATEGORIES: (EventCategory | 'All')[] = [
  'All',
  'Tech',
  'Cultural',
  'Sports',
  'Workshop',
  'Career',
  'Music',
]

export default function EventsPage() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<EventCategory | 'All'>('All')

  // Only show upcoming, non-cancelled events.
  const upcomingEvents = events.filter(
    (event) => !isPastEvent(event) && !event.cancelled,
  )

  // Apply search first, then category filtering.
  // This makes both filters work together.
  const searchedEvents = searchEventsByName(upcomingEvents, query)

  const filteredEvents = filterEventsByCategory(searchedEvents, category)

  return (
    <section className="shell" style={{ padding: '40px 0 64px' }}>
      <div style={{ marginBottom: 28 }}>
        <span className="eyebrow-tag">the board</span>
        <h1 style={{ fontSize: 30, marginTop: 10 }}>All events</h1>
        <p style={{ marginTop: 8 }}>
          Everything posted by clubs and departments this semester.
        </p>
      </div>

      <div
        style={{
          display: 'flex',
          gap: 12,
          flexWrap: 'wrap',
          marginBottom: 24,
        }}
      >
        <input
          type="search"
          placeholder="Search events by name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{
            flex: '1 1 240px',
            padding: '10px 14px',
            border: '1.5px solid var(--line)',
            borderRadius: 'var(--radius)',
            fontSize: 14.5,
            background: 'var(--paper-raised)',
          }}
        />

        <select
          value={category}
          onChange={(e) =>
            setCategory(e.target.value as EventCategory | 'All')
          }
          style={{
            padding: '10px 14px',
            border: '1.5px solid var(--line)',
            borderRadius: 'var(--radius)',
            fontSize: 14.5,
            background: 'var(--paper-raised)',
          }}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c === 'All' ? 'All categories' : c}
            </option>
          ))}
        </select>
      </div>

      <div
        style={{
          marginBottom: 16,
          fontSize: 14,
          color: 'var(--ink-soft)',
        }}
      >
        {filteredEvents.length}{' '}
        {filteredEvents.length === 1 ? 'event' : 'events'} found
      </div>

      {filteredEvents.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div
          className="card-surface"
          style={{
            padding: 40,
            textAlign: 'center',
          }}
        >
          <h2 style={{ fontSize: 20, marginBottom: 8 }}>
            No events found
          </h2>

          <p style={{ color: 'var(--ink-soft)', marginBottom: 18 }}>
            Try changing your search or selecting a different category.
          </p>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => {
              setQuery('')
              setCategory('All')
            }}
          >
            Clear filters
          </button>
        </div>
      )}
    </section>
  )
}
