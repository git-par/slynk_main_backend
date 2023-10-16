import { AES, enc } from "crypto-js";
import { NextFunction, Response } from "express";
import { Request } from "../request";
export const validateSelfPass = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const reqHeader = req.headers;
  const params = req.params;

  const headerApplePass = reqHeader.authorization;

  const accountId = AES.decrypt(
    headerApplePass.replace("ApplePass ", ""),
    process.env.AES_KEY_PASS
  ).toString(enc.Utf8);

  if (params.serialNumber !== accountId) {
    res.status(401);
    return;
  }
  req.accountId = accountId;
  next();
};
