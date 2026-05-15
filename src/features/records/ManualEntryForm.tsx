import { FormEvent, useEffect, useMemo, useState } from 'react'
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
  const [memberId, setMemberId] = useState(members[0]?.id ?? '')
  const [goalId, setGoalId] = useState(goals[0]?.id ?? '')
  const [taskId, setTaskId] = useState('')
  const [date, setDate] = useState(today())
  const [durationMinutes, setDurationMinutes] = useState('')
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

    const parsedMinutes = Number(durationMinutes)

    if (!Number.isFinite(parsedMinutes) || parsedMinutes <= 0) {
      setError('请输入有效的分钟数')
      return
    }

    if (!memberId || !goalId) {
      setError('请选择成员和目标')
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

    setDurationMinutes('')
    setNote('')
    setTaskId('')
  }

  return (
    <form className="page-card stack-md" onSubmit={handleSubmit}>
      <h2>手动补录</h2>

      <label className="stack-xs">
        <span>成员</span>
        <select value={memberId} onChange={(event) => setMemberId(event.target.value)}>
          {members.map((member) => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </label>

      <label className="stack-xs">
        <span>目标</span>
        <select value={goalId} onChange={(event) => setGoalId(event.target.value)}>
          {visibleGoals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.title}
            </option>
          ))}
        </select>
      </label>

      <label className="stack-xs">
        <span>小任务</span>
        <select value={taskId} onChange={(event) => setTaskId(event.target.value)}>
          <option value="">暂不选择</option>
          {visibleTasks.map((task) => (
            <option key={task.id} value={task.id}>
              {task.title}
            </option>
          ))}
        </select>
      </label>

      <label className="stack-xs">
        <span>日期</span>
        <input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
      </label>

      <label className="stack-xs">
        <span>时长（分钟）</span>
        <input
          aria-label="时长（分钟）"
          inputMode="numeric"
          value={durationMinutes}
          onChange={(event) => setDurationMinutes(event.target.value)}
        />
      </label>

      <label className="stack-xs">
        <span>完成内容</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          placeholder="例如：读完《蒙台梭利》第 3 章"
        />
      </label>

      {error ? <p className="error-text">{error}</p> : null}
      <button className="primary-button" type="submit">
        保存补录
      </button>
    </form>
  )
}
