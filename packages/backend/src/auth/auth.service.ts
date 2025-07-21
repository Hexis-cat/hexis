import { HttpStatusCode } from "axios";
import dayjs from "dayjs";
import { HTTPException } from "hono/http-exception";
import jwt from "jsonwebtoken";
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { LoginDTO, LoginResponse } from "./types";

export const AuthService = {
  getNonce(): string {
    return crypto.randomUUID();
  },

  /**
   * 로그인 처리 및 시그니처 검증
   */
  async login(loginDto: LoginDTO): Promise<LoginResponse> {
    const { nonce, signature, address } = loginDto;

    // 타임스탬프 검증 (5분 이내)
    const timeDiff = dayjs().diff(dayjs(nonce), 'second');
    if (timeDiff > 300) { // 5분 = 300초
      throw new HTTPException(HttpStatusCode.BadRequest, {
        message: "Nonce expired. Please try again.",
      });
    }


    const isSignatureValid = await this.verifySignature({address, nonce, signature});
    if (!isSignatureValid) {
      throw new HTTPException(HttpStatusCode.BadRequest, {
        message: "Invalid signature",
      });
    }

    // TODO : get or Create User
    
    return {
      user : {},
      token : this.generateAccessToken(address, "secret"),
    } 
  },

  
  generateAccessToken(address: string, secret : string): string {
    return jwt.sign({ address }, secret, { expiresIn: '7d' });
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
