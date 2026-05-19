import { Link } from 'react-router-dom'
import { usePreferences } from '../../app/preferences'
import type { Goal, Member } from '../../domain/types'
import { ProgressBar } from '../shared/ProgressBar'
import { GoalForm } from './GoalForm'

type GoalsPageProps = {
  members: Member[]
  goals: Goal[]
  onCreateGoal: (input: {
    memberId: string
    title: string
    targetHours: number
    taskTitles: string[]
  }) => Promise<void> | void
  onToggleGoal: (goalId: string) => Promise<void> | void
  onStartTimer: (input: { memberId: string; goalId: string; taskId?: string }) => void
}

const hoursFromMinutes = (minutes: number) => Math.round(minutes / 60)

export function GoalsPage({ members, goals, onCreateGoal, onToggleGoal, onStartTimer }: GoalsPageProps) {
  const { formatHours, t } = usePreferences()

  return (
    <section className="page-stack">
      <section className="dashboard-hero">
        <p className="eyebrow">{t('成长目标')}</p>
        <h1>{t('每一小时，都是花园里新长出的花瓣')}</h1>
        <p className="muted">{t('用温柔的进度和清晰的小任务管理长期目标。')}</p>
      </section>

      {members.map((member) => {
        const memberGoals = goals.filter((goal) => goal.memberId === member.id)
        return (
          <section key={member.id} className="page-card stack-md">
            <div className="section-heading">
              <div>
                <p className="eyebrow">{t('成长花园')}</p>
                <h2>{member.name}</h2>
              </div>
              <span className="badge peach">
                {memberGoals.length} {t('个目标')}
              </span>
            </div>

            {memberGoals.length === 0 ? <p className="muted">{t('还没有目标。')}</p> : null}

            <div className="goal-grid">
              {memberGoals.map((goal) => {
                const remaining = Math.max(0, goal.targetMinutes - goal.completedMinutes)
                const percent = goal.targetMinutes > 0 ? Math.round((goal.completedMinutes / goal.targetMinutes) * 100) : 0

                return (
                  <article key={goal.id} className={goal.isActive ? 'soft-card goal-card' : 'soft-card goal-card inactive'}>
                    <div className="goal-header-row">
                      <div>
                        <span className={percent >= 20 ? 'badge sage' : 'badge peach'}>
                          {percent >= 20 ? t('持续成长') : t('新种子')}
                        </span>
                        <h3 style={{ marginTop: 12 }}>{goal.title}</h3>
                      </div>
                      <div className="milestone-sticker" aria-hidden="true">
                        <span className="material-symbols-outlined">
                          {percent >= 20 ? 'local_florist' : 'translate'}
                        </span>
                      </div>
                    </div>

                    <ProgressBar current={goal.completedMinutes} target={goal.targetMinutes} />
                    <p>
                      {t('已学习')} {formatHours(hoursFromMinutes(goal.completedMinutes))}，{t('剩余')}{' '}
                      {formatHours(hoursFromMinutes(remaining))}
                    </p>

                    {!goal.isActive ? <p className="muted">{t('目标已停用，启用后可继续开始计时。')}</p> : null}

                    <div className="button-row">
                      <button
                        className="secondary-button"
                        type="button"
                        disabled={!goal.isActive}
                        onClick={() => onStartTimer({ memberId: member.id, goalId: goal.id })}
                      >
                        <span className="material-symbols-outlined" aria-hidden="true">
                          play_arrow
                        </span>
                        {t('开始计时')}
                      </button>
                      <button className="ghost-button" type="button" onClick={() => onToggleGoal(goal.id)}>
                        {goal.isActive ? t('停用目标') : t('重新启用')}
                      </button>
                      <Link className="text-link" to={`/goals/${goal.id}`}>
                        {t('查看详情')}
                        <span className="material-symbols-outlined" aria-hidden="true">
                          arrow_forward
                        </span>
                      </Link>
                    </div>
                  </article>
                )
              })}
            </div>
          </section>
        )
      })}

      <GoalForm members={members} onCreateGoal={onCreateGoal} />
    </section>
  )
}
