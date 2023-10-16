import { NextFunction, Response } from "express";
import { Request } from "../request";

export const validateIsSuperAdmin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.isSuperAdmin) {
    res.status(401).json({ message: "Unauthorized requests." }).end();
    return;
  }
  next();
};
