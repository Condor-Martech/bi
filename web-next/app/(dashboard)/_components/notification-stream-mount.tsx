"use client";

import { useNotificationStream } from "@/lib/hooks/notifications";

/**
 * Mounts the SSE stream for as long as the (dashboard) tree is alive.
 *
 * Why a dedicated empty component:
 * - Server Components can't call hooks. The dashboard layout is a Server
 *   Component (no "use client"), so we delegate the hook to this client leaf.
 * - Putting the hook inside the bell would re-mount the stream every time the
 *   bell unmounts (route transitions can re-render parts of the tree). Keeping
 *   it here at the layout root means: connect once at login → close on logout.
 *
 * Renders nothing.
 */
export function NotificationStreamMount() {
  useNotificationStream(true);
  return null;
}
