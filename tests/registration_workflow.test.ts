import { describe, it, expect, beforeEach } from 'vitest'
import {
  events,
  CampusEvent,
  TODAY,
} from '@/data/events'
import {
  registrations,
  registerStudentForEvent,
  cancelRegistration,
  getRegistrationsForStudent,
} from '@/data/registrations'

describe('Student Registration and Cancellation Workflow', () => {
  const testStudentId = 'stu-1'
  const testEventId = 'evt-05' // Intro to Figma Workshop, capacity 30, seatsAvailable 6, upcoming

  it('allows a student to register for an available upcoming event', () => {
    const event = events.find((e) => e.id === testEventId)!
    const initialSeats = event.seatsAvailable

    const res = registerStudentForEvent(testStudentId, testEventId)
    expect(res.success).toBe(true)
    expect(res.registration).toBeDefined()
    expect(res.registration?.studentId).toBe(testStudentId)
    expect(res.registration?.eventId).toBe(testEventId)
    expect(res.registration?.status).toBe('confirmed')

    // Decreases seats available
    expect(event.seatsAvailable).toBe(initialSeats - 1)
  })

  it('prevents duplicate registration for the same event by the same student', () => {
    const res = registerStudentForEvent(testStudentId, testEventId)
    expect(res.success).toBe(false)
    expect(res.error).toMatch(/already registered/i)
  })

  it('prevents registration when event is full (seatsAvailable = 0)', () => {
    // evt-02 is full (seatsAvailable: 0)
    const res = registerStudentForEvent(testStudentId, 'evt-02')
    expect(res.success).toBe(false)
    expect(res.error).toMatch(/full/i)
  })

  it('blocks registration for past events', () => {
    // evt-10 is a past event
    const res = registerStudentForEvent(testStudentId, 'evt-10')
    expect(res.success).toBe(false)
    expect(res.error).toMatch(/passed|past/i)
  })

  it('blocks registration for non-student users', () => {
    // org-1 is an organizer
    const res = registerStudentForEvent('org-1', 'evt-06')
    expect(res.success).toBe(false)
    expect(res.error).toMatch(/student/i)
  })

  it('allows cancelling a registration and restores the seat count', () => {
    const event = events.find((e) => e.id === testEventId)!
    const currentSeats = event.seatsAvailable

    // Find the registration created earlier
    const userRegs = registrations.filter(
      (r) => r.studentId === testStudentId && r.eventId === testEventId && r.status === 'confirmed',
    )
    expect(userRegs.length).toBe(1)
    const regId = userRegs[0].id

    const cancelRes = cancelRegistration(regId, testStudentId)
    expect(cancelRes.success).toBe(true)

    // Increases seats after cancellation
    expect(event.seatsAvailable).toBe(currentSeats + 1)

    // Cancelled registration is marked cancelled
    expect(userRegs[0].status).toBe('cancelled')

    // getRegistrationsForStudent does NOT include cancelled registrations by default
    const activeRegs = getRegistrationsForStudent(testStudentId)
    expect(activeRegs.some((r) => r.id === regId)).toBe(false)
  })

  it('prevents cancelling an already cancelled registration', () => {
    const userRegs = registrations.filter(
      (r) => r.studentId === testStudentId && r.eventId === testEventId && r.status === 'cancelled',
    )
    const regId = userRegs[0].id

    const cancelRes = cancelRegistration(regId, testStudentId)
    expect(cancelRes.success).toBe(false)
    expect(cancelRes.error).toMatch(/already cancelled/i)
  })
})
