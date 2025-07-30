import { HttpStatusCode } from "axios";
import { Context, Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { AuthService } from "./auth.service";

export const AuthRouter = new Hono().basePath("");

// Nonce 생성 엔드포인트
AuthRouter.get("/nonce", async (c : Context) => {
  const address = c.req.query("address");
  if (!address) {
    throw new HTTPException(HttpStatusCode.BadRequest, {
      message: "Missing required fields: address",
    });
  }

  const nonce = await AuthService.generateNonce(c, address);
  return c.json(nonce);
});

// 로그인 및 시그니처 검증 엔드포인트
AuthRouter.post('/login', async (c : Context) => {
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
  const result = await AuthService.login(c, {
    nonce,
    signature,
    address
  });


  return c.json(result);
});
