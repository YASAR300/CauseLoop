const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

// Manually parse .env file to get DATABASE_URL
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.error('Error: .env file not found at', envPath);
    process.exit(1);
  }
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const parts = trimmed.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      let val = parts.slice(1).join('=').trim();
      // Remove surrounding quotes if any
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.substring(1, val.length - 1);
      }
      env[key] = val;
    }
  });
  return env;
}

async function run() {
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

  console.log('Connecting to Supabase PostgreSQL...');
  const client = new Client(config);

  try {
    await client.connect();
    console.log('Connected successfully!');

    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '005_draw_simulations.sql');
    if (!fs.existsSync(migrationPath)) {
      console.error('Error: Migration file not found at', migrationPath);
      process.exit(1);
    }

    const sql = fs.readFileSync(migrationPath, 'utf8');
    console.log('Executing migration 005_draw_simulations.sql...');
    await client.query(sql);
    console.log('Migration executed successfully!');
  } catch (err) {
    console.error('Error executing migration:', err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();
