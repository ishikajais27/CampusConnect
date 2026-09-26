'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { events, EventCategory, CampusEvent, isPastEvent, isFullEvent, searchEventsByName, filterEventsByCategory } from '@/data/events'

// Category mapping from our data model → Stitch display categories
const CATEGORY_MAP: Record<EventCategory | 'All', string> = {
  'All': 'all',
  'Tech': 'academic',
  'Cultural': 'social',
  'Sports': 'athletics',
  'Workshop': 'academic',
  'Career': 'career',
  'Music': 'arts',
}

const DISPLAY_CATEGORIES = [
  { key: 'all', label: 'All Assemblages' },
  { key: 'academic', label: 'Academic & Science' },
  { key: 'arts', label: 'Arts & Salons' },
  { key: 'career', label: 'Career & Guild' },
  { key: 'social', label: 'Social Gatherings' },
  { key: 'athletics', label: 'Athletics & Fixtures' },
]

// Guild/society names per category for richer display
const GUILD_NAMES: Record<EventCategory, string> = {
  'Tech': 'Computing Guild',
  'Cultural': 'Cultural Committee',
  'Sports': 'Varsity Athletics',
  'Workshop': 'Academic Society',
  'Career': 'Life Sciences Innovation Forum',
  'Music': 'Philharmonia Society',
}

function formatEventDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }) + ' • ' + d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
  }) + ' IST'
}

function getCapacityPercent(event: CampusEvent) {
  return Math.round(((event.capacity - event.seatsAvailable) / event.capacity) * 100)
}

function getDisplayCategory(event: CampusEvent): string {
  return CATEGORY_MAP[event.category] || 'academic'
}

type SortMode = 'date-asc' | 'date-desc' | 'seats' | 'title'

function sortEvents(eventList: CampusEvent[], mode: SortMode): CampusEvent[] {
  return [...eventList].sort((a, b) => {
    if (mode === 'date-asc') return new Date(a.date).getTime() - new Date(b.date).getTime()
    if (mode === 'date-desc') return new Date(b.date).getTime() - new Date(a.date).getTime()
    if (mode === 'seats') return b.seatsAvailable - a.seatsAvailable
    if (mode === 'title') return a.name.localeCompare(b.name)
    return 0
  })
}

interface EventCardProps {
  event: CampusEvent
}

