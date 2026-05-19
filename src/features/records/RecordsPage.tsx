import { useAppContext } from '../../app/AppProvider'
import { usePreferences } from '../../app/preferences'
import { ActiveTimerCard } from '../timer/ActiveTimerCard'
import { ManualEntryForm } from './ManualEntryForm'

export function RecordsPage() {
  const app = useAppContext()
  const { t } = usePreferences()

  const activeGoals = app.goals.filter((goal) => goal.isActive)
  const tasksByGoalId = new Map(activeGoals.map((goal) => [goal.id, app.tasks.filter((task) => task.goalId === goal.id)]))
  const goalTitleById = new Map(app.goals.map((goal) => [goal.id, goal.title]))
  const recentRecords = [...app.records].sort((a, b) => b.createdAt.localeCompare(a.createdAt))

  return (
    <section className="page-stack">
      <section className="dashboard-hero">
        <p className="eyebrow">{t('添加记录')}</p>
        <h1>{t('记录成长')}</h1>
        <p className="muted">{t('用计时器开始当下，也可以补录今天已经完成的时间。')}</p>
      </section>

      <ActiveTimerCard />

      <section className="page-card stack-md">
        <div className="section-heading">
          <div>
            <p className="eyebrow">{t('开始专注')}</p>
            <h2>{t('开始计时')}</h2>
          </div>
          <span className="badge peach">
            {activeGoals.length} {t('个启用目标')}
          </span>
        </div>
        {activeGoals.length === 0 ? (
          <p className="muted">{t('还没有启用中的目标，先去创建年度目标。')}</p>
        ) : (
          <div className="record-grid">
            {activeGoals.map((goal) => (
              <article key={goal.id} className="soft-card stack-xs">
                <span className="badge sage">{t('专注')}</span>
                <h3>{goal.title}</h3>
                <button
                  className="secondary-button"
                  onClick={() => app.startActiveTimer({ memberId: goal.memberId, goalId: goal.id })}
                >
                  <span className="material-symbols-outlined" aria-hidden="true">
                    play_arrow
                  </span>
                  {t('开始')} {goal.title}
                </button>

                {tasksByGoalId.get(goal.id)?.map((task) => (
                  <button
                    key={task.id}
                    className="ghost-button"
                    onClick={() => app.startActiveTimer({ memberId: goal.memberId, goalId: goal.id, taskId: task.id })}
                  >
                    <span className="material-symbols-outlined" aria-hidden="true">
                      checklist
                    </span>
                    {t('开始')} {goal.title} · {task.title}
                  </button>
                ))}
              </article>
            ))}
          </div>
        )}
      </section>

      <ManualEntryForm
        members={app.members}
        goals={app.goals}
        tasks={app.tasks}
        onSubmit={app.addManualRecord}
      />

      <section className="page-card stack-md">
        <div className="section-heading">
          <h2>{t('最近记录')}</h2>
          <span className="mini-label">
            {recentRecords.length} {t('条记录')}
          </span>
        </div>
        {app.records.length === 0 ? (
          <p className="muted">{t('还没有记录，先补一条今天的学习。')}</p>
        ) : (
          recentRecords.map((record) => (
            <article key={record.id} className="list-row">
              <div>
                <strong>{goalTitleById.get(record.goalId) ?? t('未命名目标')}</strong>
                <p className="muted">{record.note || t('未填写完成内容')}</p>
              </div>
              <span className="badge sun">
                {record.durationMinutes} {t('分钟')}
              </span>
            </article>
          ))
        )}
      </section>
    </section>
  )
}
