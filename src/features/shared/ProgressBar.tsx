export function ProgressBar({ current, target }: { current: number; target: number }) {
  const safeTarget = target > 0 ? target : 1
  const percent = Math.min(100, Math.round((current / safeTarget) * 100))

  return (
    <div className="progress-root" aria-label={`进度 ${percent}%`}>
      <div className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  )
}
