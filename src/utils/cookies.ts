import { parse, serialize } from 'cookie';

const COOKIE_OPTIONS = {
  path: '/',
  maxAge: 30 * 24 * 60 * 60, // 30 days
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production', // Set to true in production
  sameSite: 'lax',
};

export const setCookie = (name: string, value: string) => {
  document.cookie = serialize(name, value, COOKIE_OPTIONS);
};

export const getCookie = (name: string) => {
  const cookies = parse(document.cookie);
  return cookies[name] || null;
};

export const deleteCookie = (name: string) => {
  document.cookie = serialize(name, '', {
    ...COOKIE_OPTIONS,
    maxAge: -1,
  });
};