import { useAppContext } from '../../app/AppProvider'
import { ActiveTimerCard } from '../timer/ActiveTimerCard'
import { ManualEntryForm } from './ManualEntryForm'

export function RecordsPage() {
  const app = useAppContext()

  const goalTitleById = new Map(app.goals.map((goal) => [goal.id, goal.title]))

  return (
    <section className="stack-md">
      <ActiveTimerCard />

      <section className="page-card stack-md">
        <h2>开始计时</h2>
        {app.goals.length === 0 ? (
          <p className="muted">还没有目标，先去创建年度目标。</p>
        ) : (
          app.goals.map((goal) => (
            <button
              key={goal.id}
              className="secondary-button"
              onClick={() => app.startActiveTimer({ memberId: goal.memberId, goalId: goal.id })}
            >
              开始 {goal.title}
            </button>
          ))
        )}
      </section>

      <ManualEntryForm
        members={app.members}
        goals={app.goals}
        tasks={app.tasks}
        onSubmit={app.addManualRecord}
      />

      <section className="page-card stack-md">
        <h2>最近记录</h2>
        {app.records.length === 0 ? (
          <p className="muted">还没有记录，先补一条今天的学习。</p>
        ) : (
          app.records.map((record) => (
            <article key={record.id} className="list-row">
              <div>
                <strong>{goalTitleById.get(record.goalId) ?? '未命名目标'}</strong>
                <p>{record.note || '未填写完成内容'}</p>
              </div>
              <span>{record.durationMinutes} 分钟</span>
            </article>
          ))
        )}
      </section>
    </section>
  )
}
