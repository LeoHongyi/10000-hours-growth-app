import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useAppContext } from '../../app/AppProvider'
import { ProgressBar } from '../shared/ProgressBar'

export function GoalDetailPage() {
  const { goalId = '' } = useParams()
  const app = useAppContext()
  const goal = app.goals.find((item) => item.id === goalId)

  const taskRows = useMemo(
    () =>
      app.tasks.filter((task) => task.goalId === goalId).map((task) => ({
        task,
        totalMinutes: app.records
          .filter((record) => record.taskId === task.id)
          .reduce((sum, record) => sum + record.durationMinutes, 0),
      })),
    [app.records, app.tasks, goalId],
  )

  if (!goal) {
    return (
      <section className="page-card">
        <p>目标不存在。</p>
      </section>
    )
  }

  const remainingMinutes = Math.max(0, goal.targetMinutes - goal.completedMinutes)

  return (
    <section className="stack-md">
      <section className="page-card stack-md">
        <h1>{goal.title}</h1>
        <ProgressBar current={goal.completedMinutes} target={goal.targetMinutes} />
        <p>
          已学习 {Math.round(goal.completedMinutes / 60)}h，剩余 {Math.round(remainingMinutes / 60)}h
        </p>
        <button
          className="primary-button"
          type="button"
          disabled={!goal.isActive}
          onClick={() => app.startActiveTimer({ memberId: goal.memberId, goalId: goal.id })}
        >
          从这个目标开始计时
        </button>
        {!goal.isActive ? <p className="muted">目标已停用，启用后可开始计时。</p> : null}
      </section>

      <section className="page-card stack-md">
        <h2>小任务</h2>
        {taskRows.length === 0 ? (
          <p className="muted">还没有小任务。</p>
        ) : (
          taskRows.map(({ task, totalMinutes }) => (
            <article key={task.id} className="list-row">
              <div>
                <strong>{task.title}</strong>
                <p>累计 {Math.round(totalMinutes / 60)}h</p>
              </div>
              <button
                className="secondary-button"
                type="button"
                disabled={!goal.isActive}
                onClick={() => app.startActiveTimer({ memberId: goal.memberId, goalId: goal.id, taskId: task.id })}
              >
                开始
              </button>
            </article>
          ))
        )}
      </section>

      <section className="page-card stack-md">
        <h2>最近记录</h2>
        {app.records.filter((record) => record.goalId === goal.id).slice(0, 5).map((record) => (
          <article key={record.id} className="list-row">
            <div>
              <strong>{record.durationMinutes} 分钟</strong>
              <p>{record.note || '未填写完成内容'}</p>
            </div>
            <span>{record.date}</span>
          </article>
        ))}
      </section>
    </section>
  )
}
