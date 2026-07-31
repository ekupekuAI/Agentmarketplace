import { useMemo, useState } from 'react'
import { Link } from '../components/Link'
import { getExecutionAnalytics } from '../services/analytics/analyticsService'
import { readExecutionHistory } from '../services/execution/executionStore'
import { getAllAgents } from '../services/workspace/localWorkspace'

const dayKey = (date: Date) => date.toISOString().slice(0, 10)

export function DashboardPage() {
  const [range, setRange] = useState<'week' | 'month'>('week')
  const history = useMemo(readExecutionHistory, [])
  const agents = useMemo(getAllAgents, [])
  const analytics = useMemo(getExecutionAnalytics, [])
  const days = range === 'week' ? 7 : 30
  const trend = Array.from({ length: days }, (_, index) => {
    const date = new Date()
    date.setDate(date.getDate() - (days - index - 1))
    const runs = history.filter((run) => dayKey(new Date(run.startedAt)) === dayKey(date))
    return { label: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), runs: runs.length, success: runs.filter((run) => run.status === 'completed').length, runtime: runs.length ? Math.round(runs.reduce((sum, run) => sum + (run.durationMs ?? 0), 0) / runs.length / 100) / 10 : 0 }
  })
  const maxRuns = Math.max(1, ...trend.map((item) => item.runs))
  const metrics = [{ label: 'Executions today', value: analytics.todayCount }, { label: 'Most used agent', value: analytics.mostUsedAgent }, { label: 'Average runtime', value: analytics.averageRuntime }, { label: 'Success rate', value: analytics.successRate }, { label: 'User satisfaction', value: analytics.satisfaction }]
  const insight = history.length ? `Your ${range} activity includes ${trend.reduce((sum, item) => sum + item.runs, 0)} runs with ${trend.reduce((sum, item) => sum + item.success, 0)} completed successfully.` : 'Run an agent to unlock workspace insights.'

  return <section className="dashboard-page"><p className="eyebrow">YOUR WORKSPACE</p><h1>Good to see you.</h1><p className="dashboard-lede">Track your agent activity and pick up where your work left off.</p><div className="dashboard-top-actions"><Link className="button button-ghost" to="/profile">View profile</Link><Link className="button button-ghost" to="/settings">Settings</Link><div className="segmented"><button type="button" className={range === 'week' ? 'active' : ''} onClick={() => setRange('week')}>Week</button><button type="button" className={range === 'month' ? 'active' : ''} onClick={() => setRange('month')}>Month</button></div></div><div className="metric-grid">{metrics.map((metric) => <article key={metric.label}><span>{metric.label}</span><strong>{metric.value}</strong></article>)}</div><section className="analytics-panel"><div className="section-heading"><div><p className="eyebrow">TRENDS</p><h2>Usage and runtime</h2></div><span>{insight}</span></div><div className="chart-grid">{trend.map((item) => <article key={item.label} title={`${item.runs} runs`}><div className="bar" style={{ height: `${Math.max(6, item.runs / maxRuns * 100)}%` }} /><small>{item.label}</small></article>)}</div><div className="trend-stats"><span>Peak day: {trend.reduce((best, item) => item.runs > best.runs ? item : best, trend[0]).label}</span><span>Avg runtime trend: {trend.filter((item) => item.runtime).at(-1)?.runtime ?? 0}s latest active day</span></div></section><div className="dashboard-columns"><section><div className="section-heading"><div><p className="eyebrow">RECENT ACTIVITY</p><h2>Execution history</h2></div><Link className="view-all" to="/transactions">View all →</Link></div>{history.length ? <div className="run-list">{history.slice(0, 4).map((run) => <article key={run.id}><span className={`run-status ${run.status}`}>{run.status === 'completed' ? '✓' : '!'}</span><div><b>{agents.find((agent) => agent.id === run.agentId)?.name ?? run.agentId}</b><p>{run.summary}</p></div><time>{new Date(run.startedAt).toLocaleDateString()}</time></article>)}</div> : <div className="dashboard-empty">Run an agent to start building your history.</div>}</section><aside className="dashboard-cta"><p className="eyebrow">READY WHEN YOU ARE</p><h2>Find your next helpful agent.</h2><p>Choose a specialized agent for a focused task, then keep a record of every result.</p><Link className="button" to="/marketplace">Explore marketplace <span>→</span></Link></aside></div></section>
}
