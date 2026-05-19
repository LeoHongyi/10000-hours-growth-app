import { usePreferences } from '../../app/preferences'
import type { MilestoneRecord } from '../../domain/types'

export function MilestoneModal({
  milestone,
  onClose,
}: {
  milestone: MilestoneRecord | null
  onClose: () => void
}) {
  const { t } = usePreferences()

  if (!milestone) {
    return null
  }

  return (
    <div className="modal-scrim" role="dialog" aria-modal="true">
      <section className="modal-card stack-md">
        <div className="flower-badge">✿</div>
        <h2>
          {milestone.milestoneHours} {t('小时里程碑')}
        </h2>
        <p>{milestone.message}</p>
        <button className="primary-button" type="button" onClick={onClose}>
          {t('继续前进')}
        </button>
      </section>
    </div>
  )
}
