import type { ExecutionLog } from '../../services/execution/types'

export function ExecutionTimeline({ logs, isRunning }: { logs: readonly ExecutionLog[]; isRunning: boolean }) {
  return <aside className="execution-timeline" aria-live="polite"><div className="timeline-heading"><span className={isRunning ? 'status-dot running' : 'status-dot'} /> <strong>{isRunning ? 'Execution in progress' : 'Execution activity'}</strong></div><ol>{logs.length ? logs.map((log, index) => <li key={`${log.at}-${index}`}><span>✓</span><div><b>{log.message}</b><time>{new Date(log.at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></div></li>) : <li className="timeline-empty">Your execution progress will appear here.</li>}</ol></aside>
}
