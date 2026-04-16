'use client'

import { useEffect, useState } from 'react'
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client'

export default function CommissionsPage() {
  const [loading, setLoading] = useState(true)
  const [isOpen, setIsOpen] = useState(false)
  const [queueCount, setQueueCount] = useState(0)
  const [pricingNotes, setPricingNotes] = useState('')
  const [responseTime, setResponseTime] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [hasData, setHasData] = useState(false)

  useEffect(() => {
    async function load() {
      if (!isSupabaseConfigured) { setLoading(false); return }
      try {
        const supabase = createClient()
        const { data } = await supabase.from('commissions').select('*').limit(1).single()
        if (data) {
          setHasData(true)
          setIsOpen(data.is_open ?? false)
          setQueueCount(data.queue_count ?? 0)
          setPricingNotes(data.pricing_notes ?? '')
          setResponseTime(data.response_time ?? '')
          setStatusMessage(data.status_message ?? '')
        }
      } catch { /* Supabase not available */ }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <div className="text-white/40 py-20 text-center">Loading...</div>
  if (!hasData) return <p className="text-white/30 py-20 text-center">No commission info available.</p>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Commissions</h1>
      <p className="text-sm text-white/40 mb-8">Current commission availability.</p>

      <div className="space-y-4 max-w-lg">
        <div className="flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.03]">
          <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${isOpen ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.4)]' : 'bg-red-400'}`} />
          <span className="text-sm font-medium">{isOpen ? 'Open for Commissions' : 'Commissions Closed'}</span>
        </div>
        {queueCount > 0 && (
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
            <p className="text-xs text-white/40 mb-1">Queue</p>
            <p className="text-sm">{queueCount} in queue</p>
          </div>
        )}
        {statusMessage && (
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
            <p className="text-xs text-white/40 mb-1">Status</p>
            <p className="text-sm text-white/70">{statusMessage}</p>
          </div>
        )}
        {pricingNotes && (
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
            <p className="text-xs text-white/40 mb-1">Pricing</p>
            <p className="text-sm text-white/70">{pricingNotes}</p>
          </div>
        )}
        {responseTime && (
          <div className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
            <p className="text-xs text-white/40 mb-1">Response Time</p>
            <p className="text-sm text-white/70">{responseTime}</p>
          </div>
        )}
      </div>
    </div>
  )
}
