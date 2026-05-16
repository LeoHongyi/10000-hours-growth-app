import { FormEvent, useState } from 'react'
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
  const [memberId, setMemberId] = useState(members[0]?.id ?? '')
  const [title, setTitle] = useState('')
  const [targetHours, setTargetHours] = useState('')
  const [taskTitles, setTaskTitles] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    await onCreateGoal({
      memberId,
      title: title.trim(),
      targetHours: Number(targetHours),
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
    <form className="page-card stack-md" onSubmit={handleSubmit}>
      <h2>新增年度目标</h2>
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
        <span>目标名称</span>
        <input aria-label="目标名称" value={title} onChange={(event) => setTitle(event.target.value)} />
      </label>
      <label className="stack-xs">
        <span>年度目标（小时）</span>
        <input
          aria-label="年度目标（小时）"
          value={targetHours}
          onChange={(event) => setTargetHours(event.target.value)}
        />
      </label>
      <label className="stack-xs">
        <span>小任务（逗号分隔）</span>
        <input
          aria-label="小任务（逗号分隔）"
          value={taskTitles}
          onChange={(event) => setTaskTitles(event.target.value)}
        />
      </label>
      <button className="primary-button" type="submit">
        新增目标
      </button>
    </form>
  )
}
