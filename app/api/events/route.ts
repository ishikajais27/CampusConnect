import { NextResponse } from 'next/server'
import {
  events,
  createEvent,
  searchEventsByName,
  filterEventsByCategory,
  isPastEvent,
  EventCategory,
} from '@/data/events'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const query = searchParams.get('search') || ''
  const category = (searchParams.get('category') as EventCategory | 'All') || 'All'
  const organizerId = searchParams.get('organizerId')
  const includeCancelled = searchParams.get('includeCancelled') === 'true'
  const includePast = searchParams.get('includePast') === 'true'

  let filtered = [...events]

  if (organizerId) {
    filtered = filtered.filter((e) => e.organizerId === organizerId)
  } else {
    if (!includeCancelled) {
      filtered = filtered.filter((e) => !e.cancelled)
    }
    if (!includePast) {
      filtered = filtered.filter((e) => !isPastEvent(e))
    }
  }

  if (category && category !== 'All') {
    filtered = filterEventsByCategory(filtered, category)
  }

  if (query) {
    filtered = searchEventsByName(filtered, query)
  }

  return NextResponse.json({ events: filtered })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = createEvent({
      name: body.name,
      description: body.description,
      date: body.date,
      venue: body.venue,
      category: body.category,
      capacity: Number(body.capacity),
      organizerId: body.organizerId || 'org-1',
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({ success: true, event: result.event }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Invalid request' }, { status: 400 })
  }
}
