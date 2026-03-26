import { getAuthenticatedAdmin } from '../../../utils/adminAuth.js';

export const prerender = false;

export function GET({ request, cookies }) {
  const auth = getAuthenticatedAdmin(request, cookies);
  if (!auth.authenticated) {
    return new Response(JSON.stringify({
      authenticated: false,
      error: auth.error
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  return new Response(JSON.stringify({
    authenticated: true,
    user: auth.admin
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
