import { getAdminUser, verifyUserCredentials, isUserAdmin } from '../../../utils/db.js';
import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

export const prerender = false;

function getJwtSecret() {
  const secret = process.env.JWT_SECRET;
  if (secret && String(secret).trim().length >= 32) {
    return String(secret);
  }

  // Local-only fallback: generate an in-memory secret per process.
  // This avoids committing static defaults while keeping local dev usable.
  if (!globalThis.__KAMPUS_LOCAL_JWT_SECRET__) {
    globalThis.__KAMPUS_LOCAL_JWT_SECRET__ = crypto.randomBytes(48).toString('hex');
  }
  return globalThis.__KAMPUS_LOCAL_JWT_SECRET__;
}

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Email and password are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const userResult = await verifyUserCredentials(email, password);

    if (!userResult.success) {
      return new Response(JSON.stringify({
        success: false,
        error: userResult.error || 'Invalid credentials'
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (!isUserAdmin(email)) {
      return new Response(JSON.stringify({
        success: false,
        error: 'You do not have admin access. Please contact the administrators.'
      }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const adminUser = getAdminUser(email);
    const effectiveRole = adminUser?.role || userResult.user.role;
    const effectiveName = adminUser?.full_name || userResult.user.fullName;

    const token = jwt.sign(
      {
        userId: userResult.user.id,
        email: userResult.user.email,
        username: userResult.user.username,
        role: effectiveRole
      },
      getJwtSecret(),
      { expiresIn: '24h' }
    );

    return new Response(JSON.stringify({
      success: true,
      message: 'Login successful',
      user: {
        id: userResult.user.id,
        email: userResult.user.email,
        username: userResult.user.username,
        fullName: effectiveName,
        role: effectiveRole
      },
      token
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error?.message || 'An error occurred during login'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
