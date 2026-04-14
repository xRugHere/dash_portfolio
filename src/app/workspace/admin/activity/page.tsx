'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ActivityEntry } from '@/lib/types'

const TYPE_OPTIONS = ['milestone', 'update', 'note', 'launch'] as const
const TYPE_COLORS: Record<string, string> = {
  milestone: 'bg-blue-500/20 text-blue-300',
  update: 'bg-green-500/20 text-green-300',
  note: 'bg-white/10 text-white/60',
  launch: 'bg-amber-500/20 text-amber-300',
}

export default function AdminActivityPage() {
  const supabase = createClient()
  const [entries, setEntries] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<ActivityEntry['type']>('update')
  const [adding, setAdding] = useState(false)

  async function loadEntries() {
    const { data } = await supabase
      .from('activity_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    setEntries(data ?? [])
    setLoading(false)
  }

  useEffect(() => { loadEntries() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAdding(true)

    await supabase.from('activity_log').insert({
      title,
      description: description || null,
      type,
    })

    setTitle('')
    setDescription('')
    setType('update')
    setAdding(false)
    loadEntries()
  }

  async function handleDelete(id: string) {
    await supabase.from('activity_log').delete().eq('id', id)
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  if (loading) return <div className="text-white/40 py-20 text-center">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Manage Activity</h1>
      <p className="text-sm text-white/40 mb-8">Track milestones, updates, and notes.</p>

      <form onSubmit={handleAdd} className="p-4 rounded-xl border border-white/10 bg-white/[0.03] mb-8 space-y-3">
        <p className="text-xs text-white/50 font-medium">New Entry</p>
        <div className="flex gap-3">
          <input
            value={title} onChange={(e) => setTitle(e.target.value)} required
            placeholder="What happened?"
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm
                       placeholder:text-white/25 focus:outline-none focus:border-white/30"
          />
          <select
            value={type} onChange={(e) => setType(e.target.value as ActivityEntry['type'])}
            className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm appearance-auto
                       focus:outline-none focus:border-white/30"
          >
            {TYPE_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <textarea
          value={description} onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details..."
          rows={2}
          className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-sm resize-none
                     placeholder:text-white/25 focus:outline-none focus:border-white/30"
        />
        <button
          type="submit" disabled={adding}
          className="px-4 py-2 rounded-lg bg-white text-black text-sm font-medium
                     hover:bg-white/90 transition-colors disabled:opacity-50"
        >
          {adding ? 'Adding...' : 'Add Entry'}
        </button>
      </form>

      <div className="space-y-2">
        {entries.length === 0 && (
          <p className="text-white/30 text-sm text-center py-8">No activity yet.</p>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.02] group">
            <span className={`mt-0.5 text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${TYPE_COLORS[entry.type]}`}>
              {entry.type}
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{entry.title}</p>
              {entry.description && <p className="text-xs text-white/40 mt-0.5">{entry.description}</p>}
              <p className="text-[10px] text-white/20 mt-1">
                {new Date(entry.created_at).toLocaleDateString('en-US', {
                  month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                })}
              </p>
            </div>
            <button
              onClick={() => handleDelete(entry.id)}
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
