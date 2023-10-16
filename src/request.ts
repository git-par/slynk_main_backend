import { Request as expresesRequest } from "express";
import { IUser } from "./modules/user";

export interface Request extends expresesRequest {
  authUser?: IUser;
  currentAccountId?: string;
  files?: string;
  accountId?: string;
  isAdmin: boolean;
  isSuperAdmin: boolean;
}
