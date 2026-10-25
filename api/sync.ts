import type { IncomingMessage, ServerResponse } from 'http';

const STORE_URL = 'https://api.restful-api.dev/objects/ff8081819ff5b110019ffca18b3114bd';

interface StoreData {
  trainees: unknown[];
  plans: unknown[];
  deletedTraineeIds: string[];
  coachProfile?: unknown;
  lastUpdated: number;
}

type SyncRequest = IncomingMessage & { body?: any };

let inMemoryCache: StoreData | null = null;

function sendJson(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(body));
}

/** Uses the body already parsed by the platform when present, otherwise reads the raw stream. */
async function readJsonBody(req: SyncRequest): Promise<any> {
  if (req.body !== undefined) {
    return typeof req.body === 'string' ? JSON.parse(req.body || '{}') : req.body;
  }
  let raw = '';
  for await (const chunk of req) raw += chunk;
  return JSON.parse(raw || '{}');
}

async function getPersistentStore(): Promise<StoreData> {
  try {
    const res = await fetch(STORE_URL, { headers: { 'Accept': 'application/json' } });
    if (res.ok) {
      const json = await res.json();
      if (json && json.data) {
        inMemoryCache = json.data;
        return json.data;
      }
    }
  } catch (err) {
    console.warn('Failed to fetch persistent store:', err);
  }
  return inMemoryCache || { trainees: [], plans: [], deletedTraineeIds: [], lastUpdated: 0 };
}

async function savePersistentStore(data: StoreData): Promise<boolean> {
  inMemoryCache = data;
  try {
    const res = await fetch(STORE_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'LimpyFitDataStore',
        data
      })
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to save persistent store:', err);
    return false;
  }
}

export default async function handler(req: SyncRequest, res: ServerResponse) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const parsed = await readJsonBody(req);
      const payload = parsed?.data || parsed;
      const currentStore = await getPersistentStore();

      if (payload && (payload.trainees !== undefined || payload.plans !== undefined || payload.lastUpdated)) {
        // Deletions are cumulative so a stale device can never resurrect a deleted trainee.
        const deleted = new Set<string>([...(currentStore.deletedTraineeIds || []), ...(payload.deletedTraineeIds || [])]);
        const updatedStore: StoreData = {
          trainees: ((payload.trainees ?? currentStore.trainees) as { id: string }[]).filter(t => !deleted.has(t.id)),
          plans: ((payload.plans ?? currentStore.plans) as { traineeId: string }[]).filter(p => !deleted.has(p.traineeId)),
          deletedTraineeIds: [...deleted],
          coachProfile: payload.coachProfile || currentStore.coachProfile,
          lastUpdated: payload.lastUpdated || Date.now()
        };
        await savePersistentStore(updatedStore);
        return sendJson(res, 200, { success: true, data: updatedStore });
      }
      return sendJson(res, 200, { success: true, data: currentStore });
    } catch {
      return sendJson(res, 400, { error: 'Invalid JSON payload' });
    }
  }

  sendJson(res, 200, { data: await getPersistentStore() });
}
