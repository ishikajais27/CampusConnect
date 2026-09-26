'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { getRegistrationsForStudent, Registration } from '@/data/registrations'
import { getEventById, isPastEvent, CampusEvent } from '@/data/events'
import EmptyState from '@/components/EmptyState'

function formatEventDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function RegistrationsPage() {
  const { currentUser } = useAuth()
  // Force re-render on cancel
  const [nonce, setNonce] = useState(0)

  if (currentUser.role !== 'student') {
    return (
      <section className="w-full max-w-[1320px] mx-auto px-margin-mobile lg:px-margin py-space-xl">
        <EmptyState
          title="This page is for students"
          description="Switch to a student account from the top-right menu to see registered events."
        />
      </section>
    )
  }

  const allRegs = getRegistrationsForStudent(currentUser.id)

  const handleCancel = (reg: Registration, event: CampusEvent) => {
    if (reg.status === 'cancelled') return
    reg.status = 'cancelled'
    event.seatsAvailable += 1
    setNonce(n => n + 1)
  }

  // Filter and split
  const activeRegs = allRegs.filter(r => r.status === 'confirmed')
  
  const upcomingRegs = activeRegs.filter(reg => {
    const event = getEventById(reg.eventId)
    return event && !isPastEvent(event) && !event.cancelled
  })
  
  const pastRegs = activeRegs.filter(reg => {
    const event = getEventById(reg.eventId)
    return event && (isPastEvent(event) || event.cancelled)
  })

  const cancelledRegs = allRegs.filter(r => r.status === 'cancelled')

  return (
    <section className="w-full max-w-[1320px] mx-auto px-margin-mobile lg:px-margin py-space-xl">
      <div className="mb-space-xl">
        <span className="font-label-caps text-label-caps uppercase text-primary tracking-widest font-semibold">
          SIGNED UP AS {currentUser.name.toUpperCase()}
        </span>
        <h1 className="font-display text-display text-on-surface tracking-tight mt-1">
          My Registrations
        </h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl leading-relaxed mt-space-xs">
          Passbook and schedule of all your confirmed academic assemblies and collegiate fixtures.
        </p>
      </div>

      {activeRegs.length === 0 && cancelledRegs.length === 0 ? (
        <EmptyState
          title="No registrations yet"
          description="Once you register for an event, your passbook will show up here."
          action={
            <Link href="/events" className="btn btn-primary">
              Browse events
            </Link>
          }
        />
      ) : (
        <div className="space-y-space-xl">
          {/* Upcoming Section */}
          <div>
            <h2 className="font-title-md text-title-md text-on-surface mb-space-md border-b border-outline-variant/60 pb-2">
              Upcoming Gatherings
            </h2>
            {upcomingRegs.length === 0 ? (
              <p className="font-body-md text-body-md text-on-surface-variant italic">
                No upcoming confirmed registrations.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-space-md">
                {upcomingRegs.map((reg) => {
                  const event = getEventById(reg.eventId)
                  if (!event) return null
                  return (
                    <div key={reg.id} className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col justify-between gap-space-md hover:shadow-md transition-shadow">
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider bg-surface-container-high px-2 py-0.5 rounded">
                            {event.category}
                          </span>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-secondary font-label-md text-label-md">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                            Confirmed
                          </span>
                        </div>
                        <Link href={`/events/${event.id}`} className="font-headline-sm text-headline-sm text-on-surface hover:text-primary transition-colors">
                          {event.name}
                        </Link>
                        <div className="font-body-sm text-body-sm text-on-surface-variant mt-2 flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-tertiary">calendar_today</span>
                            <span>{formatEventDate(event.date)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px] text-tertiary">location_on</span>
                            <span>{event.venue}</span>
                          </div>
                        </div>
                      </div>
                      <div className="pt-space-sm border-t border-dashed border-outline-variant/60 flex items-center justify-between">
                        <span className="font-caption text-caption text-tertiary">Pass No. {reg.id.replace('reg-', '')}</span>
                        <button
                          onClick={() => handleCancel(reg, event)}
                          className="inline-flex items-center gap-1 px-space-md py-1.5 rounded bg-surface-container hover:bg-error-container hover:text-error text-on-surface-variant font-label-md text-label-md transition-colors shadow-sm"
                        >
                          Cancel Pass
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Past / Cancelled Events Section */}
          {(pastRegs.length > 0 || cancelledRegs.length > 0) && (
            <div>
              <h2 className="font-title-md text-title-md text-on-surface mb-space-md border-b border-outline-variant/60 pb-2">
                Past & Cancelled
              </h2>
              <div className="flex flex-col gap-space-sm">
                {[...pastRegs, ...cancelledRegs].map((reg) => {
                  const event = getEventById(reg.eventId)
                  if (!event) return null
                  const isCancelled = reg.status === 'cancelled'
                  return (
                    <div key={reg.id} className="bg-surface-container-low/70 rounded-xl p-space-md flex flex-col sm:flex-row sm:items-center justify-between gap-space-md">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {isCancelled ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-error-container text-error font-caption text-caption font-semibold">
                              Cancelled Pass
                            </span>
                          ) : event.cancelled ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-error-container text-error font-caption text-caption font-semibold">
                              Event Cancelled
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-tertiary font-caption text-caption font-medium">
                              Past Assembly
                            </span>
                          )}
                          <span className="font-caption text-caption text-tertiary uppercase">{event.category}</span>
                        </div>
                        <Link href={`/events/${event.id}`} className="font-title-md text-title-md text-on-surface/80 hover:text-on-surface transition-colors">
                          {event.name}
                        </Link>
                        <div className="font-caption text-caption text-on-surface-variant/80 mt-1">
                          {formatEventDate(event.date)} · {event.venue}
                        </div>
                      </div>
                      <Link
                        href={`/events/${event.id}`}
                        className="inline-flex justify-center items-center gap-1 px-space-md py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-high text-on-surface font-label-md text-label-md transition-colors shadow-sm"
                      >
                        View Record
                      </Link>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}
