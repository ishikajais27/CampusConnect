'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { events, CampusEvent, EventCategory } from '@/data/events'
import EmptyState from '@/components/EmptyState'

function formatEventMonth(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', { month: 'short' }).toUpperCase()
}

function formatEventDay(iso: string) {
  const d = new Date(iso)
  return String(d.getDate()).padStart(2, '0')
}

function formatEventTimeRange(iso: string) {
  const d = new Date(iso)
  const end = new Date(d.getTime() + 2 * 60 * 60 * 1000) // Assumed 2 hours
  const formatTime = (date: Date) => date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: false })
  return `${formatTime(d)} - ${formatTime(end)}`
}

export default function OrganizerPage() {
  const { currentUser } = useAuth()
  const [nonce, setNonce] = useState(0)

  const [editingEvent, setEditingEvent] = useState<CampusEvent | null>(null)
  
  const formRef = useRef<HTMLDivElement>(null)
  
  // Local state for forms
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState<EventCategory>('Academic' as any)
  const [venue, setVenue] = useState('Margaret Mead Auditorium')
  const [dateTime, setDateTime] = useState('')
  const [capacity, setCapacity] = useState('50')
  const [description, setDescription] = useState('')
  const [toastMsg, setToastMsg] = useState('')

  useEffect(() => {
    // Set default date for new event
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(14, 0, 0, 0)
    
    // adjust timezone offset to get correct local time string for input
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(tomorrow.getTime() - tzoffset)).toISOString().slice(0, 16);
    setDateTime(localISOTime)
  }, [])

  if (currentUser.role !== 'organizer') {
    return (
      <section className="w-full max-w-[1320px] mx-auto px-margin-mobile lg:px-margin py-space-xl">
        <EmptyState
          title="This page is for organizers"
          description="Switch to an organizer account from the top-right menu to manage events."
        />
      </section>
    )
  }

  const myEvents = events.filter((e) => e.organizerId === currentUser.id).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  const totalEvents = myEvents.length
  const totalRegistrations = myEvents.reduce((acc, e) => acc + (e.capacity - e.seatsAvailable), 0)
  const totalCapacity = myEvents.reduce((acc, e) => acc + e.capacity, 0)
  const avgAttendance = totalCapacity === 0 ? 0 : ((totalRegistrations / totalCapacity) * 100).toFixed(1)
  const totalSeatsRemaining = totalCapacity - totalRegistrations

  const handleCancelEvent = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to cancel "${name}"?\n\nThis will revoke event listing from the student feed.`)) {
      const event = events.find(e => e.id === id)
      if (event) {
        event.cancelled = true
        setNonce(n => n + 1)
      }
    }
  }

  const handleEditClick = (event: CampusEvent) => {
    setEditingEvent(event)
    setTitle(event.name)
    setCategory(event.category)
    setVenue(event.venue)
    setCapacity(event.capacity.toString())
    setDescription(event.description || '')
    
    // format date for input
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    const localISOTime = (new Date(new Date(event.date).getTime() - tzoffset)).toISOString().slice(0, 16);
    setDateTime(localISOTime)

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleCreateNew = () => {
    setEditingEvent(null)
    setTitle('')
    setCapacity('50')
    setDescription('')
    
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(14, 0, 0, 0)
    const tzoffset = (new Date()).getTimezoneOffset() * 60000;
    setDateTime((new Date(tomorrow.getTime() - tzoffset)).toISOString().slice(0, 16))

    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 100)
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    const capacityNum = parseInt(capacity, 10)
    
    if (capacityNum < 5 || capacityNum > 1000) {
      alert('Capacity must be between 5 and 1000.')
      return
    }

    if (editingEvent) {
      // Edit
      const evt = events.find(ev => ev.id === editingEvent.id)!
      evt.name = title
      evt.description = description || title
      evt.venue = venue
      evt.category = category
      evt.date = new Date(dateTime).toISOString()
      
      const seatsTaken = evt.capacity - evt.seatsAvailable
      evt.capacity = capacityNum
      evt.seatsAvailable = Math.max(0, capacityNum - seatsTaken)
      
      setEditingEvent(null)
      setToastMsg(`"${title}" has been successfully updated.`)
    } else {
      // Create
      const newEvent: CampusEvent = {
        id: `evt-${Date.now()}`,
        name: title,
        description: description || title,
        date: new Date(dateTime).toISOString(),
        venue,
        category,
        capacity: capacityNum,
        seatsAvailable: capacityNum,
        organizerId: currentUser.id,
        cancelled: false,
      }
      events.push(newEvent)
      setToastMsg(`"${title}" has been successfully published to the live campus feed.`)
    }
    
    // Reset form
    setTitle('')
    setCapacity('50')
    setDescription('')
    
    setTimeout(() => setToastMsg(''), 6000)
    setNonce(n => n + 1)
  }

  return (
    <>
      {/* Editorial Studio Header */}
      <section className="w-full bg-canvas-cream border-b border-divider-hairline">
        <div className="max-w-7xl mx-auto px-gutter py-space-lg flex flex-col md:flex-row md:items-end justify-between gap-space-md">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-meta-caps text-meta-caps text-cocoa-sand uppercase tracking-widest">Office of Technical Initiatives</span>
              <span className="text-cocoa-sand text-xs">·</span>
              <span className="font-label-sm text-label-sm text-cocoa-sand">{currentUser.name}</span>
            </div>
            <h1 className="font-display-hero text-headline-lg md:text-display-hero text-primary font-semibold tracking-tight">
              Organizer Studio
            </h1>
            <p className="font-body-md text-body-md text-cocoa-sand">
              Curate gatherings, track registrations, and manage department programs.
            </p>
          </div>
          <div className="flex items-center gap-space-sm">
            <button
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary text-canvas-cream font-label-md text-label-md hover:bg-muted-aubergine transition-all active:translate-y-0.5"
            >
              <span className="material-symbols-outlined text-[18px] text-apricot">add</span>
              <span>New Event</span>
            </button>
          </div>
        </div>
      </section>

      {/* Live Program Metrics Overview */}
      <section className="w-full bg-surface-tint border-b border-divider-hairline">
        <div className="max-w-7xl mx-auto px-gutter py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-divider-hairline">
            <div className="py-2 md:py-0 md:px-4 flex flex-col">
              <span className="font-meta-caps text-meta-caps text-cocoa-sand uppercase tracking-wider">Active Gatherings</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-md text-headline-md text-primary font-semibold">{totalEvents}</span>
                <span className="font-label-sm text-label-sm text-cocoa-sand">published</span>
              </div>
            </div>
            <div className="py-2 md:py-0 md:px-4 flex flex-col">
              <span className="font-meta-caps text-meta-caps text-cocoa-sand uppercase tracking-wider">Total Capacity</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-md text-headline-md text-primary font-semibold">{totalCapacity}</span>
                <span className="font-label-sm text-label-sm text-cocoa-sand">seats total</span>
              </div>
            </div>
            <div className="py-2 md:py-0 md:px-4 flex flex-col">
              <span className="font-meta-caps text-meta-caps text-cocoa-sand uppercase tracking-wider">Registrations</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-md text-headline-md text-primary font-semibold">{totalRegistrations}</span>
                <span className="font-label-sm text-label-sm text-tertiary font-semibold">{avgAttendance}% filled</span>
              </div>
            </div>
            <div className="py-2 md:py-0 md:px-4 flex flex-col">
              <span className="font-meta-caps text-meta-caps text-cocoa-sand uppercase tracking-wider">Seats Remaining</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="font-headline-md text-headline-md text-primary font-semibold">{totalSeatsRemaining}</span>
                <span className="font-label-sm text-label-sm text-cocoa-sand">available</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Work Area */}
      <section className="w-full bg-canvas-cream py-space-xl min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-gutter">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg items-start">
            
            {/* Left / Primary: Managed Events Roster */}
            <div className="lg:col-span-7 flex flex-col gap-space-md">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm pb-space-sm border-b border-divider-hairline">
                <div>
                  <h2 className="font-headline-md text-headline-md text-primary font-semibold">Managed Events</h2>
                  <p className="font-body-sm text-body-sm text-cocoa-sand mt-0.5">Programs currently scheduled under your organizer desk.</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <button className="px-3 py-1 rounded-full bg-secondary-container text-primary font-label-sm text-label-sm font-semibold border border-divider-hairline">All ({myEvents.length})</button>
                </div>
              </div>

              {myEvents.length === 0 ? (
                <div className="py-10">
                  <EmptyState title="No events posted yet" description="Once you create an event, it'll show up here." />
                </div>
              ) : (
                <div className="flex flex-col gap-space-md">
                  {myEvents.map(event => {
                    const isFull = event.seatsAvailable <= 0
                    const isPast = new Date(event.date).getTime() < new Date().getTime()
                    const fillPercent = event.capacity > 0 ? ((event.capacity - event.seatsAvailable) / event.capacity) * 100 : 0
                    
                    return (
                      <article key={event.id} className={`bg-surface-white border border-divider-hairline rounded-lg p-space-md shadow-sm transition-all flex flex-col gap-3 ${event.cancelled ? 'opacity-50 pointer-events-none' : 'hover:border-outline-variant'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="flex items-start gap-3">
                            <div className="w-11 h-12 rounded bg-surface-tint border border-divider-hairline flex flex-col items-center justify-center shrink-0">
                              <span className="font-meta-caps text-[9px] text-cocoa-sand uppercase tracking-wider">{formatEventMonth(event.date)}</span>
                              <span className="font-headline-sm text-[16px] text-primary font-semibold leading-tight">{formatEventDay(event.date)}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 mb-0.5">
                                <h3 className="font-headline-sm text-[17px] text-primary font-semibold leading-tight">{event.name}</h3>
                                {event.cancelled ? (
                                  <span className="px-2 py-0.5 rounded-full bg-error-container text-error font-meta-caps text-[10px] font-semibold">Cancelled</span>
                                ) : isFull ? (
                                  <span className="px-2 py-0.5 rounded-full bg-tertiary-fixed text-primary font-meta-caps text-[10px] font-semibold">Sold Out</span>
                                ) : isPast ? (
                                  <span className="px-2 py-0.5 rounded-full bg-surface-tint text-cocoa-sand font-meta-caps text-[10px]">Past</span>
                                ) : (
                                  <span className="px-2 py-0.5 rounded-full bg-pale-pistachio text-primary font-meta-caps text-[10px]">Live</span>
                                )}
                              </div>
                              <p className="font-body-sm text-body-sm text-cocoa-sand flex items-center gap-1 mt-1">
                                <span className="material-symbols-outlined text-[14px]">location_on</span>
                                {event.venue} · {formatEventTimeRange(event.date)}
                              </p>
                              <span className="font-meta-caps text-[10px] text-cocoa-sand uppercase tracking-wider mt-1 block">{event.category}</span>
                            </div>
                          </div>
                          <div className="flex sm:flex-col sm:items-end items-center justify-between gap-1 mt-2 sm:mt-0">
                            <span className="font-label-sm text-label-sm text-primary font-semibold">
                              {event.capacity - event.seatsAvailable} / {event.capacity} seats
                            </span>
                            <span className="font-label-sm text-xs text-cocoa-sand">{event.seatsAvailable} remaining</span>
                          </div>
                        </div>
                        
                        <div className="w-full bg-surface-container rounded-full h-1.5 overflow-hidden mt-1">
                          <div className={`h-1.5 rounded-full ${isFull ? 'bg-apricot' : 'bg-primary'}`} style={{ width: `${fillPercent}%` }}></div>
                        </div>

                        <div className="pt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleEditClick(event)}
                              disabled={event.cancelled}
                              className="px-3 py-1.5 rounded-full bg-surface-tint border border-divider-hairline font-label-sm text-label-sm text-primary hover:bg-secondary-container transition-colors inline-flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[14px]">edit</span>Edit
                            </button>
                            <Link 
                              href={`/events/${event.id}`}
                              className="px-3 py-1.5 rounded-full bg-surface-white border border-divider-hairline font-label-sm text-label-sm text-primary hover:bg-surface-tint transition-colors inline-flex items-center gap-1"
                            >
                              <span className="material-symbols-outlined text-[14px]">visibility</span>View Page
                            </Link>
                          </div>
                          {!event.cancelled && (
                            <button 
                              onClick={() => handleCancelEvent(event.id, event.name)}
                              className="text-cocoa-sand hover:text-error text-xs font-label-sm transition-colors"
                            >
                              Cancel Event
                            </button>
                          )}
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right Side Panel: Event Creation & Modification Studio */}
            <div 
              ref={formRef}
              className="lg:col-span-5 bg-surface-white border border-divider-hairline rounded-lg p-space-lg shadow-[0_4px_0_0_#EBE1D3,0_12px_24px_-6px_rgba(45,35,30,0.04)] sticky top-24"
            >
              <div className="pb-space-sm border-b border-divider-hairline mb-space-md flex items-center justify-between">
                <div>
                  <h2 className="font-headline-md text-headline-md text-primary font-semibold">
                    {editingEvent ? `Edit Gathering` : `Create Event`}
                  </h2>
                  <p className="font-body-sm text-body-sm text-cocoa-sand mt-0.5">
                    {editingEvent ? editingEvent.name : `Dispatch to the CampusConnect daily dispatch.`}
                  </p>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full font-meta-caps text-meta-caps ${editingEvent ? 'bg-secondary-container text-primary font-semibold' : 'bg-surface-tint border border-divider-hairline text-cocoa-sand'}`}>
                  {editingEvent ? 'Editing Mode' : 'Drafting'}
                </span>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-space-md">
                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-primary font-semibold">Event Title</label>
                  <input 
                    required 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Open Seminar on Speculative Fiction"
                    className="w-full px-3.5 py-2 rounded bg-surface-white border border-divider-hairline text-primary font-body-md text-body-md placeholder:text-cocoa-sand/60 focus:outline-none focus:border-primary transition-all" 
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-primary font-semibold">Discipline</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value as EventCategory)}
                      className="w-full px-3.5 py-2 rounded bg-surface-white border border-divider-hairline text-primary font-body-md text-body-md focus:outline-none focus:border-primary transition-all cursor-pointer"
                    >
                      <option value="Academic">Academic & Science</option>
                      <option value="Tech">Tech & Hackathons</option>
                      <option value="Arts">Arts & Salons</option>
                      <option value="Sports">Athletics & Fixtures</option>
                      <option value="Career">Career & Guild</option>
                      <option value="Music">Music & Arts</option>
                      <option value="Cultural">Social Gatherings</option>
                      <option value="Workshop">Workshop</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-primary font-semibold">Campus Venue</label>
                    <input 
                      required 
                      type="text"
                      value={venue}
                      onChange={(e) => setVenue(e.target.value)}
                      className="w-full px-3.5 py-2 rounded bg-surface-white border border-divider-hairline text-primary font-body-md text-body-md focus:outline-none focus:border-primary transition-all cursor-pointer"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-sm">
                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-primary font-semibold">Date & Time</label>
                    <input 
                      required 
                      type="datetime-local" 
                      value={dateTime}
                      onChange={(e) => setDateTime(e.target.value)}
                      className="w-full px-3.5 py-2 rounded bg-surface-white border border-divider-hairline text-primary font-body-md text-body-md focus:outline-none focus:border-primary transition-all" 
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="font-label-sm text-label-sm text-primary font-semibold">Seats (Max 1000)</label>
                    <input 
                      required 
                      type="number" 
                      min="5" 
                      max="1000" 
                      value={capacity}
                      onChange={(e) => setCapacity(e.target.value)}
                      className="w-full px-3.5 py-2 rounded bg-surface-white border border-divider-hairline text-primary font-body-md text-body-md focus:outline-none focus:border-primary transition-all" 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-label-sm text-label-sm text-primary font-semibold">Description (optional)</label>
                  <textarea 
                    rows={2} 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3.5 py-2 rounded bg-surface-white border border-divider-hairline text-primary font-body-md text-body-md placeholder:text-cocoa-sand/60 focus:outline-none focus:border-primary transition-all resize-none" 
                  />
                </div>

                <div className="flex flex-col gap-2 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-body-sm text-primary">
                    <input defaultChecked type="checkbox" className="w-4 h-4 rounded border-divider-hairline text-primary accent-primary focus:ring-0 cursor-pointer" />
                    <span>Require student authentication</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-body-sm text-primary">
                    <input defaultChecked type="checkbox" className="w-4 h-4 rounded border-divider-hairline text-primary accent-primary focus:ring-0 cursor-pointer" />
                    <span>1 ticket limit per student</span>
                  </label>
                </div>

                <div className="pt-space-sm border-t border-divider-hairline flex flex-wrap items-center gap-space-sm">
                  <button 
                    type="submit" 
                    className="flex-1 py-2.5 px-4 rounded-full bg-primary text-canvas-cream font-label-md text-label-md font-semibold hover:bg-muted-aubergine transition-all active:translate-y-0.5 flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[16px] text-apricot">send</span>
                    <span>{editingEvent ? 'Save Changes' : 'Publish Event'}</span>
                  </button>
                  {editingEvent && (
                    <button 
                      type="button" 
                      onClick={handleCreateNew}
                      className="py-2.5 px-4 rounded-full bg-surface-tint border border-divider-hairline font-label-md text-label-md text-cocoa-sand hover:text-primary transition-colors"
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>

                {toastMsg && (
                  <div className="p-2.5 rounded bg-pale-pistachio border border-divider-hairline text-primary text-xs font-label-sm flex items-start gap-2">
                    <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                    <span>{toastMsg}</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
