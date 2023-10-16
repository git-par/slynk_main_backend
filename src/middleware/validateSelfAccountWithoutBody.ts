import { NextFunction, Response } from "express";
import { Request } from "../request";
export const validateSelfAccountWithoutBody = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const accountId = req.params.accountId;
  if (
    !accountId ||
    !req.authUser.accounts.find((ac) => ac.toString() === accountId)
  ) {
    res.status(403).json({ message: "Unauthorized request." });
    return;
  }

  req.currentAccountId = accountId;
  // prioritize user input instead of
  next();
};
