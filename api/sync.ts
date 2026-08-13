import type { IncomingMessage, ServerResponse } from 'http';

let globalSyncStore: any = {
  trainees: [],
  plans: [],
  coachProfile: null,
  lastUpdated: Date.now()
};

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

    req.on('end', () => {
      try {
        const parsed = JSON.parse(bodyData || '{}');
        const payload = parsed.data || parsed;
        if (payload && (payload.trainees || payload.plans || payload.lastUpdated)) {
          globalSyncStore = {
            ...globalSyncStore,
            ...payload,
            lastUpdated: payload.lastUpdated || Date.now()
          };
        }
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ success: true, data: globalSyncStore }));
      } catch (err) {
        res.statusCode = 400;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ error: 'Invalid JSON payload' }));
      }
    });
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ data: globalSyncStore }));
}
