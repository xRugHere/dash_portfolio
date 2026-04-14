'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function AdminCommissionsPage() {
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const [isOpen, setIsOpen] = useState(false)
  const [queueCount, setQueueCount] = useState(0)
  const [pricingNotes, setPricingNotes] = useState('')
  const [responseTime, setResponseTime] = useState('')
  const [statusMessage, setStatusMessage] = useState('')
  const [existingId, setExistingId] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('commissions').select('*').limit(1).single()
      if (data) {
        setExistingId(data.id)
        setIsOpen(data.is_open ?? false)
        setQueueCount(data.queue_count ?? 0)
        setPricingNotes(data.pricing_notes ?? '')
        setResponseTime(data.response_time ?? '')
        setStatusMessage(data.status_message ?? '')
      }
      setLoading(false)
    }
    load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaved(false)

    const payload = {
      is_open: isOpen,
      queue_count: queueCount,
      pricing_notes: pricingNotes || null,
      response_time: responseTime || null,
      status_message: statusMessage || null,
      updated_at: new Date().toISOString(),
    }

    if (existingId) {
      await supabase.from('commissions').update(payload).eq('id', existingId)
    } else {
      const { data } = await supabase.from('commissions').insert(payload).select().single()
      if (data) setExistingId(data.id)
    }

    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) return <div className="text-white/40 py-20 text-center">Loading...</div>

  return (
    <div>
      <h1 className="text-2xl font-bold mb-1">Edit Commissions</h1>
      <p className="text-sm text-white/40 mb-8">Manage your commission availability.</p>

      <form onSubmit={handleSave} className="space-y-5 max-w-lg">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className={`relative w-12 h-6 rounded-full transition-colors ${isOpen ? 'bg-green-500' : 'bg-white/20'}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform
                ${isOpen ? 'translate-x-6' : ''}`}
            />
          </button>
          <span className="text-sm">{isOpen ? 'Open for commissions' : 'Commissions closed'}</span>
        </div>

        <Field label="Queue Count">
          <input
            type="number" min={0} value={queueCount}
            onChange={(e) => setQueueCount(Number(e.target.value))}
            className="ws-input w-24"
          />
        </Field>

        <Field label="Pricing Notes">
          <textarea
            value={pricingNotes} onChange={(e) => setPricingNotes(e.target.value)}
            rows={3} className="ws-input resize-none"
            placeholder="Starting at $... / Depends on scope / etc."
          />
        </Field>

        <Field label="Response Time">
          <input
            value={responseTime} onChange={(e) => setResponseTime(e.target.value)}
            className="ws-input" placeholder="Usually within 24 hours"
          />
        </Field>

        <Field label="Status Message">
          <textarea
            value={statusMessage} onChange={(e) => setStatusMessage(e.target.value)}
            rows={2} className="ws-input resize-none"
            placeholder="Currently focused on... / Happy to chat about new projects"
          />
        </Field>

        <button
          type="submit" disabled={saving}
          className="px-5 py-2.5 rounded-lg bg-white text-black text-sm font-medium
                     hover:bg-white/90 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : saved ? '✓ Saved' : 'Save'}
        </button>
      </form>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs text-white/60 mb-1.5">{label}</label>
      {children}
    </div>
  )
}
