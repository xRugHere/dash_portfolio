'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

function slugify(text: string) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export default function AdminBlogPostEditor() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState('')
  const [published, setPublished] = useState(false)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('blog_posts').select('*').eq('id', id).single()
      if (!data) {
        router.push('/workspace/admin/blog')
        return
      }
      setTitle(data.title ?? '')
      setSlug(data.slug ?? '')
      setContent(data.content ?? '')
      setTags((data.tags ?? []).join(', '))
      setPublished(data.published ?? false)
      setLoading(false)
    }
    load()
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    await supabase.from('blog_posts').update({
      title,
      slug: slug || slugify(title),
      content,
      tags: tags.split(',').map((s) => s.trim()).filter(Boolean),
      published,
      updated_at: new Date().toISOString(),
    }).eq('id', id)

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <div className="text-white/40 py-20 text-center">Loading...</div>

  return (
    <div>
      <button
        onClick={() => router.push('/workspace/admin/blog')}
        className="text-xs text-white/40 hover:text-white/60 mb-4 transition-colors"
      >
        ← Back to Posts
      </button>

      <h1 className="text-2xl font-bold mb-6">Edit Post</h1>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Title">
            <input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value)
                if (!slug || slug.startsWith('untitled-')) setSlug(slugify(e.target.value))
              }}
              required className="ws-input" placeholder="Post title"
            />
          </Field>
          <Field label="Slug">
            <input value={slug} onChange={(e) => setSlug(e.target.value)} className="ws-input" placeholder="url-friendly-slug" />
          </Field>
        </div>

        <Field label="Content (Markdown)">
          <textarea
            value={content} onChange={(e) => setContent(e.target.value)}
            rows={20}
            className="ws-input resize-y font-mono text-xs leading-relaxed"
            placeholder="Write your post in Markdown..."
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Tags (comma-separated)">
            <input value={tags} onChange={(e) => setTags(e.target.value)} className="ws-input" placeholder="nextjs, react, devlog" />
          </Field>
          <div className="flex items-end pb-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)}
                className="w-4 h-4 accent-white rounded"
              />
              <span className="text-sm text-white/60">Published</span>
            </label>
          </div>
        </div>

        <button
          type="submit" disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-medium
                     hover:bg-white/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Post'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-white/60 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
