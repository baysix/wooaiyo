const SUPABASE_URL = 'https://uafhigakgkhyjkicsylb.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVhZmhpZ2FrZ2toeWpraWNzeWxiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTk4NjYwOSwiZXhwIjoyMDg3NTYyNjA5fQ.uAxBsv3njOR1CmXSL9CDaH5duQHxGpgBrUVAmgg2Rwc';

const buckets = [
  { id: 'post-images', name: 'post-images', public: true },
  { id: 'chat-images', name: 'chat-images', public: true },
  { id: 'avatars', name: 'avatars', public: true },
  { id: 'open-chat-images', name: 'open-chat-images', public: true },
];

async function createBuckets() {
  for (const bucket of buckets) {
    const res = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bucket),
    });

    const data = await res.json();
    if (res.ok) {
      console.log(`Created bucket: ${bucket.id}`);
    } else if (data.message && data.message.includes('already exists')) {
      console.log(`Bucket already exists: ${bucket.id}`);
    } else {
      console.log(`Error creating ${bucket.id}:`, data.message || data);
    }
  }

  // Verify
  const listRes = await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    headers: { 'Authorization': `Bearer ${SERVICE_ROLE_KEY}` },
  });
  const list = await listRes.json();
  console.log('\nAll buckets:', list.map(b => `${b.id} (public: ${b.public})`).join(', '));
}

createBuckets().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
