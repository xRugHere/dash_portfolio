'use client'

import { useEffect, useState } from 'react'
import localFont from 'next/font/local'
import type { CurrentProject, CommissionStatus, ActivityEntry } from '../src/lib/types'

const pixelFont = localFont({
  src: [{ path: '../public/fonts/PixelFont.ttf', weight: '400', style: 'normal' }],
})

const STATUS_LABEL: Record<string, string> = {
  planning: 'PLANNING',
  'in-progress': 'IN PROGRESS',
  testing: 'TESTING',
  completed: 'COMPLETED',
}

const STATUS_COLOR: Record<string, string> = {
  planning: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
  'in-progress': 'text-green-400 border-green-400/30 bg-green-400/10',
  testing: 'text-amber-400 border-amber-400/30 bg-amber-400/10',
  completed: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
}

const ACTIVITY_ICON: Record<string, string> = {
  milestone: '◆',
  update: '▸',
  note: '·',
  launch: '★',
}

export default function CurrentStatusSection() {
  const [project, setProject] = useState<CurrentProject | null>(null)
  const [commission, setCommission] = useState<CommissionStatus | null>(null)
  const [activity, setActivity] = useState<ActivityEntry[]>([])
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    async function fetchAll() {
      const [projRes, commRes, actRes] = await Promise.all([
        fetch('/api/workspace/current-project').then((r) => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/workspace/commissions').then((r) => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/workspace/activity').then((r) => r.ok ? r.json() : null).catch(() => null),
      ])
      if (projRes) setProject(projRes)
      if (commRes) setCommission(commRes)
      if (actRes) setActivity(actRes.slice(0, 5))
      setLoaded(true)
    }
    fetchAll()
  }, [])

  // Don't render anything until loaded; if no data at all, hide section
  if (!loaded) {
    return (
      <div className={`w-full max-w-3xl mx-auto px-4 py-12 ${pixelFont.className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-48 bg-white/5 rounded" />
          <div className="h-32 bg-white/5 rounded-xl" />
          <div className="h-24 bg-white/5 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!project && !commission && activity.length === 0) return null

  return (
    <div className={`w-full max-w-3xl mx-auto px-4 py-8 ${pixelFont.className}`}>
      <p className="text-white/30 text-xs tracking-[0.3em] uppercase mb-6">&gt; Current Status</p>

      <div className="space-y-4">
        {/* ── Current Project ── */}
        {project && (
          <div className="p-5 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-lg text-white">{project.title}</p>
                <p className="text-xs text-white/40 mt-1">{project.description}</p>
              </div>
              <span className={`shrink-0 text-[10px] px-2.5 py-1 rounded-full border ${STATUS_COLOR[project.status]}`}>
                {STATUS_LABEL[project.status]}
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] text-white/30">PROGRESS</span>
                <span className="text-[10px] text-white/50">{project.progress}%</span>
              </div>
              <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000"
                  style={{ width: `${project.progress}%` }}
                />
              </div>
            </div>

            {/* Tech stack tags */}
            {project.tech_stack.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-4">
                {project.tech_stack.map((tech) => (
                  <span key={tech} className="text-[10px] px-2 py-0.5 rounded-full border border-white/10 text-white/40 bg-white/[0.03]">
                    {tech}
                  </span>
                ))}
              </div>
            )}

            {/* Dates */}
            {(project.started_at || project.expected_completion) && (
              <div className="flex gap-4 mt-3">
                {project.started_at && (
                  <span className="text-[10px] text-white/20">
                    Started {new Date(project.started_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
                {project.expected_completion && (
                  <span className="text-[10px] text-white/20">
                    ETA {new Date(project.expected_completion).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── Commission Status ── */}
        {commission && (
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm flex items-center gap-4">
            <div
              className={`w-2 h-2 rounded-full shrink-0 ${commission.is_open ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.4)]' : 'bg-red-400'}`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white">
                {commission.is_open ? 'Open for Commissions' : 'Commissions Closed'}
              </p>
              {commission.status_message && (
                <p className="text-xs text-white/30 mt-0.5">{commission.status_message}</p>
              )}
            </div>
            {commission.is_open && commission.queue_count > 0 && (
              <span className="text-[10px] text-white/30 shrink-0">
                {commission.queue_count} in queue
              </span>
            )}
          </div>
        )}

        {/* ── Recent Activity Timeline ── */}
        {activity.length > 0 && (
          <div className="p-5 rounded-xl border border-white/10 bg-white/[0.03] backdrop-blur-sm">
            <p className="text-[10px] text-white/30 tracking-[0.2em] uppercase mb-3">Recent Activity</p>
            <div className="space-y-2.5">
              {activity.map((entry, i) => (
                <div key={entry.id} className="flex items-start gap-2.5">
                  {/* Timeline connector */}
                  <div className="flex flex-col items-center pt-1">
                    <span className="text-[10px] text-white/30">{ACTIVITY_ICON[entry.type]}</span>
                    {i < activity.length - 1 && <div className="w-px h-full bg-white/5 mt-1" />}
                  </div>
                  <div className="flex-1 min-w-0 pb-1">
                    <p className="text-xs text-white/70">{entry.title}</p>
                    {entry.description && <p className="text-[10px] text-white/25 mt-0.5">{entry.description}</p>}
                    <p className="text-[10px] text-white/15 mt-0.5">
                      {new Date(entry.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
