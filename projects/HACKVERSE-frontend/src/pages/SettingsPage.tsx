import { useState } from 'react'
import { exportWorkspace, importWorkspace, readSettings, resetSettings, saveSettings, type WorkspaceSettings } from '../services/workspace/localWorkspace'

export function SettingsPage() {
  const [settings, setSettings] = useState(readSettings)
  const [message, setMessage] = useState('')
  const publishSettingsChange = () => window.dispatchEvent(new Event('agentverse:settings-changed'))
  const update = <K extends keyof WorkspaceSettings>(key: K, value: WorkspaceSettings[K]) => {
    const next = { ...settings, [key]: value }
    setSettings(next)
    saveSettings(next)
    publishSettingsChange()
    setMessage('Settings saved.')
  }
  const download = (content: string, name: string, type = 'application/json') => {
    const link = document.createElement('a')
    link.href = URL.createObjectURL(new Blob([content], { type }))
    link.download = name
    link.click()
    URL.revokeObjectURL(link.href)
  }
  const upload = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      try {
        importWorkspace(String(reader.result))
        setSettings(readSettings())
        publishSettingsChange()
        setMessage('Workspace imported.')
      } catch {
        setMessage('Import failed. Choose a valid AgentVerse JSON export.')
      }
    }
    reader.readAsText(file)
  }
  const reset = () => {
    resetSettings()
    setSettings(readSettings())
    publishSettingsChange()
    setMessage('Settings reset.')
  }

  return (
    <section className="settings-page">
      <p className="eyebrow">WORKSPACE SETTINGS</p>
      <h1>Control your local workspace.</h1>
      <p className="settings-lede">Preferences are saved in this browser. Paid execution is handled by the server-side x402 API.</p>
      <div className="settings-layout">
        <section className="settings-panel">
          <h2>Preferences</h2>
          <div className="settings-list">
            <article><div><b>Notifications</b><small>Show local status messages while working.</small></div><label className="toggle-control"><input type="checkbox" checked={settings.notifications} onChange={(event) => update('notifications', event.target.checked)} /><span /></label></article>
            <article><div><b>Execution receipts</b><small>Keep run receipts visible in history.</small></div><label className="toggle-control"><input type="checkbox" checked={settings.executionReceipts} onChange={(event) => update('executionReceipts', event.target.checked)} /><span /></label></article>
            <article><div><b>Result downloads</b><small>Allow JSON and CSV export actions.</small></div><label className="toggle-control"><input type="checkbox" checked={settings.resultDownloads} onChange={(event) => update('resultDownloads', event.target.checked)} /><span /></label></article>
            <article><div><b>Creator verification notices</b><small>Show trust markers where available.</small></div><label className="toggle-control"><input type="checkbox" checked={settings.creatorVerificationNotices} onChange={(event) => update('creatorVerificationNotices', event.target.checked)} /><span /></label></article>
          </div>
        </section>
        <section className="settings-panel">
          <h2>Environment</h2>
          <div className="form-grid">
            <label>Theme<select value={settings.theme} onChange={(event) => update('theme', event.target.value as WorkspaceSettings['theme'])}><option value="dark">Dark</option><option value="contrast">High contrast</option></select></label>
            <label>AI runtime<select value={settings.aiProvider} onChange={(event) => update('aiProvider', event.target.value as WorkspaceSettings['aiProvider'])}><option value="gemini">Gemini</option><option value="python">Python Agent</option></select></label>
            <label>Wallet<select value={settings.walletPreference} onChange={(event) => update('walletPreference', event.target.value as WorkspaceSettings['walletPreference'])}><option value="pera">Pera</option><option value="defly">Defly</option><option value="exodus">Exodus</option></select></label>
            <label>Network<select value={settings.network} onChange={(event) => update('network', event.target.value as WorkspaceSettings['network'])}><option value="testnet">TestNet</option><option value="localnet">LocalNet</option><option value="mainnet">MainNet</option></select></label>
          </div>
        </section>
        <section className="settings-panel">
          <h2>Import and export</h2>
          <div className="creator-actions">
            <button type="button" className="button" onClick={() => download(exportWorkspace(), 'agentverse-workspace.json')}>Export JSON</button>
            <label className="button button-ghost">Import JSON<input className="sr-only" type="file" accept="application/json" onChange={(event) => upload(event.target.files?.[0])} /></label>
            <button type="button" className="button button-ghost" onClick={reset}>Reset settings</button>
          </div>
          {message && <div className="form-success" role="status">{message}</div>}
        </section>
      </div>
    </section>
  )
}
