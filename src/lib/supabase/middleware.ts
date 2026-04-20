import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  // Auth removed — data is managed directly through Supabase
  return NextResponse.next({ request })
}
