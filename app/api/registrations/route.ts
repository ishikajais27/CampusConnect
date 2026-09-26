import { NextResponse } from 'next/server'
import {
  registrations,
  getRegistrationsForStudent,
  registerStudentForEvent,
} from '@/data/registrations'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get('studentId')
  const includeCancelled = searchParams.get('includeCancelled') === 'true'

  if (studentId) {
    const studentRegistrations = getRegistrationsForStudent(
      studentId,
      includeCancelled,
    )
    return NextResponse.json({ registrations: studentRegistrations })
  }

  return NextResponse.json({ registrations })
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { studentId, eventId } = body

    if (!studentId || !eventId) {
      return NextResponse.json(
        { error: 'Both studentId and eventId are required.' },
        { status: 400 },
      )
    }

    const result = registerStudentForEvent(studentId, eventId)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json(
      { success: true, registration: result.registration },
      { status: 201 },
    )
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || 'Invalid request' },
      { status: 400 },
    )
  }
}
