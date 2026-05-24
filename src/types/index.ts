export interface Workspace {
  id: string
  name: string
  logo_url?: string
  owner_id: string
  plan: 'free' | 'pro' | 'enterprise'
  created_at: string
}

export interface WorkspaceMember {
  id: string
  workspace_id: string
  user_id: string
  role: 'owner' | 'admin' | 'member'
  email: string
  name: string
  avatar_url?: string
  created_at: string
}

export interface ChecklistTemplate {
  id: string
  workspace_id: string
  name: string
  description?: string
  steps: ChecklistStep[]
  created_by: string
  created_at: string
  updated_at: string
}

export interface ChecklistStep {
  id: string
  template_id: string
  title: string
  description?: string
  order: number
  link_url?: string
  is_required: boolean
}

export interface Customer {
  id: string
  workspace_id: string
  name: string
  email: string
  company?: string
  template_id: string
  status: 'not_started' | 'in_progress' | 'completed' | 'at_risk'
  assigned_to?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface CustomerProgress {
  id: string
  customer_id: string
  step_id: string
  completed: boolean
  completed_at?: string
}

export interface DashboardStats {
  total_customers: number
  completed: number
  in_progress: number
  not_started: number
  at_risk: number
  completion_rate: number
}
