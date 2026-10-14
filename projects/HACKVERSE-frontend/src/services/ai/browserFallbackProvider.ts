import type { AgentResult, AiExecutionRequest, AiExecutionResult, AiProvider } from './types'

const sleep = (milliseconds: number) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds))
const firstWords = (value: string | undefined, count = 10) => (value ?? '').trim().split(/\s+/).slice(0, count).join(' ')

function resultFor(request: AiExecutionRequest): AiExecutionResult {
  const input = request.input
  const outputs: Record<string, AgentResult> = {
    'resume-analyzer': { 'ATS Score': 82, 'Skills Found': ['Role-specific language detected'], 'Missing Skills': ['Quantified impact statements'], Weaknesses: ['Some achievements need sharper metrics'], Recommendations: ['Mirror the job description keywords.', 'Add measurable outcomes to recent projects.'], 'Overall Rating': 'Good starting match' },
    'research-assistant': { 'Executive Summary': `Structured brief prepared for "${firstWords(input.question)}".`, 'Detailed Analysis': 'Define the decision, separate assumptions from verified facts, and compare alternatives before committing.', 'Key Insights': ['Prioritize primary sources.', 'Name the tradeoffs.', 'Turn findings into next actions.'], References: ['Backend runtime unavailable in fallback mode.'], 'Follow-up Questions': ['What decision will this inform?', 'Who is the audience?'] },
    'interview-coach': { 'Practice Plan': ['Tell me about yourself.', 'Walk through a difficult project.', 'Explain a tradeoff you made.'], 'Coaching Notes': ['Use concise STAR answers.', 'Anchor answers to the target role.'], 'Readiness Score': 78 },
    'code-reviewer': { Complexity: 'Moderate', Security: 'No critical issue detected in fallback review.', 'Code Smells': ['Extract repeated logic.', 'Add failure-path tests.'], Suggestions: ['Keep public boundaries documented.'], 'Overall Score': 80 },
    'business-validator': { 'Market Signal': 'Promising but needs sharper customer evidence.', Risks: ['Unclear acquisition channel', 'Pricing not validated'], Recommendations: ['Interview five target users.', 'Test willingness to pay before building further.'], 'Overall Score': 76 },
  }
  const output = outputs[request.agentId] ?? { Summary: `Browser fallback processed "${firstWords(Object.values(input).join(' '), 12)}".`, Findings: ['Input was accepted and structured.'], Recommendations: ['Connect the x402 backend for paid production execution.'], 'Overall Score': 74 }
  const summary = Object.entries(output).slice(0, 2).map(([label, value]) => `${label}: ${Array.isArray(value) ? value[0] : value}`).join(' · ')
  return { output, summary }
}

export class BrowserFallbackProvider implements AiProvider {
  readonly id = 'python' as const
  async execute(request: AiExecutionRequest): Promise<AiExecutionResult> {
    await sleep(520)
    return resultFor(request)
  }
}
