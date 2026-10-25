import type { ServerResponse } from 'http';
import { DEFAULT_TRAINEE_PASSWORD, findTraineeByCredential } from '../shared/sync.js';
import { checkCoachPassword, isCoachEmail, safeEqual, signToken } from './_lib/auth.js';
import { readJsonBody, sendError, sendJson, type ApiRequest } from './_lib/http.js';
import { readStore } from './_lib/store.js';

/** Slows down password guessing a little. */
const FAILED_LOGIN_DELAY_MS = 600;
const fail = async (res: ServerResponse) => {
  await new Promise(r => setTimeout(r, FAILED_LOGIN_DELAY_MS));
  sendJson(res, 401, { error: 'invalid_credentials' });
};

/** POST /api/auth  { credential, password } → { token, role, traineeId? } */
export default async function handler(req: ApiRequest, res: ServerResponse) {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const { credential, password } = await readJsonBody<{ credential?: unknown; password?: unknown }>(req);
    if (typeof credential !== 'string' || typeof password !== 'string' || !credential.trim() || !password) {
      return fail(res);
    }

    if (isCoachEmail(credential)) {
      if (!checkCoachPassword(password)) return fail(res);
      return sendJson(res, 200, { token: signToken({ role: 'admin' }), role: 'admin' });
    }

    const { trainees } = await readStore();
    const trainee = findTraineeByCredential(trainees, credential);
    if (!trainee || !safeEqual(password, trainee.password || DEFAULT_TRAINEE_PASSWORD)) return fail(res);

    return sendJson(res, 200, {
      token: signToken({ role: 'trainee', traineeId: trainee.id }),
      role: 'trainee',
      traineeId: trainee.id
    });
  } catch (err) {
    sendError(res, err);
  }
}
