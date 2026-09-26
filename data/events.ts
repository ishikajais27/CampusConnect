export type EventCategory =
  | 'Tech'
  | 'Cultural'
  | 'Sports'
  | 'Workshop'
  | 'Career'
  | 'Music'

export type EventStatus = 'All' | 'Open' | 'Full' | 'Past' | 'Closed' | 'Cancelled'

export interface CampusEvent {
  id: string
  name: string
  description: string
  date: string // ISO 8601 date string, e.g. "2026-10-02T17:00:00"
  registrationDeadline?: string
  venue: string
  category: EventCategory
  capacity: number
  seatsAvailable: number
  organizerId: string
  cancelled: boolean
}

// "Today" for the seed data. Events before this are considered past.
export const TODAY = new Date('2026-09-16T09:00:00')

export const events: CampusEvent[] = [
  {
    id: 'evt-01',
    name: 'Hack the Campus 2026',
    description:
      'A 24-hour overnight hackathon open to all branches. Teams of up to 4 build anything that makes campus life better. Food, mentors, and a closing demo night included.',
    date: '2026-10-04T18:00:00',
    venue: 'Innovation Lab, Block C',
    category: 'Tech',
    capacity: 120,
    seatsAvailable: 37,
    organizerId: 'org-1',
    cancelled: false,
  },
  {
    id: 'evt-02',
    name: 'Acoustic Nights: Open Mic',
    description:
      'Sign up to sing, play, or read poetry. No audition needed — just bring your nerves and your talent. Snacks provided by the Cultural Committee.',
    date: '2026-09-25T19:30:00',
    venue: 'Amphitheatre Lawn',
    category: 'Music',
    capacity: 80,
    seatsAvailable: 0,
    organizerId: 'org-2',
    cancelled: false,
  },
  {
    id: 'evt-03',
    name: 'Resume & LinkedIn Clinic',
    description:
      'Drop-in session with alumni volunteers who will review your resume and LinkedIn profile in 15-minute slots. Walk-ins welcome, but seats are limited.',
    date: '2026-09-22T14:00:00',
    venue: 'Placement Cell, Admin Block',
    category: 'Career',
    capacity: 40,
    seatsAvailable: 12,
    organizerId: 'org-3',
    cancelled: false,
  },
  {
    id: 'evt-04',
    name: 'Inter-Hostel Football Cup — Final',
    description:
      "The championship match of this year's Inter-Hostel Football Cup. Come cheer your hostel on.",
    date: '2026-09-05T16:00:00',
    venue: 'Main Sports Ground',
    category: 'Sports',
    capacity: 300,
    seatsAvailable: 45,
    organizerId: 'org-4',
    cancelled: false,
  },
  {
    id: 'evt-05',
    name: 'Intro to Figma Workshop',
    description:
      'A hands-on beginner workshop covering frames, components, and prototyping in Figma. Bring your own laptop.',
    date: '2026-10-10T15:00:00',
    venue: 'Design Studio, Block B',
    category: 'Workshop',
    capacity: 30,
    seatsAvailable: 6,
    organizerId: 'org-2',
    cancelled: false,
  },
  {
    id: 'evt-06',
    name: 'Diwali Mela',
    description:
      'Stalls, rangoli competitions, and a fireworks-free light show to celebrate Diwali on campus. Open to students, faculty, and families.',
    date: '2026-11-01T17:00:00',
    venue: 'Central Quad',
    category: 'Cultural',
    capacity: 500,
    seatsAvailable: 500,
    organizerId: 'org-2',
    cancelled: false,
  },
  {
    id: 'evt-07',
    name: 'Competitive Programming Bootcamp',
    description:
      "Three-hour bootcamp on graph algorithms and dynamic programming, run by the CP club's senior members ahead of the ICPC regionals.",
    date: '2026-09-10T10:00:00',
    venue: 'Computer Science Lab 2',
    category: 'Tech',
    capacity: 60,
    seatsAvailable: 0,
    organizerId: 'org-1',
    cancelled: false,
  },
  {
    id: 'evt-08',
    name: 'Basketball 3x3 Street League',
    description:
      'Casual weekly 3x3 basketball league. Register your team of 3–4, matches are round-robin followed by knockouts.',
    date: '2026-09-30T17:30:00',
    venue: 'Outdoor Courts',
    category: 'Sports',
    capacity: 64,
    seatsAvailable: 20,
    organizerId: 'org-4',
    cancelled: false,
  },
  {
    id: 'evt-09',
    name: 'Startup Pitch Day',
    description:
      'Student founders pitch to a panel of alumni investors for a shot at seed funding and mentorship from the E-Cell.',
    date: '2026-10-18T13:00:00',
    venue: 'Auditorium',
    category: 'Career',
    capacity: 200,
    seatsAvailable: 88,
    organizerId: 'org-3',
    cancelled: false,
  },
  {
    id: 'evt-10',
    name: 'Photography Walk: Old Campus',
    description:
      'A guided golden-hour photo walk through the older parts of campus, led by the Photography Club. All skill levels welcome.',
    date: '2026-09-01T17:00:00',
    venue: 'Meet at Main Gate',
    category: 'Workshop',
    capacity: 25,
    seatsAvailable: 3,
    organizerId: 'org-2',
    cancelled: false,
  },
  {
    id: 'evt-11',
    name: 'Classical Fusion Night',
    description:
      'The Music Society blends Carnatic and Hindustani classical forms with modern instruments in a one-night showcase.',
    date: '2026-10-25T19:00:00',
    venue: 'Amphitheatre Lawn',
    category: 'Music',
    capacity: 150,
    seatsAvailable: 150,
    organizerId: 'org-2',
    cancelled: false,
  },
  {
    id: 'evt-12',
    name: 'Data Structures Doubt-Clearing Marathon',
    description:
      'Pre-exam doubt-clearing session covering trees, heaps, and hashing, run by teaching assistants from the CS department.',
    date: '2026-08-28T11:00:00',
    venue: 'Lecture Hall 4',
    category: 'Tech',
    capacity: 90,
    seatsAvailable: 9,
    organizerId: 'org-1',
    cancelled: false,
  },
  {
    id: 'evt-13',
    name: "Freshers' Orientation Games",
    description:
      'Icebreaker games and campus scavenger hunt for the incoming batch, hosted by the Student Council.',
    date: '2026-09-08T09:30:00',
    venue: 'Central Quad',
    category: 'Cultural',
    capacity: 250,
    seatsAvailable: 0,
    organizerId: 'org-4',
    cancelled: false,
  },
  {
    id: 'evt-14',
    name: 'Cloud & DevOps Study Group Kickoff',
    description:
      'First meetup of a semester-long study group covering AWS fundamentals and CI/CD pipelines. No prior cloud experience needed.',
    date: '2026-09-29T18:00:00',
    venue: 'Computer Science Lab 1',
    category: 'Workshop',
    capacity: 45,
    seatsAvailable: 45,
    organizerId: 'org-1',
    cancelled: false,
  },
  {
    id: 'evt-15',
    name: 'Badminton Doubles Tournament',
    description:
      'Open doubles tournament, singles-elimination bracket. Racquets available to borrow at the sports office.',
    date: '2026-10-12T08:00:00',
    venue: 'Indoor Sports Complex',
    category: 'Sports',
    capacity: 32,
    seatsAvailable: 14,
    organizerId: 'org-4',
    cancelled: false,
  },
]

