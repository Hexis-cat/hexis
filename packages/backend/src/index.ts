import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { AuthRouter } from "./auth/auth.router";

// dayjs 확장 플러그인 설정 (UTC 타임존 사용)
dayjs.extend(utc);

export type Bindings = {
  ENVIRONMENT: string;
  DB : D1Database

  // env
  ACCESS_TOKEN_SECRET : string
  ACCESS_TOKEN_EXPIRES_IN : string
};

const app = new Hono<{
  Bindings: Bindings;
}>();

app.use(logger());

app.use("*", cors());

app.get("/", async (c) => {
  
  return c.json({ status : true });
});

app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

app.route("/auth", AuthRouter);


export default app;
