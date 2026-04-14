'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import type { BlogPost } from '@/lib/types'

export default function BlogList() {
  const supabase = createClient()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false })
      setPosts(data ?? [])
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="text-white/40 py-20 text-center">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Blog Posts</h1>
      <p className="text-sm text-white/40 mb-8">Dev notes, articles, and updates.</p>

      <div className="space-y-2">
        {posts.length === 0 && (
          <p className="text-white/30 text-sm text-center py-8">No published posts yet.</p>
        )}
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/workspace/blog/${post.id}`}
            className="block p-4 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{post.title}</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[10px] text-white/20">
                {new Date(post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>
              {post.tags.length > 0 && (
                <div className="flex gap-1">
                  {post.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/30">{tag}</span>
                  ))}
                </div>
              )}
            </div>
            {post.content && (
              <p className="text-xs text-white/30 mt-2 line-clamp-2">{post.content.slice(0, 200)}</p>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}
