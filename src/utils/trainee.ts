import type { Trainee } from '../types/nutrition';
import { CREDENTIALS_EMAIL_DOMAIN, DEFAULT_TRAINEE_PASSWORD } from '../constants';

export function getTraineeEmail(t: Trainee): string {
  return t.email || `${t.name.trim().toLowerCase().replace(/\s+/g, '')}@${CREDENTIALS_EMAIL_DOMAIN}`;
}

export function getTraineePassword(t: Trainee): string {
  return t.password || DEFAULT_TRAINEE_PASSWORD;
}

export const normalizePhone = (phone: string) => phone.replace(/[^0-9]/g, '');

export function buildWhatsAppCredentialsUrl(t: Trainee): string {
  const message =
    `مرحباً ${t.name} 🦾، يمكنك الآن دخول تطبيق LIMBY FIT لمشاهدة نظامك الغذائي الأسبوعي ومتابعة التطور! 🍏\n\n` +
    `البريد الإلكتروني: ${getTraineeEmail(t)}\nكلمة المرور: ${getTraineePassword(t)}`;
  return `https://wa.me/${normalizePhone(t.phone || '')}?text=${encodeURIComponent(message)}`;
}

export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

export const todayIso = () => new Date().toISOString().split('T')[0];
