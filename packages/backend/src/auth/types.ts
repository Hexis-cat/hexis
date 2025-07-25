import { User } from "../lib/schema";

export type LoginDTO = {
  nonce: string;
  signature: string;
  address: string;
};

export type LoginResponse = {
  user : User 
  token : string;
};
