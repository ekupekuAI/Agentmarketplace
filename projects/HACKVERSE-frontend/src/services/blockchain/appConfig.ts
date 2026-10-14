const DEPLOYED_TESTNET_APP_ID = 768352288

export function getAgentVerseAppId(): number {
  const value = import.meta.env.VITE_AGENTVERSE_APP_ID ?? DEPLOYED_TESTNET_APP_ID
  const appId = Number(value)
  if (!Number.isSafeInteger(appId) || appId <= 0) throw new Error('AgentVerse TestNet application is not configured. Set VITE_AGENTVERSE_APP_ID after deployment.')
  return appId
}

// AlgoExplorer shut down in 2023; Lora is the Algorand Foundation's maintained explorer.
export const testNetExplorerTransaction = (transactionId: string) => `https://lora.algokit.io/testnet/transaction/${transactionId}`
export const testNetExplorerApplication = (appId: number) => `https://lora.algokit.io/testnet/application/${appId}`
