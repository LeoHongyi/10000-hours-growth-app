import { usePreferences } from '../../app/preferences'

export function ProgressBar({ current, target }: { current: number; target: number }) {
  const { t } = usePreferences()
  const safeTarget = Number.isFinite(target) && target > 0 ? target : 1
  const percent = Math.min(100, Math.round((current / safeTarget) * 100))
  const filledPebbles = Math.max(0, Math.min(7, Math.round((percent / 100) * 7)))

  return (
    <div className="progress-root" aria-label={`进度 ${percent}%`}>
      <div className="progress-track" aria-hidden="true">
        {Array.from({ length: 7 }, (_, index) => (
          <span
            key={index}
            className={index < filledPebbles ? 'progress-pebble filled' : 'progress-pebble'}
          />
        ))}
      </div>
      <p className="progress-meta">
        {t('已完成')} {percent}%
      </p>
    </div>
  )
}
