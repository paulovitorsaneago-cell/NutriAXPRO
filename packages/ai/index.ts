// ============================================================================
// NutriAX Pro — AI Package Barrel Export
// ============================================================================

export { SYSTEM_PROMPT, SYSTEM_PROMPT_VERSION, buildUserPrompt } from './prompts/system-prompt';
export {
  generatePrescription,
  buildAuditLogPayload,
  type AiProviderConfig,
  type GenerationResult,
} from './handlers/generate-prescription';
