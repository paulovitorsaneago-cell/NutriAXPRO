// ============================================================================
// NutriAX Pro — AI Prescription Generation Handler
// Orchestrates the LLM call with context assembly, validation, and audit
// ============================================================================

import { SYSTEM_PROMPT, SYSTEM_PROMPT_VERSION, buildUserPrompt } from '../prompts/system-prompt';
import type {
  AiGeneratePrescriptionRequest,
  AiGeneratedPrescription,
} from '@nutriaxpro/shared';
import { AiGeneratedPrescriptionSchema } from '@nutriaxpro/shared';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AiProviderConfig {
  provider: 'gemini' | 'openai' | 'anthropic';
  apiKey: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GenerationResult {
  success: boolean;
  prescription: AiGeneratedPrescription | null;
  rawResponse: string | null;
  error: string | null;
  latencyMs: number;
  tokensUsed: number | null;
  model: string;
}

// ---------------------------------------------------------------------------
// Provider-specific call implementations
// ---------------------------------------------------------------------------

async function callGemini(
  systemPrompt: string,
  userPrompt: string,
  config: AiProviderConfig
): Promise<{ text: string; tokensUsed: number | null }> {
  const model = config.model ?? 'gemini-2.0-flash';
  const { GoogleGenerativeAI } = await import('@google/generative-ai');

  const genAI = new GoogleGenerativeAI(config.apiKey);
  const geminiModel = genAI.getGenerativeModel({
    model,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: config.temperature ?? 0.3,
      maxOutputTokens: config.maxTokens ?? 8192,
      responseMimeType: 'application/json',
    },
  });

  const result = await geminiModel.generateContent(userPrompt);
  const response = result.response;
  const text = response.text();
  const tokensUsed = response.usageMetadata?.totalTokenCount ?? null;

  return { text, tokensUsed };
}

async function callOpenAI(
  systemPrompt: string,
  userPrompt: string,
  config: AiProviderConfig
): Promise<{ text: string; tokensUsed: number | null }> {
  const model = config.model ?? 'gpt-4o';

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${config.apiKey}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      temperature: config.temperature ?? 0.3,
      max_tokens: config.maxTokens ?? 8192,
      response_format: { type: 'json_object' },
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  return {
    text: data.choices[0].message.content,
    tokensUsed: data.usage?.total_tokens ?? null,
  };
}

