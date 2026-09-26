import Link from 'next/link'
import { events, isPastEvent } from '@/data/events'

export default function HomePage() {
  const upcoming = events
    .filter((e) => !isPastEvent(e) && !e.cancelled)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 3)

  const upcomingCount = events.filter((e) => !isPastEvent(e) && !e.cancelled).length

  return (
    <>
      {/* Hero Header */}
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

          {/* Editorial Masthead */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-space-lg pb-space-lg">
            <div className="max-w-3xl space-y-space-xs">
              <p className="font-label-caps text-label-caps text-primary uppercase tracking-[0.14em] font-semibold">
                COLLEGIATE GAZETTE &amp; ACADEMIC ASSEMBLIES
              </p>
              <h1 className="font-display text-display text-on-surface tracking-tight leading-[1.08]">
                Campus Connect
              </h1>
              <p className="font-body-lg text-body-lg text-on-surface-variant pt-space-xs max-w-2xl leading-relaxed">
                Every club event, academic lecture, sporting fixture, and creative salon — posted by societies, found by you. No more scattered forwards or half-updated noticeboards.
              </p>
              <div className="flex items-center gap-space-md pt-space-sm">
                <Link
                  href="/events"
                  className="inline-flex items-center gap-space-xs px-space-lg py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-colors shadow-sm"
                >
                  <span>Browse Assemblages</span>
                  <span className="material-symbols-outlined text-[18px]">north_east</span>
                </Link>
                <Link
                  href="/organizer"
                  className="inline-flex items-center gap-space-xs px-space-lg py-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px] text-tertiary">campaign</span>
                  <span>Lodge Assembly Request</span>
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-space-md shrink-0">
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm text-center">
                <div className="font-display text-display text-primary leading-none">{upcomingCount}</div>
                <div className="font-label-md text-label-md text-on-surface-variant mt-1">Upcoming Events</div>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm text-center">
                <div className="font-display text-display text-secondary leading-none">6</div>
                <div className="font-label-md text-label-md text-on-surface-variant mt-1">Categories</div>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm text-center">
                <div className="font-display text-display text-tertiary leading-none">
                  {new Set(events.map(e => e.venue)).size}
                </div>
                <div className="font-label-md text-label-md text-on-surface-variant mt-1">Campus Venues</div>
              </div>
              <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm text-center">
                <div className="font-display text-display text-on-surface leading-none">
                  {events.reduce((s, e) => s + e.capacity, 0)}
                </div>
                <div className="font-label-md text-label-md text-on-surface-variant mt-1">Total Seats</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Coming up section */}
      <section className="w-full py-space-xl">
        <div className="max-w-[1320px] mx-auto px-margin-mobile lg:px-margin">
          <div className="flex items-center justify-between gap-space-md mb-space-lg">
            <div>
              <p className="font-label-caps text-label-caps text-primary uppercase tracking-[0.14em] font-semibold mb-1">
                NEXT IN GAZETTE
              </p>
              <h2 className="font-headline-lg text-headline-lg text-on-surface">
                Coming Up Soon
              </h2>
            </div>
            <Link
              href="/events"
              className="inline-flex items-center gap-space-xs font-label-md text-label-md text-primary hover:text-primary-container transition-colors"
            >
              <span>Full Listing</span>
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-lg">
            {upcoming.map(event => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="group relative bg-surface-container-lowest rounded-xl p-space-lg flex flex-col justify-between shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="space-y-space-md">
                  <div className="flex items-center justify-between gap-space-xs">
                    <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider bg-surface-container-high px-2 py-0.5 rounded">
                      {event.category.toUpperCase()}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-secondary font-label-md text-label-md">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      <span>Open</span>
                    </span>
                  </div>
                  <div className="relative py-1">
                    <div className="w-full border-t border-dashed border-outline-variant/60" />
                  </div>
                  <h2 className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors leading-tight">
                    {event.name}
                  </h2>
                  <div className="space-y-space-xs text-on-surface-variant font-body-sm text-body-sm">
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[18px] text-tertiary shrink-0">calendar_today</span>
                      <span>{new Date(event.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="flex items-center gap-space-xs">
                      <span className="material-symbols-outlined text-[18px] text-tertiary shrink-0">location_on</span>
                      <span>{event.venue}</span>
                    </div>
                  </div>
                </div>
                <div className="pt-space-lg flex items-center justify-end gap-space-sm mt-auto">
                  <span className="inline-flex items-center gap-1 font-label-md text-label-md text-primary transition-all group-hover:translate-x-0.5">
                    <span>View Details</span>
                    <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
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
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
