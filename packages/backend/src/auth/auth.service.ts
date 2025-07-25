import { HttpStatusCode } from "axios";
import dayjs from "dayjs";
import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { generateAccessToken } from "../lib/utils/generateAccessToken";
import { LoginDTO, LoginResponse } from "./types";



export const AuthService = {
  async generateNonce(c : Context, walletAddress : string): Promise<{nonce : string}> {
    const nonce = crypto.randomUUID();

    await c.env.DB.prepare('INSERT INTO nonce (nonce, address) VALUES (?, ?)').bind(nonce, walletAddress).run();

    return {
      nonce
    };
  },


  /**
   * 로그인 처리 및 시그니처 검증
   */
  async login(c : Context, loginDto: LoginDTO): Promise<LoginResponse> {
    const { nonce, signature, address } = loginDto;

    try {

      const existingNonce = await c.env.DB.prepare('SELECT * FROM nonce WHERE nonce = ? AND address = ?').bind(nonce, address).first();
      if (!existingNonce) {
        await c.env.DB.prepare('DELETE FROM nonce WHERE nonce = ? AND address = ?').bind(nonce, address).run();
        throw new HTTPException(HttpStatusCode.BadRequest, {
          message: "Nonce not found. Please try again.",
        });
      }

      await c.env.DB.prepare('DELETE FROM nonce WHERE nonce = ? AND address = ?').bind(nonce, address).run();
  
      
  
      // 타임스탬프 검증 (5분 이내)
      // UTC로 통일하여 비교
      const timeDiff = dayjs.utc().diff(dayjs.utc(existingNonce.created_at), 'seconds');
      console.log(timeDiff)
      if (timeDiff > 300) { // 5분 = 300초
        throw new HTTPException(HttpStatusCode.BadRequest, {
          message: "Nonce expired. Please try again.",
        });
      }
  
  
      const isSignatureValid = await this.verifySignature({address, nonce, signature});
      if (!isSignatureValid) {
        console.group('Invalid signature')
        console.log('address', address)
        console.log('nonce', nonce)
        console.log('signature', signature)
        console.groupEnd()
        throw new HTTPException(HttpStatusCode.BadRequest, {
          message: "Invalid signature",
        });
      }
  
      let user = await c.env.DB.prepare('SELECT * FROM user WHERE address = ?').bind(address).first();
      if (!user) {
        await c.env.DB.prepare('INSERT INTO user (id, address) VALUES (?, ?)').bind(crypto.randomUUID(), address).run();
        user = await c.env.DB.prepare('SELECT * FROM user WHERE address = ?').bind(address).first();
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
