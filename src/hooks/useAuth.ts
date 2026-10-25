import { useCallback, useState } from 'react';
import type { AuthRole } from '../types/nutrition';
import { STORAGE_KEYS } from '../constants';
import { readString, removeKey, writeString } from '../lib/storage';

function readRole(): AuthRole {
  const saved = readString(STORAGE_KEYS.authRole);
  return saved === 'admin' || saved === 'trainee' ? saved : null;
}

export function useAuth() {
  const [role, setRole] = useState<AuthRole>(readRole);
  const [activeTraineeId, setActiveTraineeId] = useState(() => readString(STORAGE_KEYS.activeTraineeId) || '');

  const loginAdmin = useCallback(() => {
    setRole('admin');
    writeString(STORAGE_KEYS.authRole, 'admin');
  }, []);

  const loginTrainee = useCallback((traineeId: string) => {
    setRole('trainee');
    setActiveTraineeId(traineeId);
    writeString(STORAGE_KEYS.authRole, 'trainee');
    writeString(STORAGE_KEYS.activeTraineeId, traineeId);
  }, []);

  const logout = useCallback(() => {
    setRole(null);
    setActiveTraineeId('');
    removeKey(STORAGE_KEYS.authRole);
    removeKey(STORAGE_KEYS.activeTraineeId);
  }, []);

  return { role, activeTraineeId, loginAdmin, loginTrainee, logout };
}
