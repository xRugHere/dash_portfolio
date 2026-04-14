import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('current_project')
    .select('*')
    .limit(1)
    .single()

  if (error) {
    return Response.json({ error: 'No project data found' }, { status: 404 })
  }

  return Response.json(data)
}
