-- ============================================================================
-- NutriAX Pro — Row Level Security Policies
-- Version: 002
-- Description: Multi-tenant RBAC policies for nutritionist/patient isolation.
--              Uses the performance-optimized (SELECT auth.uid()) pattern.
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTIONS for RLS
-- ============================================================================

-- Returns the role of the current authenticated user
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.users WHERE id = (SELECT auth.uid());
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Returns TRUE if the current user is a nutritionist
CREATE OR REPLACE FUNCTION public.is_nutritionist()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = (SELECT auth.uid()) AND role = 'nutritionist'
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Returns TRUE if the current user is the nutritionist of the given patient
CREATE OR REPLACE FUNCTION public.is_nutritionist_of(p_patient_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.patients
    WHERE id = p_patient_id AND nutritionist_id = (SELECT auth.uid())
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Returns the patient_id for the current authenticated user (if patient)
CREATE OR REPLACE FUNCTION public.get_my_patient_id()
RETURNS UUID AS $$
  SELECT id FROM public.patients WHERE user_id = (SELECT auth.uid());
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Returns TRUE if the current user owns or is the nutritionist of a patient record
CREATE OR REPLACE FUNCTION public.can_access_patient(p_patient_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.patients
    WHERE id = p_patient_id
      AND (user_id = (SELECT auth.uid()) OR nutritionist_id = (SELECT auth.uid()))
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- ENABLE RLS ON ALL TABLES
-- ============================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_anamnesis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_anamnesis_sports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_anamnesis_routine ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_database ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_serving_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anthropometrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exam_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutritional_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescription_substitutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_log_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_evolution ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_generation_logs ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 1. USERS
-- ============================================================================

-- Users can read their own profile
CREATE POLICY "users_select_own"
  ON public.users FOR SELECT
  USING (id = (SELECT auth.uid()));

-- Nutritionists can see profiles of their patients
CREATE POLICY "users_select_nutritionist_patients"
  ON public.users FOR SELECT
  USING (
    (SELECT public.is_nutritionist())
    AND id IN (
      SELECT user_id FROM public.patients
      WHERE nutritionist_id = (SELECT auth.uid())
    )
  );

-- Users can update their own profile
CREATE POLICY "users_update_own"
  ON public.users FOR UPDATE
  USING (id = (SELECT auth.uid()))
  WITH CHECK (id = (SELECT auth.uid()));

-- ============================================================================
-- 2. PATIENTS
-- ============================================================================

-- Patient can see their own record
CREATE POLICY "patients_select_own"
  ON public.patients FOR SELECT
  USING (user_id = (SELECT auth.uid()));

-- Nutritionist can see their assigned patients
CREATE POLICY "patients_select_by_nutritionist"
  ON public.patients FOR SELECT
  USING (nutritionist_id = (SELECT auth.uid()));

-- Only nutritionists can create patient records
CREATE POLICY "patients_insert_nutritionist"
  ON public.patients FOR INSERT
  WITH CHECK (
    nutritionist_id = (SELECT auth.uid())
    AND (SELECT public.is_nutritionist())
  );

-- Nutritionist can update their own patients
CREATE POLICY "patients_update_nutritionist"
  ON public.patients FOR UPDATE
  USING (nutritionist_id = (SELECT auth.uid()))
  WITH CHECK (nutritionist_id = (SELECT auth.uid()));

-- ============================================================================
-- 3. PATIENT_ANAMNESIS (Clínica)
-- ============================================================================

-- Patient can read and write their own anamnesis
CREATE POLICY "anamnesis_select_patient"
  ON public.patient_anamnesis FOR SELECT
  USING (patient_id = (SELECT public.get_my_patient_id()));

CREATE POLICY "anamnesis_insert_patient"
  ON public.patient_anamnesis FOR INSERT
  WITH CHECK (
    patient_id = (SELECT public.get_my_patient_id())
    AND filled_by_patient = TRUE
  );

CREATE POLICY "anamnesis_update_patient"
  ON public.patient_anamnesis FOR UPDATE
  USING (patient_id = (SELECT public.get_my_patient_id()))
  WITH CHECK (patient_id = (SELECT public.get_my_patient_id()));

-- Nutritionist can read/write anamnesis of their patients
CREATE POLICY "anamnesis_select_nutritionist"
  ON public.patient_anamnesis FOR SELECT
  USING ((SELECT public.is_nutritionist_of(patient_id)));

CREATE POLICY "anamnesis_insert_nutritionist"
  ON public.patient_anamnesis FOR INSERT
  WITH CHECK ((SELECT public.is_nutritionist_of(patient_id)));

CREATE POLICY "anamnesis_update_nutritionist"
  ON public.patient_anamnesis FOR UPDATE
  USING ((SELECT public.is_nutritionist_of(patient_id)))
  WITH CHECK ((SELECT public.is_nutritionist_of(patient_id)));

-- ============================================================================
-- 4. PATIENT_ANAMNESIS_SPORTS
-- ============================================================================

CREATE POLICY "anamnesis_sports_select_patient"
  ON public.patient_anamnesis_sports FOR SELECT
  USING (patient_id = (SELECT public.get_my_patient_id()));

CREATE POLICY "anamnesis_sports_insert_patient"
  ON public.patient_anamnesis_sports FOR INSERT
  WITH CHECK (patient_id = (SELECT public.get_my_patient_id()));

CREATE POLICY "anamnesis_sports_update_patient"
  ON public.patient_anamnesis_sports FOR UPDATE
  USING (patient_id = (SELECT public.get_my_patient_id()))
  WITH CHECK (patient_id = (SELECT public.get_my_patient_id()));

CREATE POLICY "anamnesis_sports_select_nutritionist"
  ON public.patient_anamnesis_sports FOR SELECT
  USING ((SELECT public.is_nutritionist_of(patient_id)));

CREATE POLICY "anamnesis_sports_insert_nutritionist"
  ON public.patient_anamnesis_sports FOR INSERT
  WITH CHECK ((SELECT public.is_nutritionist_of(patient_id)));

CREATE POLICY "anamnesis_sports_update_nutritionist"
  ON public.patient_anamnesis_sports FOR UPDATE
  USING ((SELECT public.is_nutritionist_of(patient_id)))
  WITH CHECK ((SELECT public.is_nutritionist_of(patient_id)));

-- ============================================================================
-- 5. PATIENT_ANAMNESIS_ROUTINE
-- ============================================================================

CREATE POLICY "anamnesis_routine_select_patient"
  ON public.patient_anamnesis_routine FOR SELECT
  USING (patient_id = (SELECT public.get_my_patient_id()));

CREATE POLICY "anamnesis_routine_insert_patient"
  ON public.patient_anamnesis_routine FOR INSERT
  WITH CHECK (patient_id = (SELECT public.get_my_patient_id()));

CREATE POLICY "anamnesis_routine_update_patient"
  ON public.patient_anamnesis_routine FOR UPDATE
  USING (patient_id = (SELECT public.get_my_patient_id()))
  WITH CHECK (patient_id = (SELECT public.get_my_patient_id()));

CREATE POLICY "anamnesis_routine_select_nutritionist"
  ON public.patient_anamnesis_routine FOR SELECT
  USING ((SELECT public.is_nutritionist_of(patient_id)));

CREATE POLICY "anamnesis_routine_insert_nutritionist"
  ON public.patient_anamnesis_routine FOR INSERT
  WITH CHECK ((SELECT public.is_nutritionist_of(patient_id)));

CREATE POLICY "anamnesis_routine_update_nutritionist"
  ON public.patient_anamnesis_routine FOR UPDATE
  USING ((SELECT public.is_nutritionist_of(patient_id)))
  WITH CHECK ((SELECT public.is_nutritionist_of(patient_id)));

-- ============================================================================
-- 6. FOOD_DATABASE (Public read for all authenticated users)
-- ============================================================================

CREATE POLICY "food_db_select_authenticated"
  ON public.food_database FOR SELECT
  USING (auth.role() = 'authenticated');

-- Only nutritionists can add custom foods
CREATE POLICY "food_db_insert_nutritionist"
  ON public.food_database FOR INSERT
  WITH CHECK ((SELECT public.is_nutritionist()) AND source = 'custom');

CREATE POLICY "food_db_update_nutritionist"
  ON public.food_database FOR UPDATE
  USING ((SELECT public.is_nutritionist()) AND source = 'custom')
  WITH CHECK ((SELECT public.is_nutritionist()));

-- ============================================================================
-- 7. FOOD_SERVING_UNITS (Public read, nutritionist write)
-- ============================================================================

CREATE POLICY "serving_units_select_authenticated"
  ON public.food_serving_units FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "serving_units_insert_nutritionist"
  ON public.food_serving_units FOR INSERT
  WITH CHECK ((SELECT public.is_nutritionist()));

CREATE POLICY "serving_units_update_nutritionist"
  ON public.food_serving_units FOR UPDATE
  USING ((SELECT public.is_nutritionist()))
  WITH CHECK ((SELECT public.is_nutritionist()));

-- ============================================================================
-- 8. ANTHROPOMETRICS
-- ============================================================================

-- Patient can view their own assessments
CREATE POLICY "anthropometrics_select_patient"
  ON public.anthropometrics FOR SELECT
  USING (patient_id = (SELECT public.get_my_patient_id()));

-- Nutritionist can view, insert, update for their patients
CREATE POLICY "anthropometrics_select_nutritionist"
  ON public.anthropometrics FOR SELECT
  USING ((SELECT public.is_nutritionist_of(patient_id)));

CREATE POLICY "anthropometrics_insert_nutritionist"
  ON public.anthropometrics FOR INSERT
  WITH CHECK ((SELECT public.is_nutritionist_of(patient_id)));

CREATE POLICY "anthropometrics_update_nutritionist"
  ON public.anthropometrics FOR UPDATE
  USING ((SELECT public.is_nutritionist_of(patient_id)))
  WITH CHECK ((SELECT public.is_nutritionist_of(patient_id)));

-- ============================================================================
-- 9. CLINICAL_EXAMS
-- ============================================================================

-- Patient can read their own exams
CREATE POLICY "exams_select_patient"
  ON public.clinical_exams FOR SELECT
  USING (patient_id = (SELECT public.get_my_patient_id()));

-- Nutritionist full CRUD on their patients' exams
CREATE POLICY "exams_select_nutritionist"
  ON public.clinical_exams FOR SELECT
  USING ((SELECT public.is_nutritionist_of(patient_id)));

CREATE POLICY "exams_insert_nutritionist"
  ON public.clinical_exams FOR INSERT
  WITH CHECK ((SELECT public.is_nutritionist_of(patient_id)));

CREATE POLICY "exams_update_nutritionist"
  ON public.clinical_exams FOR UPDATE
  USING ((SELECT public.is_nutritionist_of(patient_id)))
  WITH CHECK ((SELECT public.is_nutritionist_of(patient_id)));

CREATE POLICY "exams_delete_nutritionist"
  ON public.clinical_exams FOR DELETE
  USING ((SELECT public.is_nutritionist_of(patient_id)));

-- ============================================================================
-- 10. EXAM_UPLOADS
-- ============================================================================

-- Patient can upload and view their own exam files
CREATE POLICY "exam_uploads_select_patient"
  ON public.exam_uploads FOR SELECT
  USING (patient_id = (SELECT public.get_my_patient_id()));

CREATE POLICY "exam_uploads_insert_patient"
  ON public.exam_uploads FOR INSERT
  WITH CHECK (
    patient_id = (SELECT public.get_my_patient_id())
    AND uploaded_by = (SELECT auth.uid())
  );

-- Nutritionist can view uploads from their patients
CREATE POLICY "exam_uploads_select_nutritionist"
  ON public.exam_uploads FOR SELECT
  USING ((SELECT public.is_nutritionist_of(patient_id)));

CREATE POLICY "exam_uploads_insert_nutritionist"
  ON public.exam_uploads FOR INSERT
  WITH CHECK ((SELECT public.is_nutritionist_of(patient_id)));

-- ============================================================================
-- 11. NUTRITIONAL_PLANS
-- ============================================================================

-- Patient can view their active plan
CREATE POLICY "plans_select_patient"
  ON public.nutritional_plans FOR SELECT
  USING (patient_id = (SELECT public.get_my_patient_id()));

-- Nutritionist full CRUD on their patients' plans
CREATE POLICY "plans_select_nutritionist"
  ON public.nutritional_plans FOR SELECT
  USING (nutritionist_id = (SELECT auth.uid()));

CREATE POLICY "plans_insert_nutritionist"
  ON public.nutritional_plans FOR INSERT
  WITH CHECK (
    nutritionist_id = (SELECT auth.uid())
    AND (SELECT public.is_nutritionist())
  );

CREATE POLICY "plans_update_nutritionist"
  ON public.nutritional_plans FOR UPDATE
  USING (nutritionist_id = (SELECT auth.uid()))
  WITH CHECK (nutritionist_id = (SELECT auth.uid()));

CREATE POLICY "plans_delete_nutritionist"
  ON public.nutritional_plans FOR DELETE
  USING (nutritionist_id = (SELECT auth.uid()));

-- ============================================================================
-- 12. PRESCRIPTIONS (accessed via plan_id -> nutritional_plans)
-- ============================================================================

-- Patient can view prescriptions of their plans
CREATE POLICY "prescriptions_select_patient"
  ON public.prescriptions FOR SELECT
  USING (
    plan_id IN (
      SELECT id FROM public.nutritional_plans
      WHERE patient_id = (SELECT public.get_my_patient_id())
    )
  );

-- Nutritionist CRUD on their plans' prescriptions
CREATE POLICY "prescriptions_select_nutritionist"
  ON public.prescriptions FOR SELECT
  USING (
    plan_id IN (
      SELECT id FROM public.nutritional_plans
      WHERE nutritionist_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "prescriptions_insert_nutritionist"
  ON public.prescriptions FOR INSERT
  WITH CHECK (
    plan_id IN (
      SELECT id FROM public.nutritional_plans
      WHERE nutritionist_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "prescriptions_update_nutritionist"
  ON public.prescriptions FOR UPDATE
  USING (
    plan_id IN (
      SELECT id FROM public.nutritional_plans
      WHERE nutritionist_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    plan_id IN (
      SELECT id FROM public.nutritional_plans
      WHERE nutritionist_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "prescriptions_delete_nutritionist"
  ON public.prescriptions FOR DELETE
  USING (
    plan_id IN (
      SELECT id FROM public.nutritional_plans
      WHERE nutritionist_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- 13. PRESCRIPTION_ITEMS (accessed via prescription -> plan -> nutritional_plans)
-- ============================================================================

-- Patient can view items of their prescriptions
CREATE POLICY "prescription_items_select_patient"
  ON public.prescription_items FOR SELECT
  USING (
    prescription_id IN (
      SELECT p.id FROM public.prescriptions p
      JOIN public.nutritional_plans np ON p.plan_id = np.id
      WHERE np.patient_id = (SELECT public.get_my_patient_id())
    )
  );

-- Nutritionist CRUD on items
CREATE POLICY "prescription_items_select_nutritionist"
  ON public.prescription_items FOR SELECT
  USING (
    prescription_id IN (
      SELECT p.id FROM public.prescriptions p
      JOIN public.nutritional_plans np ON p.plan_id = np.id
      WHERE np.nutritionist_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "prescription_items_insert_nutritionist"
  ON public.prescription_items FOR INSERT
  WITH CHECK (
    prescription_id IN (
      SELECT p.id FROM public.prescriptions p
      JOIN public.nutritional_plans np ON p.plan_id = np.id
      WHERE np.nutritionist_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "prescription_items_update_nutritionist"
  ON public.prescription_items FOR UPDATE
  USING (
    prescription_id IN (
      SELECT p.id FROM public.prescriptions p
      JOIN public.nutritional_plans np ON p.plan_id = np.id
      WHERE np.nutritionist_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    prescription_id IN (
      SELECT p.id FROM public.prescriptions p
      JOIN public.nutritional_plans np ON p.plan_id = np.id
      WHERE np.nutritionist_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "prescription_items_delete_nutritionist"
  ON public.prescription_items FOR DELETE
  USING (
    prescription_id IN (
      SELECT p.id FROM public.prescriptions p
      JOIN public.nutritional_plans np ON p.plan_id = np.id
      WHERE np.nutritionist_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- 14. PRESCRIPTION_SUBSTITUTIONS (accessed via item -> prescription -> plan)
-- ============================================================================

-- Patient can view substitutions for their items
CREATE POLICY "substitutions_select_patient"
  ON public.prescription_substitutions FOR SELECT
  USING (
    original_item_id IN (
      SELECT pi.id FROM public.prescription_items pi
      JOIN public.prescriptions p ON pi.prescription_id = p.id
      JOIN public.nutritional_plans np ON p.plan_id = np.id
      WHERE np.patient_id = (SELECT public.get_my_patient_id())
    )
  );

-- Nutritionist CRUD
CREATE POLICY "substitutions_select_nutritionist"
  ON public.prescription_substitutions FOR SELECT
  USING (
    original_item_id IN (
      SELECT pi.id FROM public.prescription_items pi
      JOIN public.prescriptions p ON pi.prescription_id = p.id
      JOIN public.nutritional_plans np ON p.plan_id = np.id
      WHERE np.nutritionist_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "substitutions_insert_nutritionist"
  ON public.prescription_substitutions FOR INSERT
  WITH CHECK (
    original_item_id IN (
      SELECT pi.id FROM public.prescription_items pi
      JOIN public.prescriptions p ON pi.prescription_id = p.id
      JOIN public.nutritional_plans np ON p.plan_id = np.id
      WHERE np.nutritionist_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "substitutions_delete_nutritionist"
  ON public.prescription_substitutions FOR DELETE
  USING (
    original_item_id IN (
      SELECT pi.id FROM public.prescription_items pi
      JOIN public.prescriptions p ON pi.prescription_id = p.id
      JOIN public.nutritional_plans np ON p.plan_id = np.id
      WHERE np.nutritionist_id = (SELECT auth.uid())
    )
  );

-- ============================================================================
-- 15. FOOD_LOGS
-- ============================================================================

-- Patient can CRUD their own food logs
CREATE POLICY "food_logs_select_patient"
  ON public.food_logs FOR SELECT
  USING (patient_id = (SELECT public.get_my_patient_id()));

CREATE POLICY "food_logs_insert_patient"
  ON public.food_logs FOR INSERT
  WITH CHECK (patient_id = (SELECT public.get_my_patient_id()));

CREATE POLICY "food_logs_update_patient"
  ON public.food_logs FOR UPDATE
  USING (patient_id = (SELECT public.get_my_patient_id()))
  WITH CHECK (patient_id = (SELECT public.get_my_patient_id()));

CREATE POLICY "food_logs_delete_patient"
  ON public.food_logs FOR DELETE
  USING (patient_id = (SELECT public.get_my_patient_id()));

-- Nutritionist can read food logs of their patients
CREATE POLICY "food_logs_select_nutritionist"
  ON public.food_logs FOR SELECT
  USING ((SELECT public.is_nutritionist_of(patient_id)));

-- ============================================================================
-- 16. FOOD_LOG_ITEMS
-- ============================================================================

-- Patient can CRUD their own log items
CREATE POLICY "food_log_items_select_patient"
  ON public.food_log_items FOR SELECT
  USING (
    food_log_id IN (
      SELECT id FROM public.food_logs
      WHERE patient_id = (SELECT public.get_my_patient_id())
    )
  );

CREATE POLICY "food_log_items_insert_patient"
  ON public.food_log_items FOR INSERT
  WITH CHECK (
    food_log_id IN (
      SELECT id FROM public.food_logs
      WHERE patient_id = (SELECT public.get_my_patient_id())
    )
  );

CREATE POLICY "food_log_items_update_patient"
  ON public.food_log_items FOR UPDATE
  USING (
    food_log_id IN (
      SELECT id FROM public.food_logs
      WHERE patient_id = (SELECT public.get_my_patient_id())
    )
  )
  WITH CHECK (
    food_log_id IN (
      SELECT id FROM public.food_logs
      WHERE patient_id = (SELECT public.get_my_patient_id())
    )
  );

-- Nutritionist can read log items of their patients
CREATE POLICY "food_log_items_select_nutritionist"
  ON public.food_log_items FOR SELECT
  USING (
    food_log_id IN (
      SELECT fl.id FROM public.food_logs fl
      WHERE (SELECT public.is_nutritionist_of(fl.patient_id))
    )
  );

-- ============================================================================
-- 17. BODY_EVOLUTION
-- ============================================================================

-- Patient can view their own evolution
CREATE POLICY "body_evolution_select_patient"
  ON public.body_evolution FOR SELECT
  USING (patient_id = (SELECT public.get_my_patient_id()));

-- Nutritionist can view evolution of their patients
CREATE POLICY "body_evolution_select_nutritionist"
  ON public.body_evolution FOR SELECT
  USING ((SELECT public.is_nutritionist_of(patient_id)));

-- ============================================================================
-- 18. AI_GENERATION_LOGS (Nutritionist only)
-- ============================================================================

-- Only nutritionists can view their own AI logs
CREATE POLICY "ai_logs_select_nutritionist"
  ON public.ai_generation_logs FOR SELECT
  USING (nutritionist_id = (SELECT auth.uid()));

CREATE POLICY "ai_logs_insert_nutritionist"
  ON public.ai_generation_logs FOR INSERT
  WITH CHECK (
    nutritionist_id = (SELECT auth.uid())
    AND (SELECT public.is_nutritionist())
  );

CREATE POLICY "ai_logs_update_nutritionist"
  ON public.ai_generation_logs FOR UPDATE
  USING (nutritionist_id = (SELECT auth.uid()))
  WITH CHECK (nutritionist_id = (SELECT auth.uid()));

-- ============================================================================
-- SUPABASE STORAGE POLICIES (for exam uploads bucket)
-- ============================================================================
-- Note: These must be applied via the Supabase dashboard or using the
-- storage API. The bucket 'exam-uploads' should be created with:
--   INSERT INTO storage.buckets (id, name, public) VALUES ('exam-uploads', 'exam-uploads', false);
--
-- Then apply policies:
-- SELECT: Patient can download their own files; Nutritionist can download their patients' files
-- INSERT: Patient can upload to their own folder; Nutritionist can upload to their patients' folders
-- Path pattern: {patient_id}/{filename}

-- ============================================================================
-- End of Migration 002
-- ============================================================================
