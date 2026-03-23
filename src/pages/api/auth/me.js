import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

export const prerender = false;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret && String(secret).trim().length >= 32) {
    return String(secret);
  }

  if (!globalThis.__KAMPUS_LOCAL_JWT_SECRET__) {
    globalThis.__KAMPUS_LOCAL_JWT_SECRET__ = crypto.randomBytes(48).toString('hex');
  }
  return globalThis.__KAMPUS_LOCAL_JWT_SECRET__;
}

function getBearerToken(request, cookies) {
  const authHeader = request.headers.get('authorization');

  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }

  return cookies.get('auth_token')?.value;
}

export function GET({ request, cookies }) {
  try {
    const token = getBearerToken(request, cookies);

    if (!token) {
      return new Response(JSON.stringify({
        authenticated: false,
        error: 'No authentication token found'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const decoded = jwt.verify(token, getJwtSecret());

    return new Response(JSON.stringify({
      authenticated: true,
      user: {
        id: decoded.userId,
        email: decoded.email,
        username: decoded.username,
        role: decoded.role
      }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      authenticated: false,
      error: 'Invalid or expired token'
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
