'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { CurrentProject } from '@/lib/types'

const STATUS_OPTIONS = ['planning', 'in-progress', 'testing', 'completed'] as const

export default function AdminProjectPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<CurrentProject['status']>('planning')
  const [progress, setProgress] = useState(0)
  const [techStack, setTechStack] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [startedAt, setStartedAt] = useState('')
  const [expectedCompletion, setExpectedCompletion] = useState('')
  const [existingId, setExistingId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('current_project').select('*').limit(1).single()
      if (data) {
        setExistingId(data.id)
        setTitle(data.title ?? '')
        setDescription(data.description ?? '')
        setStatus(data.status ?? 'planning')
        setProgress(data.progress ?? 0)
        setTechStack((data.tech_stack ?? []).join(', '))
        setRepoUrl(data.repo_url ?? '')
        setStartedAt(data.started_at ?? '')
        setExpectedCompletion(data.expected_completion ?? '')
      }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    const payload = {
      title,
      description,
      status,
      progress,
      tech_stack: techStack.split(',').map((s) => s.trim()).filter(Boolean),
      repo_url: repoUrl || null,
      started_at: startedAt || null,
      expected_completion: expectedCompletion || null,
      updated_at: new Date().toISOString(),
    }

    if (existingId) {
      await supabase.from('current_project').update(payload).eq('id', existingId)
    } else {
      const { data } = await supabase.from('current_project').insert(payload).select().single()
      if (data) setExistingId(data.id)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <div className="text-white/40 py-20 text-center">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Edit Project</h1>
      <p className="text-sm text-white/40 mb-8">This is what visitors see on your portfolio.</p>

      <form onSubmit={handleSave} className="space-y-5 max-w-lg">
        <Field label="Project Title">
          <input
            value={title} onChange={(e) => setTitle(e.target.value)} required
            className="ws-input" placeholder="My Cool Project"
          />
        </Field>

        <Field label="Description">
          <textarea
            value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
            className="ws-input resize-none" placeholder="What are you building?"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Status">
            <select value={status} onChange={(e) => setStatus(e.target.value as CurrentProject['status'])} className="ws-input">
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </Field>

          <Field label={`Progress — ${progress}%`}>
            <input
              type="range" min={0} max={100} value={progress}
              onChange={(e) => setProgress(Number(e.target.value))}
              className="w-full accent-white mt-2"
            />
          </Field>
        </div>

        <Field label="Tech Stack (comma-separated)">
          <input
            value={techStack} onChange={(e) => setTechStack(e.target.value)}
            className="ws-input" placeholder="React, TypeScript, Supabase"
          />
        </Field>

        <Field label="Repository URL">
          <input
            value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)}
            className="ws-input" placeholder="https://github.com/..."
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Started">
            <input type="date" value={startedAt} onChange={(e) => setStartedAt(e.target.value)} className="ws-input" />
          </Field>
          <Field label="Expected Completion">
            <input type="date" value={expectedCompletion} onChange={(e) => setExpectedCompletion(e.target.value)} className="ws-input" />
          </Field>
        </div>

        <button
          type="submit" disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-medium
                     hover:bg-white/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save Project'}
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
