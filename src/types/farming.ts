export interface FarmingProblem {
  id: string
  userId: string
  description: string
  cropType: string
  location: string
  urgency: 'low' | 'medium' | 'high'
  createdAt: string
  status: 'pending' | 'processing' | 'completed'
  images?: string[]
}

export interface ActionPlan {
  id: string
  problemId: string
  userId: string
  title: string
  description: string
  estimatedCost: number
  expectedYield: number
  currency: string
  createdAt: string
  tasks: Task[]
}

export interface Task {
  id: string
  planId: string
  userId: string
  title: string
  description: string
  scheduledDate: string
  status: 'pending' | 'in_progress' | 'completed' | 'skipped'
  priority: 'low' | 'medium' | 'high'
  estimatedDuration: number
  cost: number
  supplies: string[]
  instructions: string
  verificationImage?: string
  completedAt?: string
  createdAt: string
}

export interface WeatherData {
  date: string
  temperature: number
  humidity: number
  rainfall: number
  conditions: string
}

export interface CommunityInsight {
  id: string
  userId: string
  userDisplayName: string
  problemType: string
  solution: string
  location: string
  success: boolean
  cost: number
  createdAt: string
  upvotes: number
}