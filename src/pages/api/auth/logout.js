export const prerender = false;

export function POST({ cookies }) {
  cookies.delete('auth_token', { path: '/' });

  return new Response(JSON.stringify({
    success: true,
    message: 'Logged out successfully'
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
