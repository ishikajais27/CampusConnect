'use client'

import Link from 'next/link'
import { events, isPastEvent } from '@/data/events'
import EventCard from '@/components/EventCard'

export default function HomePage() {
  const upcoming = events
    .filter((e) => !isPastEvent(e) && !e.cancelled)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 4)

  const venueCount = new Set(events.map((e) => e.venue)).size
  const upcomingCount = events.filter((e) => !isPastEvent(e)).length

  return (
    <>
      <section className="shell" style={{ padding: '56px 0 40px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1.1fr 0.9fr',
            gap: 40,
            alignItems: 'end',
          }}
          className="hero-grid"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <span className="eyebrow-tag">what's posted this week</span>
            <h1 style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}>
              Every club, match, and workshop on campus — in one place.
            </h1>
            <p style={{ fontSize: 16.5 }}>
              Campus Connect is where student organizations post their events
              and where you register for them. No more scattered WhatsApp
              forwards or half-updated noticeboards.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
              <Link href="/events" className="btn btn-primary">
                Browse events
              </Link>
              <Link href="/organizer" className="btn btn-secondary">
                Post an event
              </Link>
            </div>
          </div>

          <div
            className="card-surface"
            style={{
              padding: 24,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 20,
            }}
          >
            <Stat label="Upcoming events" value={String(upcomingCount)} />
            <Stat label="Campus venues" value={String(venueCount)} />
            <Stat label="Categories" value="6" />
            <Stat
              label="Total seats posted"
              value={String(events.reduce((s, e) => s + e.capacity, 0))}
            />
          </div>
        </div>
      </section>

      <section className="shell" style={{ padding: '24px 0 64px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            marginBottom: 18,
          }}
        >
          <h2 style={{ fontSize: 22 }}>Coming up soon</h2>
          <Link
            href="/events"
            style={{ fontSize: 14, fontWeight: 600, textDecoration: 'none' }}
          >
            See full listing →
          </Link>
        </div>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 16,
          }}
        >
          {upcoming.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontFamily: 'var(--font-display)',
          fontSize: 28,
          fontWeight: 700,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: 13, color: 'var(--ink-soft)' }}>{label}</div>
    </div>
  )
}
