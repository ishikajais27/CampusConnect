// Seed data for registrations, so the "My Registrations" and Organizer
// pages have something real to display before participants build the
// actual registration flow (Task 2 and Task 3).

import { getEventById, isPastEvent, isFullEvent } from './events'
import { getUserById } from './auth'

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
export const registrations: Registration[] = [
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


/** Simple lookup used by the placeholder "My Registrations" page. */
export function getRegistrationsForStudent(studentId: string): Registration[] {
  return registrations.filter((reg) => reg.studentId === studentId)
}

/** Check if a student is already registered for a given event. */
export function isStudentRegistered(
  studentId: string,
  eventId: string,
): boolean {
  return registrations.some(
    (reg) =>
      reg.eventId === eventId &&
      reg.studentId === studentId &&
      reg.status === 'confirmed',
  )
}

export interface RegisterResult {
  success: boolean
  message: string
  registration?: Registration
}

/**
 * Register a student for an event while enforcing all validation rules:
 * - Requires login & student role
 * - Blocks registration for past or cancelled events
 * - Prevents registration when event is full
 * - Prevents duplicate registrations
 * - Decreases available seats upon success
 */
export function registerStudentForEvent(
  studentId: string,
  eventId: string,
): RegisterResult {
  if (!studentId) {
    return {
      success: false,
      message: 'Registration failed: You must be logged in to register.',
    }
  }

  const user = getUserById(studentId)
  if (!user || user.role !== 'student') {
    return {
      success: false,
      message:
        'Registration failed: Only logged-in students can register for events. Please switch to a student account.',
    }
  }

  const event = getEventById(eventId)
  if (!event) {
    return {
      success: false,
      message: 'Registration failed: Event not found.',
    }
  }

  if (event.cancelled) {
    return {
      success: false,
      message:
        'Registration failed: This event has been cancelled by the organizer.',
    }
  }

  if (isPastEvent(event)) {
    return {
      success: false,
      message: 'Registration failed: Registration is closed for past events.',
    }
  }

  if (
    event.registrationDeadline &&
    new Date(event.registrationDeadline).getTime() <= Date.now()
  ) {
    return {
      success: false,
      message: 'Registration failed: The registration period has closed.',
    }
  }

  if (isFullEvent(event)) {
    return {
      success: false,
      message: 'Registration failed: This event is already full.',
    }
  }

  if (isStudentRegistered(studentId, eventId)) {
    return {
      success: false,
      message: 'Registration failed: You are already registered for this event.',
    }
  }

  // Create registration & decrement seats
  const newRegistration: Registration = {
    id: `reg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    eventId,
    studentId,
    status: 'confirmed',
    registeredAt: new Date().toISOString(),
  }

  registrations.push(newRegistration)
  event.seatsAvailable -= 1

  return {
    success: true,
    message: `Successfully registered for ${event.name}!`,
    registration: newRegistration,
  }
}

export interface CancelResult {
  success: boolean
  message: string
}

/**
 * Cancel a student registration (Task 3):
 * - Sets status to 'cancelled'
 * - Increases available seats by 1 if it was confirmed
 */
export function cancelRegistration(
  registrationId: string,
  studentId: string,
): CancelResult {
  const reg = registrations.find((r) => r.id === registrationId)
  if (!reg) {
    return { success: false, message: 'Registration not found.' }
  }

  if (reg.studentId !== studentId) {
    return { success: false, message: 'Unauthorized action.' }
  }

  if (reg.status === 'cancelled') {
    return { success: false, message: 'Registration is already cancelled.' }
  }

  // Update registration status to cancelled
  reg.status = 'cancelled'

  // Increase available seats
  const event = getEventById(reg.eventId)
  if (event) {
    event.seatsAvailable += 1
  }

  return {
    success: true,
    message: 'Registration successfully cancelled.',
  }
}


