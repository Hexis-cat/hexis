export type User = {
  id : string;
  address : string;
  createdAt : Date;
  updatedAt : Date;
  deletedAt : Date | null;
}

export type Nonce = {
  nonce : string;
  address : string;
  createdAt : Date;
}
