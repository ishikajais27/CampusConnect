'use client'

import { useState } from 'react'
import Link from 'next/link'
import { getEventById, isPastEvent, isFullEvent } from '@/data/events'
import { registrations, Registration } from '@/data/registrations'
import { useAuth } from '@/components/AuthProvider'

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function EventDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const { currentUser } = useAuth()
  const event = getEventById(params.id)
  
  // Local state for optimistic updates
  const [seatsAvailable, setSeatsAvailable] = useState(event?.seatsAvailable || 0)
  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  if (!event) {
    return (
      <section className="w-full max-w-[1320px] mx-auto px-margin-mobile lg:px-margin py-space-xl">
        <div className="w-full max-w-xl mx-auto py-space-xl text-center space-y-space-md">
          <div className="w-20 h-20 mx-auto rounded-full bg-surface-container-high flex items-center justify-center text-primary shadow-sm">
            <span className="material-symbols-outlined text-[36px]">history_edu</span>
          </div>
          <div className="space-y-space-xs">
            <h3 className="font-headline-md text-headline-md text-on-surface">
              This event isn't on the board
            </h3>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto leading-relaxed">
              It may have been removed, or the link might be wrong. Head back to the full listing to find what you're looking for.
            </p>
          </div>
          <div className="pt-space-sm flex items-center justify-center gap-space-md">
            <Link
              href="/events"
              className="inline-flex items-center gap-space-xs px-space-lg py-2.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-label-md text-label-md transition-colors shadow-sm"
            >
              Back to events
            </Link>
          </div>
        </div>
      </section>
    )
  }

  const past = isPastEvent(event)
  const full = seatsAvailable <= 0
  const status = event.cancelled ? 'cancelled' : past ? 'past' : full ? 'full' : 'open'
  
  const isStudent = currentUser?.role === 'student'
  
  // Check if already registered
  const existingReg = registrations.find(
    r => r.studentId === currentUser?.id && r.eventId === event.id && r.status === 'confirmed'
  )
  
  const canRegister = isStudent && !past && !full && !event.cancelled && !existingReg

  const handleRegister = () => {
    setErrorMsg('')
    setSuccessMsg('')
    
    if (!isStudent) {
      setErrorMsg('Only students can register for events.')
      return
    }
    
    if (existingReg) {
      setErrorMsg('You are already registered for this event.')
      return
    }
    
    if (full || event.cancelled || past) {
      setErrorMsg('Registration is not available for this event.')
      return
    }

    // Task 2: Push new registration and update seats
    const newReg: Registration = {
      id: `reg-${Date.now()}`,
      eventId: event.id,
      studentId: currentUser.id,
      status: 'confirmed',
      registeredAt: new Date().toISOString()
    }
    
    registrations.push(newReg)
    event.seatsAvailable -= 1
    setSeatsAvailable(event.seatsAvailable)
    
    setSuccessMsg('Successfully registered! View your ticket in My Registrations.')
  }

  return (
    <section className="w-full max-w-[1320px] mx-auto px-margin-mobile lg:px-margin py-space-xl">
      <Link
        href="/events"
        className="inline-flex items-center gap-1 font-label-md text-label-md text-primary hover:text-primary-container transition-colors"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        <span>All Assemblages</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-[1.6fr_1fr] gap-space-xl mt-space-lg">
        <div className="space-y-space-md">
          <span className="font-label-caps text-label-caps uppercase text-on-surface-variant tracking-wider bg-surface-container-high px-2 py-0.5 rounded">
            {event.category}
          </span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight leading-[1.08]">
            {event.name}
          </h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">
            {event.description}
          </p>
        </div>

        <aside className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-md h-fit">
          <div className="flex items-center justify-between">
            <span className="font-title-md text-title-md text-on-surface">Details</span>
            {status === 'open' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container text-secondary font-label-md text-label-md">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary" />
                <span>Open</span>
              </span>
            )}
            {status === 'full' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-label-md text-label-md">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                <span>At Capacity</span>
              </span>
            )}
            {status === 'past' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-container text-tertiary font-label-md text-label-md">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                <span>Past</span>
              </span>
            )}
            {status === 'cancelled' && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-error-container text-error font-label-md text-label-md font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-error" />
                <span>Cancelled</span>
              </span>
            )}
          </div>
          
          <div className="w-full border-t border-dashed border-outline-variant/60" />

          <div className="space-y-space-sm">
            <div className="flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-[20px] text-tertiary shrink-0">calendar_today</span>
              <div>
                <div className="font-caption text-caption text-tertiary">Date</div>
                <div className="font-body-md text-body-md text-on-surface">{formatDate(event.date)}</div>
              </div>
            </div>
            <div className="flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-[20px] text-tertiary shrink-0">schedule</span>
              <div>
                <div className="font-caption text-caption text-tertiary">Time</div>
                <div className="font-body-md text-body-md text-on-surface">{formatTime(event.date)}</div>
              </div>
            </div>
            <div className="flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-[20px] text-tertiary shrink-0">location_on</span>
              <div>
                <div className="font-caption text-caption text-tertiary">Venue</div>
                <div className="font-body-md text-body-md text-on-surface">{event.venue}</div>
              </div>
            </div>
            <div className="flex items-start gap-space-sm">
              <span className="material-symbols-outlined text-[20px] text-tertiary shrink-0">chair</span>
              <div>
                <div className="font-caption text-caption text-tertiary">Capacity</div>
                <div className="font-body-md text-body-md text-on-surface">
                  {seatsAvailable} of {event.capacity} seats remaining
                </div>
              </div>
            </div>
          </div>

          <div className="pt-space-sm">
            {errorMsg && (
              <div className="mb-3 p-2 bg-error-container/40 text-error font-caption text-caption rounded">
                {errorMsg}
              </div>
            )}
            {successMsg && (
              <div className="mb-3 p-2 bg-secondary-container/40 text-secondary font-caption text-caption rounded">
                {successMsg}
              </div>
            )}
            
            {!isStudent ? (
              <p className="font-caption text-caption text-tertiary italic text-center">
                Only students can register for events. Switch your role to test.
              </p>
            ) : existingReg ? (
              <div className="w-full text-center py-2.5 rounded-lg bg-surface-container text-tertiary font-label-md text-label-md flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-[18px]">check_circle</span>
                You are registered
              </div>
            ) : (
              <button
                onClick={handleRegister}
                disabled={!canRegister}
                className={`w-full inline-flex justify-center items-center gap-1 px-space-md py-2.5 rounded-lg font-label-md text-label-md transition-all shadow-sm ${
                  canRegister 
                    ? 'bg-primary hover:bg-primary-container text-on-primary'
                    : 'bg-surface-container text-tertiary cursor-not-allowed'
                }`}
              >
                {canRegister
                  ? 'Register Now'
                  : status === 'full'
                    ? 'Event Full'
                    : 'Registration Closed'}
              </button>
            )}
          </div>
        </aside>
      </div>
    </section>
  )
}
