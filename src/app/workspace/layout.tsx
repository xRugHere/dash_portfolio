'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { href: '/workspace', label: 'Dashboard', icon: '◆' },
  { href: '/workspace/project', label: 'Project', icon: '▶' },
  { href: '/workspace/commissions', label: 'Commissions', icon: '◎' },
  { href: '/workspace/activity', label: 'Activity', icon: '◈' },
  { href: '/workspace/blog', label: 'Blog', icon: '▤' },
]

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  // Don't wrap login or admin pages with the public sidebar
  if (pathname === '/workspace/login' || pathname.startsWith('/workspace/admin')) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-white/10 bg-white/[0.02] flex flex-col">
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="text-xs text-white/40 hover:text-white/60 transition-colors">
            ← Back to Portfolio
          </Link>
          <h2 className="text-lg font-bold mt-2">Workspace</h2>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const isActive = pathname === item.href
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
          <Link
            href="/workspace/admin"
            className="block w-full px-3 py-2 rounded-lg text-sm text-white/30 hover:text-white/60
                       hover:bg-white/5 transition-colors"
          >
            Admin →
          </Link>
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
