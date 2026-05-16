export function ProgressBar({ current, target }: { current: number; target: number }) {
  const percent = Math.min(100, Math.round((current / target) * 100))

  return (
    <div className="progress-root" aria-label={`进度 ${percent}%`}>
      <div className="progress-fill" style={{ width: `${percent}%` }} />
    </div>
  )
}
