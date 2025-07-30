import { HttpStatusCode } from "axios";
import dayjs from "dayjs";
import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { createPrismaClient } from "../lib/prisma";
import { generateAccessToken } from "../lib/utils/generateAccessToken";
import { LoginDTO, LoginResponse } from "./types";

export const AuthService = {
  async generateNonce(c : Context, walletAddress : string): Promise<{nonce : string}> {
    const prisma = createPrismaClient(c.env.DB);
    const nonce = crypto.randomUUID();
    await prisma.nonce.create({
      data: {
        id: nonce,
        address: walletAddress,
        createdAt: new Date(),
      }
    })

    return {
      nonce
    };
  },


  /**
   * 로그인 처리 및 시그니처 검증
   */
  async login(c : Context, loginDto: LoginDTO): Promise<LoginResponse> {
    const prisma = createPrismaClient(c.env.DB);
    const { nonce, signature, address } = loginDto;

    try {
      const existingNonce = await prisma.nonce.findUnique({
        where: {
          id_address: {
            id: nonce,
            address: address,
          }
        }
      })
      
      if (!existingNonce) {
        throw new HTTPException(HttpStatusCode.BadRequest, {
          message: "Nonce not found. Please try again.",
        });
      }

      if(dayjs.utc(existingNonce.createdAt).add(5, 'minutes').isBefore(dayjs.utc())) {
        throw new HTTPException(HttpStatusCode.BadRequest, {
          message: "Nonce expired. Please try again.",
        });
      }

      await prisma.nonce.delete({
        where: {
          id_address: {
            id: nonce,
            address: address,
          }
        }
      })
  
      const isSignatureValid = await this.verifySignature({address, nonce, signature});
      if (!isSignatureValid) {
        throw new HTTPException(HttpStatusCode.BadRequest, {
          message: "Invalid signature",
        });
      }
  
      let user = await prisma.user.findUnique({
        where: {
          address: address,
        }
      });

      if (!user) {
        user = await prisma.user.create({
          data: {
            id: crypto.randomUUID(),
            address: address,
          }
        })
      }
  
      
      return {
        user,
        token : generateAccessToken(address, c.env.ACCESS_TOKEN_SECRET, c.env.ACCESS_TOKEN_EXPIRES_IN),
      } 
    } catch(err) {
      console.error(err)
      throw err;
    }
  },

  


  async verifySignature({address, nonce, signature}: {address: string, nonce: string, signature: string}): Promise<boolean> {
    const publicClient = createPublicClient({
      chain: mainnet,
      transport: http(),
    })

   return await publicClient.verifyMessage({
      address: address as `0x${string}`,
      message: nonce,
      signature: signature as `0x${string}`,
    })
  },
};
