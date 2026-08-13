import { Trainee, DietPlan, CoachProfile } from '../types/nutrition';

const CLOUD_SYNC_ENDPOINT = 'https://api.restful-api.dev/objects/ff8081819ff5b110019ffca18b3114bd';

export interface CloudPayload {
  trainees: Trainee[];
  plans: DietPlan[];
  coachProfile?: CoachProfile;
  lastUpdated: number;
}

let lastSyncTimestamp = 0;
let isPushing = false;

/**
 * Fetches the latest global cloud data across all devices
 */
export async function fetchCloudData(): Promise<CloudPayload | null> {
  try {
    const res = await fetch(CLOUD_SYNC_ENDPOINT, { 
      cache: 'no-store',
      headers: { 'Accept': 'application/json' }
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json && json.data) {
      return json.data as CloudPayload;
    }
  } catch (err) {
    console.warn('Cloud sync fetch error:', err);
  }
  return null;
}

/**
 * Pushes updated trainees, plans, or profile to the global cloud store
 */
export async function pushCloudData(
  traineesList: Trainee[],
  plansList: DietPlan[],
  profile?: CoachProfile
): Promise<boolean> {
  if (isPushing) return false;
  isPushing = true;
  try {
    const timestamp = Date.now();
    lastSyncTimestamp = timestamp;

    const payload: CloudPayload = {
      trainees: traineesList,
      plans: plansList,
      coachProfile: profile,
      lastUpdated: timestamp
    };

    const res = await fetch(CLOUD_SYNC_ENDPOINT, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'LimpyFitDataStore',
        data: payload
      })
    });
    return res.ok;
  } catch (err) {
    console.warn('Cloud sync push error:', err);
    return false;
  } finally {
    isPushing = false;
  }
}

/**
 * Initializes automatic real-time cloud polling and window focus sync listeners
 */
export function initCloudAutoSync(
  onDataReceived: (data: { trainees?: Trainee[]; dietPlans?: DietPlan[]; coachProfile?: CoachProfile }) => void
): () => void {
  const checkCloudUpdates = async () => {
    const cloud = await fetchCloudData();
    if (cloud && cloud.lastUpdated && cloud.lastUpdated > lastSyncTimestamp) {
      lastSyncTimestamp = cloud.lastUpdated;
      onDataReceived({
        trainees: cloud.trainees,
        dietPlans: cloud.plans,
        coachProfile: cloud.coachProfile
      });
    }
  };

  // Perform immediate initial check
  checkCloudUpdates();

  // Poll every 3 seconds for fast real-time sync across mobile & desktop
  const intervalId = setInterval(checkCloudUpdates, 3000);

  // Sync immediately when user switches tabs or focuses window on phone/laptop
  const handleFocus = () => checkCloudUpdates();
  window.addEventListener('focus', handleFocus);
  window.addEventListener('visibilitychange', handleFocus);

  return () => {
    clearInterval(intervalId);
    window.removeEventListener('focus', handleFocus);
    window.removeEventListener('visibilitychange', handleFocus);
  };
}
