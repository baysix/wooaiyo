'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { isNativePlatform, getPlatform } from '@/lib/capacitor';
import { registerPushToken } from '@/actions/push';

export default function PushProvider({ userId }: { userId: string | null }) {
  const pathname = usePathname();
  const activeChatRoomRef = useRef<string | null>(null);

  // Track which chat room is currently open for foreground suppression
  useEffect(() => {
    const match = pathname.match(/^\/chat\/([^/]+)$/);
    activeChatRoomRef.current = match ? match[1] : null;
  }, [pathname]);

  useEffect(() => {
    if (!userId || !isNativePlatform()) return;

    let cleanup = false;

    async function initPush() {
      const { PushNotifications } = await import('@capacitor/push-notifications');

      // Check/request permissions
      let permStatus = await PushNotifications.checkPermissions();
      if (permStatus.receive === 'prompt') {
        permStatus = await PushNotifications.requestPermissions();
      }
      if (permStatus.receive !== 'granted') {
        console.warn('Push notification permission denied');
        return;
      }

      // Listen for registration success
      await PushNotifications.addListener('registration', async (token) => {
        if (cleanup) return;
        const platform = getPlatform();
        await registerPushToken(token.value, platform);
      });

      // Listen for registration error
      await PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error.error);
      });

      // Foreground: suppress notification if viewing the same chat room
      await PushNotifications.addListener('pushNotificationReceived', (notification) => {
        const notifChatRoomId = notification.data?.chatRoomId;
        if (notifChatRoomId && notifChatRoomId === activeChatRoomRef.current) {
          PushNotifications.removeAllDeliveredNotifications();
        }
      });

      // Notification tap: navigate to chat room
      await PushNotifications.addListener('pushNotificationActionPerformed', (action) => {
        const chatRoomId = action.notification.data?.chatRoomId;
        if (chatRoomId) {
          window.location.href = `/chat/${chatRoomId}`;
        }
      });

      // Register with FCM
      await PushNotifications.register();
    }

    initPush();

    return () => {
      cleanup = true;
    };
  }, [userId]);

  return null;
}
