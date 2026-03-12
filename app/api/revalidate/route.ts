import { revalidateTag } from 'next/cache'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { tag } = await request.json()

    if (tag) {
      revalidateTag(tag)
    } else {
      // Revalidate all common tags
      revalidateTag('doctor')
      revalidateTag('patients')
      revalidateTag('dashboard')
    }

    return NextResponse.json({ revalidated: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to revalidate' }, { status: 500 })
  }
}
