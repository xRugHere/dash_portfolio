'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { ActivityEntry } from '@/lib/types'

const TYPE_COLORS: Record<string, string> = {
  milestone: 'bg-blue-500/20 text-blue-300',
  update: 'bg-green-500/20 text-green-300',
  note: 'bg-white/10 text-white/60',
  launch: 'bg-amber-500/20 text-amber-300',
}

export default function ActivityPage() {
  const supabase = createClient()
  const [entries, setEntries] = useState<ActivityEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)
      setEntries(data ?? [])
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="text-white/40 py-20 text-center">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Activity Log</h1>
      <p className="text-sm text-white/40 mb-8">Recent milestones, updates, and notes.</p>

      <div className="space-y-2">
        {entries.length === 0 && (
          <p className="text-white/30 text-sm text-center py-8">No activity yet.</p>
        )}
        {entries.map((entry) => (
          <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.02]">
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
          </div>
        ))}
      </div>
    </div>
  )
}
