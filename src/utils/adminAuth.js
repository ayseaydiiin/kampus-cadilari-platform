import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { getAdminUser, isUserAdmin } from './db.js';

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret && String(secret).trim().length >= 32) {
    return String(secret);
  }

  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set to at least 32 characters in production');
  }

  if (!globalThis.__KAMPUS_LOCAL_JWT_SECRET__) {
    globalThis.__KAMPUS_LOCAL_JWT_SECRET__ = crypto.randomBytes(48).toString('hex');
  }
  return globalThis.__KAMPUS_LOCAL_JWT_SECRET__;
}

export function buildAuthCookieOptions() {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 24,
  };
}

export function getBearerToken(request, cookies) {
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return cookies.get('auth_token')?.value || null;
}

export function verifyAdminToken(token) {
  const decoded = jwt.verify(token, getJwtSecret());
  if (!decoded?.email || !isUserAdmin(decoded.email)) {
    return null;
  }

  const adminUser = getAdminUser(decoded.email);
  if (!adminUser) {
    return null;
  }

  return {
    id: decoded.userId,
    email: decoded.email,
    username: decoded.username,
    role: adminUser.role || decoded.role,
    fullName: adminUser.full_name || decoded.fullName || decoded.username || decoded.email,
  };
}

export function getAuthenticatedAdmin(request, cookies) {
  const token = getBearerToken(request, cookies);
  if (!token) {
    return { authenticated: false, error: 'Kimlik dogrulama gerekli' };
  }

  try {
    const admin = verifyAdminToken(token);
    if (!admin) {
      return { authenticated: false, error: 'Admin yetkisi gerekli' };
    }

    return { authenticated: true, admin, token };
  } catch {
    return { authenticated: false, error: 'Gecersiz veya suresi dolmus oturum' };
  }
}

function isLocalHostname(hostname) {
  const value = String(hostname || '').toLowerCase();
  return new Set([
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    '[::1]',
    '::ffff:127.0.0.1',
  ]).has(value) || value.startsWith('127.');
}

function isLoopbackOrigin(originValue) {
  try {
    return isLocalHostname(new URL(originValue).hostname);
  } catch {
    return false;
  }
}

function normalizeOrigin(originValue) {
  try {
    const url = new URL(originValue);
    const normalizedHost = isLocalHostname(url.hostname) ? 'localhost' : url.hostname;
    return `${url.protocol}//${normalizedHost}${url.port ? `:${url.port}` : ''}`;
  } catch {
    return originValue;
  }
}

export function requireAdmin(context) {
  const method = String(context.request.method || 'GET').toUpperCase();
  if (!['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const origin = context.request.headers.get('origin');
    if (origin) {
      const requestOrigin = new URL(context.request.url).origin;
      const bothLoopback = isLoopbackOrigin(origin) && isLoopbackOrigin(requestOrigin);
      if (!bothLoopback && normalizeOrigin(origin) !== normalizeOrigin(requestOrigin)) {
        return {
          ok: false,
          response: new Response(
            JSON.stringify({ success: false, error: 'Gecersiz istek kaynagi' }),
            { status: 403, headers: { 'Content-Type': 'application/json' } }
          ),
        };
      }
    }
  }

  const auth = getAuthenticatedAdmin(context.request, context.cookies);
  if (!auth.authenticated) {
    return {
      ok: false,
      response: new Response(
        JSON.stringify({ success: false, error: auth.error }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      ),
    };
  }

  return { ok: true, admin: auth.admin, token: auth.token };
}

export { getJwtSecret };
