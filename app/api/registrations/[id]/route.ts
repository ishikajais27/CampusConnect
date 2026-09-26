import { NextResponse } from 'next/server'
import { cancelRegistration } from '@/data/registrations'

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } },
) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get('studentId') || undefined

  const result = cancelRegistration(params.id, studentId)
  if (!result.success) {
    return NextResponse.json({ error: result.error }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}
