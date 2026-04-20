'use client'

import Link from 'next/link'

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Top bar */}
      <header className="px-8 py-4 flex items-center justify-between">
        <h3 className="text-xl tracking-widest">_BASEPLATE</h3>
        <Link href="/" className="text-xs text-white/40 hover:text-white/60 transition-colors">
          ← Back to Portfolio
        </Link>
      </header>

      <main>
        {children}
      </main>
    </div>
  )
}
