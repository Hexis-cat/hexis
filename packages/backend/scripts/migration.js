const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const { PrismaClient } = require("../src/generated/prisma");

async function runMigrations(env) {
  const prisma = new PrismaClient();

  try {
    // 1. prisma_migrations 테이블에서 이미 실행된 migration 이름 조회
    const applied = await prisma.prisma_migrations.findMany({ select: { name: true } });
    const appliedSet = new Set(applied.map(m => m.name));

    // 2. prisma/migrations 폴더 내 마이그레이션 디렉토리 목록 조회 (시간순 정렬)
    const migrationsDir = path.resolve(process.cwd(), "prisma", "migrations");
    const allMigrations = fs.readdirSync(migrationsDir).filter(d => fs.statSync(path.join(migrationsDir, d)).isDirectory());
    allMigrations.sort();

    for (const migrationName of allMigrations) {
      if (appliedSet.has(migrationName)) {
        console.log(`[${env}] Migration already applied: ${migrationName}`);
        continue;
      }

      const migrationSqlPath = path.join(migrationsDir, migrationName, "migration.sql");
      if (!fs.existsSync(migrationSqlPath)) {
        console.warn(`[${env}] migration.sql not found for ${migrationName}, skipping.`);
        continue;
      }

      console.log(`[${env}] Applying migration: ${migrationName}`);

      // 3. 마이그레이션 SQL 파일 실행 (env에 따라 --remote 옵션 조절)
      const remoteFlag = env === "prod" ? "--remote" : "";
      execSync(`npx wrangler d1 execute hexis-db ${remoteFlag} --file=${migrationSqlPath}`, { stdio: "inherit" });

      // 4. 마이그레이션 기록 테이블에 추가
      await prisma.prisma_migrations.create({
        data: {
          name: migrationName,
          registeredAt: new Date(),
        },
      });

      console.log(`[${env}] Migration applied and recorded: ${migrationName}`);
    }

  } catch (error) {
    console.error(`[${env}] Migration error:`, error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// 커맨드라인 인자로 환경 받기 (dev / prod)
const env = process.argv[2];
if (!env || !["dev", "prod"].includes(env)) {
  console.error("Usage: node migration.js <dev|prod>");
  process.exit(1);
}

runMigrations(env);
