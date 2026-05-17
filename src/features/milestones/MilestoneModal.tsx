import type { MilestoneRecord } from '../../domain/types'

export function MilestoneModal({
  milestone,
  onClose,
}: {
  milestone: MilestoneRecord | null
  onClose: () => void
}) {
  if (!milestone) {
    return null
  }

  return (
    <div className="modal-scrim" role="dialog" aria-modal="true">
      <section className="modal-card stack-md">
        <div className="flower-badge">✿</div>
        <h2>{milestone.milestoneHours} 小时里程碑</h2>
        <p>{milestone.message}</p>
        <button className="primary-button" type="button" onClick={onClose}>
          继续前进
        </button>
      </section>
    </div>
  )
}
