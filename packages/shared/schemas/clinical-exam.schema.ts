// ============================================================================
// NutriAX Pro — Clinical Exams Zod Schema
// Covers: Lab results entry with nutritionist interpretation
// ============================================================================

import { z } from 'zod';
import { EXAM_STATUSES, EXAM_CATEGORIES } from '../constants';

// ---------------------------------------------------------------------------
// Clinical Exam Entry
// ---------------------------------------------------------------------------
export const ClinicalExamSchema = z.object({
  patient_id: z.string().uuid(),
  entered_by: z.string().uuid().nullable().optional(),

  exam_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Formato: YYYY-MM-DD'),
  exam_name: z.string().min(1, 'Nome do exame é obrigatório').max(200),
  category: z.enum(EXAM_CATEGORIES).default('outros'),

  // Resultado
  result_value: z.number().nullable().optional(),
  result_text: z.string().max(500).nullable().optional(),
  unit: z.string().max(50).nullable().optional(),

  // Referência
  ref_min: z.number().nullable().optional(),
  ref_max: z.number().nullable().optional(),
  ref_text: z.string().max(200).nullable().optional(),

  // Classificação e Conduta (nutricionista)
  status_flag: z.enum(EXAM_STATUSES).default('normal'),
  priority: z.number().int().min(0).max(5).default(0),
  nutritionist_interpretation: z.string().max(2000).nullable().optional(),
  nutritional_conduct: z.string().max(2000).nullable().optional(),
  dietary_guidelines: z.array(z.string()).nullable().optional(),
}).refine(
  (data) => data.result_value !== null || data.result_text !== null,
  { message: 'Informe o valor numérico ou textual do resultado', path: ['result_value'] }
);

export type ClinicalExamInput = z.infer<typeof ClinicalExamSchema>;

// ---------------------------------------------------------------------------
// Batch Exam Entry (multiple exams at once from a lab report)
// ---------------------------------------------------------------------------
export const BatchExamEntrySchema = z.object({
  patient_id: z.string().uuid(),
  exam_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  exams: z.array(ClinicalExamSchema.omit({ patient_id: true, exam_date: true }))
    .min(1, 'Insira pelo menos 1 exame'),
});

export type BatchExamEntryInput = z.infer<typeof BatchExamEntrySchema>;

// ---------------------------------------------------------------------------
// Exam Upload
// ---------------------------------------------------------------------------
export const ExamUploadSchema = z.object({
  patient_id: z.string().uuid(),
  uploaded_by: z.string().uuid(),
  file_name: z.string().min(1).max(500),
  file_path: z.string().min(1),
  file_size_kb: z.number().int().positive().nullable().optional(),
  mime_type: z.string().default('application/pdf'),
  description: z.string().max(500).nullable().optional(),
  exam_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
});

export type ExamUploadInput = z.infer<typeof ExamUploadSchema>;
