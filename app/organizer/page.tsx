'use client'

import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { events } from '@/data/events'
import EmptyState from '@/components/EmptyState'
import StatusBadge from '@/components/StatusBadge'

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-IN', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  }) + ' • ' + d.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

export default function OrganizerPage() {
  const { currentUser } = useAuth()

  if (currentUser.role !== 'organizer') {
    return (
      <section className="shell" style={{ padding: '56px 0' }}>
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

  return (
    <div className="max-w-7xl mx-auto px-gutter py-space-xl flex flex-col gap-space-xl px-4 lg:px-8">
      {/* Header */}
      <div className="mb-space-lg">
        <h1 className="font-display-hero text-display-hero text-on-surface mb-space-xs tracking-tight">Program Desk</h1>
        <p className="font-body-lg text-body-lg text-on-surface-variant max-w-3xl">
          Govern your upcoming functions, oversee attendance, and orchestrate the campus pulse.
        </p>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-space-md mb-space-xl">
        <div className="bg-surface-white border border-outline-variant p-space-lg rounded-[2px] shadow-[0_4px_12px_rgba(45,35,30,0.03)] flex flex-col gap-space-xs">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Total Events</span>
          <span className="font-headline-lg text-headline-lg text-primary">{totalEvents}</span>
        </div>
        <div className="bg-surface-white border border-outline-variant p-space-lg rounded-[2px] shadow-[0_4px_12px_rgba(45,35,30,0.03)] flex flex-col gap-space-xs">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Registrations</span>
          <span className="font-headline-lg text-headline-lg text-primary">{totalRegistrations}</span>
        </div>
        <div className="bg-surface-white border border-outline-variant p-space-lg rounded-[2px] shadow-[0_4px_12px_rgba(45,35,30,0.03)] flex flex-col gap-space-xs">
          <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-widest">Avg. Fill Rate</span>
          <span className="font-headline-lg text-headline-lg text-primary">{avgAttendance}%</span>
        </div>
      </div>

      {/* Roster */}
      <div className="bg-surface-white border border-outline-variant rounded-[2px] shadow-[0_8px_24px_rgba(45,35,30,0.04)]">
        <div className="p-space-lg border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center bg-surface-container-low gap-4">
          <h2 className="font-headline-md text-headline-md text-on-surface">Active Roster</h2>
          <button disabled className="bg-primary text-on-primary px-space-md py-space-sm rounded-full font-label-md text-label-md hover:bg-on-surface transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed">
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
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-divider-hairline">
                  <th className="p-space-md font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">Event Particulars</th>
                  <th className="p-space-md font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold hidden md:table-cell">Date &amp; Locale</th>
                  <th className="p-space-md font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold">Status</th>
                  <th className="p-space-md font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold text-right">Attendance</th>
                  <th className="p-space-md font-label-sm text-label-sm uppercase tracking-widest text-on-surface-variant font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {myEvents.map((event) => {
                  const status = event.cancelled ? 'cancelled' : event.seatsAvailable <= 0 ? 'full' : 'open'
                  return (
                    <tr key={event.id} className="border-b border-divider-hairline hover:bg-surface-container-low transition-colors group">
                      <td className="p-space-md">
                        <Link href={`/events/${event.id}`} className="font-headline-sm text-headline-sm text-on-surface group-hover:text-primary transition-colors block mb-1">
                          {event.name}
                        </Link>
                        <span className="font-body-sm text-body-sm text-on-surface-variant">{event.category}</span>
                      </td>
                      <td className="p-space-md hidden md:table-cell">
                        <div className="font-body-sm text-body-sm text-on-surface-variant mb-1">{formatDateTime(event.date)}</div>
                        <div className="font-body-sm text-body-sm text-on-surface-variant">{event.venue}</div>
                      </td>
                      <td className="p-space-md">
                        <StatusBadge status={status} />
                      </td>
                      <td className="p-space-md text-right font-label-md text-label-md text-on-surface-variant">
                        {event.capacity - event.seatsAvailable}/{event.capacity}
                      </td>
                      <td className="p-space-md text-right">
                        <div className="flex items-center justify-end gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                          <button disabled className="text-primary hover:text-on-surface font-label-md text-label-md disabled:opacity-50 disabled:cursor-not-allowed">Edit</button>
                          <button disabled className="text-error hover:text-on-error-container font-label-md text-label-md disabled:opacity-50 disabled:cursor-not-allowed">Cancel</button>
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
    </div>
  )
}
