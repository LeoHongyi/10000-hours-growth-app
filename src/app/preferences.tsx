import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react'

export type AppLanguage = 'zh' | 'en'
export type AppTheme = 'light' | 'dark'

type PreferencesContextValue = {
  language: AppLanguage
  theme: AppTheme
  setLanguage: (language: AppLanguage) => void
  setTheme: (theme: AppTheme) => void
  t: (text: string) => string
  formatDuration: (minutes: number) => string
  formatHours: (hours: number) => string
}

const LANGUAGE_KEY = 'growth-app-language'
const THEME_KEY = 'growth-app-theme'

const english: Record<string, string> = {
  '温暖成长记录': 'Warm Growth Tracker',
  '轻松照看每一点进步': 'Tend every small step',
  '首页': 'Home',
  '目标': 'Goals',
  '记录': 'Records',
  '日记': 'Diary',
  '计划': 'Plans',
  '设置': 'Settings',
  '偏好设置': 'Preferences',
  '外观': 'Appearance',
  '语言': 'Language',
  '明亮模式': 'Light',
  '暗色模式': 'Dark',
  '已完成': 'Completed',
  '中文': 'Chinese',
  '英文': 'English',
  '关闭设置': 'Close settings',
  '当前设置会自动保存到这台设备。': 'Your preferences are saved on this device.',
  '数据与隐私': 'Data and privacy',
  '导出备份': 'Export backup',
  '导入恢复': 'Import backup',
  '清空本地数据': 'Clear local data',
  '隐私说明': 'Privacy note',
  '隐私政策': 'Privacy policy',
  '查看完整隐私政策': 'View full privacy policy',
  '这份说明解释当前版本如何保存、备份和删除你的家庭成长记录。':
    'This notice explains how this version stores, backs up, and deletes your family growth records.',
  '我们保存什么': 'What we store',
  '应用会在本机浏览器中保存家庭成员、目标、任务、专注记录、计划、里程碑和日记照片。':
    'The app stores household members, goals, tasks, focus records, plans, milestones, diary notes, and diary photos in this browser.',
  '数据保存在哪里': 'Where data is stored',
  '当前版本没有账号和服务器同步。主要记录保存在 IndexedDB，偏好设置和当前计时状态保存在 localStorage。':
    'This version has no accounts or server sync. Main records are stored in IndexedDB; preferences and the active timer are stored in localStorage.',
  '备份与恢复': 'Backup and restore',
  '你可以在设置中导出 JSON 备份文件，也可以导入备份恢复到当前设备。请妥善保管备份文件。':
    'You can export a JSON backup in settings and import it to restore this device. Keep backup files safe.',
  '删除数据': 'Deleting data',
  '你可以在设置中清空本地数据。清空浏览器数据、换设备或换浏览器也可能删除这些记录。':
    'You can clear local data in settings. Clearing browser data, changing devices, or switching browsers may also delete these records.',
  '第三方服务': 'Third-party services',
  '应用托管在 Cloudflare Pages。当前版本不会把你的日记、照片或学习记录上传到应用服务器。':
    'The app is hosted on Cloudflare Pages. This version does not upload your diary, photos, or study records to an application server.',
  '返回首页': 'Back home',
  '当前版本的数据只保存在这台设备的浏览器里，不会上传到服务器。':
    'This version stores data only in this browser on this device and does not upload it to a server.',
  '请定期导出备份；清理浏览器数据、换设备或换浏览器可能导致记录丢失。':
    'Export backups regularly. Clearing browser data, changing devices, or switching browsers may lose records.',
  '备份已下载。': 'Backup downloaded.',
  '备份失败，请稍后再试。': 'Backup failed. Please try again.',
  '备份已恢复。': 'Backup restored.',
  '恢复失败，请选择有效的备份文件。': 'Restore failed. Please choose a valid backup file.',
  '本地数据已清空。': 'Local data cleared.',
  '清空失败，请稍后再试。': 'Clear failed. Please try again.',
  '清空后无法恢复。请先导出备份，确定继续吗？':
    'This cannot be undone. Export a backup first. Continue?',
  '本周家庭投入': 'Family time this week',
  '今天先开始一点点': 'Start with one small step today',
  '系统已经把今天最值得推进的任务挑出来了，让成长像照看花园一样轻一点。':
    'Today’s best next steps are ready, so growth feels easier to tend.',
  '开始今日焦点': 'Start today’s focus',
  '开始': 'Start',
  '计时': 'Timer',
  '今日焦点': 'Today’s focus',
  '等待种下第一个目标': 'Waiting for the first goal',
  '今天建议': 'Today’s suggestions',
  '先创建目标，再回来开始今天的第一段专注。': 'Create a goal first, then come back for your first focus session.',
  '开始这条建议': 'Start this suggestion',
  '本周旅程': 'Weekly journey',
  '目标进度': 'Goal progress',
  '查看目标': 'View goals',
  '还没有目标。先种下一颗成长种子，之后这里会显示进度。':
    'No goals yet. Plant one growth seed and progress will appear here.',
  '成长中': 'Growing',
  '宝宝成长记录': 'Baby growth records',
  '去家庭日记': 'Open family diary',
  '里程碑': 'Milestone',
  '今天': 'Today',
  '新发现': 'New discovery',
  '温馨时刻': 'Warm moments',
  '顺手记下一张照片和一句今天的小变化。': 'Save a photo and one small change from today.',
  '家庭成长和宝宝时光会一起沉淀在日记里。': 'Family growth and baby moments are saved together in the diary.',
  '成长目标': 'Growth goals',
  '每一小时，都是花园里新长出的花瓣': 'Every hour is a new petal in the garden',
  '用温柔的进度和清晰的小任务管理长期目标。': 'Manage long-term goals with gentle progress and clear tasks.',
  '成长花园': 'Growth garden',
  '个目标': 'goals',
  '还没有目标。': 'No goals yet.',
  '还没有小任务。': 'No tasks yet.',
  '持续成长': 'In progress',
  '新种子': 'New seed',
  '已学习': 'Studied',
  '剩余': 'remaining',
  '目标已停用，启用后可继续开始计时。': 'This goal is inactive. Enable it before starting a timer.',
  '开始计时': 'Start timer',
  '停用目标': 'Pause goal',
  '重新启用': 'Enable again',
  '查看详情': 'View details',
  '种下新目标': 'Plant a new goal',
  '新增年度目标': 'Add annual goal',
  '把长期愿望拆成可以持续照看的小时和小任务。':
    'Split a long-term wish into hours and small tasks you can tend.',
  '成员': 'Member',
  '目标名称': 'Goal name',
  '年度目标（小时）': 'Annual target (hours)',
  '小任务（逗号分隔）': 'Tasks (comma-separated)',
  '新增目标': 'Add goal',
  '添加记录': 'Add record',
  '记录成长': 'Record growth',
  '用计时器开始当下，也可以补录今天已经完成的时间。':
    'Start a live timer or add time you already completed today.',
  '开始专注': 'Start focus',
  '个启用目标': 'active goals',
  '还没有启用中的目标，先去创建年度目标。': 'No active goals yet. Create an annual goal first.',
  '专注': 'Focus',
  '最近记录': 'Recent records',
  '条记录': 'records',
  '还没有记录，先补一条今天的学习。': 'No records yet. Add today’s study first.',
  '未命名目标': 'Untitled goal',
  '未填写完成内容': 'No notes yet',
  '手动补录': 'Manual entry',
  '把今天投入的时间和收获写进成长记录。': 'Save today’s invested time and takeaways.',
  '小任务': 'Task',
  '暂不选择': 'No task',
  '日期': 'Date',
  '时长（分钟）': 'Duration (minutes)',
  '时长（小时）': 'Duration (hours)',
  '小时': 'hours',
  '分钟': 'minutes',
  '完成内容': 'What you completed',
  '例如：读完《蒙台梭利》第 3 章': 'Example: finished Montessori chapter 3',
  '保存补录': 'Save entry',
  '专注计时': 'Focus timer',
  '当前专注中': 'Current focus',
  '已暂停': 'Paused',
  '进行中': 'Running',
  '结束时顺手记一句今天学了什么': 'Add one note about what you learned before finishing',
  '暂停': 'Pause',
  '继续': 'Resume',
  '结束并保存': 'Finish and save',
  '家庭成长日记': 'Family growth diary',
  '家庭日记': 'Family diary',
  '把学习进步、宝宝瞬间和家里的温馨片段连成一条时间线。':
    'Connect learning progress, baby moments, and warm family memories in one timeline.',
  '添加回忆': 'Add memory',
  '温馨时光轮廓': 'Warm moment outline',
  '照片': 'Photo',
  '一句话': 'One sentence',
  '例如：今天第一次自己拍手了。': 'Example: clapped by themselves for the first time today.',
  '保存成长记录': 'Save growth record',
  '还没有日记': 'No diary entries yet',
  '保存第一条成长记录后，它会出现在这里。': 'Your first growth record will appear here.',
  '今天的小变化': 'Today’s small change',
  '最新记录': 'Latest record',
  '这段温馨时光已保存在家庭成长花园里。': 'This warm moment is saved in the family growth garden.',
  '本月计划概览': 'Monthly plan overview',
  '本月已投入': 'Invested this month',
  '今日建议': 'Today’s suggestions',
  '今天的建议已经处理完了，去首页开始下一段专注。':
    'Today’s suggestions are done. Go home to start the next focus session.',
  '完成这条': 'Mark done',
  '跳过': 'Skip',
  '换一个': 'Replace',
  '下周框架': 'Next week framework',
  '下周框架会在生成后显示在这里。': 'Next week’s framework will appear here after it is generated.',
  '目标不存在。': 'Goal not found.',
  '从这个目标开始计时': 'Start timer from this goal',
  '目标已停用，启用后可开始计时。': 'This goal is inactive. Enable it before starting.',
  '累计': 'Total',
  '小时里程碑': 'hour milestone',
  '继续前进': 'Keep going',
  '先创建两位大人': 'Create two adults first',
  '一万小时成长记录': '10,000-hour growth tracker',
  '第一版先服务你们两位，再把每天的学习和宝宝的成长片段慢慢装进去。':
    'This first version starts with two adults, then gradually saves study and baby growth moments.',
  '大人 1': 'Adult 1',
  '大人 2': 'Adult 2',
  '例如：妈妈': 'Example: Mom',
  '例如：爸爸': 'Example: Dad',
  '进入成长记录': 'Enter growth tracker',
  '请先填写两位大人的称呼': 'Please enter names for two adults',
  '请输入目标名称': 'Please enter a goal name',
  '请输入有效的目标小时数': 'Please enter a valid target in hours',
  '请输入有效的分钟数': 'Please enter a valid duration',
  '时长必须大于 0 分钟': 'Duration must be greater than 0 minutes',
  '请选择成员和目标': 'Please choose a member and goal',
  '正在准备成长记录…': 'Preparing growth records...',
  '出现问题': 'Something went wrong',
  '成长记录暂时无法打开': 'Growth records cannot open right now',
  '请刷新页面重试。如果问题持续，请先导出浏览器数据备份再排查。':
    'Refresh and try again. If the issue continues, export a browser data backup before troubleshooting.',
  '刷新页面': 'Refresh page',
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null)

