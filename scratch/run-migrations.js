const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const config = {
  host: 'db.wkchanfyajdivmuummsb.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'AMzDlo5lICqJcNxY',
  ssl: {
    rejectUnauthorized: false
  }
};

const migrations = [
  '001_initial_schema.sql',
  '002_rls_and_policies.sql',
  '002_stripe_events.sql',
  '003_indexes.sql',
  '004_update_signup_trigger.sql'
];

async function run() {
  const client = new Client(config);
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully!');

    for (const file of migrations) {
      console.log(`\nExecuting migration: ${file}...`);
      const filePath = path.join(__dirname, '..', 'supabase', 'migrations', file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Execute the SQL commands
      await client.query(sql);
      console.log(`Finished executing ${file}`);
    }

    console.log('\nAll migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await client.end();
  }
}

run();
