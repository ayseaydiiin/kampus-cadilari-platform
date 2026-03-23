import { createUser } from '../../../utils/db.js';

export const prerender = false;

export async function POST({ request }) {
  try {
    const body = await request.json();
    const { action, email, password, fullName, username } = body;

    if (action === 'register') {
      // Registration endpoint
      const result = await createUser(email, password, fullName, username);
      
      if (!result.success) {
        return new Response(JSON.stringify({ success: false, error: result.error }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ success: true, message: 'User registered successfully' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ success: false, error: 'Invalid action' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
