import { getAdminUser, verifyUserCredentials, isUserAdmin } from '../../../utils/db.js';
import jwt from 'jsonwebtoken';
import { buildAuthCookieOptions, getJwtSecret } from '../../../utils/adminAuth.js';
import { checkRateLimit, rateLimitResponse } from '../../../utils/security.js';

export const prerender = false;

export async function POST({ request, cookies }) {
  try {
    const rateLimit = checkRateLimit(request, 'auth-login', { limit: 8, windowMs: 15 * 60 * 1000 });
    if (!rateLimit.allowed) {
      return rateLimitResponse('Cok fazla giris denemesi yapildi', rateLimit.retryAfter);
    }

    const contentType = String(request.headers.get('content-type') || '').toLowerCase();
    let rawEmail = '';
    let rawPassword = '';

    if (contentType.includes('application/json')) {
      const body = await request.json();
      rawEmail = body?.email ?? body?.username ?? '';
      rawPassword = body?.password ?? '';
    } else if (contentType.includes('application/x-www-form-urlencoded') || contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      rawEmail = form.get('email') ?? form.get('username') ?? '';
      rawPassword = form.get('password') ?? '';
    } else {
      // Fallback: try JSON first, then form-data.
      try {
        const body = await request.json();
        rawEmail = body?.email ?? body?.username ?? '';
        rawPassword = body?.password ?? '';
      } catch {
        const form = await request.formData();
        rawEmail = form.get('email') ?? form.get('username') ?? '';
        rawPassword = form.get('password') ?? '';
      }
    }

    const email = String(rawEmail || '').trim().toLowerCase();
    const password = String(rawPassword || '');

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
        fullName: effectiveName,
        role: effectiveRole
      },
      getJwtSecret(),
      { expiresIn: '24h' }
    );

    cookies.set('auth_token', token, buildAuthCookieOptions());

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
