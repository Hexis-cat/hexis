export type JwtPayload = {
  address: string;
  iat: number;
  exp: number;
  [key: string]: string | number | boolean | null | undefined;
};
