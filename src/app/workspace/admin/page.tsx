'use client'

import Link from 'next/link'

const sections = [
  { href: '/workspace/admin/project', label: 'Current Project', desc: 'Update what project is displayed on your portfolio.', icon: '▶' },
  { href: '/workspace/admin/commissions', label: 'Commissions', desc: 'Toggle availability, pricing, and queue info.', icon: '◎' },
  { href: '/workspace/admin/activity', label: 'Activity Log', desc: 'Add or remove milestones, updates, and notes.', icon: '◈' },
  { href: '/workspace/admin/blog', label: 'Blog Posts', desc: 'Create, edit, and publish blog posts.', icon: '▤' },
]

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Admin Overview</h1>
      <p className="text-sm text-white/40 mb-8">
        Manage what shows on your portfolio. Changes go live in ~60 seconds.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="block p-5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.06] transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs">{s.icon}</span>
              <p className="text-sm font-medium">{s.label}</p>
            </div>
            <p className="text-xs text-white/30">{s.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 p-4 rounded-xl border border-white/5 bg-white/[0.02]">
        <p className="text-xs text-white/30">
          <Link href="/workspace" className="text-blue-400 hover:text-blue-300 transition-colors">
            View the public workspace →
          </Link>
          {' '}to see what visitors see.
        </p>
      </div>
    </div>
  )
}
