import { useCallback, useMemo, useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { ExecutionTimeline } from '../components/execution/ExecutionTimeline'
import { ResultPanel } from '../components/execution/ResultPanel'
import { NotFoundState } from '../components/feedback/NotFoundState'
import { Link } from '../components/Link'
import { getAgentDefinition } from '../data/agentDefinitions'
import { executeAgent } from '../services/execution/executionService'
import { saveExecution } from '../services/execution/executionStore'
import type { ExecutionLog, ExecutionRecord } from '../services/execution/types'
import { hashExecutionSummary, recordExecutionOnChain, type ExecutionChainReceipt } from '../services/blockchain/agentVerseContractService'
import { getAgentVerseAppId, testNetExplorerApplication, testNetExplorerTransaction } from '../services/blockchain/appConfig'
import { executeAgentWithX402, type X402ExecutionResponse } from '../services/payments/x402ExecutionService'
import { getAgentById, readSettings } from '../services/workspace/localWorkspace'

const initialInput = (fields: readonly { key: string }[]) => Object.fromEntries(fields.map((field) => [field.key, '']))
const createRunId = () => `run_${crypto.randomUUID?.() ?? Date.now()}`
const downloadableResult = (record: ExecutionRecord, payment?: PaymentReceipt, chain?: ExecutionChainReceipt) => JSON.stringify({ ...record, payment, chain }, null, 2)

interface PaymentReceipt { transactionId?: string; appId?: number }
type RunStage = 'idle' | 'payment' | 'executing' | 'recording' | 'complete' | 'failed'

export function ExecuteAgentPage({ agentId }: { agentId: string }) {
  const { activeAddress, signTransactions, transactionSigner } = useWallet()
  const agent = getAgentById(agentId)
  const definition = getAgentDefinition(agentId)
  const settings = readSettings()
  const [input, setInput] = useState(() => definition ? initialInput(definition.fields) : {})
  const [logs, setLogs] = useState<ExecutionLog[]>([])
  const [record, setRecord] = useState<ExecutionRecord>()
  const [error, setError] = useState<string>()
  const [isRunning, setIsRunning] = useState(false)
  const [runStage, setRunStage] = useState<RunStage>('idle')
  const [paymentReceipt, setPaymentReceipt] = useState<PaymentReceipt>()
  const [chainReceipt, setChainReceipt] = useState<ExecutionChainReceipt>()
  const [uploadStatus, setUploadStatus] = useState<Record<string, string>>({})

  const validation = useMemo(
    () => definition?.fields.filter((field) => (input[field.key] ?? '').trim().length < field.minLength).map((field) => field.label) ?? [],
    [definition, input],
  )
  const updateInput = useCallback((key: string, value: string) => setInput((current) => ({ ...current, [key]: value })), [])
  const uploadInput = async (key: string, file?: File) => {
    if (!file) return
    if (file.size > 240_000) { setError('Use a text file smaller than 240 KB, or paste an excerpt.'); return }
    if (file.type.startsWith('image/')) {
      setError('Image upload is ready, but local OCR is not installed in this runtime. Paste OCR text or configure the Python OCR runtime before charging for image analysis.')
      setUploadStatus((current) => ({ ...current, [key]: `${file.name} selected` }))
      return
    }
    try {
      const text = await file.text()
      updateInput(key, text)
      setUploadStatus((current) => ({ ...current, [key]: `${file.name} loaded` }))
    } catch { setError('We could not read that file. Please paste its text instead.') }
  }

  if (!agent || !definition) return <NotFoundState />

  const appId = (() => {
    try { return getAgentVerseAppId() } catch { return undefined }
  })()
  const canUseTestNet = settings.network === 'testnet' && Boolean(activeAddress && appId)
  const networkLabel = canUseTestNet ? 'Algorand TestNet' : 'Browser fallback'

  const addLog = (message: string) => {
    const log = { at: new Date().toISOString(), message }
    setLogs((current) => [...current, log])
    return log
  }

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (validation.length) { setError(`Please complete: ${validation.join(', ')}.`); return }
    setError(undefined); setRecord(undefined); setLogs([]); setPaymentReceipt(undefined); setChainReceipt(undefined); setIsRunning(true)
    const startedAt = new Date()
    try {
      let completed: ExecutionRecord
      let payment: PaymentReceipt | undefined

      if (canUseTestNet) {
        setRunStage('payment')
        addLog('x402 payment requirements requested')
        const result: X402ExecutionResponse = await executeAgentWithX402(agentId, input, { address: activeAddress!, signTransactions })
        payment = { transactionId: result.paymentTransactionId, appId }
        setPaymentReceipt(payment)
        setRunStage('executing')
        addLog(`${result.provider} execution completed${result.fallback ? ' with graceful fallback' : ''}`)
        completed = {
          id: createRunId(),
          agentId,
          startedAt: startedAt.toISOString(),
          completedAt: new Date().toISOString(),
          durationMs: Date.now() - startedAt.getTime(),
          status: 'completed',
          input,
          output: result.output,
          summary: result.summary,
          logs: [
            { at: startedAt.toISOString(), message: 'x402 payment requirements requested' },
            { at: new Date().toISOString(), message: `${result.provider} execution completed${result.fallback ? ' with graceful fallback' : ''}` },
          ],
          providerId: result.provider === 'Gemini' ? 'gemini' : result.provider === 'OpenRouter' ? 'openrouter' : 'python',
        }
      } else {
        addLog('Wallet or TestNet configuration unavailable; running browser fallback')
        completed = await executeAgent({ agentId, input, providerId: agent.runtime === 'Python Agent' ? 'python' : 'python', onProgress: (log) => setLogs((current) => [...current, log]) })
      }

      setLogs(completed.logs)
      setRunStage('recording')
      let receipt: ExecutionChainReceipt | undefined
      if (canUseTestNet) {
        try {
          const resultHash = await hashExecutionSummary(JSON.stringify({ summary: completed.summary, output: completed.output }))
          receipt = await recordExecutionOnChain({ agentId, executionId: completed.id, resultHash, sender: activeAddress!, signer: transactionSigner })
        } catch (caught) {
          receipt = { appId: appId ?? 0, transactionId: '' }
          setError(`Your paid result is below, but the on-chain receipt could not be recorded: ${caught instanceof Error ? caught.message : 'unknown error'}`)
        }
      } else {
        receipt = { appId: appId ?? 0, transactionId: `local-receipt-${completed.id}` }
      }

      const enriched: ExecutionRecord = {
        ...completed,
        network: canUseTestNet ? 'testnet' : 'local',
        applicationId: receipt.appId || undefined,
        paymentTransactionId: payment?.transactionId,
        chainTransactionId: receipt.transactionId || undefined,
      }
      saveExecution(enriched)
      setPaymentReceipt(payment)
      setChainReceipt(receipt)
      setRecord(enriched)
      setRunStage('complete')
    } catch (caught) {
      setRunStage('failed')
      setError(caught instanceof Error ? caught.message : 'We could not complete this run. Please try again.')
    } finally {
      setIsRunning(false)
    }
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

  const statusText = runStage === 'idle' ? 'Ready' : runStage === 'payment' ? 'Awaiting x402 payment' : runStage === 'executing' ? `${agent.runtime ?? 'Gemini'} running` : runStage === 'recording' ? 'Recording receipt' : runStage === 'complete' ? 'Confirmed' : 'Needs retry'

  return (
    <section className="execute-page">
      <div className="details-breadcrumb"><Link to={`/agents/${agent.id}`}>← {agent.name}</Link><span> / Run agent</span></div>
      <div className="execute-heading">
        <div>
          <p className="eyebrow">{canUseTestNet ? 'X402 PROTECTED TESTNET EXECUTION' : 'BROWSER FALLBACK'}</p>
          <h1>{agent.name}</h1>
          <p>{agent.tagline} {canUseTestNet ? `This run uses x402 payment, ${agent.runtime ?? 'Gemini'} execution, and an Algorand TestNet receipt.` : 'Connect Pera on TestNet to run the paid production flow.'}</p>
        </div>
        {agent.iconDataUrl ? <img className="agent-icon preview-image" src={agent.iconDataUrl} alt="" /> : <span className={'agent-icon ' + agent.accent}>{agent.initials}</span>}
      </div>
      <div className="execute-layout">
        <form className="execution-form" onSubmit={submit} noValidate>
          <h2>Give the agent context</h2>
          <p>Clear inputs help produce a more useful, focused result.</p>
          {definition.fields.map((field) => (
            <label key={field.key}>{field.label}
              <textarea value={input[field.key] ?? ''} disabled={isRunning} placeholder={field.placeholder} onChange={(event) => updateInput(field.key, event.target.value)} aria-describedby={field.helper ? `${field.key}-help` : undefined} />
              {field.helper && <small id={`${field.key}-help`}>{field.helper}</small>}
              {field.upload && <span className="execution-upload"><span>{field.upload.label}</span><input type="file" accept={field.upload.accept} disabled={isRunning} aria-label={field.upload.label} onChange={(event) => void uploadInput(field.key, event.target.files?.[0])} />{uploadStatus[field.key] && <small>{uploadStatus[field.key]}</small>}</span>}
            </label>
          ))}
          <div className="chain-status" aria-live="polite">
            <span className={`chain-pill ${runStage}`}>{statusText}</span>
            <small>{canUseTestNet ? `Wallet ${activeAddress!.slice(0, 6)}... connected on TestNet, app #${appId}. Runtime: ${agent.runtime ?? 'Gemini'}.` : 'Production x402 execution requires Pera Wallet, TestNet, and the deployed AgentVerse app configuration.'}</small>
          </div>
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="creator-actions">
            <button className="button execute-button" disabled={isRunning} type="submit">{isRunning ? 'Processing...' : canUseTestNet ? `Pay x402 and run for ${agent.price}` : 'Run browser fallback'} <span>{isRunning ? '◌' : '→'}</span></button>
            {runStage === 'failed' && <button className="button button-ghost" type="submit">Retry</button>}
          </div>
          <small className="execution-note">{canUseTestNet ? 'x402 verifies payment before the backend calls Gemini or the Python agent runtime.' : 'Fallback mode is local only and does not represent a paid execution.'}</small>
        </form>
        <ExecutionTimeline logs={logs} isRunning={isRunning} />
      </div>
      {settings.executionReceipts && (paymentReceipt || chainReceipt) && <section className="blockchain-receipt" aria-label="Execution receipt"><div><p className="eyebrow">EXECUTION RECEIPT</p><h2>Execution trail</h2><p>{canUseTestNet ? 'Paid runs keep a compact TestNet paper trail without putting full AI output on-chain.' : 'This browser-local receipt keeps history usable without external credentials.'}</p></div><dl>{activeAddress && <div><dt>Connected wallet</dt><dd>{activeAddress}</dd></div>}<div><dt>Network</dt><dd>{networkLabel}</dd></div>{appId && <div><dt>Application ID</dt><dd>{appId}</dd></div>}{paymentReceipt?.transactionId && <div><dt>Payment Tx</dt><dd>{canUseTestNet ? <a href={testNetExplorerTransaction(paymentReceipt.transactionId)} target="_blank" rel="noreferrer">{paymentReceipt.transactionId}</a> : paymentReceipt.transactionId}</dd></div>}{chainReceipt?.transactionId && <div><dt>Execution Tx</dt><dd>{canUseTestNet ? <a href={testNetExplorerTransaction(chainReceipt.transactionId)} target="_blank" rel="noreferrer">{chainReceipt.transactionId}</a> : chainReceipt.transactionId}</dd></div>}{canUseTestNet && appId && <div><dt>Explorer</dt><dd><a href={testNetExplorerApplication(appId)} target="_blank" rel="noreferrer">View application</a></dd></div>}</dl></section>}
      {record?.output && <><div className="result-actions"><button type="button" onClick={copy}>Copy result</button>{settings.resultDownloads && <button type="button" onClick={download}>Download JSON</button>}<button type="button" onClick={share}>Share result</button></div><ResultPanel output={record.output} summary={record.summary ?? ''} /></>}
    </section>
  )
}
