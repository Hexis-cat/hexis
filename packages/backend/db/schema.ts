import { pgTable, timestamp, uuid, varchar, text, numeric, boolean, integer, uniqueIndex, jsonb } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: uuid('id').default(crypto.randomUUID()).primaryKey().notNull(),
  walletAddress: varchar({ length: 255 }).notNull().unique(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
export type User = typeof usersTable.$inferSelect;
export type NewUser = typeof usersTable.$inferInsert;

export const noncesTable = pgTable('nonces', {
  nonce: varchar({ length: 255 }).primaryKey().notNull(),
  walletAddress: varchar({ length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});
export type Nonce = typeof noncesTable.$inferSelect;
export type NewNonce = typeof noncesTable.$inferInsert;

export const privateTextsTable = pgTable('private_texts',{
  id: uuid("id").default(crypto.randomUUID()).primaryKey().notNull(),
  creator_id: uuid("creator_id").references(() => usersTable.id),
  title: text("title").notNull(),
  description: text("description"),
  price_amount: numeric("price_amount", { precision: 24, scale: 8 }).notNull(),
  price_currency: text("price_currency").notNull(),
  preview: text("preview"),
  tags: text("tags").array(),
  is_published: boolean("is_published").default(false),
  created_at: timestamp("created_at").defaultNow(),
});
export type PrivateTexts = typeof privateTextsTable.$inferSelect;
export type newPrivateTexts = typeof privateTextsTable.$inferInsert;

export const contentVersionsTable = pgTable(
  'content_versions',
  {
    id: uuid('id').defaultRandom().primaryKey().notNull(),
    textId: uuid('text_id').references(() => privateTextsTable.id),
    version: integer('version').notNull(),
    storageUrl: text('storage_url').notNull(),
    storageObjKey: text('storage_obj_key'),
    contentHash: text('content_hash').notNull(),
    encryptedKey: text('encrypted_key').notNull(), // base64/hex of envelope
    contentSize: integer('content_size'),
    createdAt: timestamp('created_at').defaultNow(),
  },
  (tbl) => [
    uniqueIndex('unique_text_version').on(tbl.textId, tbl.version),
  ]
);
export type ContentVersion = typeof contentVersionsTable.$inferSelect;
export type NewContentVersion = typeof contentVersionsTable.$inferInsert;

export const purchasesTable = pgTable('purchases', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  buyerId: uuid('buyer_id').references(() => usersTable.id),
  textId: uuid('text_id').references(() => privateTextsTable.id),
  versionId: uuid('version_id').references(() => contentVersionsTable.id),
  purchasePrice: numeric('purchase_price', { precision: 24, scale: 8 }).notNull(),
  currency: text('currency').notNull(),
  paymentMethod: text('payment_method').notNull(),
  paymentTxHash: text('payment_tx_hash'),
  paymentReceipt: jsonb('payment_receipt'),
  purchasedAt: timestamp('purchased_at').defaultNow(),
  accessGranted: boolean('access_granted').default(false),
  accessGrantedAt: timestamp('access_granted_at'),
});
export type Purchase = typeof purchasesTable.$inferSelect;
export type NewPurchase = typeof purchasesTable.$inferInsert;

export const onChainDataTable = pgTable('on_chain_data', {
  id: uuid('id').defaultRandom().primaryKey().notNull(),
  textId: uuid('text_id').references(() => privateTextsTable.id), // link -> private text
  chainEvent: text('chain_event').notNull(),                     // name/type of on-chain event
  blockNumber: integer('block_number'),                           // optional? block number
  metadata: jsonb('metadata'),                                     // additional chain metadata
  createdAt: timestamp('created_at').defaultNow(),                
});

export type OnChainData = typeof onChainDataTable.$inferSelect;
export type NewOnChainData = typeof onChainDataTable.$inferInsert;