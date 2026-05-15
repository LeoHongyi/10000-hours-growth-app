export type Member = {
  id: string
  name: string
  avatarColor: string
  sortOrder: number
}

export type Goal = {
  id: string
  memberId: string
  title: string
  targetMinutes: number
  completedMinutes: number
  isActive: boolean
  createdAt: string
}

export type GoalTask = {
  id: string
  goalId: string
  title: string
  sortOrder: number
}

export type StudyRecord = {
  id: string
  memberId: string
  goalId: string
  taskId?: string
  date: string
  startTime?: string
  endTime?: string
  durationMinutes: number
  note: string
  isManualEntry: boolean
  createdAt: string
}

export type PlanStatus = 'pending' | 'completed' | 'skipped' | 'replaced'
export type PlanSource = 'system' | 'manual'

export type PlanItem = {
  id: string
  memberId: string
  goalId: string
  taskId?: string
  date: string
  title: string
  suggestedMinutes: number
  status: PlanStatus
  source: PlanSource
}

export type MilestoneRecord = {
  id: string
  goalId: string
  milestoneHours: number
  reachedAt: string
  message: string
}

export type DiaryEntry = {
  id: string
  date: string
  photo?: string
  note: string
  createdAt: string
}

export type ActiveTimer = {
  memberId: string
  goalId: string
  taskId?: string
  startedAt: string
  accumulatedSeconds: number
  isPaused: boolean
}

export type AppSnapshot = {
  members: Member[]
  goals: Goal[]
  tasks: GoalTask[]
  records: StudyRecord[]
  plans: PlanItem[]
  milestones: MilestoneRecord[]
  diary: DiaryEntry[]
}
