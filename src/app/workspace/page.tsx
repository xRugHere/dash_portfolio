'use client'

import { useEffect, useState } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import type { CurrentProject, CommissionStatus, ActivityEntry, BlogPost } from '@/lib/types'
import WeatherStrip from '../../../components/WeatherStrip'
import ScrollFadeIn from '../../../components/ScrollFadeIn'
import SocialLinks from '../../../components/SocialLinks'

const STATUS_LABEL: Record<string, string> = {
  planning: 'Planning', 'in-progress': 'In Progress', testing: 'Testing', completed: 'Completed',
}

const TYPE_COLORS: Record<string, string> = {
  milestone: 'bg-blue-500/20 text-blue-300',
  update: 'bg-green-500/20 text-green-300',
  note: 'bg-white/10 text-white/60',
  launch: 'bg-amber-500/20 text-amber-300',
}

export default function WorkspacePage() {
  const [project, setProject] = useState<CurrentProject | null>(null)
  const [commission, setCommission] = useState<CommissionStatus | null>(null)
  const [activities, setActivities] = useState<ActivityEntry[]>([])
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured) { setLoading(false); return }
      try {
        const supabase = createClient()
        const [projectRes, commRes, actRes, blogRes] = await Promise.all([
          supabase.from('current_project').select('*').limit(1).single(),
          supabase.from('commissions').select('*').limit(1).single(),
          supabase.from('activity_log').select('*').order('created_at', { ascending: false }).limit(20),
          supabase.from('blog_posts').select('*').eq('published', true).order('created_at', { ascending: false }),
        ])
        if (projectRes.data) setProject(projectRes.data)
        if (commRes.data) setCommission(commRes.data)
        setActivities(actRes.data ?? [])
        setPosts(blogRes.data ?? [])
      } catch { /* queries failed */ }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return <div className="text-white/40 py-20 text-center">Loading workspace...</div>
  }

  const techTags = project?.tech_stack ?? []
  const projectImages = project?.images ?? []

  return (
    <div className="w-full space-y-10">

      {/* Weather */}
      <ScrollFadeIn>
        <WeatherStrip />
      </ScrollFadeIn>

      {/* Current Project & Commissions — side by side */}
      <div className="flex flex-col lg:flex-row gap-6 p-8">
      {/* Current Project */}
      <ScrollFadeIn delay={100} className="flex-1 min-w-0">
      <section>
        <h2 className="text-lg font-bold mb-4 text-center">Current Project</h2>
        {project ? (
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Reference Image */}
            <div className="w-full md:w-72 shrink-0">
              {projectImages.length > 0 ? (
                <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden border border-white/10 bg-white/[0.03]">
                  <Image
                    src={projectImages[selectedImage]}
                    alt={`${project.title} reference ${selectedImage + 1}`}
                    fill
                    className="object-cover"
                  />
                  {projectImages.length > 1 && (
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                      {projectImages.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setSelectedImage(idx)}
                          className={`w-2 h-2 rounded-full transition-colors ${idx === selectedImage ? 'bg-white' : 'bg-white/30 hover:bg-white/50'}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="w-full aspect-[4/3] rounded-xl border border-white/10 bg-white/[0.03] flex items-center justify-center">
                  <p className="text-sm text-white/20">No reference images yet</p>
                </div>
              )}
            </div>

            {/* Project Details */}
            <div className="flex-1 space-y-3 w-full">
              <div className="p-4 rounded-xl">
                <p className="text-lg font-semibold">{project.title}</p>
                {project.description && (
                  <p className="text-sm text-white/50 mt-2">{project.description}</p>
                )}
              </div>
              <div className="flex gap-3">
                <div className="flex-1 p-4 rounded-xl">
                  <p className="text-xs text-white/40 mb-1">Progress</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/50">{project.progress}%</span>
                  </div>
                </div>
              </div>
              {project.repo_url && (
                <a href={project.repo_url} target="_blank" rel="noopener noreferrer"
                  className="inline-block text-xs text-white/40 hover:text-white/60 transition-colors">
                  View Repository →
                </a>
              )}
            </div>
          </div>
        ) : (
          <p className="text-white/30 text-sm text-center">No project info available.</p>
        )}
      </section>
      </ScrollFadeIn>

      {/* Commissions */}
      <ScrollFadeIn delay={300} className="lg:w-120 shrink-0">
      <section>
        <h2 className="text-lg font-bold mb-4">Commissions</h2>
        {commission ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.03]">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${commission.is_open ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.4)]' : 'bg-red-400'}`} />
              <span className="text-sm font-medium">{commission.is_open ? 'Open for Commissions' : 'Commissions Closed'}</span>
            </div>
            {commission.queue_count > 0 && (
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                <p className="text-xs text-white/40 mb-1">Queue</p>
                <p className="text-sm">{commission.queue_count} in queue</p>
              </div>
            )}
            {commission.status_message && (
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                <p className="text-xs text-white/40 mb-1">Status</p>
                <p className="text-sm text-white/70">{commission.status_message}</p>
              </div>
            )}
            {commission.pricing_notes && (
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                <p className="text-xs text-white/40 mb-1">Pricing</p>
                <p className="text-sm text-white/70">{commission.pricing_notes}</p>
              </div>
            )}
            {commission.response_time && (
              <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
                <p className="text-xs text-white/40 mb-1">Response Time</p>
                <p className="text-sm text-white/70">{commission.response_time}</p>
              </div>
            )}
          </div>
        ) : (
          <p className="text-white/30 text-sm">No commission info available.</p>
        )}
      </section>
      </ScrollFadeIn>
      </div>

      {/* Activity Log */}
      <ScrollFadeIn delay={200} className='p-8'>
      <section>
        <h2 className="text-lg font-bold mb-4">Activity Log</h2>
        <div className="space-y-2">
          {activities.length === 0 ? (
            <p className="text-white/30 text-sm">No activity yet.</p>
          ) : (
            activities.map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg border border-white/5 bg-white/[0.02]">
                <span className={`mt-0.5 text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0 ${TYPE_COLORS[entry.type]}`}>
                  {entry.type}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{entry.title}</p>
                  {entry.description && <p className="text-xs text-white/40 mt-0.5">{entry.description}</p>}
                  <p className="text-[10px] text-white/20 mt-1">
                    {new Date(entry.created_at).toLocaleDateString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
      </ScrollFadeIn>

      {/* Blog Posts */}
      <ScrollFadeIn delay={200}>
      <section className='p-8'>
        <h2 className="text-lg font-bold mb-4">Blog Posts</h2>
        <div className="space-y-2">
          {posts.length === 0 ? (
            <p className="text-white/30 text-sm">No published posts yet.</p>
          ) : (
            posts.map((post) => (
              <Link
                key={post.id}
                href={`/workspace/blog/${post.id}`}
                className="block p-4 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-colors"
              >
                <span className="text-sm font-medium">{post.title}</span>
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
            ))
          )}
        </div>
              <section className="relative w-full py-16">
                <ScrollFadeIn delay={200} className='p-8'>
                  <SocialLinks />
                </ScrollFadeIn>
              </section>
      </section>
      </ScrollFadeIn>
    </div>
  )
}
