const { Client } = require('pg');
const bcrypt = require('bcryptjs');

const client = new Client({
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.uafhigakgkhyjkicsylb',
  password: '!@thankTHANK132',
  ssl: { rejectUnauthorized: false },
});

const users = [
  { email: 'user1@wooaiyo.com', password: 'test1234', nickname: '김철수', dong: '102동' },
  { email: 'user2@wooaiyo.com', password: 'test1234', nickname: '박영희', dong: '103동' },
];

async function createTestUsers() {
  await client.connect();

  for (const u of users) {
    const passwordHash = await bcrypt.hash(u.password, 10);

    const userResult = await client.query(
      'INSERT INTO public.users (email, password_hash) VALUES ($1, $2) RETURNING id, email',
      [u.email, passwordHash]
    );
    const user = userResult.rows[0];

    await client.query(
      'INSERT INTO public.profiles (id, nickname, apartment_id, dong) VALUES ($1, $2, $3, $4)',
      [user.id, u.nickname, 'a0000000-0000-0000-0000-000000000001', u.dong]
    );

    console.log(`Created: ${u.email} / ${u.password} (${u.nickname}, ${u.dong})`);
  }

  await client.end();
}

createTestUsers().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
