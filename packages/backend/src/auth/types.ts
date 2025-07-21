export type LoginDTO = {
  nonce: string;
  signature: string;
  address: string;
};

export type LoginResponse = {
  user? : {[k: string]: any}
  token?: string;
};
