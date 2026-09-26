import { describe, it, expect } from 'vitest'
import {
  events,
  filterEventsByCategory,
  filterEventsByStatus,
  isPastEvent,
} from '@/data/events'

describe('isPastEvent', () => {
  it('marks an event with a date before TODAY as past', () => {
    // evt-10 is dated 2026-09-01; TODAY (seeded) is 2026-09-16
    const pastEvent = events.find((e) => e.id === 'evt-10')!
    expect(isPastEvent(pastEvent)).toBe(true)
  })

  it('combines category and past status filters', () => {
    const techEvents = filterEventsByCategory(events, 'Tech')
    const pastTechEvents = filterEventsByStatus(techEvents, 'Past')

    expect(pastTechEvents.map((event) => event.id)).toEqual(['evt-07', 'evt-12'])
  })
})
