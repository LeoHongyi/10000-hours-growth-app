import type { PlanItem } from '../../domain/types'
import { ProgressBar } from '../shared/ProgressBar'

type GoalPreview = {
  id: string
  title: string
  completedMinutes: number
  targetMinutes: number
}

type HomePageProps = {
  weeklyMinutes: number
  suggestions: PlanItem[]
  goalPreview: GoalPreview[]
  onStartSuggestion: (plan: PlanItem) => void
}

const formatDuration = (minutes: number) => `${Math.floor(minutes / 60)}h ${minutes % 60}m`

export function HomePage({ weeklyMinutes, suggestions, goalPreview, onStartSuggestion }: HomePageProps) {
  return (
    <section className="stack-md">
      <section className="page-card stack-xs">
        <p className="eyebrow">本周家庭投入 {formatDuration(weeklyMinutes)}</p>
        <h1>今天先开始一点点</h1>
        <p className="muted">系统已经把今天最值得推进的任务挑出来了。</p>
      </section>

      <section className="page-card stack-md">
        <h2>今天建议</h2>
        {suggestions.length === 0 ? (
          <p className="muted">先创建目标，再回来开始今天的第一段专注。</p>
        ) : (
          suggestions.map((plan) => (
            <article key={plan.id} className="list-row">
              <div>
                <strong>{plan.title}</strong>
                <p>{plan.suggestedMinutes} 分钟</p>
              </div>
              <button className="primary-button compact-button" type="button" onClick={() => onStartSuggestion(plan)}>
                开始这条建议
              </button>
            </article>
          ))
        )}
      </section>

      <section className="page-card stack-md">
        <h2>目标进度</h2>
        {goalPreview.map((goal) => (
          <article key={goal.id} className="stack-xs">
            <strong>{goal.title}</strong>
            <ProgressBar current={goal.completedMinutes} target={goal.targetMinutes} />
            <p>{Math.round(goal.completedMinutes / 60)}h / {Math.round(goal.targetMinutes / 60)}h</p>
          </article>
        ))}
      </section>

      <section className="page-card stack-xs">
        <h2>宝宝成长记录</h2>
        <p className="muted">顺手记下一张照片和一句今天的小变化。</p>
      </section>
    </section>
  )
}