function EventArticleCard({ event }: EventCardProps) {
  const past = isPastEvent(event)
  const full = isFullEvent(event)
  const status: 'open' | 'full' | 'past' | 'cancelled' = event.cancelled
    ? 'cancelled'
    : past ? 'past'
      : full ? 'full'
        : 'open'

  const capacityPct = getCapacityPercent(event)
  const displayCat = getDisplayCategory(event)

  const CATEGORY_LABELS: Record<string, string> = {
    academic: 'ACADEMIC & SCIENCE',
    arts: 'ARTS & SALONS',
    career: 'CAREER & GUILD',
    social: 'SOCIAL',
    athletics: 'ATHLETICS',
  }

  const statusBadge = {
    open: (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-secondary font-label-md text-label-md">
        <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
        <span>Open</span>
      </span>
    ),
    full: (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-label-md text-label-md">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
        <span>At Capacity</span>
      </span>
    ),
    past: (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container text-tertiary font-label-md text-label-md">
        <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
        <span>Past Assembly</span>
      </span>
    ),
    cancelled: (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-error-container text-error font-label-md text-label-md font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-error" />
        <span>Cancelled</span>
      </span>
    ),
  }

  const barColor = {
    open: 'bg-secondary',
    full: 'bg-amber-600',
    past: 'bg-tertiary',
    cancelled: 'bg-error',
  }

  const isDisabled = status === 'cancelled' || status === 'past'
  const articleClass = event.cancelled
    ? 'event-card group relative bg-surface-container-low/70 opacity-80 rounded-xl p-space-lg flex flex-col justify-between shadow-sm transition-all duration-200'
    : 'event-card group relative bg-surface-container-lowest rounded-xl p-space-lg flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200'

  return (
    <article className={articleClass}>
      <div className="space-y-space-md">
        {/* Header: Category & Status Badge */}
        <div className="flex items-center justify-between gap-space-xs">
          <span className={`font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider px-2 py-0.5 rounded ${event.cancelled ? 'bg-surface-container' : 'bg-surface-container-high'}`}>
            {CATEGORY_LABELS[displayCat] || event.category.toUpperCase()}
          </span>
          {statusBadge[status]}
        </div>

        {/* Archival Dashed Divider */}
        <div className="relative py-1">
          <div className="w-full border-t border-dashed border-outline-variant/60" />
          <span className={`absolute right-0 -top-2 pl-1 font-caption text-caption text-tertiary ${event.cancelled ? 'bg-surface-container-low' : 'bg-surface-container-lowest'}`}>
            {status === 'past' ? 'Record' : status === 'cancelled' ? 'Notice' : status === 'full' ? 'Recital' : 'No.' + event.id.replace('evt-', '')}
          </span>
        </div>

        {/* Title & Guild */}
        <div>
          <p className={`font-caption text-caption font-medium tracking-wide pb-0.5 ${status === 'cancelled' || status === 'past' ? 'text-tertiary' : 'text-secondary'}`}>
            {GUILD_NAMES[event.category]}
          </p>
          <h2 className={`font-headline-sm text-headline-sm text-on-surface leading-tight ${event.cancelled ? 'line-through decoration-tertiary/40 text-on-surface/75' : 'group-hover:text-primary transition-colors'}`}>
            {event.name}
          </h2>
        </div>

        {/* Cancellation Banner */}
        {event.cancelled && (
          <div className="p-space-sm bg-error-container/40 rounded-lg flex items-start gap-2">
            <span className="material-symbols-outlined text-error text-[18px] shrink-0 mt-0.5">warning</span>
            <p className="font-caption text-caption text-error font-medium leading-relaxed">
              This event has been cancelled. Please check for rescheduling notices.
            </p>
          </div>
        )}

        {/* Metadata Cluster */}
        <div className={`space-y-space-xs font-body-sm text-body-sm pt-space-xs ${event.cancelled ? 'text-on-surface-variant/70' : 'text-on-surface-variant'}`}>
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[18px] text-tertiary shrink-0">calendar_today</span>
            <span>{formatEventDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-space-xs">
            <span className="material-symbols-outlined text-[18px] text-tertiary shrink-0">location_on</span>
            <span>{event.venue}</span>
          </div>
          {status === 'open' && (
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[18px] text-tertiary shrink-0">chair</span>
              <span className="text-secondary font-medium">{event.seatsAvailable} seats remaining</span>
              <span className="text-tertiary text-caption">(of {event.capacity} total)</span>
            </div>
          )}
          {status === 'full' && (
            <div className="flex items-center gap-space-xs">
              <span className="material-symbols-outlined text-[18px] text-amber-700 shrink-0">hourglass_top</span>
              <span className="text-amber-800 font-medium">0 seats remaining</span>
              <span className="text-tertiary text-caption">(Waitlist open)</span>
            </div>
          )}
          {status === 'past' && (
            <div className="flex items-center gap-space-xs text-tertiary">
              <span className="material-symbols-outlined text-[18px] shrink-0">check_circle</span>
              <span>Event concluded • {event.capacity - event.seatsAvailable} Attendees recorded</span>
            </div>
          )}
        </div>

        {/* Past archive note */}
        {status === 'past' && (
          <div className="p-space-xs bg-surface-container-low rounded font-caption text-caption text-tertiary italic">
            Records archived in the campus repository.
          </div>
        )}

        {/* Capacity Progress Bar */}
        {(status === 'open' || status === 'full') && (
          <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${barColor[status]}`}
              style={{ width: `${capacityPct}%` }}
            />
          </div>
        )}
      </div>

      {/* Card Footer Action */}
      <div className="pt-space-lg flex items-center justify-between gap-space-sm mt-auto">
        <span className="font-label-caps text-label-caps text-tertiary uppercase">
          {event.category}
        </span>
        {status === 'open' && (
          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center gap-1 px-space-md py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-all shadow-sm group-hover:translate-x-0.5"
          >
            <span>View Details</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </Link>
        )}
        {status === 'full' && (
          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center gap-1 px-space-md py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px] text-amber-700">playlist_add</span>
            <span>Join Waitlist</span>
          </Link>
        )}
        {status === 'past' && (
          <Link
            href={`/events/${event.id}`}
            className="inline-flex items-center gap-1 font-label-md text-label-md text-primary hover:text-primary-container transition-colors py-2"
          >
            <span className="material-symbols-outlined text-[18px]">library_books</span>
            <span className="underline underline-offset-4">Read Proceedings</span>
          </Link>
        )}
        {status === 'cancelled' && (
          <button
            type="button"
            disabled
            className="inline-flex items-center gap-1 px-space-md py-2 rounded-lg bg-surface-container text-tertiary font-label-md text-label-md cursor-not-allowed"
          >
            <span>Archived</span>
          </button>
        )}
      </div>
    </article>
  )
}

export default function EventsPage() {
  const [query, setQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')
  const [onlyAvailable, setOnlyAvailable] = useState(false)
  const [sortMode, setSortMode] = useState<SortMode>('date-asc')

  const filteredEvents = useMemo(() => {
    let result = searchEventsByName(events, query)

    // Filter by display category (mapped from our data categories)
    if (activeCategory !== 'all') {
      result = result.filter(e => getDisplayCategory(e) === activeCategory)
    }

    // Filter only available seats
    if (onlyAvailable) {
      result = result.filter(e => !e.cancelled && !isPastEvent(e) && e.seatsAvailable > 0)
    }

    return sortEvents(result, sortMode)
  }, [query, activeCategory, onlyAvailable, sortMode])

  return (
    <>
      {/* Page Header & Collegiate Breadcrumb */}
      <section className="w-full bg-surface-container-low/60 pb-space-lg">
        <div className="max-w-[1320px] mx-auto px-margin-mobile lg:px-margin pt-space-lg">
          {/* Top Micro-bar */}
          <div className="flex flex-wrap items-center justify-between gap-space-sm pb-space-md text-on-surface-variant font-label-caps text-label-caps uppercase tracking-widest">
            <div className="flex items-center gap-space-sm">
              <span className="inline-block w-2 h-2 rounded-full bg-primary" />
              <span>MICHAELMAS TERM 2026 • VOL. LXXIV</span>
              <span className="text-tertiary">/</span>
              <span className="text-tertiary">ISSUE 08</span>
            </div>
            <div className="flex items-center gap-space-md">
              <span className="inline-flex items-center gap-1 font-caption text-caption lowercase text-on-surface-variant/80">
                <span className="material-symbols-outlined text-[14px]">auto_stories</span>
                curated campus chronicle
              </span>
              <span className="bg-surface-container px-2 py-0.5 rounded text-tertiary">CIRCULATION 4,200</span>
            </div>
          </div>

          {/* Main Editorial Title Block */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg pb-space-lg">
            <div className="max-w-3xl space-y-space-xs">
              <p className="font-label-caps text-label-caps text-primary uppercase tracking-[0.14em] font-semibold">
                DISPATCH &amp; GATHERINGS
              </p>
              <h1 className="font-display text-display text-on-surface tracking-tight leading-[1.08]">
                Campus Discoveries &amp; Assemblages
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant pt-space-xs max-w-2xl leading-relaxed">
                Curated lectures, creative salons, research symposia, and athletic fixtures across collegiate societies and research foundations.
              </p>
            </div>

            {/* Metric stamp & Sort pill */}
            <div className="flex flex-row lg:flex-col items-start lg:items-end justify-between gap-space-sm shrink-0">
              <div className="inline-flex items-center gap-space-xs bg-surface-container px-space-md py-space-xs rounded-lg shadow-sm">
                <span className="material-symbols-outlined text-secondary text-[18px]">event_available</span>
                <span className="font-title-md text-title-md text-on-surface">{filteredEvents.length}</span>
                <span className="font-label-md text-label-md text-on-surface-variant">Events in Gazette</span>
              </div>
              <div className="relative inline-flex items-center bg-surface-container-lowest px-space-sm py-1 rounded-lg shadow-sm">
                <span className="font-label-caps text-label-caps text-tertiary uppercase pl-space-xs pr-1">Sort:</span>
                <select
                  aria-label="Sort events"
                  value={sortMode}
                  onChange={e => setSortMode(e.target.value as SortMode)}
                  className="appearance-none bg-transparent font-label-md text-label-md text-on-surface pr-6 pl-1 py-1 focus:outline-none cursor-pointer"
                >
                  <option value="date-asc">Date (Earliest First)</option>
                  <option value="date-desc">Date (Latest First)</option>
                  <option value="seats">Available Capacity</option>
                  <option value="title">Alphabetical (A-Z)</option>
                </select>
                <span className="material-symbols-outlined text-tertiary text-[18px] pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                  unfold_more
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sticky Filter Bar */}
      <section className="w-full bg-surface py-space-md sticky top-20 z-30 backdrop-blur-md bg-surface/95 shadow-sm">
        <div className="max-w-[1320px] mx-auto px-margin-mobile lg:px-margin space-y-space-md">
          {/* Search Row */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-space-md">
            <div className="relative flex-1 group">
              <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-tertiary text-[20px] group-focus-within:text-primary transition-colors">
                search
              </span>
              <input
                type="text"
                placeholder="Search by event title, society, hall, or speaker..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="w-full bg-surface-container-lowest text-on-surface placeholder:text-outline font-label-md text-label-md pl-11 pr-24 py-2.5 rounded-lg shadow-sm focus:outline-none focus:bg-surface-container-lowest transition-all"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear Search"
                  onClick={() => setQuery('')}
                  className="absolute right-space-sm top-1/2 -translate-y-1/2 text-tertiary hover:text-on-surface p-1"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              )}
              {!query && (
                <div className="absolute right-space-sm top-1/2 -translate-y-1/2 pointer-events-none">
                  <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded bg-surface-container text-tertiary font-label-caps text-label-caps">
                    ⌘K
                  </kbd>
                </div>
              )}
            </div>
          </div>

          {/* Category Chips & Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md pt-space-xs">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
              {DISPLAY_CATEGORIES.map(cat => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={`shrink-0 px-space-md py-1.5 rounded-full font-label-md text-label-md transition-all duration-150 ${
                    activeCategory === cat.key
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-space-lg text-on-surface-variant text-caption font-caption">
              <label className="inline-flex items-center gap-2 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={onlyAvailable}
                  onChange={e => setOnlyAvailable(e.target.checked)}
                  className="w-4 h-4 rounded-sm accent-primary focus:ring-0 cursor-pointer"
                />
                <span className="font-label-md text-label-md text-on-surface group-hover:text-primary transition-colors">
                  Only available seats
                </span>
              </label>
              <div className="hidden xl:flex items-center gap-space-md text-tertiary">
                <span className="font-label-caps text-label-caps uppercase text-tertiary">Key:</span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-secondary" /> Open
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-600" /> Full
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-tertiary" /> Past
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-error" /> Cancelled
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Event Cards Grid */}
      <section className="w-full py-space-xl">
        <div className="max-w-[1320px] mx-auto px-margin-mobile lg:px-margin">
          {filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg items-stretch">
              {filteredEvents.map(event => (
                <EventArticleCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="w-full max-w-xl mx-auto py-space-xl text-center space-y-space-md">
              <div className="w-20 h-20 mx-auto rounded-full bg-surface-container-high flex items-center justify-center text-primary shadow-sm">
                <span className="material-symbols-outlined text-[36px]">history_edu</span>
              </div>
              <div className="space-y-space-xs">
                <p className="font-label-caps text-label-caps uppercase text-primary tracking-widest font-semibold">
                  ✦ NO MATCHING GATHERINGS FOUND ✦
                </p>
                <h3 className="font-headline-md text-headline-md text-on-surface">
                  The Archival Ledger is Silent
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto leading-relaxed">
                  No assemblies correspond with your current query. Try adjusting your search query, or clear your filter to view the broader term itinerary.
                </p>
              </div>
              <div className="pt-space-sm flex items-center justify-center gap-space-md">
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setActiveCategory('all')
                    setOnlyAvailable(false)
                  }}
                  className="inline-flex items-center gap-space-xs px-space-lg py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-[18px]">filter_alt_off</span>
                  <span>Clear Filters &amp; Reset View</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Collegiate Society Dispatch Bulletin */}
      <section className="w-full bg-surface-container-low py-space-xl">
        <div className="max-w-[1320px] mx-auto px-margin-mobile lg:px-margin">
          <div className="bg-surface-container-lowest rounded-xl p-space-lg md:p-space-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-space-lg">
            <div className="space-y-space-xs max-w-2xl">
              <div className="flex items-center gap-space-xs text-secondary font-label-caps text-label-caps uppercase tracking-wider">
                <span className="material-symbols-outlined text-[16px]">campaign</span>
                <span>COLLEGIATE SOCIETY NOTICE</span>
              </div>
              <h2 className="font-headline-md text-headline-md text-on-surface">
                Are You Convening an Academic Society Assembly?
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Registered guild officers and university fellows may petition for collegiate lecture halls, submit term gazette notifications, or coordinate guest speaker clearances through the unified registry.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-space-sm shrink-0 w-full sm:w-auto">
              <Link
                href="/organizer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-space-lg py-2.5 rounded-lg bg-secondary hover:bg-secondary/90 text-on-secondary font-label-md text-label-md transition-colors shadow-sm"
              >
                <span>Lodge Assembly Request</span>
                <span className="material-symbols-outlined text-[18px]">north_east</span>
              </Link>
              <button
                type="button"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-space-md py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-tertiary">menu_book</span>
                <span>Guidelines</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