/** True when the event's date has already passed relative to TODAY. */
export function isPastEvent(event: CampusEvent): boolean {
  return new Date(event.date).getTime() < TODAY.getTime()
}

/** True when there are no seats left. */
export function isFullEvent(event: CampusEvent): boolean {
  return event.seatsAvailable <= 0
}

export function isRegistrationClosed(event: CampusEvent, now = Date.now()): boolean {
  return (
    isPastEvent(event) ||
    Boolean(
      event.registrationDeadline &&
        new Date(event.registrationDeadline).getTime() <= now,
    )
  )
}

/** Look up a single event by id, or undefined if it doesn't exist. */
export function getEventById(id: string): CampusEvent | undefined {
  return events.find((event) => event.id === id)
}

export interface EventInput {
  name: string
  description: string
  date: string
  registrationDeadline: string
  venue: string
  category: EventCategory
  capacity: number
}

export function validateEventInput(input: EventInput, occupiedSeats = 0): string | null {
  if (!input.name.trim()) return 'Enter an event name.'
  const eventTime = new Date(input.date).getTime()
  if (!input.date || Number.isNaN(eventTime) || eventTime <= Date.now()) {
    return 'Choose a date and time in the future.'
  }
  const deadlineTime = new Date(input.registrationDeadline).getTime()
  if (!input.registrationDeadline || Number.isNaN(deadlineTime) || deadlineTime <= Date.now()) {
    return 'Choose a registration closing time in the future.'
  }
  if (deadlineTime > eventTime) {
    return 'Registration must close before the event starts.'
  }
  if (!input.venue.trim()) return 'Enter a venue.'
  if (!Number.isInteger(input.capacity) || input.capacity < 1) {
    return 'Capacity must be a positive whole number.'
  }
  if (input.capacity < occupiedSeats) {
    return `Capacity cannot be less than the ${occupiedSeats} confirmed registrations.`
  }
  return null
}

