const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

const isProd = process.argv[2] === "prod";
const remoteFlag = isProd ? "--remote" : "";

/** wrangler d1 execute (JSON 모드) */
function runWranglerQuery(sql) {
  const tmpFile = path.join(os.tmpdir(), `migration-${Date.now()}.sql`);
  fs.writeFileSync(tmpFile, sql);

  const cmd = `npx wrangler d1 execute hexis-db ${remoteFlag} --file=${tmpFile} --json=true`;
  const raw = execSync(cmd, { encoding: "utf-8" });
  fs.unlinkSync(tmpFile);

  // JSON 부분만 추출
  const jsonStart = raw.indexOf("[");
  const jsonEnd = raw.lastIndexOf("]");
  if (jsonStart !== -1 && jsonEnd !== -1) {
    const jsonStr = raw.slice(jsonStart, jsonEnd + 1);
    return JSON.parse(jsonStr);
  }

  // JSON 파싱 실패시 로그 출력
  console.error("Failed to extract JSON from wrangler output:", raw);
  throw new Error("Invalid JSON output from wrangler");
}

/** prisma_migrations 테이블 보장 */
function ensureMigrationsTable() {
  const sql = `
    CREATE TABLE IF NOT EXISTS prisma_migrations (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      registeredAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `;
  runWranglerQuery(sql);
}

function markMigrationAsApplied(name) {
  const sql = `
    INSERT OR IGNORE INTO prisma_migrations (id, name, registeredAt)
    VALUES (lower(hex(randomblob(16))), '${name}', CURRENT_TIMESTAMP);
  `;
  runWranglerQuery(sql);
}


/** 적용된 마이그레이션 목록 조회 */
function getAppliedMigrations() {
  const res = runWranglerQuery('SELECT name as "migration_name" FROM prisma_migrations ORDER BY registeredAt;');
  if (!Array.isArray(res) || !res[0] || !Array.isArray(res[0].results)) return [];

  const migrations = res[0].results
    .map(row => row.migration_name)
    .filter(Boolean);

  return migrations;
}

/** 마이그레이션 실행 */
function runMigrations() {
  ensureMigrationsTable();

  const migrationsDir = path.join(__dirname, "../prisma/migrations");
  const allMigrations = fs
    .readdirSync(migrationsDir)
    .filter(name => fs.statSync(path.join(migrationsDir, name)).isDirectory())
    .sort();

  const applied = getAppliedMigrations();
  const pending = allMigrations.filter(m => !applied.includes(m));

  if (pending.length === 0) {
    console.log("[migration] No new migrations to apply.");
    return;
  }

  console.log(`[migration] Applying ${pending.length} migration(s): ${pending.join(", ")}`);

  for (const migration of pending) {
    const sqlFile = path.join(migrationsDir, migration, "migration.sql");
    if (!fs.existsSync(sqlFile)) {
      console.warn(`[migration] Skipping ${migration}: migration.sql not found`);
      continue;
    }

    let sql = fs.readFileSync(sqlFile, "utf-8");

    // SQL 주석 제거 (-- 로 시작하는 라인)
    sql = sql.replace(/^\s*--.*$/gm, "");

    // prisma_migrations 테이블 생성 구문 제거
    sql = sql.replace(/CREATE TABLE "prisma_migrations"[\s\S]*?;\n\n/g, "");

    // CREATE TABLE/INDEX → IF NOT EXISTS 변환
    sql = sql.replace(/CREATE TABLE "([^"]+)"/g, 'CREATE TABLE IF NOT EXISTS "$1"');
    sql = sql.replace(/CREATE INDEX "([^"]+)" ON "([^"]+)"/g, 'CREATE INDEX IF NOT EXISTS "$1" ON "$2"');
    sql = sql.replace(/CREATE UNIQUE INDEX "([^"]+)" ON "([^"]+)"/g, 'CREATE UNIQUE INDEX IF NOT EXISTS "$1" ON "$2"');

    try {
      runWranglerQuery(sql);
      markMigrationAsApplied(migration);
      console.log(`[migration] Applied: ${migration}`);
    } catch (err) {
      console.error(`[migration] Failed: ${migration}`, err.message);
      throw err;
    }
  }

  console.log("[migration] All migrations applied successfully.");
}

runMigrations();
