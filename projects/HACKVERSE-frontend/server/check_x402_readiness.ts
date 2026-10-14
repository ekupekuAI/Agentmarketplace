import { config as loadEnv } from 'dotenv'

loadEnv({ path: ['.env.server', '.env'], quiet: true })

const indexer = process.env.INDEXER_SERVER ?? 'https://testnet-idx.algonode.cloud'
const assetId = Number(process.env.X402_ASSET_ID ?? 10458941)
const receiver = process.env.X402_PAY_TO_ADDRESS
const payer = process.env.X402_PAYER_ADDRESS

async function checkAddress(label: string, address?: string) {
  if (!address) return { label, configured: false, funded: false, optedIntoUsdc: false }
  const response = await fetch(`${indexer.replace(/\/$/, '')}/v2/accounts/${address}`)
  if (!response.ok) return { label, configured: true, address, funded: false, optedIntoUsdc: false, status: response.status }
  const body = await response.json()
  const asset = body.account?.assets?.find((item: { 'asset-id': number | string }) => Number(item['asset-id']) === assetId)
  return { label, configured: true, address, funded: true, optedIntoUsdc: Boolean(asset), usdcAmount: asset?.amount ?? 0, frozen: asset?.['is-frozen'] ?? false }
}

const checks = await Promise.all([checkAddress('x402 receiver', receiver), checkAddress('payer wallet', payer)])
process.stdout.write(`${JSON.stringify({ network: 'Algorand TestNet', assetId, checks }, null, 2)}\n`)
if (!checks.every((check) => check.funded && check.optedIntoUsdc)) process.exitCode = 1
