'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/lib/useAuth'

const adminNavItems = [
  { href: '/workspace/admin', label: 'Overview', icon: '◆' },
  { href: '/workspace/admin/project', label: 'Edit Project', icon: '▶' },
  { href: '/workspace/admin/commissions', label: 'Edit Commissions', icon: '◎' },
  { href: '/workspace/admin/activity', label: 'Manage Activity', icon: '◈' },
  { href: '/workspace/admin/blog', label: 'Manage Blog', icon: '▤' },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { isAuthenticated, loading } = useAuth()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/workspace')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <p className="text-white/40">Loading...</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    router.push('/workspace/login')
    return null
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-white/10 bg-white/[0.02] flex flex-col">
        <div className="p-5 border-b border-white/10">
          <Link href="/workspace" className="text-xs text-white/40 hover:text-white/60 transition-colors">
            ← View Workspace
          </Link>
          <h2 className="text-lg font-bold mt-2">Admin</h2>
          <p className="text-[10px] text-white/25 mt-0.5">Editing mode</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {adminNavItems.map((item) => {
            const isActive = pathname === item.href ||
              (item.href !== '/workspace/admin' && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors
                  ${isActive
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  }`}
              >
                <span className="text-xs">{item.icon}</span>
                {item.label}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 rounded-lg text-sm text-white/40 hover:text-red-400
                       hover:bg-red-400/10 transition-colors text-left"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
