const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");
const os = require("os");

/** wrangler d1 execute 실행 (파일 기반) */
function runWranglerQuery(sql) {
  const tmpFile = path.join(os.tmpdir(), `cleanup-${Date.now()}.sql`);
  fs.writeFileSync(tmpFile, sql);

  const cmd = `npx wrangler d1 execute hexis-db --remote --file=${tmpFile}`;
  const result = execSync(cmd, { encoding: "utf-8" });

  fs.unlinkSync(tmpFile);
  return result;
}

/** 원격 데이터베이스 중복 정리 */
function cleanupRemoteDuplicates() {
  console.log("[cleanup] Cleaning up remote database duplicates...");
  
  // 현재 마이그레이션 상태 확인
  const currentMigrations = runWranglerQuery('SELECT id, name, registeredAt FROM prisma_migrations ORDER BY name, registeredAt;');
  console.log("Current migrations:", currentMigrations);
  
  // 중복 확인
  const duplicates = runWranglerQuery('SELECT name, COUNT(*) as count FROM prisma_migrations GROUP BY name HAVING COUNT(*) > 1 ORDER BY name;');
  console.log("Duplicates found:", duplicates);
  
  // 각 마이그레이션별로 가장 최근 기록만 남기고 나머지 삭제
  const cleanupSQL = `
    DELETE FROM prisma_migrations 
    WHERE id NOT IN (
      SELECT MAX(id) 
      FROM prisma_migrations 
      GROUP BY name
    );
  `;
  
  console.log("Executing cleanup...");
  const cleanupResult = runWranglerQuery(cleanupSQL);
  console.log("Cleanup result:", cleanupResult);
  
  // 정리 후 상태 확인
  const afterCleanup = runWranglerQuery('SELECT id, name, registeredAt FROM prisma_migrations ORDER BY name, registeredAt;');
  console.log("After cleanup:", afterCleanup);
  
  console.log("[cleanup] Remote database cleanup completed.");
}

cleanupRemoteDuplicates(); 
