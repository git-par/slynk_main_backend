import { AES, enc } from "crypto-js";
import { NextFunction, Response } from "express";
import { Request } from "./../request";
import { getUserById, User } from "../modules/user";
import { set as setGlobalContext } from "express-http-context";

export const validateAuthIdToken = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log(req.headers);
  console.log(req.signedCookies);

  const token =
    req.headers.authorization ||
    req.signedCookies.auth ||
    req.signedCookies.admin_auth;
  console.log({ token });
  if (!token) {
    res.clearCookie("admin_auth", {
      //httpOnly: true,
      // domain: "slynk.app",
      signed: true,
    });
    res
      .clearCookie("auth", {
        //httpOnly: true,
        // domain: "slynk.app",
        signed: true,
      })
      .status(403)
      .json({ message: "Unauthorized request." });
    return;
  }
  const userId = AES.decrypt(token, process.env.AES_KEY).toString(enc.Utf8);
  if (!userId) {
    res.clearCookie("admin_auth", {
      //httpOnly: true,
      // domain: "slynk.app",
      signed: true,
    });
    res
      .clearCookie("auth", {
        //httpOnly: true,
        // domain: "slynk.app",
        signed: true,
      })
      .status(403)
      .json({ message: "Unauthorized request." });
    return;
  }

  const user: User = await getUserById(userId);
  if (!user) {
    res.clearCookie("admin_auth", {
      //httpOnly: true,
      // domain: "slynk.app",
      signed: true,
    });
    res
      .clearCookie("auth", {
        //httpOnly: true,
        // domain: "slynk.app",
        signed: true,
      })
      .status(403)
      .json({ message: "Unauthorized request." });
    return;
  }
  if (new Date().getTime() < (user.deActivate || 0)) {
    res.status(403).json({
      message:
        "Please contact to admin. your access is  temporary deactivated. ",
    });
    return;
  }
  //@ts-ignore
  if (new Date().getTime() < (user.suspend.suspendTill || 0)) {
    res.status(403).json({
      message: "Please contact to admin. your access is temporary suspended. ",
    });
    return;
  }
  const userRawData = user.toJSON();
  delete userRawData.password;

  req.authUser = userRawData;
  req.isAdmin = User.adminTypes.includes(userRawData.userType);
  req.isSuperAdmin = userRawData.userType === "SUPER ADMIN";
  setGlobalContext("authUser", userRawData);

  next();
  return;
};
