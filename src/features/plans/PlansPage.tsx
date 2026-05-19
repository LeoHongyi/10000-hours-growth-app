import { usePreferences } from '../../app/preferences'
import type { PlanItem, PlanStatus } from '../../domain/types'

type PlansPageProps = {
  todayPlans: PlanItem[]
  weeklyPlans: PlanItem[]
  monthlyMinutes: number
  onChangeStatus: (planId: string, status: PlanStatus) => Promise<void> | void
  onReplacePlan: (planId: string) => Promise<void> | void
}

export function PlansPage({ todayPlans, weeklyPlans, monthlyMinutes, onChangeStatus, onReplacePlan }: PlansPageProps) {
  const { formatDuration, t } = usePreferences()

  return (
    <section className="stack-md">
      <section className="page-card stack-xs">
        <p className="eyebrow">{t('本月计划概览')}</p>
        <h1>{t('计划')}</h1>
        <p>
          {t('本月已投入')} {formatDuration(monthlyMinutes)}
        </p>
      </section>

      <section className="page-card stack-md">
        <h2>{t('今日建议')}</h2>
        {todayPlans.length === 0 ? (
          <p className="muted">{t('今天的建议已经处理完了，去首页开始下一段专注。')}</p>
        ) : (
          todayPlans.map((plan) => (
            <article key={plan.id} className="list-row">
              <div>
                <strong>{plan.title}</strong>
                <p>
                  {plan.suggestedMinutes} {t('分钟')}
                </p>
              </div>
              <div className="button-row">
                <button className="secondary-button" type="button" onClick={() => onChangeStatus(plan.id, 'completed')}>
                  {t('完成这条')}
                </button>
                <button className="ghost-button" type="button" onClick={() => onChangeStatus(plan.id, 'skipped')}>
                  {t('跳过')}
                </button>
                <button className="ghost-button" type="button" onClick={() => onReplacePlan(plan.id)}>
                  {t('换一个')}
                </button>
              </div>
            </article>
          ))
        )}
      </section>

      <section className="page-card stack-md">
        <h2>{t('下周框架')}</h2>
        {weeklyPlans.length === 0 ? (
          <p className="muted">{t('下周框架会在生成后显示在这里。')}</p>
        ) : (
          weeklyPlans.map((plan) => (
            <article key={plan.id} className="list-row">
              <div>
                <strong>{plan.date}</strong>
                <p>{plan.title}</p>
              </div>
              <span>
                {plan.suggestedMinutes} {t('分钟')}
              </span>
            </article>
          ))
        )}
      </section>
    </section>
  )
}
