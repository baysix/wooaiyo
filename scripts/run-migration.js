const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: 'aws-1-ap-south-1.pooler.supabase.com',
  port: 6543,
  database: 'postgres',
  user: 'postgres.uafhigakgkhyjkicsylb',
  password: '!@thankTHANK132',
  ssl: { rejectUnauthorized: false },
});

const file = process.argv[2];
if (!file) {
  console.error('Usage: node run-migration.js <filename.sql>');
  process.exit(1);
}

async function run() {
  await client.connect();
  const filePath = path.join(__dirname, '..', 'supabase', 'migrations', file);
  const sql = fs.readFileSync(filePath, 'utf-8');

  console.log(`Running: ${file}`);
  await client.query(sql);
  console.log('OK');

  // Set test user roles
  console.log('\nSetting test user roles...');
  await client.query("UPDATE public.profiles SET role = 'admin' WHERE nickname = '테스트유저'");
  await client.query("UPDATE public.profiles SET role = 'manager' WHERE nickname = '김철수'");
  console.log('Roles set: 테스트유저=admin, 김철수=manager');

  // Verify
  const res = await client.query("SELECT nickname, role FROM public.profiles ORDER BY nickname");
  console.log('\nProfiles:', res.rows.map(r => `${r.nickname}(${r.role})`).join(', '));

  const tables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name");
  console.log('Tables:', tables.rows.map(r => r.table_name).join(', '));

  await client.end();
}

run().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