const defaultPreferences: PreferencesContextValue = {
  language: 'zh',
  theme: 'light',
  setLanguage: () => {},
  setTheme: () => {},
  t: (text) => text,
  formatDuration: (minutes) => `${Math.floor(minutes / 60)}小时 ${minutes % 60}分钟`,
  formatHours: (hours) => `${hours}小时`,
}

const readLanguage = (): AppLanguage => {
  if (typeof window === 'undefined') {
    return 'zh'
  }

  return window.localStorage.getItem(LANGUAGE_KEY) === 'en' ? 'en' : 'zh'
}

const readTheme = (): AppTheme => {
  if (typeof window === 'undefined') {
    return 'light'
  }

  return window.localStorage.getItem(THEME_KEY) === 'dark' ? 'dark' : 'light'
}

export function PreferencesProvider({ children }: PropsWithChildren) {
  const [language, setLanguageState] = useState<AppLanguage>(readLanguage)
  const [theme, setThemeState] = useState<AppTheme>(readTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    window.localStorage.setItem(THEME_KEY, theme)
  }, [theme])

  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en'
    document.documentElement.dataset.language = language
    window.localStorage.setItem(LANGUAGE_KEY, language)
  }, [language])

  const value = useMemo<PreferencesContextValue>(() => {
    const t = (text: string) => (language === 'zh' ? text : english[text] ?? text)
    const formatDuration = (minutes: number) => {
      const hours = Math.floor(minutes / 60)
      const remainder = minutes % 60
      return language === 'zh' ? `${hours}小时 ${remainder}分钟` : `${hours}h ${remainder}m`
    }
    const formatHours = (hours: number) => (language === 'zh' ? `${hours}小时` : `${hours}h`)

    return {
      language,
      theme,
      setLanguage: setLanguageState,
      setTheme: setThemeState,
      t,
      formatDuration,
      formatHours,
    }
  }, [language, theme])

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>
}

export function usePreferences() {
  const context = useContext(PreferencesContext)
  if (!context) {
    return defaultPreferences
  }
  return context
}
