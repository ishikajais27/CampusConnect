'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  events as initialEvents,
  EventCategory,
  searchEventsByName,
  filterEventsByCategory,
  isPastEvent,
  CampusEvent,
} from '@/data/events'
import EventCard from '@/components/EventCard'
import EmptyState from '@/components/EmptyState'

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
  const [allEvents, setAllEvents] = useState<CampusEvent[]>(initialEvents)
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<EventCategory | 'All'>('All')

  useEffect(() => {
    fetch('/api/events?includeCancelled=false&includePast=false')
      .then((res) => res.json())
      .then((data) => {
        if (data.events) {
          setAllEvents(data.events)
        }
      })
      .catch(() => {})
  }, [])

  // Hide past events and cancelled events from student listing
  const upcomingEvents = useMemo(() => {
    return allEvents.filter((event) => !isPastEvent(event) && !event.cancelled)
  }, [allEvents])

  // Compose category filter and search together
  const visibleEvents = useMemo(() => {
    const categoryFiltered = filterEventsByCategory(upcomingEvents, category)
    return searchEventsByName(categoryFiltered, query)
  }, [upcomingEvents, category, query])

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
        style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}
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
          onChange={(e) => setCategory(e.target.value as EventCategory | 'All')}
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

      {visibleEvents.length === 0 ? (
        <EmptyState
          title="No events found"
          description={
            query || category !== 'All'
              ? 'No upcoming events matched your search and filter criteria. Try clearing your filters.'
              : 'There are currently no upcoming events posted.'
          }
          action={
            query || category !== 'All' ? (
              <button
                className="btn btn-secondary"
                onClick={() => {
                  setQuery('')
                  setCategory('All')
                }}
              >
                Clear filters
              </button>
            ) : undefined
          }
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {visibleEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </section>
  )
}
