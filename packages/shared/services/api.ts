/**
 * ==============================================================================
 * NUTRIAX PRO — API SERVICE CLIENT (GOOGLE APPS SCRIPT / DRIVE - NO SUPABASE)
 * ==============================================================================
 */

export interface PatientData {
  patient: {
    id: string;
    name: string;
    sex: string;
    age: number;
    height: number;
    objective: string;
    currentWeight: number;
    targetWeight: number;
    initialWeight: number;
    currentFatPercent: number;
    muscleMass: number;
    fatMass: number;
    bmr: number;
    get: number;
    waterTarget: number;
    streakDays: number;
    [key: string]: any;
  };
  macros: {
    calories: number;
    tdee: number;
    deficit: number;
    proteinGrams: number;
    proteinKcal: number;
    carbsGrams: number;
    carbsKcal: number;
    fatsGrams: number;
    fatsKcal: number;
    fibersGrams: number;
    sodiumMg: number;
  };
  prescribedMeals?: any[];
  meals?: any[];
  exams?: any[];
  evolutionHistory?: any[];
  dailyLogs?: any;
  [key: string]: any;
}

const STORAGE_KEY = 'NutriAx_NativeDB_v2';

export class GoogleAppsScriptService {
  private static getApiUrl(): string {
    if (typeof window !== 'undefined' && (window as any).GOOGLE_APPS_SCRIPT_URL) {
      return (window as any).GOOGLE_APPS_SCRIPT_URL;
    }
    return process.env.NEXT_PUBLIC_GOOGLE_APPS_SCRIPT_URL || '';
  }

  /**
   * Fetch patient data from Google Apps Script Web App API or local cache
   */
  public static async fetchPatientData(patientId: string = 'paulovitor.rsousa3@gmail.com'): Promise<PatientData | null> {
    const apiUrl = this.getApiUrl();

    if (apiUrl) {
      try {
        const response = await fetch(`${apiUrl}?action=get&patientId=${encodeURIComponent(patientId)}`, {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
        });

        if (response.ok) {
          const res = await response.json();
          if (res && res.success && res.data) {
            // Update local storage cache
            if (typeof window !== 'undefined') {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(res.data));
            }
            return res.data;
          }
        }
      } catch (error) {
        console.warn('[NutriAX API] Could not connect to Google Apps Script. Using local storage fallback.', error);
      }
    }

    // Local Storage Fallback
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
      } catch (e) {
        console.error('[NutriAX API] Error parsing local storage data:', e);
      }
    }

    return null;
  }

  /**
   * Save patient data to Google Apps Script Web App API and local cache
   */
  public static async savePatientData(data: PatientData): Promise<boolean> {
    // 1. Save to local storage first (instant responsiveness)
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      } catch (e) {
        console.error('[NutriAX API] Error saving to local storage:', e);
      }
    }

    // 2. Sync asynchronously with Google Apps Script Web App
    const apiUrl = this.getApiUrl();
    if (apiUrl) {
      try {
        await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ action: 'save', data: data }),
        });
        return true;
      } catch (error) {
        console.warn('[NutriAX API] Warning: Remote sync to Google Apps Script failed. Local storage preserved.', error);
      }
    }

    return true;
  }
}
