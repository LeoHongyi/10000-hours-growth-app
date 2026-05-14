import { openDB } from 'idb'
import type { DBSchema } from 'idb'
import type {
  DiaryEntry,
  Goal,
  GoalTask,
  Member,
  MilestoneRecord,
  PlanItem,
  StudyRecord,
} from '../domain/types'

interface GrowthAppDB extends DBSchema {
  members: {
    key: string
    value: Member
  }
  goals: {
    key: string
    value: Goal
    indexes: { 'by-member': string }
  }
  tasks: {
    key: string
    value: GoalTask
    indexes: { 'by-goal': string }
  }
  records: {
    key: string
    value: StudyRecord
    indexes: { 'by-goal': string; 'by-date': string }
  }
  plans: {
    key: string
    value: PlanItem
    indexes: { 'by-date': string }
  }
  milestones: {
    key: string
    value: MilestoneRecord
    indexes: { 'by-goal': string }
  }
  diary: {
    key: string
    value: DiaryEntry
    indexes: { 'by-date': string }
  }
}

export function openGrowthAppDb(name = 'growth-app') {
  return openDB<GrowthAppDB>(name, 1, {
    upgrade(db) {
      const members = db.createObjectStore('members', { keyPath: 'id' })
      const goals = db.createObjectStore('goals', { keyPath: 'id' })
      goals.createIndex('by-member', 'memberId')

      const tasks = db.createObjectStore('tasks', { keyPath: 'id' })
      tasks.createIndex('by-goal', 'goalId')

      const records = db.createObjectStore('records', { keyPath: 'id' })
      records.createIndex('by-goal', 'goalId')
      records.createIndex('by-date', 'date')

      const plans = db.createObjectStore('plans', { keyPath: 'id' })
      plans.createIndex('by-date', 'date')

      const milestones = db.createObjectStore('milestones', { keyPath: 'id' })
      milestones.createIndex('by-goal', 'goalId')

      const diary = db.createObjectStore('diary', { keyPath: 'id' })
      diary.createIndex('by-date', 'date')

      void members
    },
  })
}
