import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import PatientDetail from './patient-detail';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PatientPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Fetch patient with user profile
  const { data: patient } = await supabase
    .from('patients')
    .select(`*, users!patients_user_id_fkey(full_name, email, phone, avatar_url)`)
    .eq('id', id)
    .single();

  if (!patient) notFound();

  // Fetch anamnesis data
  const { data: anamnesis } = await supabase
    .from('patient_anamnesis')
    .select('*')
    .eq('patient_id', id)
    .single();

  const { data: anamnesisSports } = await supabase
    .from('patient_anamnesis_sports')
    .select('*')
    .eq('patient_id', id)
    .single();

  const { data: anamnesisRoutine } = await supabase
    .from('patient_anamnesis_routine')
    .select('*')
    .eq('patient_id', id)
    .single();

  // Fetch latest anthropometric assessment
  const { data: anthropometrics } = await supabase
    .from('anthropometrics')
    .select('*')
    .eq('patient_id', id)
    .order('assessment_date', { ascending: false })
    .limit(5);

  // Fetch clinical exams
  const { data: exams } = await supabase
    .from('clinical_exams')
    .select('*')
    .eq('patient_id', id)
    .order('exam_date', { ascending: false });

  // Fetch active nutritional plan with prescriptions
  const { data: activePlan } = await supabase
    .from('nutritional_plans')
    .select(`
      *,
      prescriptions(
        *,
        prescription_items(*)
      )
    `)
    .eq('patient_id', id)
    .eq('is_active', true)
    .single();

  // Fetch body evolution
  const { data: evolution } = await supabase
    .from('body_evolution')
    .select('*')
    .eq('patient_id', id)
    .order('assessment_date', { ascending: true });

  // Fetch recent food logs
  const { data: foodLogs } = await supabase
    .from('food_logs')
    .select('*')
    .eq('patient_id', id)
    .order('log_date', { ascending: false })
    .limit(30);

  return (
    <PatientDetail
      patient={patient}
      anamnesis={anamnesis}
      anamnesisSports={anamnesisSports}
      anamnesisRoutine={anamnesisRoutine}
      anthropometrics={anthropometrics ?? []}
      exams={exams ?? []}
      activePlan={activePlan}
      evolution={evolution ?? []}
      foodLogs={foodLogs ?? []}
    />
  );
}
