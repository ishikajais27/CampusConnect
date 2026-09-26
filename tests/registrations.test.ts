import { describe, it, expect } from 'vitest'
import {
  getRegistrationsForStudent,
  registerStudentForEvent,
} from '@/data/registrations'
import { getEventById } from '@/data/events'

describe('getRegistrationsForStudent', () => {
  it('returns only the seeded registrations belonging to that student', () => {
    const mine = getRegistrationsForStudent('stu-1')
    expect(mine.length).toBe(3)
    expect(mine.every((reg) => reg.studentId === 'stu-1')).toBe(true)
  })
})

describe('registerStudentForEvent', () => {
  it('registers a student successfully and decreases available seats', () => {
    const eventId = 'evt-05' // Figma workshop, initial seats = 6
    const studentId = 'stu-1'
    const eventBefore = getEventById(eventId)!
    const initialSeats = eventBefore.seatsAvailable

    const result = registerStudentForEvent(studentId, eventId)

    expect(result.success).toBe(true)
    expect(result.message).toContain('Successfully registered')

    const eventAfter = getEventById(eventId)!
    expect(eventAfter.seatsAvailable).toBe(initialSeats - 1)
  })

  it('prevents duplicate registration for the same event', () => {
    const eventId = 'evt-01' // stu-1 is already registered for evt-01 in seed data
    const studentId = 'stu-1'

    const result = registerStudentForEvent(studentId, eventId)

    expect(result.success).toBe(false)
    expect(result.message).toContain('already registered')
  })

  it('prevents registration when event is full', () => {
    const eventId = 'evt-02' // Open mic night, seatsAvailable = 0
    const studentId = 'stu-1'

    const result = registerStudentForEvent(studentId, eventId)

    expect(result.success).toBe(false)
    expect(result.message).toContain('full')
  })

  it('prevents registration for past events', () => {
    const eventId = 'evt-10' // Photo walk, date in past relative to TODAY
    const studentId = 'stu-1'

    const result = registerStudentForEvent(studentId, eventId)

    expect(result.success).toBe(false)
    expect(result.message).toContain('closed for past events')
  })

  it('requires student role login', () => {
    const eventId = 'evt-05'
    const organizerId = 'org-1'

    const result = registerStudentForEvent(organizerId, eventId)

    expect(result.success).toBe(false)
    expect(result.message).toContain('Only logged-in students can register')
  })
})

