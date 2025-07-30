import { User } from "../generated/prisma";

export type LoginDTO = {
  nonce: string;
  signature: string;
  address: string;
};

export type LoginResponse = {
  user : Partial<User>
  token : string;
};
