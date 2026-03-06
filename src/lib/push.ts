import { getMessaging } from './firebase-admin';
import { createClient } from '@/lib/supabase/server';

interface SendPushParams {
  recipientUserId: string;
  title: string;
  body: string;
  data?: Record<string, string>;
}

export async function sendPushToUser({ recipientUserId, title, body, data }: SendPushParams) {
  const messaging = getMessaging();
  if (!messaging) return;

  const supabase = createClient();

  const { data: tokens } = await supabase
    .from('push_tokens')
    .select('id, token')
    .eq('user_id', recipientUserId)
    .eq('is_active', true);

  if (!tokens || tokens.length === 0) return;

  const results = await Promise.allSettled(
    tokens.map(({ token }) =>
      messaging.send({
        token,
        notification: { title, body },
        data: data ?? {},
        android: {
          priority: 'high' as const,
          notification: {
            channelId: 'chat_messages',
            sound: 'default',
            color: '#20C997',
          },
        },
      })
    )
  );

  // Deactivate invalid tokens
  const invalidTokenIds: string[] = [];
  results.forEach((result, index) => {
    if (result.status === 'rejected') {
      const errorCode = result.reason?.code;
      if (
        errorCode === 'messaging/invalid-registration-token' ||
        errorCode === 'messaging/registration-token-not-registered'
      ) {
        invalidTokenIds.push(tokens[index].id);
      }
    }
  });

  if (invalidTokenIds.length > 0) {
    await supabase
      .from('push_tokens')
      .update({ is_active: false })
      .in('id', invalidTokenIds);
  }
}
