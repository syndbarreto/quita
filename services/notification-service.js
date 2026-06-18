import { createOwnedRecord, getOwnedRecords, apiRequest } from "./api-service.js";

export function notify(type, title) {
  return createOwnedRecord("notifications", {
    type,
    title,
    read: false,
    createdAt: new Date().toISOString(),
  });
}

export function getNotifications() {
  return getOwnedRecords("notifications");
}

export async function markAllRead(notifications) {
  const unread = notifications.filter((n) => !n.read);

  await Promise.all(
    unread.map((n) =>
      apiRequest(`/notifications/${n.id}`, {
        method: "PATCH",
        body: { read: true },
      }),
    ),
  );
}
