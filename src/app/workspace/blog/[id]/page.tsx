'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function BlogPostReader() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [createdAt, setCreatedAt] = useState('')

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .eq('published', true)
        .single()
      if (!data) {
        router.push('/workspace/blog')
        return
      }
      setTitle(data.title ?? '')
      setContent(data.content ?? '')
      setTags(data.tags ?? [])
      setCreatedAt(data.created_at ?? '')
      setLoading(false)
    }
    load()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="text-white/40 py-20 text-center">Loading...</div>

  return (
    <div>
      <button
        onClick={() => router.push('/workspace/blog')}
        className="text-xs text-white/40 hover:text-white/60 mb-6 transition-colors"
      >
        &larr; Back to Posts
      </button>

      <article className="max-w-2xl">
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <div className="flex items-center gap-3 mb-8">
          <p className="text-xs text-white/30">
            {createdAt && new Date(createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          {tags.length > 0 && (
            <div className="flex gap-1">
              {tags.map((tag) => (
                <span key={tag} className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/30">{tag}</span>
              ))}
            </div>
          )}
        </div>
        <div className="text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
          {content || 'No content.'}
        </div>
      </article>
    </div>
  )
}
