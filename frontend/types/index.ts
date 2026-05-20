export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  role: 'engineer' | 'client' | 'admin'
  is_verified: boolean
  date_joined: string
}

export interface Skill {
  id: number
  name: string
}

export interface Certification {
  id: number
  name: string
  issuer: string
  issued_on: string
  expires?: string
  document?: string
}

export interface PortfolioMedia {
  id: number
  media_type: 'image' | 'video' | 'document'
  url: string
  caption: string
  order: number
}

export interface PortfolioProject {
  id: number
  title: string
  description: string
  location: string
  client_name: string
  value?: number
  completed: string
  cover_image: string
  media: PortfolioMedia[]
  created_at: string
}

export interface EngineerProfile {
  id: number
  // FIX: added — ContactButton needs the User UUID (not the profile integer id)
  // to call StartConversationView which does User.objects.get(id=participant_id)
  user_id: string
  slug: string
  full_name: string
  email?: string
  title: string
  specialization: string
  bio: string
  years_exp: number
  hourly_rate?: number
  availability: 'available' | 'busy' | 'unavailable'
  location_city: string
  location_country: string
  location_lat?: number
  location_lng?: number
  avatar: string
  linkedin_url?: string
  website_url?: string
  is_verified: boolean
  avg_rating: number
  review_count: number
  profile_views: number
  skills: Skill[]
  certifications: Certification[]
  portfolio: PortfolioProject[]
  created_at: string
}

export interface ClientProfile {
  id: number
  full_name: string
  company_name: string
  industry: string
  location: string
  website?: string
  avatar: string
}

export interface Project {
  id: number
  client: ClientProfile
  title: string
  description: string
  skills_req: string[]
  budget_min: number
  budget_max: number
  deadline: string
  location: string
  status: 'open' | 'in_progress' | 'completed' | 'cancelled'
  bid_count?: number
  bids?: Bid[]
  milestones?: Milestone[]
  created_at: string
}

export interface Bid {
  id: number
  engineer: EngineerProfile
  amount: number
  cover_letter: string
  timeline: number
  status: 'pending' | 'accepted' | 'rejected'
  submitted_at: string
}

export interface Milestone {
  id: number
  title: string
  description: string
  amount: number
  due_date: string
  is_released: boolean
  released_at?: string
}

export interface Review {
  id: number
  client_name: string
  rating: number
  comment: string
  created_at: string
}

export interface Message {
  id: number
  sender: User
  content: string
  file_url?: string
  file_type?: string
  file_name?: string
  is_read: boolean
  sent_at: string
}

export interface Conversation {
  id: number
  participants: User[]
  project?: number
  last_message?: Message
  unread_count: number
  created_at: string
}

export interface Notification {
  id: number
  notif_type: string
  title: string
  body: string
  link: string
  is_read: boolean
  created_at: string
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  email: string
  first_name: string
  last_name: string
  role: 'engineer' | 'client'
  password: string
  password2: string
}
