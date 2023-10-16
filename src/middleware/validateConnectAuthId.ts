import { AES, enc } from "crypto-js";
import { NextFunction, Response } from "express";
import { Request } from "../request";
import { getUserById, User } from "../modules/user";
import { set as setGlobalContext } from "express-http-context";

export const validateConnectAuthIdToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token =
    req.headers.authorization ||
    req.signedCookies.auth ||
    req.signedCookies.admin_auth;

  if (token) {
    const userId = AES.decrypt(token, process.env.AES_KEY).toString(enc.Utf8);
    if (!userId) {
      res.status(403).json({ message: "Unauthorized request." });
      return;
    }

    const user: User = await getUserById(userId);

    if (!user) {
      res.status(403).json({ message: "Unauthorized request." });
      return;
    }
    const userRawData = user.toJSON();
    delete userRawData.password;

    req.authUser = userRawData;
    req.isAdmin = User.adminTypes.includes(userRawData.userType);

    setGlobalContext("authUser", userRawData);
  } else {
    req.authUser = null;
  }

  next();
  return;
};
