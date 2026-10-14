import type { Agent } from '../types/agent'
import { readSettings } from '../services/workspace/localWorkspace'
import { Link } from './Link'

export function AgentCard({ agent }: { agent: Agent }) {
  return (
    <article className="agent-card">
      {agent.iconDataUrl ? <img className="agent-icon preview-image" src={agent.iconDataUrl} alt="" /> : <div className={'agent-icon ' + agent.accent}>{agent.initials}</div>}
      <div className="agent-card-main">
        <div className="card-title-row">
          <span className="eyebrow">{agent.category}</span>
          {!readSettings().creatorVerificationNotices ? null : agent.verified ? <span className="verified" title="Verified creator">✓</span> : agent.owner === 'local' && <span className="verified" title="Local creator">local</span>}
        </div>
        <h3>{agent.name}</h3>
        <p>{agent.description}</p>
        <div className="card-meta">
          <span>{agent.rating ? `★ ${agent.rating}` : 'New'} <em>({agent.reviews})</em></span>
          <span>{agent.runtime ?? 'Gemini'}</span>
        </div>
        <div className="card-footer">
          <span className="price">{agent.price}<small> / run</small></span>
          <Link className="card-link" to={'/agents/' + agent.id}>View agent <span>→</span></Link>
        </div>
      </div>
    </article>
  )
}
