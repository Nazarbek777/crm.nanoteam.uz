export interface BaseUser {
  id: number
  name?: string | null
  email?: string | null
  phone?: string | null
}

export interface Notification {
  id: number
  title?: string | null
  message?: string | null
  is_read?: boolean
  created_at?: string | null
  master_id?: number | null
  client_id?: number | null
  transferred_by?: BaseUser | null
}

export interface MasterSummary {
  id: number
  name: string
  phone?: string | null
  email?: string | null
}

export interface ClientSummary {
  id: number
  name: string
  phone?: string | null
  email?: string | null
  status: string
  house_type?: string | null
  payment_method?: string | null
  last_conversation_date?: string | null
}

export interface Conversation {
  id: number
  topic?: string | null
  note?: string | null
  result?: string | null
  conversation_type?: string | null
  conversation_date?: string | null
  next_action?: string | null
  master?: MasterSummary | null
  client?: ClientSummary | null
  user?: BaseUser | null
}

export interface Reminder {
  id: number
  note?: string | null
  reminder_date?: string | null
  is_completed?: boolean
  master?: MasterSummary | null
  client?: ClientSummary | null
  user?: BaseUser | null
}

export interface Master extends MasterSummary {
  specialization?: string | null
  address?: string | null
  telegram_username?: string | null
  experience_years?: number | null
  region?: string | null
  district?: string | null
  status: string
  operator?: BaseUser | null
  last_conversation_date?: string | null
  conversations?: Conversation[]
  reminders?: Reminder[]
  notifications?: Notification[]
}

export interface Client extends ClientSummary {
  operator?: BaseUser | null
  conversations?: Conversation[]
  reminders?: Reminder[]
}

export interface TechnicalUser extends BaseUser {}

export interface DashboardStats {
  total_masters: number
  total_clients: number
  total_conversations: number
  today_reminders: number
  active_masters: number
  active_clients: number
}


