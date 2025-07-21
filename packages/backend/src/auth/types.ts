export type LoginDTO = {
  nonce: string;
  signature: string;
  address: string;
};

export type LoginResponse = {
  token?: string;
};
