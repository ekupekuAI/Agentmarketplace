import type { AgentResult, AiExecutionRequest, AiExecutionResult, AiProvider } from './types'

const sleep = (milliseconds: number) => new Promise<void>((resolve) => window.setTimeout(resolve, milliseconds))
const firstWords = (value: string, count = 10) => value.trim().split(/\s+/).slice(0, count).join(' ')

function resultFor(request: AiExecutionRequest): AiExecutionResult {
  const input = request.input
  const outputs: Record<string, AgentResult> = {
    'resume-analyzer': { 'ATS Score': 86, 'Skills Found': ['TypeScript', 'React', 'Stakeholder communication'], 'Missing Skills': ['Metrics ownership', 'Cloud deployment'], Weaknesses: ['Impact statements could be more specific', 'Recent achievements need quantification'], Recommendations: ['Lead with measurable outcomes in each role.', 'Mirror priority terms from the job description.'], 'Overall Rating': 'Strong match' },
    'research-assistant': { 'Executive Summary': `A concise starting point for "${firstWords(input.question)}".`, 'Detailed Analysis': 'The strongest path is to define the decision first, compare credible viewpoints, then identify the evidence that would change the recommendation.', 'Key Insights': ['Separate assumptions from verified facts.', 'Prioritize primary sources for high-impact decisions.', 'Translate findings into clear next actions.'], References: ['Source collection is available when a live research provider is connected.'], 'Follow-up Questions': ['What decision will this research inform?', 'Which audience needs the final brief?'] },
    'prompt-guard': { 'Injection Risk': 'Low', 'Sensitive Data': 'No obvious sensitive data patterns found', 'Jailbreak Detection': 'No direct jailbreak pattern detected', 'Risk Level': 'Low', Recommendations: ['Keep system instructions separate from untrusted user text.', 'Validate any external content before passing it to a model.'] },
    'code-reviewer': { Complexity: 'Moderate — core logic is easy to follow, with a few branches worth extracting.', Security: 'No critical issue detected in this offline review.', 'Code Smells': ['Consider naming repeated conditions.', 'Keep data transformation functions small.'], Suggestions: ['Add focused tests around expected failure paths.', 'Document the public boundary of this module.'], 'Overall Score': 84 },
  }
  const output = outputs[request.agentId] ?? { Summary: `Local agent completed a review of "${firstWords(Object.values(input).join(' '), 12)}".`, Findings: ['Input was accepted and processed by the local execution adapter.', 'Connect a live provider later for domain-specific reasoning.'], Recommendations: ['Keep the prompt focused.', 'Add examples or constraints for sharper output.'], 'Overall Score': 78 }
  const summary = Object.entries(output).slice(0, 2).map(([label, value]) => `${label}: ${Array.isArray(value) ? value[0] : value}`).join(' · ')
  return { output, summary }
}

/** Deterministic local provider used until a secure server-side provider adapter is configured. */
export class DemoAiProvider implements AiProvider {
  readonly id = 'demo' as const
  async execute(request: AiExecutionRequest): Promise<AiExecutionResult> { await sleep(520); return resultFor(request) }
}
