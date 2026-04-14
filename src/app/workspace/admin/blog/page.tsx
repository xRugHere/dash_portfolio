'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { BlogPost } from '@/lib/types'

export default function AdminBlogList() {
  const supabase = createClient()
  const router = useRouter()
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  async function loadPosts() {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false })
    setPosts(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadPosts() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate() {
    const { data } = await supabase.from('blog_posts').insert({
      title: 'Untitled Post',
      slug: `untitled-${Date.now()}`,
      content: '',
      tags: [],
      published: false,
    }).select().single()

    if (data) {
      router.push(`/workspace/admin/blog/${data.id}`)
    }
  }

  async function handleDelete(id: string) {
    await supabase.from('blog_posts').delete().eq('id', id)
    setPosts((prev) => prev.filter((p) => p.id !== id))
  }

  if (loading) return <div className="text-white/40 py-20 text-center">Loading...</div>

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold mb-1">Manage Blog</h1>
          <p className="text-sm text-white/40">Create, edit, and publish posts.</p>
        </div>
        <button
          onClick={handleCreate}
          className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium
                     hover:bg-white/90 transition-colors"
        >
          + New Post
        </button>
      </div>

      <div className="space-y-2">
        {posts.length === 0 && (
          <p className="text-white/30 text-sm text-center py-8">No posts yet. Create your first one.</p>
        )}
        {posts.map((post) => (
          <div key={post.id} className="flex items-center gap-3 p-4 rounded-lg border border-white/5 bg-white/[0.02] group">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <Link
                  href={`/workspace/admin/blog/${post.id}`}
                  className="text-sm font-medium hover:text-white/80 transition-colors"
                >
                  {post.title}
                </Link>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                  post.published ? 'bg-green-500/20 text-green-300' : 'bg-white/10 text-white/40'
                }`}>
                  {post.published ? 'Published' : 'Draft'}
                </span>
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
            </div>
            <button
              onClick={() => handleDelete(post.id)}
              className="text-white/20 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
