'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { events, CampusEvent, EventCategory } from '@/data/events'
import EmptyState from '@/components/EmptyState'
import StatusBadge from '@/components/StatusBadge'

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-GB', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }) + ' • ' + d.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

// Modal component for forms
function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-on-surface/40 backdrop-blur-sm">
      <div className="bg-surface-container-lowest rounded-xl p-space-xl max-w-lg w-full shadow-lg relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute right-4 top-4 text-tertiary hover:text-on-surface">
          <span className="material-symbols-outlined">close</span>
        </button>
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-md">{title}</h2>
        {children}
      </div>
    </div>
  )
}

export default function OrganizerPage() {
  const { currentUser } = useAuth()
  const [nonce, setNonce] = useState(0)

  // State for forms
  const [isCreating, setIsCreating] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CampusEvent | null>(null)

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

  const myEvents = events.filter((e) => e.organizerId === currentUser.id)

  const totalEvents = myEvents.length
  const totalRegistrations = myEvents.reduce((acc, e) => acc + (e.capacity - e.seatsAvailable), 0)
  const totalCapacity = myEvents.reduce((acc, e) => acc + e.capacity, 0)
  const avgAttendance = totalCapacity === 0 ? 0 : Math.round((totalRegistrations / totalCapacity) * 100)

  const handleCancelEvent = (id: string) => {
    const event = events.find(e => e.id === id)
    if (event) {
      event.cancelled = true
      setNonce(n => n + 1)
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const venue = formData.get('venue') as string
    const category = formData.get('category') as EventCategory
    const date = formData.get('date') as string
    const capacity = parseInt(formData.get('capacity') as string, 10)

    if (editingEvent) {
      // Edit
      const evt = events.find(ev => ev.id === editingEvent.id)!
      evt.name = name
      evt.description = description
      evt.venue = venue
      evt.category = category
      evt.date = date
      
      const seatsTaken = evt.capacity - evt.seatsAvailable
      evt.capacity = capacity
      evt.seatsAvailable = Math.max(0, capacity - seatsTaken)
      
      setEditingEvent(null)
    } else {
      // Create
      const newEvent: CampusEvent = {
        id: `evt-${Date.now()}`,
        name,
        description,
        date,
        venue,
        category,
        capacity,
        seatsAvailable: capacity,
        organizerId: currentUser.id,
        cancelled: false,
      }
      events.push(newEvent)
      setIsCreating(false)
    }
    setNonce(n => n + 1)
  }

  return (
    <div className="w-full max-w-[1320px] mx-auto px-margin-mobile lg:px-margin py-space-xl flex flex-col gap-space-xl">
      {/* Header */}
      <div className="mb-space-lg">
        <h1 className="font-display text-display text-on-surface mb-space-xs tracking-tight">Program Desk</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">
          Govern your upcoming functions, oversee attendance, and orchestrate the campus pulse.
        </p>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-xl">
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-xs text-center">
          <span className="font-display text-display text-primary leading-none">{totalEvents}</span>
          <span className="font-label-md text-label-md text-on-surface-variant mt-1">Total Events</span>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-xs text-center">
          <span className="font-display text-display text-secondary leading-none">{totalRegistrations}</span>
          <span className="font-label-md text-label-md text-on-surface-variant mt-1">Registrations</span>
        </div>
        <div className="bg-surface-container-lowest rounded-xl p-space-lg shadow-sm flex flex-col gap-space-xs text-center">
          <span className="font-display text-display text-tertiary leading-none">{avgAttendance}%</span>
          <span className="font-label-md text-label-md text-on-surface-variant mt-1">Avg. Fill Rate</span>
        </div>
      </div>

      {/* Roster */}
      <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/30 overflow-hidden">
        <div className="p-space-lg border-b border-outline-variant/30 flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface-container-low/50 gap-4">
          <h2 className="font-title-md text-title-md text-on-surface">Active Roster</h2>
          <button onClick={() => setIsCreating(true)} className="bg-primary hover:bg-primary-container text-on-primary px-space-md py-2 rounded-lg font-label-md text-label-md transition-colors flex items-center gap-1 shadow-sm">
            <span className="material-symbols-outlined text-[18px]">add</span>
            Create Event
          </button>
        </div>
        
        {myEvents.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No events posted yet"
              description="Once you create an event, it'll show up here."
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="border-b border-outline-variant/30">
                  <th className="p-space-md font-label-caps text-label-caps text-on-surface-variant">Event Particulars</th>
                  <th className="p-space-md font-label-caps text-label-caps text-on-surface-variant hidden md:table-cell">Date &amp; Locale</th>
                  <th className="p-space-md font-label-caps text-label-caps text-on-surface-variant">Status</th>
                  <th className="p-space-md font-label-caps text-label-caps text-on-surface-variant text-right">Attendance</th>
                  <th className="p-space-md font-label-caps text-label-caps text-on-surface-variant text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myEvents.map((event) => {
                  const status = event.cancelled ? 'cancelled' : event.seatsAvailable <= 0 ? 'full' : 'open'
                  return (
                    <tr key={event.id} className="border-b border-outline-variant/10 hover:bg-surface-container-lowest transition-colors group">
                      <td className="p-space-md">
                        <Link href={`/events/${event.id}`} className="font-title-md text-title-md text-on-surface group-hover:text-primary transition-colors block mb-1">
                          {event.name}
                        </Link>
                        <span className="font-caption text-caption text-on-surface-variant uppercase">{event.category}</span>
                      </td>
                      <td className="p-space-md hidden md:table-cell">
                        <div className="font-body-sm text-body-sm text-on-surface-variant mb-1">{formatDateTime(event.date)}</div>
                        <div className="font-caption text-caption text-tertiary">{event.venue}</div>
                      </td>
                      <td className="p-space-md">
                        <StatusBadge status={status} />
                      </td>
                      <td className="p-space-md text-right font-label-md text-label-md text-on-surface-variant">
                        {event.capacity - event.seatsAvailable} <span className="text-tertiary">/ {event.capacity}</span>
                      </td>
                      <td className="p-space-md text-right">
                        <div className="flex items-center justify-end gap-3 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          {!event.cancelled && (
                            <>
                              <button onClick={() => setEditingEvent(event)} className="text-primary hover:text-primary-container font-label-md text-label-md transition-colors">Edit</button>
                              <button onClick={() => handleCancelEvent(event.id)} className="text-error hover:text-on-error-container font-label-md text-label-md transition-colors">Cancel</button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Form Modal */}
      {(isCreating || editingEvent) && (
        <Modal
          title={editingEvent ? 'Edit Assemblage' : 'Draft New Assemblage'}
          onClose={() => {
            setIsCreating(false)
            setEditingEvent(null)
          }}
        >
          <form onSubmit={handleSubmit} className="space-y-space-md flex flex-col">
            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">Event Name</label>
              <input required type="text" name="name" defaultValue={editingEvent?.name} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:outline-none focus:border-primary" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">Category</label>
                <select name="category" defaultValue={editingEvent?.category || 'Tech'} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:outline-none focus:border-primary">
                  <option value="Tech">Tech / Academic</option>
                  <option value="Cultural">Cultural / Social</option>
                  <option value="Sports">Sports / Athletics</option>
                  <option value="Workshop">Workshop / Career</option>
                  <option value="Career">Career & Guild</option>
                  <option value="Music">Music & Arts</option>
                </select>
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">Total Capacity</label>
                <input required type="number" min="1" name="capacity" defaultValue={editingEvent?.capacity || 50} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:outline-none focus:border-primary" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">Date & Time</label>
                <input required type="datetime-local" name="date" defaultValue={editingEvent?.date ? editingEvent.date.slice(0, 16) : ''} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:outline-none focus:border-primary" />
              </div>
              <div>
                <label className="block font-label-md text-label-md text-on-surface mb-1">Venue</label>
                <input required type="text" name="venue" defaultValue={editingEvent?.venue} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:outline-none focus:border-primary" />
              </div>
            </div>

            <div>
              <label className="block font-label-md text-label-md text-on-surface mb-1">Description</label>
              <textarea required name="description" rows={3} defaultValue={editingEvent?.description} className="w-full bg-surface-container-lowest border border-outline-variant rounded p-2 text-on-surface focus:outline-none focus:border-primary resize-none"></textarea>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-outline-variant/30">
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false)
                  setEditingEvent(null)
                }}
                className="px-4 py-2 rounded-lg font-label-md text-label-md text-tertiary hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button type="submit" className="bg-primary hover:bg-primary-container text-on-primary px-4 py-2 rounded-lg font-label-md text-label-md transition-colors shadow-sm">
                {editingEvent ? 'Save Changes' : 'Publish Assembly'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
