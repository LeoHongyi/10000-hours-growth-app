import { FormEvent, useEffect, useMemo, useState } from 'react'
import { usePreferences } from '../../app/preferences'
import type { Goal, GoalTask, Member } from '../../domain/types'

type ManualEntryInput = {
  memberId: string
  goalId: string
  taskId?: string
  date: string
  durationMinutes: number
  note: string
}

type ManualEntryFormProps = {
  members: Member[]
  goals: Goal[]
  tasks: GoalTask[]
  onSubmit: (input: ManualEntryInput) => Promise<void> | void
}

const today = () => new Date().toISOString().slice(0, 10)

export function ManualEntryForm({ members, goals, tasks, onSubmit }: ManualEntryFormProps) {
  const { t } = usePreferences()
  const [memberId, setMemberId] = useState(members[0]?.id ?? '')
  const [goalId, setGoalId] = useState(goals[0]?.id ?? '')
  const [taskId, setTaskId] = useState('')
  const [date, setDate] = useState(today())
  const [hours, setHours] = useState('')
  const [minutes, setMinutes] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const visibleGoals = useMemo(
    () => goals.filter((goal) => goal.memberId === memberId && goal.isActive),
    [goals, memberId],
  )

  useEffect(() => {
    if (!visibleGoals.some((goal) => goal.id === goalId)) {
      setGoalId(visibleGoals[0]?.id ?? '')
    }
  }, [goalId, visibleGoals])

  const visibleTasks = useMemo(
    () => tasks.filter((task) => task.goalId === goalId),
    [tasks, goalId],
  )

  useEffect(() => {
    if (!visibleTasks.some((task) => task.id === taskId)) {
      setTaskId('')
    }
  }, [taskId, visibleTasks])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const parsedHours = hours.trim() === '' ? 0 : Number(hours)
    const parsedMinuteRemainder = minutes.trim() === '' ? 0 : Number(minutes)

    if (!Number.isFinite(parsedHours) || !Number.isFinite(parsedMinuteRemainder)) {
      setError(t('请输入有效的分钟数'))
      return
    }

    const parsedMinutes = parsedHours * 60 + parsedMinuteRemainder

    if (parsedMinutes <= 0) {
      setError(t('时长必须大于 0 分钟'))
      return
    }

    if (!memberId || !goalId) {
      setError(t('请选择成员和目标'))
      return
    }

    setError('')

    await onSubmit({
      memberId,
      goalId,
      taskId: taskId || undefined,
      date,
      durationMinutes: parsedMinutes,
      note: note.trim(),
    })

    setHours('')
    setMinutes('')
    setNote('')
    setTaskId('')
  }

  return (
    <form className="page-card form-grid journal-texture" onSubmit={handleSubmit}>
      <div>
        <p className="eyebrow">{t('记录成长')}</p>
        <h2>{t('手动补录')}</h2>
        <p className="muted">{t('把今天投入的时间和收获写进成长记录。')}</p>
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
          {t('目标')}
        </span>
        <select value={goalId} onChange={(event) => setGoalId(event.target.value)}>
          {visibleGoals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.title}
            </option>
          ))}
        </select>
      </label>

      <label className="field-label">
        <span>
          <span className="material-symbols-outlined" aria-hidden="true">
            checklist
          </span>
          {t('小任务')}
        </span>
        <select value={taskId} onChange={(event) => setTaskId(event.target.value)}>
          <option value="">{t('暂不选择')}</option>
          {visibleTasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </select>
      </label>

      <label className="field-label">
        <span>
          <span className="material-symbols-outlined" aria-hidden="true">
            calendar_month
          </span>
          {t('日期')}
        </span>
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </label>

      <div className="field-label">
        <span>
          <span className="material-symbols-outlined" aria-hidden="true">
            schedule
          </span>
          {t('时长（分钟）')}
        </span>
        <div className="split-fields">
          <label className="stack-xs">
            <span className="mini-label">{t('小时')}</span>
            <input
              className="number-well"
              aria-label={t('时长（小时）')}
              inputMode="numeric"
              value={hours}
              onChange={(event) => setHours(event.target.value)}
              placeholder="00"
            />
          </label>
          <label className="stack-xs">
            <span className="mini-label">{t('分钟')}</span>
            <input
              className="number-well"
              aria-label={t('时长（分钟）')}
              inputMode="numeric"
              value={minutes}
              onChange={(event) => setMinutes(event.target.value)}
              placeholder="00"
            />
          </label>
        </div>
      </div>

      <label className="field-label">
        <span>
          <span className="material-symbols-outlined" aria-hidden="true">
            auto_stories
          </span>
          {t('完成内容')}
        </span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder={t('例如：读完《蒙台梭利》第 3 章')}
        />
      </label>

      {error ? <p className="error-text">{error}</p> : null}
      <button className="primary-button" type="submit">
        {t('保存补录')}
        <span className="material-symbols-outlined" aria-hidden="true">
          check_circle
        </span>
      </button>
    </form>
  )
}
