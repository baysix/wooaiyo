import admin from 'firebase-admin';

function getFirebaseAdmin() {
  if (admin.apps.length > 0) {
    return admin.apps[0]!;
  }

  const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (!base64) {
    console.warn('FIREBASE_SERVICE_ACCOUNT_BASE64 not set, push notifications disabled');
    return null;
  }

  const serviceAccount = JSON.parse(
    Buffer.from(base64, 'base64').toString('utf-8')
  );

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export const firebaseApp = getFirebaseAdmin();

export function getMessaging() {
  if (!firebaseApp) return null;
  return admin.messaging();
}
