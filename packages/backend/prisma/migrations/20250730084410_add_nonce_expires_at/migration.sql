-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Nonce" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "address" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Nonce" ("address", "createdAt", "id") SELECT "address", "createdAt", "id" FROM "Nonce";
DROP TABLE "Nonce";
ALTER TABLE "new_Nonce" RENAME TO "Nonce";
CREATE INDEX "Nonce_address_idx" ON "Nonce"("address");
CREATE UNIQUE INDEX "Nonce_id_address_key" ON "Nonce"("id", "address");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
