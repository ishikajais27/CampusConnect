import { describe, it, expect } from 'vitest'
import {
  events,
  createEvent,
  updateEvent,
  cancelEvent,
  searchEventsByName,
  filterEventsByCategory,
  TODAY,
} from '@/data/events'
import { registerStudentForEvent } from '@/data/registrations'

describe('Organizer Event Management and Validation', () => {
  let createdEventId = ''

  it('validates required fields and rejects invalid event creation', () => {
    // Missing name
    const res1 = createEvent({
      name: '',
      date: '2026-11-10T10:00',
      venue: 'Lab A',
      category: 'Tech',
      capacity: 50,
      organizerId: 'org-1',
    })
    expect(res1.success).toBe(false)
    expect(res1.error).toMatch(/name/i)

    // Past date (before TODAY = 2026-09-16)
    const res2 = createEvent({
      name: 'Old Event',
      date: '2026-08-01T10:00',
      venue: 'Lab A',
      category: 'Tech',
      capacity: 50,
      organizerId: 'org-1',
    })
    expect(res2.success).toBe(false)
    expect(res2.error).toMatch(/future/i)

    // Invalid capacity
    const res3 = createEvent({
      name: 'Valid Name',
      date: '2026-11-10T10:00',
      venue: 'Lab A',
      category: 'Tech',
      capacity: -5,
      organizerId: 'org-1',
    })
    expect(res3.success).toBe(false)
    expect(res3.error).toMatch(/capacity/i)
  })

  it('successfully creates an event with valid data', () => {
    const res = createEvent({
      name: 'AI Robotics Expo 2026',
      description: 'Hands-on showcase of autonomous robots.',
      date: '2026-11-20T14:00',
      venue: 'Robotics Center',
      category: 'Tech',
      capacity: 60,
      organizerId: 'org-1',
    })
    expect(res.success).toBe(true)
    expect(res.event).toBeDefined()
    expect(res.event?.name).toBe('AI Robotics Expo 2026')
    expect(res.event?.capacity).toBe(60)
    expect(res.event?.seatsAvailable).toBe(60)
    expect(res.event?.cancelled).toBe(false)
    createdEventId = res.event!.id
  })

  it('edits an existing event successfully', () => {
    const res = updateEvent(createdEventId, {
      name: 'AI & Robotics Expo 2026 (Updated)',
      capacity: 80,
      venue: 'Grand Convention Hall',
    })
    expect(res.success).toBe(true)
    expect(res.event?.name).toBe('AI & Robotics Expo 2026 (Updated)')
    expect(res.event?.capacity).toBe(80)
    expect(res.event?.seatsAvailable).toBe(80)
    expect(res.event?.venue).toBe('Grand Convention Hall')
  })

  it('cancels an event and marks it cancelled', () => {
    const res = cancelEvent(createdEventId)
    expect(res.success).toBe(true)
    expect(res.event?.cancelled).toBe(true)

    // A cancelled event should block registrations
    const regRes = registerStudentForEvent('stu-1', createdEventId)
    expect(regRes.success).toBe(false)
    expect(regRes.error).toMatch(/cancelled/i)
  })

  it('composes search and category filter correctly', () => {
    const musicEvents = filterEventsByCategory(events, 'Music')
    expect(musicEvents.every((e) => e.category === 'Music')).toBe(true)

    const searchResults = searchEventsByName(musicEvents, 'acoustic')
    expect(searchResults.length).toBe(1)
    expect(searchResults[0].id).toBe('evt-02')
  })
})
