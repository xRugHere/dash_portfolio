import { createServiceClient } from '@/lib/supabase/service'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('blog_posts')
    .select('id, title, slug, content, tags, published, created_at, updated_at')
    .eq('published', true)
    .order('created_at', { ascending: false })

  if (error) {
    return Response.json({ error: 'Failed to fetch blog posts' }, { status: 500 })
  }

  return Response.json(data ?? [])
}
