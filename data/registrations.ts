import { getEventById, isPastEvent, isFullEvent } from '@/data/events'

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
export function getRegistrationsForStudent(
  studentId: string,
): Registration[] {
  return registrations.filter((reg) => reg.studentId === studentId)
}

/**
 * Register a student for an event.
 *
 * Checks:
 * - Event exists
 * - Event is not cancelled
 * - Event has not already happened
 * - Event has available seats
 * - Student is not already registered
 *
 * On success:
 * - Creates a new registration
 * - Adds it to the registrations store
 * - Decreases available seats by 1
 */
export function registerStudent(
  eventId: string,
  studentId: string,
): {
  success: boolean
  message: string
  registration?: Registration
} {
  const event = getEventById(eventId)

  if (!event) {
    return {
      success: false,
      message: 'Event not found.',
    }
  }

  if (event.cancelled) {
    return {
      success: false,
      message: 'This event has been cancelled.',
    }
  }

  if (isPastEvent(event)) {
    return {
      success: false,
      message:
        'Registration is closed because this event has already happened.',
    }
  }

  if (isFullEvent(event)) {
    return {
      success: false,
      message: 'This event is full.',
    }
  }

  const alreadyRegistered = registrations.some(
    (reg) =>
      reg.eventId === eventId &&
      reg.studentId === studentId &&
      reg.status === 'confirmed',
  )

  if (alreadyRegistered) {
    return {
      success: false,
      message: 'You are already registered for this event.',
    }
  }

  const registration: Registration = {
    id: `reg-${Date.now()}`,
    eventId,
    studentId,
    status: 'confirmed',
    registeredAt: new Date().toISOString(),
  }

  registrations.push(registration)
  event.seatsAvailable -= 1

  return {
    success: true,
    message: 'Successfully registered for the event.',
    registration,
  }
}