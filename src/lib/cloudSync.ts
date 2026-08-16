import { Trainee, DietPlan, CoachProfile } from '../types/nutrition';

const PRIMARY_SYNC_ENDPOINT = '/api/sync';
const FALLBACK_SYNC_ENDPOINT = 'https://limpy-fit.vercel.app/api/sync';

export interface CloudPayload {
  trainees: Trainee[];
  plans: DietPlan[];
  deletedTraineeIds?: string[];
  coachProfile?: CoachProfile;
  lastUpdated: number;
}

let lastSyncTimestamp = 0;
let isPushing = false;

const getEndpoints = () => {
  const currentHost = typeof window !== 'undefined' ? window.location.origin : '';
  const endpoints = [PRIMARY_SYNC_ENDPOINT];
  if (currentHost && !currentHost.includes('limpy-fit.vercel.app')) {
    endpoints.push(FALLBACK_SYNC_ENDPOINT);
  }
  return endpoints;
};

/**
 * Fetches the latest global cloud data across all devices
 */
export async function fetchCloudData(): Promise<CloudPayload | null> {
  const endpoints = getEndpoints();
  for (const endpoint of endpoints) {
    try {
      const res = await fetch(endpoint, { 
        cache: 'no-store',
        headers: { 'Accept': 'application/json' }
      });
      if (!res.ok) continue;
      const json = await res.json();
      const payload = json.data || json;
      if (payload && (payload.trainees || payload.lastUpdated !== undefined)) {
        return payload as CloudPayload;
      }
    } catch (err) {
      // try next endpoint fallback
    }
  }
  return null;
}

/**
 * Pushes updated trainees, plans, deleted IDs, or profile to global cloud store
 */
export async function pushCloudData(
  traineesList: Trainee[],
  plansList: DietPlan[],
  profile?: CoachProfile,
  deletedTraineeIds: string[] = []
): Promise<boolean> {
  if (isPushing) return false;
  isPushing = true;
  try {
    const timestamp = Date.now();
    lastSyncTimestamp = timestamp;

    const payload: CloudPayload = {
      trainees: traineesList,
      plans: plansList,
      deletedTraineeIds,
      coachProfile: profile,
      lastUpdated: timestamp
    };

    const body = JSON.stringify({
      name: 'LimpyFitDataStore',
      data: payload
    });

    const endpoints = getEndpoints();
    let success = false;

    for (const endpoint of endpoints) {
      try {
        const res = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body
        });
        if (res.ok) {
          success = true;
          break;
        }
      } catch (err) {
        // try next endpoint fallback
      }
    }
    return success;
  } finally {
    isPushing = false;
  }
}

/**
 * Initializes automatic real-time cloud polling and window focus sync listeners
 */
export function initCloudAutoSync(
  onDataReceived: (data: {
    trainees?: Trainee[];
    dietPlans?: DietPlan[];
    deletedTraineeIds?: string[];
    coachProfile?: CoachProfile;
    lastUpdated?: number;
  }) => void
): () => void {
  const checkCloudUpdates = async () => {
    const cloud = await fetchCloudData();
    if (cloud && cloud.lastUpdated !== undefined && cloud.lastUpdated > lastSyncTimestamp) {
      lastSyncTimestamp = cloud.lastUpdated;
      onDataReceived({
        trainees: cloud.trainees,
        dietPlans: cloud.plans,
        deletedTraineeIds: cloud.deletedTraineeIds,
        coachProfile: cloud.coachProfile,
        lastUpdated: cloud.lastUpdated
      });
    }
  };

  // Perform immediate initial check
  checkCloudUpdates();

  // Poll every 2 seconds for fast real-time auto sync across mobile & desktop
  const intervalId = setInterval(checkCloudUpdates, 2000);

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
