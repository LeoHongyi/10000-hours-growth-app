import { Link } from 'react-router-dom'
import { usePreferences } from '../../app/preferences'
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

export function HomePage({ weeklyMinutes, suggestions, goalPreview, onStartSuggestion }: HomePageProps) {
  const { formatDuration, formatHours, t } = usePreferences()
  const weeklyTarget = Math.max(weeklyMinutes, 20 * 60)

  return (
    <section className="page-stack">
      <section className="page-card dashboard-hero">
        <p className="eyebrow">
          {t('本周家庭投入')} {formatDuration(weeklyMinutes)}
        </p>
        <h1>{t('今天先开始一点点')}</h1>
        <p className="muted">{t('系统已经把今天最值得推进的任务挑出来了，让成长像照看花园一样轻一点。')}</p>
      </section>

      <section className="page-card focus-layout">
        <div className="stack-xs">
          <button
            className="timer-button"
            type="button"
            disabled={suggestions.length === 0}
            onClick={() => suggestions[0] && onStartSuggestion(suggestions[0])}
            aria-label={t('开始今日焦点')}
          >
            <span className="timer-button-content" aria-hidden="true">
              <span className="material-symbols-outlined">play_arrow</span>
              <span className="timer-button-title">{t('开始')}</span>
              <span className="mini-label">{t('计时')}</span>
            </span>
          </button>
          <div style={{ textAlign: 'center' }}>
            <p className="mini-label">{t('今日焦点')}</p>
            <h2>{suggestions[0]?.title ?? t('等待种下第一个目标')}</h2>
          </div>
        </div>

        <div>
          <div className="section-heading">
            <h2>
              <span className="material-symbols-outlined" aria-hidden="true">
                potted_plant
              </span>{' '}
              {t('今天建议')}
            </h2>
          </div>
          {suggestions.length === 0 ? (
            <p className="muted">{t('先创建目标，再回来开始今天的第一段专注。')}</p>
          ) : (
            <div className="plan-list">
              {suggestions.map((plan) => (
                <article key={plan.id} className="plan-item">
                  <span className="plan-check" aria-hidden="true">
                    <span className="material-symbols-outlined">check</span>
                  </span>
                  <div>
                    <strong>{plan.title}</strong>
                    <p className="muted">
                      {plan.suggestedMinutes} {t('分钟')}
                    </p>
                  </div>
                  <button className="secondary-button" type="button" onClick={() => onStartSuggestion(plan)}>
                    {t('开始这条建议')}
                  </button>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section>
        <div className="section-heading">
          <h2>{t('本周旅程')}</h2>
          <span className="mini-label">{formatDuration(weeklyMinutes)} / {formatHours(20)}</span>
        </div>
        <ProgressBar current={weeklyMinutes} target={weeklyTarget} />
      </section>

      <section className="page-card stack-md">
        <div className="section-heading">
          <h2>{t('目标进度')}</h2>
          <Link className="text-link" to="/goals">
            {t('查看目标')}
            <span className="material-symbols-outlined" aria-hidden="true">
              arrow_forward
            </span>
          </Link>
        </div>
        {goalPreview.length === 0 ? (
          <p className="muted">{t('还没有目标。先种下一颗成长种子，之后这里会显示进度。')}</p>
        ) : (
          <div className="goal-grid">
            {goalPreview.map((goal) => (
              <article key={goal.id} className="soft-card stack-xs">
                <span className="badge sage">{t('成长中')}</span>
                <strong>{goal.title}</strong>
                <ProgressBar current={goal.completedMinutes} target={goal.targetMinutes} />
                <p className="muted">
                  {formatHours(Math.round(goal.completedMinutes / 60))} / {formatHours(Math.round(goal.targetMinutes / 60))}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="page-card stack-md">
        <div className="section-heading">
          <h2>
            <span className="material-symbols-outlined" aria-hidden="true">
              child_care
            </span>{' '}
            {t('宝宝成长记录')}
          </h2>
          <Link className="text-link" to="/diary">
            {t('去家庭日记')}
            <span className="material-symbols-outlined" aria-hidden="true">
              arrow_forward
            </span>
          </Link>
        </div>
        <div className="feed-grid">
          <article className="feed-card">
            <div className="memory-thumb" aria-hidden="true">
              <span className="material-symbols-outlined">steps</span>
            </div>
            <div>
              <span className="badge sage">{t('里程碑')}</span>
              <p style={{ marginTop: 10 }}>{t('顺手记下一张照片和一句今天的小变化。')}</p>
              <p className="mini-label">{t('今天')}</p>
            </div>
          </article>
          <article className="feed-card">
            <div className="memory-thumb" aria-hidden="true" style={{ transform: 'rotate(3deg)' }}>
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <div>
              <span className="badge peach">{t('新发现')}</span>
              <p style={{ marginTop: 10 }}>{t('家庭成长和宝宝时光会一起沉淀在日记里。')}</p>
              <p className="mini-label">{t('温馨时刻')}</p>
            </div>
          </article>
        </div>
      </section>
    </section>
  )
}