export function createEvent(input: EventInput, organizerId: string): CampusEvent {
  const event: CampusEvent = {
    ...input,
    id: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    name: input.name.trim(),
    description: input.description.trim(),
    venue: input.venue.trim(),
    seatsAvailable: input.capacity,
    organizerId,
    cancelled: false,
  }
  events.unshift(event)
  return event
}

export function updateEvent(id: string, input: EventInput): CampusEvent | undefined {
  const event = getEventById(id)
  if (!event) return undefined
  const occupiedSeats = event.capacity - event.seatsAvailable
  Object.assign(event, {
    ...input,
    name: input.name.trim(),
    description: input.description.trim(),
    venue: input.venue.trim(),
    seatsAvailable: input.capacity - occupiedSeats,
  })
  return event
}

export function cancelEvent(id: string): boolean {
  const event = getEventById(id)
  if (!event) return false
  event.cancelled = true
  return true
}

/**
 * PARTICIPANT TASK (Task 1 — Event Listing):
 *
 * This is a stub. Right now it ignores `query` completely and just
 * returns every event, which is why `tests/search.test.ts` is failing.
 *
 * You need to make this do a case-insensitive, partial match on
 * `event.name` — e.g. "hack" should match "Hack the Campus 2026".
 */
export function searchEventsByName(
  eventList: CampusEvent[],
  query: string,
): CampusEvent[] {
  const normalizedQuery = query.trim().toLowerCase()
  if (!normalizedQuery) return eventList

  return eventList.filter((event) =>
    event.name.toLowerCase().includes(normalizedQuery),
  )
}

export function filterEventsByCategory(
  eventList: CampusEvent[],
  category: EventCategory | 'All',
): CampusEvent[] {
  if (category === 'All') {
    return eventList
  }

  return eventList.filter((event) => event.category === category)
}

export function filterEventsByStatus(
  eventList: CampusEvent[],
  status: EventStatus,
): CampusEvent[] {
  return eventList.filter((event) => {
    if (status === 'Cancelled') {
      return event.cancelled
    }

    if (event.cancelled) {
      return false
    }

    if (status === 'Closed') {
      return isRegistrationClosed(event)
    }

    if (status === 'Past') {
      return isPastEvent(event)
    }

    if (isPastEvent(event)) {
      return false
    }

    if (status === 'Full') {
      return isFullEvent(event) && !isRegistrationClosed(event)
    }

    return status !== 'Open' || (!isFullEvent(event) && !isRegistrationClosed(event))
  })
}

export type EventSortOption =
  | 'date-asc'
  | 'date-desc'
  | 'popularity-desc'
  | 'popularity-asc'

/**
 * Sort events by date or popularity:
 * - date-asc: Soonest date first (chronological)
 * - date-desc: Latest date first (reverse chronological)
 * - popularity-desc: Highest number of booked seats first
 * - popularity-asc: Lowest number of booked seats first
 */
export function sortEvents(
  eventList: CampusEvent[],
  sortBy: EventSortOption,
): CampusEvent[] {
  const sorted = [...eventList]

  return sorted.sort((a, b) => {
    if (sortBy === 'date-asc') {
      return new Date(a.date).getTime() - new Date(b.date).getTime()
    }
    if (sortBy === 'date-desc') {
      return new Date(b.date).getTime() - new Date(a.date).getTime()
    }
    if (sortBy === 'popularity-desc') {
      const bookedA = a.capacity - a.seatsAvailable
      const bookedB = b.capacity - b.seatsAvailable
      return bookedB - bookedA
    }
    if (sortBy === 'popularity-asc') {
      const bookedA = a.capacity - a.seatsAvailable
      const bookedB = b.capacity - b.seatsAvailable
      return bookedA - bookedB
    }
    return 0
  })
}

