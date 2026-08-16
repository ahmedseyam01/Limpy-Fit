import type { IncomingMessage, ServerResponse } from 'http';

const STORE_URL = 'https://api.restful-api.dev/objects/ff8081819ff5b110019ffca18b3114bd';

let inMemoryCache: any = null;

async function getPersistentStore(): Promise<any> {
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

async function savePersistentStore(data: any): Promise<boolean> {
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

export default async function handler(req: IncomingMessage & { body?: any }, res: ServerResponse) {
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
    let bodyData = '';
    req.on('data', chunk => {
      bodyData += chunk;
    });

    req.on('end', async () => {
      try {
        const parsed = JSON.parse(bodyData || '{}');
        const payload = parsed.data || parsed;
        const currentStore = await getPersistentStore();

        if (payload && (payload.trainees !== undefined || payload.plans !== undefined || payload.lastUpdated)) {
          const updatedStore = {
            trainees: payload.trainees !== undefined ? payload.trainees : currentStore.trainees,
            plans: payload.plans !== undefined ? payload.plans : currentStore.plans,
            deletedTraineeIds: Array.from(new Set([...(currentStore.deletedTraineeIds || []), ...(payload.deletedTraineeIds || [])])),
            coachProfile: payload.coachProfile || currentStore.coachProfile,
            lastUpdated: payload.lastUpdated || Date.now()
          };
          await savePersistentStore(updatedStore);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ success: true, data: updatedStore }));
          return;
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, data: currentStore }));
      } catch (err) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  const currentData = await getPersistentStore();
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ data: currentData }));
}
