import { Link } from 'react-router-dom'
import type { Goal, GoalTask, Member, StudyRecord } from '../../domain/types'
import { ProgressBar } from '../shared/ProgressBar'
import { GoalForm } from './GoalForm'

type GoalsPageProps = {
  members: Member[]
  goals: Goal[]
  tasks: GoalTask[]
  records: StudyRecord[]
  onCreateGoal: (input: {
    memberId: string
    title: string
    targetHours: number
    taskTitles: string[]
  }) => Promise<void> | void
  onToggleGoal: (goalId: string) => Promise<void> | void
  onStartTimer: (input: { memberId: string; goalId: string; taskId?: string }) => void
}

const formatHours = (minutes: number) => Math.round(minutes / 60)

export function GoalsPage({ members, goals, tasks, onCreateGoal, onToggleGoal, onStartTimer }: GoalsPageProps) {
  return (
    <section className="stack-md">
      <GoalForm members={members} onCreateGoal={onCreateGoal} />

      {members.map((member) => {
        const memberGoals = goals.filter((goal) => goal.memberId === member.id)
        return (
          <section key={member.id} className="page-card stack-md">
            <h2>{member.name}</h2>

            {memberGoals.length === 0 ? <p className="muted">还没有目标。</p> : null}

            {memberGoals.map((goal) => {
              const remaining = Math.max(0, goal.targetMinutes - goal.completedMinutes)
              void tasks

              return (
                <article key={goal.id} className="goal-card stack-xs">
                  <div className="goal-header-row">
                    <strong>{goal.title}</strong>
                    <button className="ghost-button" type="button" onClick={() => onToggleGoal(goal.id)}>
                      {goal.isActive ? '停用目标' : '重新启用'}
                    </button>
                  </div>

                  <ProgressBar current={goal.completedMinutes} target={goal.targetMinutes} />
                  <p>已学习 {formatHours(goal.completedMinutes)}h，剩余 {formatHours(remaining)}h</p>

                  {!goal.isActive ? <p className="muted">目标已停用，启用后可继续开始计时。</p> : null}

                  <div className="button-row">
                    <button
                      className="secondary-button"
                      type="button"
                      disabled={!goal.isActive}
                      onClick={() => onStartTimer({ memberId: member.id, goalId: goal.id })}
                    >
                      开始计时
                    </button>
                    <Link className="text-link" to={`/goals/${goal.id}`}>
                      查看详情
                    </Link>
                  </div>
                </article>
              )
            })}
          </section>
        )
      })}
    </section>
  )
}
