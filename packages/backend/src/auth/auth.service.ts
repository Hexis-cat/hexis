import { HttpStatusCode } from "axios";
import dayjs from "dayjs";
import { HTTPException } from "hono/http-exception";
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


    // TODO : 시그니처 검증
    const isSignatureValid = await this.verifySignature({address, nonce, signature});
    if (!isSignatureValid) {
      throw new HTTPException(HttpStatusCode.BadRequest, {
        message: "Invalid signature",
      });
    }

    // TODO : get User
    
    // JWT 토큰 생성 (실제 구현에서는 더 안전한 방법 사용)
    const accessToken = this.generateJWT(address);

    return {
      token: accessToken,
    };
  },

  /**
   * 간단한 JWT 토큰 생성 (실제 프로덕션에서는 더 안전한 방법 사용)
   */
  generateJWT(address: string): string {
    return "token";
  },
  async verifySignature({address, nonce, signature}: {address: string, nonce: string, signature: string}): Promise<boolean> {
    return true;
  },
};
