import { NextResponse } from 'next/server'
import { getEventById, updateEvent, cancelEvent } from '@/data/events'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const event = getEventById(params.id)
  if (!event) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }
  return NextResponse.json({ event })
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json()
    const result = updateEvent(params.id, body)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json({ success: true, event: result.event })
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Invalid request' },
      { status: 400 },
    )
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } },
) {
  const result = cancelEvent(params.id)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }
  return NextResponse.json({ success: true, event: result.event })
}
