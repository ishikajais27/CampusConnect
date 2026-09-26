import { describe, it, expect, beforeEach } from 'vitest'
import {
  events,
  validateEvent,
  createEvent,
  editEvent,
  cancelEvent,
  deleteEvent,
  getActiveEvents,
  getEventById,
  CampusEvent,
} from '@/data/events'

/*
 * These tests exercise the organizer helper functions added for Task 4.
 * Because the helpers mutate the shared `events` array in-place, we
 * snapshot and restore it between tests to keep them isolated.
 */

let snapshot: CampusEvent[]

beforeEach(() => {
  // Restore the seed array to its original state before every test
  snapshot = events.map((e) => ({ ...e }))
  events.length = 0
  snapshot.forEach((e) => events.push({ ...e }))
})

/* ------------------------------------------------------------------ */
/*  validateEvent                                                      */
/* ------------------------------------------------------------------ */

describe('validateEvent', () => {
  const futureDate = new Date(Date.now() + 86_400_000).toISOString()

  it('passes when all fields are valid', () => {
    const result = validateEvent({
      name: 'Test Event',
      date: futureDate,
      venue: 'Room 101',
      capacity: 50,
    })
    expect(result.valid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('fails when name is empty', () => {
    const result = validateEvent({
      name: '   ',
      date: futureDate,
      venue: 'Room 101',
      capacity: 50,
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Event name is required.')
  })

  it('fails when date is in the past', () => {
    const result = validateEvent({
      name: 'Test',
      date: '2020-01-01T00:00:00',
      venue: 'Room 101',
      capacity: 50,
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Event date must be a valid date in the future.')
  })

  it('fails when venue is empty', () => {
    const result = validateEvent({
      name: 'Test',
      date: futureDate,
      venue: '',
      capacity: 50,
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Venue is required.')
  })

  it('fails when capacity is zero', () => {
    const result = validateEvent({
      name: 'Test',
      date: futureDate,
      venue: 'Room 101',
      capacity: 0,
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Capacity must be a positive whole number.')
  })

  it('fails when capacity is negative', () => {
    const result = validateEvent({
      name: 'Test',
      date: futureDate,
      venue: 'Room 101',
      capacity: -10,
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Capacity must be a positive whole number.')
  })

  it('fails when capacity is not an integer', () => {
    const result = validateEvent({
      name: 'Test',
      date: futureDate,
      venue: 'Room 101',
      capacity: 3.5,
    })
    expect(result.valid).toBe(false)
    expect(result.errors).toContain('Capacity must be a positive whole number.')
  })

  it('collects multiple errors at once', () => {
    const result = validateEvent({
      name: '',
      date: 'not-a-date',
      venue: '',
      capacity: -1,
    })
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThanOrEqual(4)
  })
})

/* ------------------------------------------------------------------ */
/*  createEvent                                                        */
/* ------------------------------------------------------------------ */

describe('createEvent', () => {
  const futureDate = new Date(Date.now() + 86_400_000).toISOString()

  it('creates a new event and pushes it onto the events array', () => {
    const before = events.length
    const result = createEvent({
      name: 'New Event',
      description: 'A brand new event.',
      date: futureDate,
      venue: 'Main Hall',
      category: 'Tech',
      capacity: 100,
      organizerId: 'org-1',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.event.name).toBe('New Event')
      expect(result.event.seatsAvailable).toBe(100)
      expect(result.event.cancelled).toBe(false)
    }
    expect(events.length).toBe(before + 1)
  })

  it('rejects creation when validation fails', () => {
    const before = events.length
    const result = createEvent({
      name: '',
      description: '',
      date: '2020-01-01T00:00:00',
      venue: '',
      category: 'Tech',
      capacity: 0,
      organizerId: 'org-1',
    })
    expect(result.success).toBe(false)
    expect(events.length).toBe(before)
  })
})

/* ------------------------------------------------------------------ */
/*  editEvent                                                          */
/* ------------------------------------------------------------------ */

describe('editEvent', () => {
  it('updates an existing event name', () => {
    const result = editEvent('evt-01', { name: 'Renamed Hackathon' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.event.name).toBe('Renamed Hackathon')
    }
    expect(getEventById('evt-01')!.name).toBe('Renamed Hackathon')
  })

  it('rejects edit when event is not found', () => {
    const result = editEvent('evt-999', { name: 'Nope' })
    expect(result.success).toBe(false)
  })

  it('rejects edit when event is cancelled', () => {
    cancelEvent('evt-01')
    const result = editEvent('evt-01', { name: 'Nope' })
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors).toContain('Cannot edit a cancelled event.')
    }
  })

  it('rejects edit with invalid fields', () => {
    const result = editEvent('evt-01', { name: '   ' })
    expect(result.success).toBe(false)
  })
})

/* ------------------------------------------------------------------ */
/*  cancelEvent                                                        */
/* ------------------------------------------------------------------ */

describe('cancelEvent', () => {
  it('marks an event as cancelled', () => {
    const result = cancelEvent('evt-02')
    expect(result.success).toBe(true)
    expect(getEventById('evt-02')!.cancelled).toBe(true)
  })

  it('rejects cancelling a non-existent event', () => {
    const result = cancelEvent('evt-999')
    expect(result.success).toBe(false)
  })

  it('rejects cancelling an already-cancelled event', () => {
    cancelEvent('evt-02')
    const result = cancelEvent('evt-02')
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.errors).toContain('Event is already cancelled.')
    }
  })
})

/* ------------------------------------------------------------------ */
/*  deleteEvent                                                        */
/* ------------------------------------------------------------------ */

describe('deleteEvent', () => {
  it('removes an event from the array', () => {
    const before = events.length
    const result = deleteEvent('evt-03')
    expect(result.success).toBe(true)
    expect(events.length).toBe(before - 1)
    expect(getEventById('evt-03')).toBeUndefined()
  })

  it('rejects deleting a non-existent event', () => {
    const result = deleteEvent('evt-999')
    expect(result.success).toBe(false)
  })
})

/* ------------------------------------------------------------------ */
/*  getActiveEvents                                                    */
/* ------------------------------------------------------------------ */

describe('getActiveEvents', () => {
  it('excludes cancelled events', () => {
    // Ensure both target events start non-cancelled
    const evt01 = getEventById('evt-01')!
    const evt05 = getEventById('evt-05')!
    evt01.cancelled = false
    evt05.cancelled = false

    const activeBefore = getActiveEvents().length
    cancelEvent('evt-01')
    cancelEvent('evt-05')
    const activeAfter = getActiveEvents()
    expect(activeAfter.length).toBe(activeBefore - 2)
    expect(activeAfter.find((e) => e.id === 'evt-01')).toBeUndefined()
    expect(activeAfter.find((e) => e.id === 'evt-05')).toBeUndefined()
  })

  it('returns all events when none are cancelled', () => {
    // Make sure no event is cancelled
    events.forEach((e) => { e.cancelled = false })
    expect(getActiveEvents().length).toBe(events.length)
  })
})
