import { useState } from 'react'
import { useWallet } from '@txnlab/use-wallet-react'
import { readExecutionHistory } from '../services/execution/executionStore'
import { readLocalAgents, readProfile, saveProfile, type Profile } from '../services/workspace/localWorkspace'
import { ellipseAddress } from '../utils/ellipseAddress'

export function ProfilePage() {
  const { activeAddress } = useWallet()
  const [profile, setProfile] = useState(readProfile)
  const history = readExecutionHistory()
  const completed = history.filter((run) => run.status === 'completed').length
  const localAgents = readLocalAgents()
  const update = <K extends keyof Profile>(key: K, value: Profile[K]) => setProfile((current) => ({ ...current, [key]: value }))
  const uploadAvatar = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => update('avatarDataUrl', String(reader.result))
    reader.readAsDataURL(file)
  }
  const persist = () => saveProfile(profile)

  return <section className="profile-page"><div className="profile-header"><div className="profile-avatar" aria-hidden="true">{profile.avatarDataUrl ? <img src={profile.avatarDataUrl} alt=""/> : profile.displayName.split(/\s+/).slice(0, 2).map((part) => part[0]).join('')}</div><div><p className="eyebrow">USER PROFILE</p><h1>{profile.displayName}</h1><p>{profile.biography}</p>{activeAddress && <span className="wallet-address"><i />{ellipseAddress(activeAddress)}</span>}</div><button className="button button-ghost" type="button" onClick={persist}>Save profile</button></div><div className="profile-grid"><article><span>Total runs</span><strong>{history.length}</strong></article><article><span>Completed</span><strong>{completed}</strong></article><article><span>Creator agents</span><strong>{localAgents.length}</strong></article></div><div className="profile-workspace"><section className="profile-panel"><h2>Edit profile</h2><div className="form-grid"><label>Display name<input value={profile.displayName} onChange={(event) => update('displayName', event.target.value)} /></label><label>Role<input value={profile.role} onChange={(event) => update('role', event.target.value)} /></label><label className="wide">Biography<textarea value={profile.biography} onChange={(event) => update('biography', event.target.value)} /></label><label className="wide">Skills<textarea value={profile.skills.join('\n')} onChange={(event) => update('skills', event.target.value.split('\n').map((item) => item.trim()).filter(Boolean))} /></label><label className="wide">Avatar<input type="file" accept="image/*" onChange={(event) => uploadAvatar(event.target.files?.[0])} /></label></div></section><section className="profile-panel"><h2>Activity timeline</h2>{history.length ? <div className="timeline-list">{history.slice(0, 8).map((run) => <article key={run.id}><span className={`run-status ${run.status}`}>{run.status === 'completed' ? '✓' : '!'}</span><div><b>{run.agentId}</b><small>{new Date(run.startedAt).toLocaleString()} · {run.durationMs ? `${(run.durationMs / 1000).toFixed(1)}s` : 'pending'}</small><p>{run.summary}</p></div></article>)}</div> : <div className="dashboard-empty">Run an agent to build an activity timeline.</div>}</section></div></section>
}
