import type { AgentResult } from '../../services/ai/types'

function ResultValue({ value }: { value: AgentResult[string] }) { return Array.isArray(value) ? <ul>{value.map((item) => <li key={item}>{item}</li>)}</ul> : <p>{String(value)}</p> }
export function ResultPanel({ output, summary }: { output: AgentResult; summary: string }) { return <section className="result-panel completion-pop"><div className="result-title"><span>✓</span><div><p className="eyebrow">RESULT READY</p><h2>Your analysis is complete.</h2></div></div><p className="result-summary">{summary}</p><div className="result-grid">{Object.entries(output).map(([label, value]) => <article key={label}><h3>{label}</h3><ResultValue value={value}/></article>)}</div></section> }
