import { aes256Encrypt } from '@commons/utils/cryptoAES256GCM';
import { db } from '@db/config';
import { boothSaleTextTable, boothTable, NewBooth } from '@db/schema';
import { HttpStatusCode } from 'axios';
import { count, eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { SubGraphService } from '../../external/subgraph/subgraph.service';

export const BoothService = {
  async getBooths(page: number, size: number) {
    const [totalCount, list] = await Promise.all([
      db.select({ count: count() }).from(boothTable),
      db
        .select()
        .from(boothTable)
        .limit(size)
        .offset((page - 1) * size),
    ]);

    return {
      count: totalCount[0].count,
      list,
    };
  },

  async getBooth(boothId: string) {
    const booth = await db
      .select()
      .from(boothTable)
      .where(eq(boothTable.id, boothId));

    if (!booth) {
      throw new HTTPException(HttpStatusCode.NotFound, {
        message: 'Booth not found',
      });
    }

    return booth;
  },

  async createBooth({
    id,
    requestOwnerAddress,
    fullText,
  }: {
    id: string;
    requestOwnerAddress: string;
    fullText: string;
  }) {
    const createdBooth = await SubGraphService.getCreatedBoothsByBoothId(id);

    if (
      createdBooth.owner.toLowerCase() !== requestOwnerAddress.toLowerCase()
    ) {
      throw new HTTPException(HttpStatusCode.Forbidden, {
        message: 'You are not the owner of the booth',
      });
    }

    const insertData: NewBooth = {
      id: createdBooth.id.toLowerCase(),
      owner: createdBooth.owner.toLowerCase(),
      price: createdBooth.price,
      previewText: createdBooth.previewText,
      boothAddress: createdBooth.boothAddress.toLowerCase(),
      paymentOption:
        createdBooth.paymentOption === 0 ? 'NATIVE_CURRENCY' : 'ERC20_TOKEN',
      paymentTokenAddress: createdBooth.paymentTokenAddress.toLowerCase(),
      saleType: createdBooth.saleType === 0 ? 'INSTANT_SALE' : 'REQUEST_SALE',
      blockNumber: createdBooth.blockNumber,
    };

    try {
      const booth = await db.transaction(async tx => {
        const booth = await tx
          .insert(boothTable)
          .values(insertData)
          .returning();

        const boothId = booth[0].id;

        const { iv, encrypted, authTag } = aes256Encrypt(fullText);
        await tx.insert(boothSaleTextTable).values({
          boothId,
          encryptedText: encrypted,
          iv,
          authTag,
        });

        return booth;
      });

      return booth;
    } catch (err) {
      console.error(err);
      throw new HTTPException(HttpStatusCode.InternalServerError);
    }
  },

  async patchBooth({
    ownerAddress,
    boothId,
    previewText,
  }: {
    ownerAddress: string;
    boothId: string;
    previewText: string;
  }) {
    const booth = await db
      .select()
      .from(boothTable)
      .where(eq(boothTable.id, boothId));

    if (!booth) {
      throw new HTTPException(HttpStatusCode.NotFound, {
        message: 'Booth not found',
      });
    }

    if (ownerAddress.toLowerCase() !== booth[0].owner.toLowerCase()) {
      throw new HTTPException(HttpStatusCode.Forbidden, {
        message: 'You are not the owner of the booth',
      });
    }

    const updatedBooth = await db
      .update(boothTable)
      .set({ previewText })
      .where(eq(boothTable.id, boothId))
      .returning();

    return updatedBooth;
  },
};
