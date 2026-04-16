'use client'

import { useEffect, useState } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import type { CurrentProject } from '@/lib/types'

const STATUS_LABEL: Record<string, string> = {
  planning: 'Planning', 'in-progress': 'In Progress', testing: 'Testing', completed: 'Completed',
}

export default function ProjectPage() {
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<CurrentProject['status']>('planning')
  const [progress, setProgress] = useState(0)
  const [techStack, setTechStack] = useState('')
  const [repoUrl, setRepoUrl] = useState('')
  const [startedAt, setStartedAt] = useState('')
  const [expectedCompletion, setExpectedCompletion] = useState('')
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured) { setLoading(false); return }
      try {
        const supabase = createClient()
        const { data } = await supabase.from('current_project').select('*').limit(1).single()
        if (data) {
          setHasData(true)
          setTitle(data.title ?? '')
          setDescription(data.description ?? '')
          setStatus(data.status ?? 'planning')
          setProgress(data.progress ?? 0)
          setTechStack((data.tech_stack ?? []).join(', '))
          setRepoUrl(data.repo_url ?? '')
          setStartedAt(data.started_at ?? '')
          setExpectedCompletion(data.expected_completion ?? '')
        }
      } catch { /* Supabase not available */ }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="text-white/40 py-20 text-center">Loading...</div>
  if (!hasData) return <p className="text-white/30 py-20 text-center">No project info available.</p>

  const techTags = techStack.split(',').map((s) => s.trim()).filter(Boolean)

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Current Project</h1>
      <p className="text-sm text-white/40 mb-8">What I&apos;m currently working on.</p>

      <div className="space-y-4 max-w-lg">
        <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
          <p className="text-xs text-white/40 mb-1">Project</p>
          <p className="text-lg font-semibold">{title || '\u2014'}</p>
        </div>
        {description && (
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
            <p className="text-xs text-white/40 mb-1">Description</p>
            <p className="text-sm text-white/70">{description}</p>
          </div>
        )}
        <div className="flex gap-3">
          <div className="flex-1 p-4 rounded-xl border border-white/10 bg-white/[0.03]">
            <p className="text-xs text-white/40 mb-1">Status</p>
            <p className="text-sm">{STATUS_LABEL[status]}</p>
          </div>
          <div className="flex-1 p-4 rounded-xl border border-white/10 bg-white/[0.03]">
            <p className="text-xs text-white/40 mb-1">Progress</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full" style={{ width: `${progress}%` }} />
              </div>
              <span className="text-xs text-white/50">{progress}%</span>
            </div>
          </div>
        </div>
        {techTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {techTags.map((t) => (
              <span key={t} className="text-xs px-2.5 py-1 rounded-full border border-white/10 text-white/50">{t}</span>
            ))}
          </div>
        )}
        {(startedAt || expectedCompletion) && (
          <div className="flex gap-3">
            {startedAt && (
              <div className="flex-1 p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                <p className="text-xs text-white/40 mb-1">Started</p>
                <p className="text-sm text-white/60">{new Date(startedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            )}
            {expectedCompletion && (
              <div className="flex-1 p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                <p className="text-xs text-white/40 mb-1">ETA</p>
                <p className="text-sm text-white/60">{new Date(expectedCompletion).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
              </div>
            )}
          </div>
        )}
        {repoUrl && (
          <a href={repoUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-xs text-blue-400 hover:text-blue-300 transition-colors">
            View Repository &rarr;
          </a>
        )}
      </div>
    </div>
  )
}
