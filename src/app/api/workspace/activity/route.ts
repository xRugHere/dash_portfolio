import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('activity_log')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    return Response.json({ error: 'Failed to fetch activity log' }, { status: 500 })
  }

  return Response.json(data ?? [])
}
