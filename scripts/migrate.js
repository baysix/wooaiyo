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

const migrationFiles = [
  '00000_create_users.sql',
  '00001_create_enums.sql',
  '00002_create_apartments.sql',
  '00003_create_profiles.sql',
  '00004_create_categories.sql',
  '00005_create_posts.sql',
  '00006_create_chat.sql',
  '00007_create_reviews.sql',
  '00008_create_notifications.sql',
  '00009_create_notices.sql',
  '00010_create_functions.sql',
];

async function run() {
  await client.connect();
  console.log('Connected to database\n');

  for (const file of migrationFiles) {
    const filePath = path.join(__dirname, '..', 'supabase', 'migrations', file);
    const sql = fs.readFileSync(filePath, 'utf-8');

    console.log(`Running: ${file}`);
    try {
      await client.query(sql);
      console.log(`  OK`);
    } catch (err) {
      console.log(`  ERROR: ${err.message}`);
    }
  }

  // Run seed data
  console.log('\nRunning: seed.sql');
  try {
    const seedSql = fs.readFileSync(
      path.join(__dirname, '..', 'supabase', 'seed.sql'),
      'utf-8'
    );
    await client.query(seedSql);
    console.log('  OK');
  } catch (err) {
    console.log(`  ERROR: ${err.message}`);
  }

  // Verify
  console.log('\n--- Verification ---');
  const tables = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    ORDER BY table_name
  `);
  console.log('Tables:', tables.rows.map(r => r.table_name).join(', '));

  const aptCount = await client.query('SELECT count(*) FROM public.apartments');
  console.log('Apartments:', aptCount.rows[0].count);

  const catCount = await client.query('SELECT count(*) FROM public.categories');
  console.log('Categories:', catCount.rows[0].count);

  const locCount = await client.query('SELECT count(*) FROM public.apartment_locations');
  console.log('Locations:', locCount.rows[0].count);

  await client.end();
  console.log('\nDone!');
}

run().catch(e => {
  console.error('Fatal:', e.message);
  process.exit(1);
});
