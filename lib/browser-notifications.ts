export interface BrowserNotificationResult {
  supported: boolean;
  permission: NotificationPermission | 'unsupported';
}

export async function ensureBrowserNotificationsEnabled(): Promise<BrowserNotificationResult> {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { supported: false, permission: 'unsupported' };
  }

  if (Notification.permission === 'granted') {
    return { supported: true, permission: 'granted' };
  }

  if (Notification.permission === 'denied') {
    return { supported: true, permission: 'denied' };
  }

  const permission = await Notification.requestPermission();
  return { supported: true, permission };
}

export function showBrowserNotificationPreview(title: string, body: string): boolean {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return false;
  }

  if (Notification.permission !== 'granted') {
    return false;
  }

  const notification = new Notification(title, {
    body,
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: 'funded-reminder-preview',
  });

  window.setTimeout(() => notification.close(), 5000);
  return true;
}
