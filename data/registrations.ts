// Seed data for registrations, so the "My Registrations" and Organizer
// pages have something real to display before participants build the
// actual registration flow (Task 2 and Task 3).

export type RegistrationStatus = 'confirmed' | 'cancelled'

export interface Registration {
  id: string
  eventId: string
  studentId: string
  status: RegistrationStatus
  registeredAt: string // ISO date string
}

// NOTE FOR PARTICIPANTS: this array is the "database" of registrations.
// Task 2 (Registration) means pushing new items into this array when a
// student registers. Task 3 (Cancellation) means updating an item's
// status here. Keep using this same array — don't create a second store.
const initialRegistrations: Registration[] = [
  {
    id: 'reg-01',
    eventId: 'evt-01',
    studentId: 'stu-1',
    status: 'confirmed',
    registeredAt: '2026-09-10T10:15:00',
  },
  {
    id: 'reg-02',
    eventId: 'evt-04',
    studentId: 'stu-1',
    status: 'confirmed',
    registeredAt: '2026-08-20T09:00:00',
  },
  {
    id: 'reg-03',
    eventId: 'evt-09',
    studentId: 'stu-1',
    status: 'confirmed',
    registeredAt: '2026-09-12T18:40:00',
  },
]

const globalForRegistrations = globalThis as unknown as {
  campusRegistrations?: Registration[]
}

export const registrations: Registration[] =
  globalForRegistrations.campusRegistrations ?? initialRegistrations

globalForRegistrations.campusRegistrations = registrations

import { getEventById, isPastEvent, isFullEvent } from './events'
import { getUserById } from './auth'

/** Simple lookup used by the "My Registrations" page. */
export function getRegistrationsForStudent(
  studentId: string,
  includeCancelled = false,
): Registration[] {
  return registrations.filter((reg) => {
    if (reg.studentId !== studentId) return false
    if (!includeCancelled && reg.status === 'cancelled') return false
    const event = getEventById(reg.eventId)
    if (event && event.cancelled) return false
    return true
  })
}

export function registerStudentForEvent(
  studentId: string,
  eventId: string,
): {
  success: boolean
  registration?: Registration
  error?: string
} {
  if (!studentId) {
    return { success: false, error: 'You must be logged in to register.' }
  }

  const user = getUserById(studentId)
  if (!user || user.role !== 'student') {
    return {
      success: false,
      error: 'Only student accounts can register for events.',
    }
  }

  const event = getEventById(eventId)
  if (!event) {
    return { success: false, error: 'Event not found.' }
  }

  if (event.cancelled) {
    return { success: false, error: 'Cannot register for a cancelled event.' }
  }

  if (isPastEvent(event)) {
    return {
      success: false,
      error: 'Cannot register for an event that has already passed.',
    }
  }

  if (isFullEvent(event) || event.seatsAvailable <= 0) {
    return { success: false, error: 'This event is full. No seats available.' }
  }

  const existing = registrations.find(
    (r) =>
      r.studentId === studentId &&
      r.eventId === eventId &&
      r.status === 'confirmed',
  )
  if (existing) {
    return {
      success: false,
      error: 'You are already registered for this event.',
    }
  }

  event.seatsAvailable = Math.max(0, event.seatsAvailable - 1)

  const id = `reg-${Date.now().toString().slice(-4)}-${Math.floor(Math.random() * 1000)}`
  const newRegistration: Registration = {
    id,
    eventId,
    studentId,
    status: 'confirmed',
    registeredAt: new Date().toISOString(),
  }

  registrations.push(newRegistration)
  return { success: true, registration: newRegistration }
}

export function cancelRegistration(
  registrationId: string,
  studentId?: string,
): {
  success: boolean
  error?: string
} {
  const reg = registrations.find((r) => r.id === registrationId)
  if (!reg) {
    return { success: false, error: 'Registration not found.' }
  }

  if (studentId && reg.studentId !== studentId) {
    return {
      success: false,
      error: 'Unauthorized to cancel this registration.',
    }
  }

  if (reg.status === 'cancelled') {
    return { success: false, error: 'Registration is already cancelled.' }
  }

  reg.status = 'cancelled'

  const event = getEventById(reg.eventId)
  if (event) {
    event.seatsAvailable = Math.min(event.capacity, event.seatsAvailable + 1)
  }

  return { success: true }
}