async function callAnthropic(
  systemPrompt: string,
  userPrompt: string,
  config: AiProviderConfig
): Promise<{ text: string; tokensUsed: number | null }> {
  const model = config.model ?? 'claude-sonnet-4-20250514';

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': config.apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: config.maxTokens ?? 8192,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      temperature: config.temperature ?? 0.3,
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Anthropic API error: ${response.status} - ${err}`);
  }

  const data = await response.json();
  const textBlock = data.content.find((b: { type: string }) => b.type === 'text');
  return {
    text: textBlock?.text ?? '',
    tokensUsed: (data.usage?.input_tokens ?? 0) + (data.usage?.output_tokens ?? 0) || null,
  };
}

// ---------------------------------------------------------------------------
// Main Handler
// ---------------------------------------------------------------------------

/**
 * Generates an AI-assisted nutrition prescription.
 *
 * @param request - Validated request payload from the nutritionist
 * @param providerConfig - LLM provider configuration (API key, model, etc.)
 * @returns GenerationResult with parsed prescription or error details
 */
export async function generatePrescription(
  request: AiGeneratePrescriptionRequest,
  providerConfig: AiProviderConfig
): Promise<GenerationResult> {
  const startTime = Date.now();
  const model = providerConfig.model ?? getDefaultModel(providerConfig.provider);

  try {
    // 1. Build the user prompt from patient context
    const userPrompt = buildUserPrompt({
      patientContext: request.patient_context,
      caloricTargets: request.caloric_targets,
      additionalInstructions: request.additional_instructions,
      includeSubstitutions: request.include_substitutions,
    });

    // 2. Call the LLM provider
    let llmResult: { text: string; tokensUsed: number | null };

    switch (providerConfig.provider) {
      case 'gemini':
        llmResult = await callGemini(SYSTEM_PROMPT, userPrompt, providerConfig);
        break;
      case 'openai':
        llmResult = await callOpenAI(SYSTEM_PROMPT, userPrompt, providerConfig);
        break;
      case 'anthropic':
        llmResult = await callAnthropic(SYSTEM_PROMPT, userPrompt, providerConfig);
        break;
      default:
        throw new Error(`Unsupported provider: ${providerConfig.provider}`);
    }

    // 3. Parse JSON from response
    const rawJson = extractJson(llmResult.text);
    if (!rawJson) {
      return {
        success: false,
        prescription: null,
        rawResponse: llmResult.text,
        error: 'Resposta do LLM não contém JSON válido',
        latencyMs: Date.now() - startTime,
        tokensUsed: llmResult.tokensUsed,
        model,
      };
    }

    const parsed = JSON.parse(rawJson);

    // 4. Validate with Zod schema
    const validation = AiGeneratedPrescriptionSchema.safeParse(parsed);
    if (!validation.success) {
      return {
        success: false,
        prescription: null,
        rawResponse: llmResult.text,
        error: `Validação do schema falhou: ${validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ')}`,
        latencyMs: Date.now() - startTime,
        tokensUsed: llmResult.tokensUsed,
        model,
      };
    }

    // 5. Verify caloric consistency
    const calorieDeviation = Math.abs(
      validation.data.total_daily_kcal - request.caloric_targets.target_kcal
    ) / request.caloric_targets.target_kcal;

    if (calorieDeviation > 0.10) {
      // Allow up to 10% deviation, but flag it
      console.warn(
        `[NutriAX AI] Calorie deviation of ${(calorieDeviation * 100).toFixed(1)}% ` +
        `(target: ${request.caloric_targets.target_kcal}, generated: ${validation.data.total_daily_kcal})`
      );
    }

    return {
      success: true,
      prescription: validation.data,
      rawResponse: llmResult.text,
      error: null,
      latencyMs: Date.now() - startTime,
      tokensUsed: llmResult.tokensUsed,
      model,
    };

  } catch (error) {
    return {
      success: false,
      prescription: null,
      rawResponse: null,
      error: error instanceof Error ? error.message : 'Erro desconhecido na geração',
      latencyMs: Date.now() - startTime,
      tokensUsed: null,
      model,
    };
  }
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getDefaultModel(provider: string): string {
  switch (provider) {
    case 'gemini': return 'gemini-2.0-flash';
    case 'openai': return 'gpt-4o';
    case 'anthropic': return 'claude-sonnet-4-20250514';
    default: return 'unknown';
  }
}

/**
 * Extracts JSON from an LLM response, handling cases where the model
 * wraps the JSON in markdown code blocks.
 */
function extractJson(text: string): string | null {
  // Try direct parse first
  const trimmed = text.trim();
  if (trimmed.startsWith('{')) return trimmed;

  // Try extracting from markdown code block
  const jsonMatch = trimmed.match(/```(?:json)?\s*\n?([\s\S]*?)\n?```/);
  if (jsonMatch?.[1]) return jsonMatch[1].trim();

  // Try finding the first { ... } block
  const braceMatch = trimmed.match(/\{[\s\S]*\}/);
  if (braceMatch?.[0]) return braceMatch[0];

  return null;
}

/**
 * Builds the audit log payload for storing in ai_generation_logs table.
 */
export function buildAuditLogPayload(
  request: AiGeneratePrescriptionRequest,
  result: GenerationResult,
  nutritionistId: string
) {
  return {
    nutritionist_id: nutritionistId,
    patient_id: request.patient_id,
    plan_id: request.plan_id ?? null,
    request_payload: {
      patient_context: request.patient_context,
      caloric_targets: request.caloric_targets,
      additional_instructions: request.additional_instructions,
    },
    prompt_version: SYSTEM_PROMPT_VERSION,
    model_used: result.model,
    response_payload: result.rawResponse ? { raw: result.rawResponse } : null,
    response_parsed: result.prescription ? (result.prescription as unknown as Record<string, unknown>) : null,
    was_accepted: null, // Will be updated when nutritionist reviews
    modifications_made: null,
    latency_ms: result.latencyMs,
    tokens_used: result.tokensUsed,
    error_message: result.error,
    status: result.success ? 'success' : 'error',
  };
}
