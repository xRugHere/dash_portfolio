export interface CurrentProject {
  id: string
  title: string
  description: string
  status: 'planning' | 'in-progress' | 'testing' | 'completed'
  progress: number
  tech_stack: string[]
  repo_url: string | null
  started_at: string | null
  expected_completion: string | null
  updated_at: string
}

export interface CommissionStatus {
  id: string
  is_open: boolean
  queue_count: number
  pricing_notes: string | null
  response_time: string | null
  status_message: string | null
  updated_at: string
}

export interface ActivityEntry {
  id: string
  title: string
  description: string | null
  type: 'milestone' | 'update' | 'note' | 'launch'
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  tags: string[]
  published: boolean
  created_at: string
  updated_at: string
}
