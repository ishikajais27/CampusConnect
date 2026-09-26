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

describe('sortEvents', () => {
  it('sorts events by date in ascending order (soonest first)', () => {
    const { sortEvents } = require('@/data/events')
    const sorted = sortEvents(events, 'date-asc')
    expect(new Date(sorted[0].date).getTime()).toBeLessThanOrEqual(
      new Date(sorted[1].date).getTime(),
    )
  })

  it('sorts events by date in descending order (latest first)', () => {
    const { sortEvents } = require('@/data/events')
    const sorted = sortEvents(events, 'date-desc')
    expect(new Date(sorted[0].date).getTime()).toBeGreaterThanOrEqual(
      new Date(sorted[1].date).getTime(),
    )
  })

  it('sorts events by registration popularity in descending order', () => {
    const { sortEvents } = require('@/data/events')
    const sorted = sortEvents(events, 'popularity-desc')
    const bookedFirst = sorted[0].capacity - sorted[0].seatsAvailable
    const bookedSecond = sorted[1].capacity - sorted[1].seatsAvailable
    expect(bookedFirst).toBeGreaterThanOrEqual(bookedSecond)
  })
})

