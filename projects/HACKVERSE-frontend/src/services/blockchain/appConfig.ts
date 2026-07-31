const DEPLOYED_TESTNET_APP_ID = 768352288

export function getAgentVerseAppId(): number {
  const value = import.meta.env.VITE_AGENTVERSE_APP_ID ?? DEPLOYED_TESTNET_APP_ID
  const appId = Number(value)
  if (!Number.isSafeInteger(appId) || appId <= 0) throw new Error('AgentVerse TestNet application is not configured. Set VITE_AGENTVERSE_APP_ID after deployment.')
  return appId
}

export const testNetExplorerTransaction = (transactionId: string) => `https://testnet.algoexplorer.io/tx/${transactionId}`
export const testNetExplorerApplication = (appId: number) => `https://testnet.algoexplorer.io/application/${appId}`
