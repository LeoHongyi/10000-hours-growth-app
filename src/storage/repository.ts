import type {
  AppSnapshot,
  DiaryEntry,
  Goal,
  GoalTask,
  Member,
  MilestoneRecord,
  PlanItem,
  StudyRecord,
} from '../domain/types'
import { openGrowthAppDb } from './db'

const avatarColors = ['#E8C8A1', '#DDB892']
const createId = () => crypto.randomUUID()
const now = () => new Date().toISOString()
const storeNames = ['members', 'goals', 'tasks', 'records', 'plans', 'milestones', 'diary'] as const

type AppDatabase = Awaited<ReturnType<typeof openGrowthAppDb>>

type ImportableSnapshot = {
  members?: Member[]
  goals?: Goal[]
  tasks?: GoalTask[]
  records?: StudyRecord[]
  plans?: PlanItem[]
  milestones?: MilestoneRecord[]
  diary?: DiaryEntry[]
}

function normalizeSnapshot(snapshot: ImportableSnapshot): AppSnapshot {
  return {
    members: Array.isArray(snapshot.members) ? snapshot.members : [],
    goals: Array.isArray(snapshot.goals) ? snapshot.goals : [],
    tasks: Array.isArray(snapshot.tasks) ? snapshot.tasks : [],
    records: Array.isArray(snapshot.records) ? snapshot.records : [],
    plans: Array.isArray(snapshot.plans) ? snapshot.plans : [],
    milestones: Array.isArray(snapshot.milestones) ? snapshot.milestones : [],
    diary: Array.isArray(snapshot.diary) ? snapshot.diary : [],
  }
}

export function createAppRepository(name?: string) {
  async function withDb<T>(callback: (db: AppDatabase) => Promise<T>) {
    const db = await openGrowthAppDb(name)

    try {
      return await callback(db)
    } finally {
      db.close()
    }
  }

  return {
    async saveHousehold(names: string[]): Promise<Member[]> {
      return withDb(async (db) => {
        const members = names.map((memberName, index) => ({
          id: createId(),
          name: memberName,
          avatarColor: avatarColors[index % avatarColors.length],
          sortOrder: index,
        }))

        const tx = db.transaction(storeNames, 'readwrite')
        await Promise.all(storeNames.map((storeName) => tx.objectStore(storeName).clear()))
        await Promise.all(members.map((member) => tx.objectStore('members').put(member)))
        await tx.done
        return members
      })
    },

    async createGoal(input: Pick<Goal, 'memberId' | 'title' | 'targetMinutes'>): Promise<Goal> {
      return withDb(async (db) => {
        const goal: Goal = {
          id: createId(),
          memberId: input.memberId,
          title: input.title,
          targetMinutes: input.targetMinutes,
          completedMinutes: 0,
          isActive: true,
          createdAt: now(),
        }
        await db.put('goals', goal)
        return goal
      })
    },

    async createTask(input: Pick<GoalTask, 'goalId' | 'title'>): Promise<GoalTask> {
      return withDb(async (db) => {
        const existing = await db.getAllFromIndex('tasks', 'by-goal', input.goalId)
        const task: GoalTask = {
          id: createId(),
          goalId: input.goalId,
          title: input.title,
          sortOrder: existing.length,
        }
        await db.put('tasks', task)
        return task
      })
    },

    async addStudyRecord(input: Omit<StudyRecord, 'id' | 'createdAt'>): Promise<StudyRecord> {
      return withDb(async (db) => {
        const tx = db.transaction(['goals', 'records'], 'readwrite')
        const goalStore = tx.objectStore('goals')
        const recordStore = tx.objectStore('records')
        const goal = await goalStore.get(input.goalId)

        if (!goal) {
          throw new Error('Goal not found')
        }

        const record: StudyRecord = {
          ...input,
          id: createId(),
          createdAt: now(),
        }

        await recordStore.put(record)
        await goalStore.put({
          ...goal,
          completedMinutes: goal.completedMinutes + input.durationMinutes,
        })
        await tx.done

        return record
      })
    },

    async updateGoal(goal: Goal) {
      return withDb(async (db) => {
        await db.put('goals', goal)
      })
    },

    async savePlans(items: AppSnapshot['plans']) {
      return withDb(async (db) => {
        const tx = db.transaction('plans', 'readwrite')
        await Promise.all(items.map((item) => tx.store.put(item)))
        await tx.done
      })
    },

    async saveMilestone(record: AppSnapshot['milestones'][number]) {
      return withDb(async (db) => {
        await db.put('milestones', record)
      })
    },

    async saveDiaryEntry(entry: AppSnapshot['diary'][number]) {
      return withDb(async (db) => {
        await db.put('diary', entry)
      })
    },

    async replaceSnapshot(input: ImportableSnapshot) {
      return withDb(async (db) => {
        const snapshot = normalizeSnapshot(input)
        const tx = db.transaction(storeNames, 'readwrite')

        await Promise.all(storeNames.map((storeName) => tx.objectStore(storeName).clear()))
        await Promise.all([
          ...snapshot.members.map((item) => tx.objectStore('members').put(item)),
          ...snapshot.goals.map((item) => tx.objectStore('goals').put(item)),
          ...snapshot.tasks.map((item) => tx.objectStore('tasks').put(item)),
          ...snapshot.records.map((item) => tx.objectStore('records').put(item)),
          ...snapshot.plans.map((item) => tx.objectStore('plans').put(item)),
          ...snapshot.milestones.map((item) => tx.objectStore('milestones').put(item)),
          ...snapshot.diary.map((item) => tx.objectStore('diary').put(item)),
        ])
        await tx.done
      })
    },

    async clearAll() {
      return withDb(async (db) => {
        const tx = db.transaction(storeNames, 'readwrite')
        await Promise.all(storeNames.map((storeName) => tx.objectStore(storeName).clear()))
        await tx.done
      })
    },

    async getSnapshot(): Promise<AppSnapshot> {
      return withDb(async (db) => {
        const [members, goals, tasks, records, plans, milestones, diary] = await Promise.all([
          db.getAll('members'),
          db.getAll('goals'),
          db.getAll('tasks'),
          db.getAll('records'),
          db.getAll('plans'),
          db.getAll('milestones'),
          db.getAll('diary'),
        ])

        return {
          members: members.sort((a, b) => a.sortOrder - b.sortOrder),
          goals: goals.sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
          tasks: tasks.sort((a, b) => a.sortOrder - b.sortOrder),
          records: records.sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
          plans,
          milestones,
          diary: diary.sort((a, b) => b.date.localeCompare(a.date)),
        }
      })
    },
  }
}
