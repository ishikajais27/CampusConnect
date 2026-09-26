'use client'

import { useState } from 'react'
import { events, EventCategory, searchEventsByName, filterEventsByCategory } from '@/data/events'
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

  let displayEvents = searchEventsByName(events, query)
  displayEvents = filterEventsByCategory(displayEvents, category)

  return (
    <div className="max-w-7xl mx-auto px-gutter py-space-xl flex flex-col gap-space-xl px-4 lg:px-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-lg">
        <div className="max-w-2xl">
          <h1 className="font-display text-display text-primary mb-space-sm">Campus Assemblages</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Discover gatherings, workshops, and spectacles curated by your campus societies.</p>
        </div>
        
        {/* Filters */}
        <div className="flex items-center gap-space-sm overflow-x-auto pb-2 md:pb-0 hide-scrollbar">
          {CATEGORIES.map((c) => {
            const isActive = category === c
            return (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                className={`flex-shrink-0 px-space-md py-space-sm rounded-full font-label-md text-label-md border transition-colors ${
                  isActive
                    ? 'border-primary bg-primary text-on-primary'
                    : 'border-outline text-on-surface hover:bg-surface-variant'
                }`}
              >
                {c === 'All' ? 'All Events' : c}
              </button>
            )
          })}
        </div>
      </div>
      
      {/* Search */}
      <div className="relative max-w-xl mb-4">
        <span className="material-symbols-outlined absolute left-space-md top-1/2 -translate-y-1/2 text-on-surface-variant">search</span>
        <input 
          type="text" 
          placeholder="Search the archives..." 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-surface-container-lowest border border-outline rounded-full py-space-sm pl-12 pr-space-md font-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all" 
        />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {displayEvents.map((event) => (
          <div key={event.id} className="col-span-1">
            <EventCard event={event} />
          </div>
        ))}
      </div>
    </div>
  )
}
