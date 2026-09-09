import { createHmac, timingSafeEqual } from 'crypto';

const COOKIE_NAME = 'tf_session';
const MAX_AGE_SECONDS = 60 * 60 * 24 * 365; // 1 year

function secret(): string {
  const s = process.env.SESSION_SECRET;
  if (!s) throw new Error('SESSION_SECRET is not set');
  return s;
}

function sign(value: string): string {
  return createHmac('sha256', secret()).update(value).digest('hex');
}

export function createSessionToken(): string {
  const payload = `ok.${Date.now()}`;
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined | null): boolean {
  if (!token) return false;
  const lastDot = token.lastIndexOf('.');
  if (lastDot === -1) return false;
  const payload = token.slice(0, lastDot);
  const providedSig = token.slice(lastDot + 1);
  const expectedSig = sign(payload);
  const a = Buffer.from(providedSig);
  const b = Buffer.from(expectedSig);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function verifyPassword(candidate: string): boolean {
  const expected = process.env.APP_PASSWORD;
  if (!expected) throw new Error('APP_PASSWORD is not set');
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export { COOKIE_NAME, MAX_AGE_SECONDS };
