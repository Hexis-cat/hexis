import { db } from '@db/config';
import { noncesTable, User, usersTable } from '@db/schema';
import { HttpStatusCode } from 'axios';
import dayjs from 'dayjs';
import { eq } from 'drizzle-orm';
import { HTTPException } from 'hono/http-exception';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';

import {
  generateAccessToken,
  JwtPeriodStringValue,
} from '@commons/utils/generateAccessToken';
import { PostLoginDTO } from './dtos-req';
import { LoginResponse } from './dtos-res';

export const AuthService = {
  async generateNonce(walletAddress: string): Promise<{ nonce: string }> {
    const nonce = crypto.randomUUID();

    await db.insert(noncesTable).values({
      nonce,
      walletAddress,
      expiresAt: dayjs().add(5, 'minutes').toDate(),
    });

    return {
      nonce,
    };
  },

  async login(loginDto: PostLoginDTO): Promise<LoginResponse> {
    const { nonce, signature, address } = loginDto;

    try {
      const existingNonce = await db
        .select()
        .from(noncesTable)
        .where(eq(noncesTable.nonce, nonce));

      if (existingNonce.length === 0) {
        throw new HTTPException(HttpStatusCode.BadRequest, {
          message: 'Nonce not found. Please try again.',
        });
      }

      if (existingNonce[0].walletAddress !== address) {
        throw new HTTPException(HttpStatusCode.BadRequest, {
          message: 'Nonce is not for this wallet address.',
        });
      }

      if (dayjs(existingNonce[0].expiresAt).isBefore(dayjs())) {
        throw new HTTPException(HttpStatusCode.BadRequest, {
          message: 'Nonce expired. Please try again.',
        });
      }

      await db.delete(noncesTable).where(eq(noncesTable.nonce, nonce));

      const isSignatureValid = await this.verifySignature({
        address,
        nonce,
        signature,
      });
      if (!isSignatureValid) {
        throw new HTTPException(HttpStatusCode.BadRequest, {
          message: 'Invalid signature',
        });
      }

      let user = await db
        .select()
        .from(usersTable)
        .where(eq(usersTable.walletAddress, address));

      if (user.length === 0) {
        await db.insert(usersTable).values({
          walletAddress: address,
        });

        user = await db
          .select()
          .from(usersTable)
          .where(eq(usersTable.walletAddress, address));
      }

      return {
        user: user[0],
        token: generateAccessToken(
          address,
          process.env.ACCESS_TOKEN_SECRET,
          process.env.ACCESS_TOKEN_EXPIRES_IN as JwtPeriodStringValue
        ),
      };
    } catch (err) {
      console.error(err);
      throw err;
    }
  },

  async verifySignature({
    address,
    nonce,
    signature,
  }: {
    address: string;
    nonce: string;
    signature: string;
  }): Promise<boolean> {
    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http(),
    });

    return await publicClient.verifyMessage({
      address: address as `0x${string}`,
      message: nonce,
      signature: signature as `0x${string}`,
    });
  },
};
