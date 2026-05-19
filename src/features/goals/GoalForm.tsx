import { FormEvent, useState } from 'react'
import { usePreferences } from '../../app/preferences'
import type { Member } from '../../domain/types'

type GoalCreateInput = {
  memberId: string
  title: string
  targetHours: number
  taskTitles: string[]
}

type GoalFormProps = {
  members: Member[]
  onCreateGoal: (input: GoalCreateInput) => Promise<void> | void
}

export function GoalForm({ members, onCreateGoal }: GoalFormProps) {
  const { t } = usePreferences()
  const [memberId, setMemberId] = useState(members[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [targetHours, setTargetHours] = useState('')
  const [taskTitles, setTaskTitles] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const trimmedTitle = title.trim()
    const parsedTargetHours = Number(targetHours)

    if (!trimmedTitle) {
      setError(t('请输入目标名称'))
      return
    }

    if (!Number.isFinite(parsedTargetHours) || parsedTargetHours <= 0) {
      setError(t('请输入有效的目标小时数'))
      return
    }

    setError('')

    await onCreateGoal({
      memberId,
      title: trimmedTitle,
      targetHours: parsedTargetHours,
      taskTitles: taskTitles
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
    })

    setTitle('')
    setTargetHours('')
    setTaskTitles('')
  }

  return (
    <form className="page-card form-grid journal-texture" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">{t('种下新目标')}</p>
        <h2>{t('新增年度目标')}</h2>
        <p className="muted">{t('把长期愿望拆成可以持续照看的小时和小任务。')}</p>
      </div>

      <label className="field-label">
        <span>
          <span className="material-symbols-outlined" aria-hidden="true">
            group
          </span>
          {t('成员')}
        </span>
        <select value={memberId} onChange={(event) => setMemberId(event.target.value)}>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </label>

      <label className="field-label">
        <span>
          <span className="material-symbols-outlined" aria-hidden="true">
            target
          </span>
          {t('目标名称')}
        </span>
        <input aria-label={t('目标名称')} value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>

      <label className="field-label">
        <span>
          <span className="material-symbols-outlined" aria-hidden="true">
            schedule
          </span>
          {t('年度目标（小时）')}
        </span>
        <input
          className="number-well"
          aria-label={t('年度目标（小时）')}
          inputMode="numeric"
          value={targetHours}
          onChange={(event) => setTargetHours(event.target.value)}
        />
      </label>

      <label className="field-label">
        <span>
          <span className="material-symbols-outlined" aria-hidden="true">
            format_list_bulleted
          </span>
          {t('小任务（逗号分隔）')}
        </span>
        <input
          aria-label={t('小任务（逗号分隔）')}
          value={taskTitles}
          onChange={(event) => setTaskTitles(event.target.value)}
        />
      </label>
      {error ? <p className="error-text">{error}</p> : null}
      <button className="primary-button" type="submit">
        {t('新增目标')}
        <span className="material-symbols-outlined" aria-hidden="true">
          add_circle
        </span>
      </button>
    </form>
  )
}
