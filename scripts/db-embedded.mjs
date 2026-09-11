// Host-only dev aid: run an embedded PostgreSQL (no Docker / no admin rights)
// so you can inspect the aibah schema with Prisma Studio on machines where
// Docker isn't installed. Docker Compose remains the canonical runtime
// (see AGENTS.md Phase 0) — this is purely a convenience.
//
// Usage:
//   node scripts/db-embedded.mjs start   # init (first time) + start + ensure `aibah` db
//   node scripts/db-embedded.mjs stop    # stop the server (data is kept in .pgdata)
//   node scripts/db-embedded.mjs status  # is it running?
//   node scripts/db-embedded.mjs verify  # list tables + row counts
import EmbeddedPostgres from "embedded-postgres";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const mode = process.argv[2] ?? "start";

const options = {
  databaseDir: path.join(root, ".pgdata"),
  user: "aibah",
  password: "aibah",
  port: 5432,
  persistent: true,
};

const pg = new EmbeddedPostgres(options);

async function ensureDb(pg) {
  const client = pg.getPgClient();
  await client.connect();
  const dbs = await client.query(`SELECT datname FROM pg_database WHERE datname = 'aibah'`);
  if (dbs.rows.length === 0) {
    await pg.createDatabase("aibah");
    console.log("Created database 'aibah'.");
  } else {
    console.log("Database 'aibah' already exists.");
  }
  await client.end();
}

async function connectToDb(pg) {
  const client = pg.getPgClient("aibah");
  await client.connect();
  return client;
}

async function verify(pg) {
  const client = await connectToDb(pg);
  const tables = await client.query(
    `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`,
  );
  console.log(`\nTables in 'aibah' (${tables.rows.length}):\n`);
  for (const t of tables.rows) {
    const r = await client.query(`SELECT count(*)::int AS n FROM "${t.table_name}"`);
    console.log(`  ${t.table_name.padEnd(28)} ${r.rows[0].n} rows`);
  }
  await client.end();
}

async function main() {
  if (mode === "stop") {
    try {
      await pg.stop();
      console.log("Embedded Postgres stopped. Data kept in .pgdata/");
    } catch (e) {
      console.log(`Stop: ${e.message}`);
    }
    return;
  }

  if (mode === "status") {
    const client = pg.getPgClient();
    try {
      await client.connect();
      await client.query("SELECT 1");
      console.log("Embedded Postgres is RUNNING on 127.0.0.1:5432.");
      await client.end();
    } catch {
      console.log("Embedded Postgres is NOT running.");
    }
    return;
  }

  if (mode === "verify") {
    try {
      await verify(pg);
    } catch (e) {
      console.log(`Verify failed (is the server running?): ${e.message}`);
    }
    return;
  }

  // ----- start -----
  try {
    await pg.initialise();
    console.log("Cluster initialised in .pgdata/");
  } catch (e) {
    console.log(`initialise: ${e.message}`);
  }

  try {
    await pg.start();
    console.log("Embedded Postgres started on 127.0.0.1:5432");
  } catch (e) {
    console.log(`start: ${e.message}`);
  }

  try {
    await ensureDb(pg);
  } catch (e) {
    console.log(`ensureDb: ${e.message}`);
  }
}

await main();