import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotifications,
} from '../../../utils/db.js';
import { requireAdmin } from '../../../utils/adminAuth.js';

export const prerender = false;

const headers = { 'Content-Type': 'application/json' };

export async function GET(context) {
  const auth = requireAdmin(context);
  if (!auth.ok) return auth.response;

  const { url } = context;
  try {
    const onlyUnread = url.searchParams.get('onlyUnread') === '1';
    const limit = Number(url.searchParams.get('limit') || '50');
    const notifications = getNotifications(auth.admin.email, { onlyUnread, limit });
    const unreadCount = getUnreadNotificationCount(auth.admin.email);

    return new Response(
      JSON.stringify({ success: true, notifications, unreadCount }),
      { status: 200, headers }
    );
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}

export async function PUT(context) {
  const auth = requireAdmin(context);
  if (!auth.ok) return auth.response;

  const { request } = context;
  try {
    const { notificationId, markAll } = await request.json();

    const result = markAll
      ? markAllNotificationsRead(auth.admin.email)
      : markNotificationRead(Number(notificationId), auth.admin.email);
    if (!result.success) {
      return new Response(JSON.stringify(result), { status: 400, headers });
    }

    const unreadCount = getUnreadNotificationCount(auth.admin.email);
    return new Response(JSON.stringify({ success: true, unreadCount }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}

export async function DELETE(context) {
  const auth = requireAdmin(context);
  if (!auth.ok) return auth.response;

  const { request } = context;
  try {
    const { notificationIds } = await request.json();

    const result = deleteNotifications(auth.admin.email, notificationIds);
    if (!result.success) {
      return new Response(JSON.stringify(result), { status: 400, headers });
    }

    const unreadCount = getUnreadNotificationCount(auth.admin.email);
    return new Response(JSON.stringify({ success: true, unreadCount, deleted: result.deleted }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 500, headers });
  }
}
