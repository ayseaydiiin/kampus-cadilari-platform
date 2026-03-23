import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotifications,
} from '../../../utils/db.js';

export const prerender = false;

const headers = { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' };

export async function GET({ url }) {
  try {
    const adminEmail = url.searchParams.get('adminEmail');
    if (!adminEmail) {
      return new Response(JSON.stringify({ success: false, error: 'adminEmail gerekli' }), { status: 400, headers });
    }

    const onlyUnread = url.searchParams.get('onlyUnread') === '1';
    const limit = Number(url.searchParams.get('limit') || '50');
    const notifications = getNotifications(adminEmail, { onlyUnread, limit });
    const unreadCount = getUnreadNotificationCount(adminEmail);

    return new Response(
      JSON.stringify({ success: true, notifications, unreadCount }),
      { status: 200, headers }
    );
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}

export async function PUT({ request }) {
  try {
    const { adminEmail, notificationId, markAll } = await request.json();
    if (!adminEmail) {
      return new Response(JSON.stringify({ success: false, error: 'adminEmail gerekli' }), { status: 400, headers });
    }

    const result = markAll
      ? markAllNotificationsRead(adminEmail)
      : markNotificationRead(Number(notificationId), adminEmail);
    if (!result.success) {
      return new Response(JSON.stringify(result), { status: 400, headers });
    }

    const unreadCount = getUnreadNotificationCount(adminEmail);
    return new Response(JSON.stringify({ success: true, unreadCount }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}

export async function DELETE({ request }) {
  try {
    const { adminEmail, notificationIds } = await request.json();
    if (!adminEmail) {
      return new Response(JSON.stringify({ success: false, error: 'adminEmail gerekli' }), { status: 400, headers });
    }

    const result = deleteNotifications(adminEmail, notificationIds);
    if (!result.success) {
      return new Response(JSON.stringify(result), { status: 400, headers });
    }

    const unreadCount = getUnreadNotificationCount(adminEmail);
    return new Response(JSON.stringify({ success: true, unreadCount, deleted: result.deleted }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}
