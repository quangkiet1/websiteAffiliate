require('../config/env');

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

function quoteIdentifier(value) {
  return `"${String(value).replace(/"/g, '""')}"`;
}

async function createDatabaseIfNeeded(databaseUrl) {
  const url = new URL(databaseUrl);
  const databaseName = url.pathname.slice(1);

  if (!databaseName) {
    throw new Error('DATABASE_URL chưa có tên database.');
  }

  url.pathname = '/postgres';

  const client = new Client({ connectionString: url.toString() });
  await client.connect();

  try {
    const existing = await client.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [databaseName]
    );

    if (existing.rowCount === 0) {
      await client.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
      return { databaseName, created: true };
    }

    return { databaseName, created: false };
  } finally {
    await client.end();
  }
}

async function applySchema(databaseUrl) {
  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  const client = new Client({ connectionString: databaseUrl });

  await client.connect();

  try {
    await client.query(schema);
  } finally {
    await client.end();
  }
}

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error('DATABASE_URL chưa được cấu hình.');
  }

  const result = await createDatabaseIfNeeded(databaseUrl);
  await applySchema(databaseUrl);

  console.log(JSON.stringify({
    ok: true,
    database: result.databaseName,
    databaseCreated: result.created,
    schemaApplied: true
  }));
}

main().catch((err) => {
  console.error(JSON.stringify({
    ok: false,
    code: err.code,
    message: err.message
  }));
  process.exit(1);
});
