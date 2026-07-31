import { useMemo, useState } from 'react'
import { EmptyState } from '../components/feedback/EmptyState'
import { Link } from '../components/Link'
import { testNetExplorerApplication, testNetExplorerTransaction } from '../services/blockchain/appConfig'
import { readExecutionHistory } from '../services/execution/executionStore'
import { getAllAgents } from '../services/workspace/localWorkspace'

const download = (content: string, fileName: string, type: string) => {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(new Blob([content], { type }))
  link.download = fileName
  link.click()
  URL.revokeObjectURL(link.href)
}

export function ExecutionHistoryPage() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('all')
  const history = useMemo(readExecutionHistory, [])
  const agents = useMemo(getAllAgents, [])
  const agentName = (agentId: string) => agents.find((agent) => agent.id === agentId)?.name ?? agentId
  const normalizedQuery = query.toLowerCase()
  const filtered = history.filter((run) => {
    const haystack = [run.agentId, agentName(run.agentId), run.summary ?? '', run.providerId, run.paymentTransactionId ?? '', run.chainTransactionId ?? '']
    return (status === 'all' || run.status === status) && haystack.some((value) => value.toLowerCase().includes(normalizedQuery))
  })
  const csv = ['Agent,Date,Duration,Status,Network,Payment Tx,Execution Tx,Summary', ...filtered.map((run) => [agentName(run.agentId), run.startedAt, run.durationMs ?? '', run.status, run.network ?? '', run.paymentTransactionId ?? '', run.chainTransactionId ?? '', `"${(run.summary ?? '').replace(/"/g, '""')}"`].join(','))].join('\n')

  return <section className="history-page"><p className="eyebrow">YOUR ACTIVITY</p><h1>Execution history</h1><p>Every local run is kept here in this browser, ready to revisit.</p><div className="history-toolbar"><label className="search-box"><span aria-hidden="true">⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search history, tx id, or agent" aria-label="Search execution history"/></label><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by status"><option value="all">All statuses</option><option value="completed">Completed</option><option value="failed">Failed</option><option value="running">Running</option></select><button type="button" onClick={() => download(JSON.stringify(filtered, null, 2), 'agentverse-history.json', 'application/json')}>Export JSON</button><button type="button" onClick={() => download(csv, 'agentverse-history.csv', 'text/csv')}>Export CSV</button></div>{filtered.length ? <div className="history-table" role="table" aria-label="Execution history"><div className="history-row history-labels" role="row"><span>Agent</span><span>Date</span><span>Duration</span><span>Status</span><span>Receipt</span><span>Result</span></div>{filtered.map((run) => <div className="history-row" role="row" key={run.id}><span role="cell"><b>{agentName(run.agentId)}</b><small>{run.providerId}</small></span><time role="cell">{new Date(run.startedAt).toLocaleString()}</time><span role="cell">{run.durationMs ? `${(run.durationMs / 1000).toFixed(1)}s` : '-'}</span><span role="cell" className={`history-status ${run.status}`}>{run.status}</span><span role="cell" className="history-receipt">{run.network === 'testnet' && run.chainTransactionId ? <a href={testNetExplorerTransaction(run.chainTransactionId)} target="_blank" rel="noreferrer">View tx</a> : <small>{run.chainTransactionId ?? 'Local only'}</small>}{run.network === 'testnet' && run.applicationId ? <a href={testNetExplorerApplication(run.applicationId)} target="_blank" rel="noreferrer">App #{run.applicationId}</a> : null}</span><span role="cell" className="history-summary">{run.summary}</span></div>)}</div> : <EmptyState title="No matching history" description="Run an agent or adjust your filters." action={<Link className="button" to="/marketplace">Explore agents</Link>}/>}</section>
}
