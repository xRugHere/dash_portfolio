'use client'

import { useEffect, useState } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import Link from 'next/link'
import type { CurrentProject, CommissionStatus } from '@/lib/types'
import WeatherStrip from '../../../components/WeatherStrip'

export default function WorkspaceDashboard() {
  const [project, setProject] = useState<CurrentProject | null>(null)
  const [commission, setCommission] = useState<CommissionStatus | null>(null)
  const [activityCount, setActivityCount] = useState(0)
  const [blogCount, setBlogCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured) {
        setLoading(false)
        return
      }
      try {
        const supabase = createClient()
        const [projectRes, commRes, actRes, blogRes] = await Promise.all([
          supabase.from('current_project').select('*').limit(1).single(),
          supabase.from('commissions').select('*').limit(1).single(),
          supabase.from('activity_log').select('id', { count: 'exact', head: true }),
          supabase.from('blog_posts').select('id', { count: 'exact', head: true }).eq('published', true),
        ])

        if (projectRes.data) setProject(projectRes.data)
        if (commRes.data) setCommission(commRes.data)
        setActivityCount(actRes.count ?? 0)
        setBlogCount(blogRes.count ?? 0)
      } catch {
        // Supabase queries failed — leave defaults
      }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <div className="text-white/40 py-20 text-center">Loading workspace...</div>
  }

  const cards = [
    {
      title: 'Current Project',
      href: '/workspace/project',
      value: project?.title ?? 'Not set',
      sub: project ? `${project.status} · ${project.progress}%` : 'No project configured',
      color: 'border-blue-500/30',
    },
    {
      title: 'Commissions',
      href: '/workspace/commissions',
      value: commission?.is_open ? 'Open' : commission ? 'Closed' : 'Not set',
      sub: commission ? `${commission.queue_count} in queue` : 'No commission info',
      color: commission?.is_open ? 'border-green-500/30' : 'border-red-500/30',
    },
    {
      title: 'Activity Log',
      href: '/workspace/activity',
      value: `${activityCount} entries`,
      sub: 'Milestones, updates, notes',
      color: 'border-purple-500/30',
    },
    {
      title: 'Blog Posts',
      href: '/workspace/blog',
      value: `${blogCount} posts`,
      sub: 'Dev notes & articles',
      color: 'border-amber-500/30',
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
      <p className="text-sm text-white/40 mb-6">
        A live view of what I&apos;m currently working on and my availability.
      </p>

      <div className="mb-6">
        <WeatherStrip />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className={`block p-5 rounded-xl border ${card.color} bg-white/[0.03] hover:bg-white/[0.06] transition-colors`}
          >
            <p className="text-xs text-white/40 mb-2">{card.title}</p>
            <p className="text-lg font-semibold">{card.value}</p>
            <p className="text-xs text-white/30 mt-1">{card.sub}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
