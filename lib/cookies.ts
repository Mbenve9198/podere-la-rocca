import { cookies } from 'next/headers';

/**
 * Imposta un cookie
 */
export function setCookie(name: string, value: string, options: {
  httpOnly?: boolean;
  secure?: boolean;
  maxAge?: number;
  path?: string;
  sameSite?: 'strict' | 'lax' | 'none';
} = {}) {
  const cookieStore = cookies();
  cookieStore.set({
    name,
    value,
    httpOnly: options.httpOnly ?? true,
    secure: options.secure ?? process.env.NODE_ENV === 'production',
    maxAge: options.maxAge ?? 7 * 24 * 60 * 60, // 7 giorni in secondi di default
    path: options.path ?? '/',
    sameSite: options.sameSite ?? 'strict',
  });
}

/**
 * Ottiene il valore di un cookie
 */
export function getCookie(name: string) {
  const cookieStore = cookies();
  const cookie = cookieStore.get(name);
  return cookie?.value;
}

/**
 * Elimina un cookie
 */
export function deleteCookie(name: string) {
  const cookieStore = cookies();
  cookieStore.delete(name);
} 