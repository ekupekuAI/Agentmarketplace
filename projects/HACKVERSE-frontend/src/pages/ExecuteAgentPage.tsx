import { useCallback, useMemo, useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { ExecutionTimeline } from '../components/execution/ExecutionTimeline'
import { ResultPanel } from '../components/execution/ResultPanel'
import { NotFoundState } from '../components/feedback/NotFoundState'
import { Link } from '../components/Link'
import { getAgentDefinition } from '../data/agentDefinitions'
import { ExecutionError, executeAgent } from '../services/execution/executionService'
import { saveExecution } from '../services/execution/executionStore'
import type { ExecutionLog, ExecutionRecord } from '../services/execution/types'
import { hashExecutionSummary, recordExecutionOnChain, type ExecutionChainReceipt } from '../services/blockchain/agentVerseContractService'
import { getAgentVerseAppId, testNetExplorerApplication, testNetExplorerTransaction } from '../services/blockchain/appConfig'
import { payAgentVerse, type TestNetPaymentReceipt } from '../services/payments/algorandPaymentService'
import { getAgentById, readSettings } from '../services/workspace/localWorkspace'

const initialInput = (fields: readonly { key: string }[]) => Object.fromEntries(fields.map((field) => [field.key, '']))
const getAgentPrice = (price: string) => Number.parseFloat(price.replace(' ALGO', ''))
const downloadableResult = (record: ExecutionRecord, payment?: TestNetPaymentReceipt, chain?: ExecutionChainReceipt) => JSON.stringify({ ...record, payment, chain }, null, 2)
const localReceipt = (runId: string, appId = 0): TestNetPaymentReceipt => ({ transactionId: `local-${runId}`, appId })

type RunStage = 'idle' | 'payment' | 'executing' | 'recording' | 'complete' | 'failed'

export function ExecuteAgentPage({ agentId }: { agentId: string }) {
  const { activeAddress, transactionSigner } = useWallet()
  const agent = getAgentById(agentId)
  const definition = getAgentDefinition(agentId)
  const settings = readSettings()
  const [input, setInput] = useState(() => definition ? initialInput(definition.fields) : {})
  const [logs, setLogs] = useState<ExecutionLog[]>([])
  const [record, setRecord] = useState<ExecutionRecord>()
  const [error, setError] = useState<string>()
  const [isRunning, setIsRunning] = useState(false)
  const [runStage, setRunStage] = useState<RunStage>('idle')
  const [paymentReceipt, setPaymentReceipt] = useState<TestNetPaymentReceipt>()
  const [chainReceipt, setChainReceipt] = useState<ExecutionChainReceipt>()

  const validation = useMemo(
    () => definition?.fields.filter((field) => (input[field.key] ?? '').trim().length < field.minLength).map((field) => field.label) ?? [],
    [definition, input],
  )
  const updateInput = useCallback((key: string, value: string) => setInput((current) => ({ ...current, [key]: value })), [])

  if (!agent || !definition) return <NotFoundState />

  const appId = (() => {
    try { return getAgentVerseAppId() } catch { return undefined }
  })()
  const canUseTestNet = settings.network === 'testnet' && Boolean(activeAddress && appId)
  const networkLabel = canUseTestNet ? 'Algorand TestNet' : 'Local receipt mode'

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (validation.length) { setError(`Please complete: ${validation.join(', ')}.`); return }
    setError(undefined); setRecord(undefined); setLogs([]); setPaymentReceipt(undefined); setChainReceipt(undefined); setIsRunning(true)
    try {
      setRunStage('payment')
      const payment = canUseTestNet
        ? await payAgentVerse({ sender: activeAddress!, signer: transactionSigner, amountAlgos: getAgentPrice(agent.price) })
        : localReceipt(`pending-${Date.now()}`, appId)
      setPaymentReceipt(payment)

      setRunStage('executing')
      const completed = await executeAgent({ agentId, input, providerId: settings.aiProvider, onProgress: (log) => setLogs((current) => [...current, log]) })
      setLogs(completed.logs)

      setRunStage('recording')
      let receipt: ExecutionChainReceipt | undefined
      if (canUseTestNet) {
        const resultHash = await hashExecutionSummary(JSON.stringify({ summary: completed.summary, output: completed.output }))
        receipt = await recordExecutionOnChain({ agentId, executionId: completed.id, resultHash, sender: activeAddress!, signer: transactionSigner })
      } else {
        receipt = { appId: appId ?? 0, transactionId: `local-chain-${completed.id}` }
      }

      const enriched: ExecutionRecord = {
        ...completed,
        network: canUseTestNet ? 'testnet' : 'local',
        applicationId: receipt.appId || undefined,
        paymentTransactionId: payment.transactionId,
        chainTransactionId: receipt.transactionId,
      }
      saveExecution(enriched)
      setPaymentReceipt(canUseTestNet ? payment : localReceipt(completed.id, appId))
      setChainReceipt(receipt)
      setRecord(enriched)
      setRunStage('complete')
    } catch (caught) {
      setRunStage('failed')
      const failedRecord = caught instanceof ExecutionError ? caught.record : undefined
      if (failedRecord) setRecord(failedRecord)
      setError(caught instanceof ExecutionError ? caught.message : caught instanceof Error ? caught.message : 'We could not complete this run. Please try again.')
    } finally { setIsRunning(false) }
  }

  const copy = async () => {
    if (!record?.output) return
    try {
      if (!navigator.clipboard) throw new Error('Clipboard access is unavailable.')
      await navigator.clipboard.writeText(downloadableResult(record, paymentReceipt, chainReceipt))
    } catch { setError('We could not copy the result. Please download the JSON instead.') }
  }
  const share = async () => {
    if (!record) return
    const shareText = `${agent.name} result: ${record.summary ?? 'Agent run completed.'}`
    try {
      if (navigator.share) { await navigator.share({ title: `${agent.name} result`, text: shareText, url: window.location.href }); return }
      if (!navigator.clipboard) throw new Error('Clipboard access is unavailable.')
      await navigator.clipboard.writeText(`${shareText}\n${window.location.href}`)
    } catch { setError('We could not share the result. Please copy or download it instead.') }
  }
  const download = () => {
    if (!record) return
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([downloadableResult(record, paymentReceipt, chainReceipt)], { type: 'application/json' }))
    link.download = `${agent.id}-${record.id}.json`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return <section className="execute-page"><div className="details-breadcrumb"><Link to={`/agents/${agent.id}`}>← {agent.name}</Link><span> / Run agent</span></div><div className="execute-heading"><div><p className="eyebrow">{canUseTestNet ? 'LIVE TESTNET EXECUTION' : 'LOCAL EXECUTION'}</p><h1>{agent.name}</h1><p>{agent.tagline} {canUseTestNet ? 'Payments and execution receipts are sent through Algorand TestNet while AI processing stays modular.' : 'This run will complete locally and keep a browser receipt until TestNet deployment settings are available.'}</p></div>{agent.iconDataUrl ? <img className="agent-icon preview-image" src={agent.iconDataUrl} alt=""/> : <span className={'agent-icon ' + agent.accent}>{agent.initials}</span>}</div><div className="execute-layout"><form className="execution-form" onSubmit={submit} noValidate><h2>Give the agent context</h2><p>Clear inputs help produce a more useful, focused result.</p>{definition.fields.map((field) => <label key={field.key}>{field.label}<textarea value={input[field.key] ?? ''} disabled={isRunning} placeholder={field.placeholder} onChange={(event) => updateInput(field.key, event.target.value)} aria-describedby={field.helper ? `${field.key}-help` : undefined}/>{field.helper && <small id={`${field.key}-help`}>{field.helper}</small>}</label>)}<div className="chain-status" aria-live="polite"><span className={`chain-pill ${runStage}`}>{runStage === 'idle' ? 'Ready' : runStage === 'payment' ? (canUseTestNet ? 'Awaiting wallet signature' : 'Creating local receipt') : runStage === 'executing' ? 'Agent running' : runStage === 'recording' ? 'Recording receipt' : runStage === 'complete' ? 'Confirmed' : 'Needs retry'}</span><small>{canUseTestNet ? `Wallet ${activeAddress!.slice(0, 6)}... connected on TestNet, app #${appId}. Provider: ${settings.aiProvider}.` : `Provider: ${settings.aiProvider}. Add TestNet app configuration and connect a wallet to submit real payment and receipt transactions.`}</small></div>{error && <div className="form-error" role="alert">{error}</div>}<div className="creator-actions"><button className="button execute-button" disabled={isRunning} type="submit">{isRunning ? 'Processing...' : canUseTestNet ? `Run for ${agent.price}` : 'Run locally'} <span>{isRunning ? '◌' : '→'}</span></button>{runStage === 'failed' && <button className="button button-ghost" type="submit">Retry</button>}</div><small className="execution-note">{canUseTestNet ? 'This requests a TestNet payment signature, runs the selected AI adapter, and stores a compact execution receipt on-chain.' : 'Local receipt mode avoids external infrastructure while preserving the same execution and history workflow.'}</small></form><ExecutionTimeline logs={logs} isRunning={isRunning}/></div>{(paymentReceipt || chainReceipt) && <section className="blockchain-receipt" aria-label="Execution receipt"><div><p className="eyebrow">EXECUTION RECEIPT</p><h2>Execution trail</h2><p>{canUseTestNet ? 'Every paid run keeps a clean TestNet paper trail without pushing full AI output on-chain.' : 'This browser-local receipt keeps the workflow usable until deployment credentials are configured.'}</p></div><dl>{activeAddress && <div><dt>Connected wallet</dt><dd>{activeAddress}</dd></div>}<div><dt>Network</dt><dd>{networkLabel}</dd></div>{appId && <div><dt>Application ID</dt><dd>{appId}</dd></div>}{paymentReceipt?.transactionId && <div><dt>Payment Tx</dt><dd>{canUseTestNet ? <a href={testNetExplorerTransaction(paymentReceipt.transactionId)} target="_blank" rel="noreferrer">{paymentReceipt.transactionId}</a> : paymentReceipt.transactionId}</dd></div>}{chainReceipt?.transactionId && <div><dt>Execution Tx</dt><dd>{canUseTestNet ? <a href={testNetExplorerTransaction(chainReceipt.transactionId)} target="_blank" rel="noreferrer">{chainReceipt.transactionId}</a> : chainReceipt.transactionId}</dd></div>}{canUseTestNet && appId && <div><dt>Explorer</dt><dd><a href={testNetExplorerApplication(appId)} target="_blank" rel="noreferrer">View application</a></dd></div>}</dl></section>}{record?.output && <><div className="result-actions"><button type="button" onClick={copy}>Copy result</button><button type="button" onClick={download}>Download JSON</button><button type="button" onClick={share}>Share result</button></div><ResultPanel output={record.output} summary={record.summary ?? ''}/></>}</section>
}
