import { Context, Hono } from "hono";
import { AuthService } from "./auth.service";

export const AuthRouter = new Hono().basePath("/auth");

// Nonce 생성 엔드포인트
AuthRouter.get("/nonce", (c) => {
  const nonce = AuthService.getNonce();
  return c.json({ nonce });
});

// 로그인 및 시그니처 검증 엔드포인트
AuthRouter.post('/login', async (c : Context) => {
  try {
    const body = await c.req.json();
    const { nonce, signature, address } = body;

    // 필수 필드 검증
    if (!nonce || !signature || !address) {
      return c.json({
        success: false,
        error: "Missing required fields: nonce, signature, address"
      }, 400);
    }

    // 시그니처 검증 및 로그인 처리
    const result = await AuthService.login({
      nonce,
      signature,
      address
    });


    return c.json(result);
  } catch (error) {
    return c.json({
      success: false,
      error: "Internal server error"
    }, 500);
  }
});
