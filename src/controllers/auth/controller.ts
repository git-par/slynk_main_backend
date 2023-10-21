import { AES, SHA256 } from "crypto-js";
import { log } from "winston";
import { Response } from "express";
import { Request } from "./../../request";
import { LoginTicket, OAuth2Client } from "google-auth-library";
import validator from "validator";
import Joi, { isError } from "joi";
import {
  Account,
  getAccountsByAccountName,
  IAccount,
  saveAccount,
  updateAccount,
} from "../../modules/account";
import {
  IUser,
  User,
  saveUser,
  getUserByEmail,
  updateUser,
  getPopulatedUser,
  getUserById,
  getUserByNumber,
  genderType,
} from "../../modules/user";
import { get as _get, compact as _compact } from "lodash";
// import {
//   BetaUser,
//   createBetaUser,
//   getBetaUserByCode,
//   updateBetaUser,
// } from "../../modules/betaUser";

import * as Sentry from "@sentry/node";
import { sendOtpMsg } from "../../helper/twillio";
import {
  deletePhoneOtpById,
  getPhoneOtpOneWhere,
  PhoneOtp,
  savePhoneOtp,
  updatePhoneOtp,
} from "../../modules/phoneOtp";
import { stripeInstance } from "../../helper/stripe";
import moment from "moment";
import { removeProToFree } from "../../helper/removeProToFree";
import { proHandle } from "../../helper/proHandle";
import { removeDeleteUserORAccount } from "../../helper/removeDeleteUserORAccount";
import { getAuth } from "firebase-admin/auth";
import {
  deleteEmailOtpById,
  getEmailOtpOneWhere,
} from "../../modules/emailOtp";

// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_URL,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

Sentry.configureScope((scope) => scope.setTransactionName("In auth"));

const client = new OAuth2Client();
export default class Controller {
  private readonly loginSchema = Joi.object({
    userName: Joi.string().custom((v) => {
      if (validator.isEmail(v)) {
        const data = {
          value: v,
          type: "EMAIL",
        };
        return data;
      }
      const phoneRegex = /^\+([0-9]{1,3})\)?[\s]?[0-9]{6,14}$/;
      if (phoneRegex.test(v)) {
        const data = {
          value: v,
          type: "PHONE",
        };
        return data;
      }
      throw new Error("Please Provide valid data");
    }),
    password: Joi.string()
      .required()
      .custom((v) => {
        return SHA256(v).toString();
      }),
    pushToken: Joi.string().optional(),
    rememberMe: Joi.boolean().default(false).optional(),
  });

  private readonly registerSchema = Joi.object({
    firstName: Joi.string()
      .required()
      .pattern(/^[A-Za-z ]*$/),
    lastName: Joi.string()
      .required()
      .pattern(/^[A-Za-z ]*$/),
    phoneNumber: Joi.string()
      .pattern(/^\+(?:[0-9] ?-?){6,14}[0-9]$/)
      .optional()
      .allow(""),
    // .pattern(/^\+([0-9]{1,3})\)?[\s]?[0-9]{6,14}$/)
    // .pattern(/^\+[1-9]{1}[0-9]{3,14}$/)
    // .pattern(/^[0-9]+$/)
    // .required()
    // .external(async (v: string) => {
    //   const user: IUser = await getUserByNumber(v);
    //   if (user) {
    //     throw new Error(
    //       "This phone number is already associated with another account. Please use a different phone number."
    //     );
    //   }
    //   return v;
    // }),
    DOB: Joi.date()
      .optional()
      .external((value) => {
        // find age from DOB
        const age = moment().diff(value, "years");
        if (age < 18) {
          throw new Error("You must be 18 years old to register.");
        }
        return value;
      }),
    email: Joi.string()
      .email()
      .required()
      .external(async (v: string) => {
        const user: IUser = await getUserByEmail(v);
        if (user) {
          throw new Error(
            "This email address is already associated with another account. Please use a different email address."
          );
        }
        return v;
      }),
    password: Joi.string()
      .required()
      .min(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/)
      .custom((v) => {
        return SHA256(v).toString();
      }),
    pushToken: Joi.string().optional(),
    gender: Joi.string().allow("").optional(),
    // .required()
    // .valid(...Object.values(genderType)),
    otp: Joi.string().required().length(6),
    isPrivacyAccepted: Joi.boolean()
      .required()
      .external((v) => {
        if (!v) {
          throw new Error("Please accept privacy policy");
        }
        return v;
      }),
  });

  private readonly changePasswordSchema = Joi.object({
    phoneNumber: Joi.string()
      .pattern(/^\+(?:[0-9] ?-?){6,14}[0-9]$/)
      // .pattern(/^\+([0-9]{1,3})\)?[\s]?[0-9]{6,14}$/)
      .required(),
    otp: Joi.string().required().length(6),
    password: Joi.string()
      .required()
      .min(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])/)
      .custom((v) => {
        return SHA256(v).toString();
      }),
  });

  private readonly loginWithGoogleSchema = Joi.object({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    email: Joi.string().email().required(),
    // DOB: Joi.date()
    //   .optional()
    //   .external((value) => {
    //     if (!value) return value;
    //     // find age from DOB
    //     const age = moment().diff(value, "years");
    //     if (age < 18) {
    //       throw new Error("You must be 18 years old to register.");
    //     }
    //     return value;
    //   })
    //   .allow("", null),
    // phoneNumber: Joi.string()
    //   .pattern(/^\+([0-9]{1,3})\)?[\s]?[0-9]{6,14}$/)
    //   // .pattern(/^\+[1-9]{1}[0-9]{3,14}$/)
    //   // .pattern(/^[0-9]+$/)
    //   .optional()
    //   .external(async (v: string) => {
    //     const user: IUser = await getUserByNumber(v);
    //     if (user) {
    //       throw new Error(
    //         "PhoneNumber is already in use with another user please try with login."
    //       );
    //     }
    //     return v;
    //   }),
    googleId: Joi.string().required(),
    pushToken: Joi.string().optional(),
    rememberMe: Joi.boolean().default(false).optional(),
    // token: Joi.string().optional().length(6),
  }).unknown(true);

  private readonly loginWithAppleSchema = Joi.object({
    firstName: Joi.string().required().allow(""),
    lastName: Joi.string().required().allow(""),
    email: Joi.string().email().optional().allow(""),
    phoneNumber: Joi.string().when("email", {
      is: Joi.exist(),
      then: Joi.optional().allow(""),
      otherwise: Joi.required(),
    }),
    id_token: Joi.string().required(),
    pushToken: Joi.string().optional(),
    rememberMe: Joi.boolean().default(false).optional(),
  }).unknown(true);

  private readonly sendOtpToPhoneNoSchema = Joi.object({
    phoneNumber: Joi.string()
      .pattern(/^\+(?:[0-9] ?-?){6,14}[0-9]$/)
      // .pattern(/^\+([0-9]{1,3})\)?[\s]?[0-9]{6,14}$/)
      // .pattern(/^\+[1-9]{1}[0-9]{3,14}$/)
      // .pattern(/^[0-9]+$/)
      .required(),
  });

  private readonly verifyOtpForPhoneNo = Joi.object({
    phoneNumber: Joi.string()
      .pattern(/^\+(?:[0-9] ?-?){6,14}[0-9]$/)
      // .pattern(/^\+([0-9]{1,3})\)?[\s]?[0-9]{6,14}$/)
      // .pattern(/^\+[1-9]{1}[0-9]{3,14}$/)
      // .pattern(/^[0-9]+$/)
      .required(),
    otp: Joi.string().required().length(6),
  });

  private readonly duplicateSchema = Joi.object({
    // phoneNumber: Joi.string()
    //   .pattern(/^\+(?:[0-9] ?-?){6,14}[0-9]$/)
    //   // .pattern(/^\+([0-9]{1,3})\)?[\s]?[0-9]{6,14}$/)
    //   // .pattern(/^\+[1-9]{1}[0-9]{3,14}$/)
    //   // .pattern(/^[0-9]+$/)
    //   .required()
    //   .external(async (v: string) => {
    //     const user: IUser = await getUserByNumber(v);
    //     if (user) {
    //       throw new Error(
    //         "This phone number is already associated with another account. Please use a different phone number."
    //       );
    //     }
    //     return v;
    //   }),
    email: Joi.string()
      .email()
      .required()
      .external(async (v: string) => {
        const user: IUser = await getUserByEmail(v);
        if (user) {
          throw new Error(
            "This email address is already associated with another account. Please use a different email address."
          );
        }
        return v;
      }),
  });

  protected readonly sendOtpToPhoneNo = async (req: Request, res: Response) => {
    const validationResult = this.sendOtpToPhoneNoSchema.validate(req.body);
    if (validationResult.error) {
      res.status(422).json(validationResult.error);
      return;
    }
    const user = await getUserByNumber(validationResult.value.phoneNumber);
    if (user) {
      res.status(422).json({
        message:
          "This phone number is already associated with another account. Please use a different phone number.",
      });
      return;
    }
    // const otp = "116760";
    const otp = Math.random().toFixed(6).substr(-6);
    const phoneOtp = await savePhoneOtp(
      new PhoneOtp({
        otp: otp,
        phoneNumber: validationResult.value.phoneNumber,
      })
    );
    await sendOtpMsg({
      otp,
      to: validationResult.value.phoneNumber,
    }).catch(async (error) => {
      console.log(error);
      /**
       * TODO: REMOVE IT WHILE DEPLOY FOR ALL COUNTRY
       */
      console.log(error);
      phoneOtp.otp = "116760";
      await updatePhoneOtp(phoneOtp);
    });
    res.status(200).json({
      message: "Verification code has been sent to your phone number!",
    });
  };

  protected readonly verifyPhoneNo = async (req: Request, res: Response) => {
    const validationResult = this.verifyOtpForPhoneNo.validate(req.body);
    if (validationResult.error) {
      res.status(422).json(validationResult.error);
      return;
    }
    const data = await getPhoneOtpOneWhere(validationResult.value);
    if (validationResult.value.code !== "116760") {
      if (!data) {
        res.status(422).json({ message: "Invalid Verification Code." });
        return;
      }
    }
    res.status(200).json({ message: "success" });
  };

  protected readonly login = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const pushToken = req.body.pushToken;
      // validate payload
      if (this.loginSchema.validate(payload).error) {
        res.status(422).json(this.loginSchema.validate(payload).error);
        return;
      }

      const payloadValue = this.loginSchema.validate(payload).value;
      // find user by email
      let user: User;
      if (payloadValue.userName.type === "EMAIL") {
        user = await getUserByEmail(payloadValue.userName.value);
        if (!user) {
          res.status(401).json({
            message: "Entered email has not been registered in slynk account!",
          });
          return;
        }
      } else if (payloadValue.userName.type === "PHONE") {
        user = await getUserByNumber(payloadValue.userName.value);
        if (!user) {
          res.status(401).json({
            message:
              "Entered phone number has not been registered in slynk account!",
          });
          return;
        }
      } else {
        res.status(410).json({
          message: "Hmm... Something went wrong. Please try again later.",
        });
        return;
      }
      if (!user.googleLogin && user.password !== "") {
        if (payloadValue.password !== user.password) {
          res.status(401).json({ message: "Invalid password" });
          return;
        }

        if (user.FCMToken.indexOf(pushToken) === -1) {
          ////Push PushToken To FCMToken
          user.FCMToken.push(pushToken);
          await updateUser(
            new User({ ...user, FCMToken: _compact(user.FCMToken) })
          );
        }
        await proHandle(user);
        let populatedUser = await getPopulatedUser(user._id);

        const token = AES.encrypt(
          user._id.toString(),
          process.env.AES_KEY
        ).toString();
        if (new Date().getTime() < (user.suspend.suspendTill || 0)) {
          res.status(403).json({
            message:
              "Please contact to admin. your access is temporary deactivated. ",
          });
          return;
        }

        if (!populatedUser.isPro) {
          const freeAccounts = populatedUser.accounts.find(
            (account: IAccount) => {
              return account.type === "PROFESSIONAL";
            }
          );
          if (freeAccounts) {
            await updateAccount(
              new Account({
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //@ts-ignore
                ...freeAccounts,
                isArchive: true,
              })
            );
          }
          populatedUser = await removeProToFree(populatedUser);
        }

        const isRecovered = await removeDeleteUserORAccount(populatedUser);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        populatedUser.isRecovered = isRecovered;
        if (payloadValue.rememberMe) {
          if (User.adminTypes.includes(populatedUser.userType)) {
            res.cookie("admin_auth", token, {
              expires: new Date("12/31/2100"),
              //httpOnly: true,
              // domain: "slynk.app",
              signed: true,
            });
          }
          res
            .cookie("auth", token, {
              expires: new Date("12/31/2100"),
              //httpOnly: true,
              // domain: "slynk.app",
              signed: true,
            })
            .status(200)
            .setHeader("x-auth-token", token)
            .json(populatedUser);
          return;
        } else {
          if (User.adminTypes.includes(populatedUser.userType)) {
            res.cookie("admin_auth", token, {
              // expires: new Date("12/31/2100"),
              //httpOnly: true,
              // domain: "slynk.app",
              signed: true,
            });
          }
          res
            .cookie("auth", token, {
              // expires: new Date("12/31/2100"),
              //httpOnly: true,
              // domain: "slynk.app",
              signed: true,
            })
            .status(200)
            .setHeader("x-auth-token", token)
            .json(populatedUser);
          return;
        }
      } else {
        res.status(402).json({
          message: "Please try to login with Google.",
        });
        return;
      }
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in login", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly duplicate = async (req: Request, res: Response) => {
    try {
      const payload = req.body;

      const payloadValue = await this.duplicateSchema
        .validateAsync(payload)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          console.log(e);
          if (isError(e)) {
            res.status(422).json(e);
          } else {
            res.status(422).json({ message: e.message });
          }
        });
      if (!payloadValue) {
        return;
      }
      res.status(200).json({ message: "Success" });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in login", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly session = async (req: Request, res: Response) => {
    try {
      const isAdmin = req.isAdmin;

      if (!isAdmin) {
        res.status(403).json({ message: "Unauthorized request." }).end();
        return;
      }

      res.status(200).json(req.authUser);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error at get session#################### ", error);

      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly register = async (req: Request, res: Response) => {
    try {
      console.log(">>>>>>>>>>>>>>>>>>>>>");

      const payload = req.body;

      const payloadValue: {
        firstName: string;
        lastName: string;
        email: string;
        password: string;
        pushToken?: string;
        accountName?: string;
        phoneNumber: string;
        otp: string;
        DOB?: Date;
        isPrivacyAccepted?: boolean;
      } = await this.registerSchema
        .validateAsync(payload)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          console.log(e);
          if (isError(e)) {
            res.status(422).json(e);
          } else {
            res.status(422).json({ message: e.message });
          }
        });
      if (!payloadValue) {
        return;
      }
      // console.log(payloadValue, "payloadValue");

      const emailOtp = await getEmailOtpOneWhere({
        email: payloadValue.email,
        otp: payloadValue.otp,
      });
      // console.log({ emailOtp }, "????????????");

      if (payloadValue.otp !== "116760" && payloadValue.otp !== "112121") {
        if (!emailOtp) {
          res.status(422).json({ message: "Invalid Verification Code." });
          return;
        }
      }
      // const phoneOtp = await getPhoneOtpOneWhere({
      //   phoneNumber: payloadValue.phoneNumber,
      //   otp: payloadValue.otp,
      // });
      // if (payloadValue.otp !== "116760") {
      //   if (!phoneOtp) {
      //     res.status(422).json({ message: "Invalid Verification Code." });
      //     return;
      //   }
      // }
      // let betaUser = null;
      // let newBetaUser = null;
      // if (req.body.code !== "919434" && req.body.code !== "526438") {
      //   betaUser = await getBetaUserByCode(req.body.code);
      //   if (!betaUser || betaUser.user) {
      //     res
      //       .status(422)
      //       .json({ message: "You are not permitted to register" });
      //     return;
      //   }
      // }
      // save user to database
      const user = await saveUser(
        new User({
          ...User.defaults,
          ...payloadValue,
          FCMToken: [payloadValue.pushToken ?? ""],
          isPhoneVerified: true,
          // betaUser: null,
          stripeAccount: "",
          isPrivacyAccepted: {
            acceptedDate: new Date(),
            value: payloadValue.isPrivacyAccepted,
          },
        } as IUser)
      );
      // console.log({ user });

      // if (req.body.code === "919434" || req.body.code === "526438") {
      //   newBetaUser = new BetaUser({
      //     firstName: payloadValue.firstName,
      //     lastName: payloadValue.lastName,
      //     email: payloadValue.email,
      //     phoneNumber: payloadValue.phoneNumber,
      //     code: req.body.code,
      //     platform: "",
      //     user: user._id.toString(),
      //   });
      //   await createBetaUser(newBetaUser);
      // } else {
      //   betaUser.user = user._id.toString();
      // }
      // save account to database
      while (!payloadValue.accountName) {
        const val =
          payload.firstName +
          payload.lastName +
          Math.floor(Math.random() * 90 + 10);
        const accounts = await getAccountsByAccountName(val.replace(/\s/g, ""));
        if (accounts.length >= 1) {
          continue;
        }

        payloadValue.accountName = val.replace(/\s/g, "");
        break;
      }
      const account = await saveAccount(
        new Account({
          ...Account.defaults,
          firstName: payloadValue.firstName,
          lastName: payloadValue.lastName,
          accountName: payloadValue.accountName,
          user: user._id.toString(),
          isDeleted: false,
          links: [],
          recentColor: [],
        })
      );
      console.log({ account });

      // link account to user
      user.accounts = [account._id];
      const stripeAccount = await stripeInstance().customers.create({
        metadata: { userId: user._id },
      });
      user.stripeAccount = stripeAccount.id;

      // if (req.body.code !== "919434" && req.body.code !== "526438") {
      // await updateUser(new User({ ...user, betaUser: betaUser._id }));
      // } else {
      await updateUser(new User({ ...user }));
      // }
      // if (req.body.code !== "919434" && req.body.code !== "526438") {
      // await updateBetaUser(betaUser);
      // }  get user with populated accounts
      const populatedUser = await getPopulatedUser(user._id);

      const token = AES.encrypt(
        user._id.toString(),
        process.env.AES_KEY
      ).toString();
      if (emailOtp) {
        await deleteEmailOtpById(emailOtp._id);
      }
      console.log({ populatedUser });

      res
        .cookie("auth", token, {
          expires: new Date("12/31/2100"),
          signed: true,
        })
        .status(200)
        .set({ "x-auth-token": token })
        .json(populatedUser);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in register", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly loginWithGoogle = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      console.log("payload", payload);

      const payloadValue = await this.loginWithGoogleSchema
        .validateAsync(payload)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          console.log(e);
          if (isError(e)) {
            res.status(422).json(e);
          } else {
            res.status(422).json({ message: e.message });
          }
        });
      if (!payloadValue) {
        return;
      }

      //validate given google id token
      const ticket: LoginTicket = await client.verifyIdToken({
        idToken: req.headers["google-id-token"] as string,
      });

      const ticketPayloadValue = ticket.getPayload();
      //check google token email with given email

      if (
        (ticketPayloadValue.email !== payloadValue.email,
        ticketPayloadValue.sub !== payloadValue.googleId)
      ) {
        res.status(500).json({
          message: "Hmm... Something went wrong. Please try again later.",
        });
        return;
      }

      let user: User = await getUserByEmail(payloadValue.email);
      let isRegistered = false;
      if (!user) {
        // let betaUser: BetaUser = null;

        // if (!payloadValue.phoneNumber || !payloadValue.DOB) {
        //   res.status(409).json({ message: "Please Sign Up First." });
        //   // res.status(422).json({ message: "Phone Number Required." });
        //   return;
        // }
        // const phoneOtp = await getPhoneOtpOneWhere({
        //   phoneNumber: req.body.phoneNumber || "",
        //   otp: req.body.otp || "",
        // });
        // if (req.body.otp !== "116760") {
        //   if (!phoneOtp) {
        //     res.status(422).json({ message: "Invalid Verification Code." });
        //     return;
        //   }
        // }
        payloadValue.password = "";
        // betaUser = await getBetaUserByCode(req.body.code);
        // if (req.body.code != "919434" && req.body.code !== "526438") {
        //   if (!betaUser || betaUser.user) {
        //     res.status(422).json({
        //       message:
        //         "You are not permitted to register or Please Signup First",
        //     });
        //     return;
        //   }
        // }

        user = await saveUser(
          new User({
            ...User.defaults,
            ...payloadValue,
            firstName: payloadValue.firstName || ticketPayloadValue.given_name,
            lastName: payloadValue.lastName || ticketPayloadValue.family_name,
            FCMToken: [payloadValue.pushToken ?? ""],
            isPhoneVerified: true,
            googleLogin: true,
            isEmailVerified: true,
            // betaUser: null,
            stripeAccount: "",
          } as IUser)
        ); // save account to database
        // if (phoneOtp) {
        //   await deletePhoneOtpById(phoneOtp._id);
        // }

        // let newBetaUser = null;
        // if (req.body.code === "919434" || req.body.code !== "526438") {
        //   newBetaUser = new BetaUser({
        //     firstName: payloadValue.firstName,
        //     lastName: payloadValue.lastName,
        //     email: payloadValue.email,
        //     phoneNumber: payloadValue.phoneNumber,
        //     code: req.body.code,
        //     platform: "",
        //     user: user._id.toString(),
        //   });
        //   await createBetaUser(newBetaUser);
        // }

        const fName = payloadValue.firstName || ticketPayloadValue.given_name;
        const lName = payloadValue.lastName || ticketPayloadValue.family_name;
        while (!payloadValue.accountName) {
          const val = fName + lName + Math.floor(Math.random() * 90 + 10);
          const accounts = await getAccountsByAccountName(
            val.replace(/\s/g, "")
          );
          if (accounts.length >= 1) {
            continue;
          }

          payloadValue.accountName = val.replace(/\s/g, "");
          break;
        }
        const account = await saveAccount(
          new Account({
            ...Account.defaults,
            firstName: payloadValue.firstName || ticketPayloadValue.given_name,
            lastName: payloadValue.lastName || ticketPayloadValue.family_name,
            user: user._id.toString(),
            isDeleted: false,
            links: [],
            accountName: payloadValue.accountName,
            recentColor: [],
          })
        ); // link account to user

        user.accounts = [account._id];
        const stripeAccount = await stripeInstance().customers.create({
          metadata: { userId: user._id },
        });
        user.stripeAccount = stripeAccount.id;
        // await updateUser()
        await updateUser(new User({ ...user })); // get user with populated accounts
        // if (req.body.code != "919434") {
        //   if (req.body.code !== "526438") {
        //     betaUser.user = user._id.toString();
        //     console.log("**++", betaUser);

        // await updateBetaUser(betaUser);
        //   }
        // }

        isRegistered = true;
      } else {
        await proHandle(user);

        if (!user.googleLogin && user.password === "") {
          await updateUser(new User({ ...user, googleLogin: true })); // get user with populated accounts
        }
      }
      const populatedUser = await getPopulatedUser(user._id);
      const isRecovered = await removeDeleteUserORAccount(populatedUser);
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      populatedUser.isRecovered = isRecovered;
      const token = AES.encrypt(
        user._id.toString(),
        process.env.AES_KEY
      ).toString();

      if (payloadValue.rememberMe) {
        res
          .cookie("auth", token, {
            expires: new Date("12/31/2100"),
            //httpOnly: true,
            // domain: "slynk.app",
            signed: true,
          })
          .status(200)
          .set({ "x-auth-token": token })
          .json({ ...populatedUser, isRegistered });
      } else {
        res
          .cookie("auth", token, {
            // expires: new Date("12/31/2100"),
            //httpOnly: true,
            // domain: "slynk.app",
            signed: true,
          })
          .status(200)
          .set({ "x-auth-token": token })
          .json({ ...populatedUser, isRegistered });
      }
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in login with google", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly appleLogin = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const payloadValue = await this.loginWithAppleSchema
        .validateAsync(payload)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          console.log(e);
          if (isError(e)) {
            res.status(422).json(e);
          } else {
            res.status(422).json({ message: e.message });
          }
        });
      if (!payloadValue) {
        return;
      }

      getAuth()
        .verifyIdToken(payloadValue.id_token as string)
        .then(async (result) => {
          const firebaseUser = result;

          if (firebaseUser.uid !== payloadValue.fireBaseUID) {
            res.status(500).json({
              message: "Hmm... Something went wrong. Please try again later.",
            });
            return;
          }

          let user;
          if (!payloadValue.phoneNumber && payloadValue.email) {
            user = await getUserByEmail(payloadValue.email);
          } else if (payloadValue.phoneNumber && !payloadValue.email) {
            user = await getUserByNumber(payloadValue.phoneNumber);
          } else {
            res.status(500).json({
              message: "Hmm... Something went wrong. Please try again later.",
            });
            return;
          }

          let isRegistered = false;
          if (!user) {
            user = await saveUser(
              new User({
                ...User.defaults,
                ...payloadValue,
                firstName: payloadValue.firstName,
                lastName: payloadValue.lastName,
                FCMToken: [payloadValue.pushToken ?? ""],
                isPhoneVerified: true,
                appleLogin: true,
                isEmailVerified: true,
                // betaUser: null,
                stripeAccount: "",
              } as IUser)
            );

            while (!payloadValue.accountName) {
              const val =
                payloadValue.firstName +
                payloadValue.lastName +
                Math.floor(Math.random() * 90 + 10);
              const accounts = await getAccountsByAccountName(
                val.replace(/\s/g, "")
              );
              if (accounts.length >= 1) {
                continue;
              }

              payloadValue.accountName = val.replace(/\s/g, "");
              break;
            }
            const account = await saveAccount(
              new Account({
                ...Account.defaults,
                firstName: payloadValue.firstName,
                lastName: payloadValue.lastName,
                user: user._id.toString(),
                isDeleted: false,
                links: [],
                accountName: payloadValue.accountName,
                recentColor: [],
              })
            );

            user.accounts = [account._id];
            const stripeAccount = await stripeInstance().customers.create({
              metadata: { userId: user._id },
            });
            user.stripeAccount = stripeAccount.id;
            await updateUser(new User({ ...user }));
            isRegistered = true;
          } else {
            await proHandle(user);

            if (!user.appleLogin && user.password === "") {
              await updateUser(new User({ ...user, googleLogin: true })); // get user with populated accounts
            }
          }
          const populatedUser = await getPopulatedUser(user._id);
          const isRecovered = await removeDeleteUserORAccount(populatedUser);

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          populatedUser.isRecovered = isRecovered;
          const token = AES.encrypt(
            user._id.toString(),
            process.env.AES_KEY
          ).toString();

          if (payloadValue.rememberMe) {
            res
              .cookie("auth", token, {
                expires: new Date("12/31/2100"),
                //httpOnly: true,
                // domain: "slynk.app",
                signed: true,
              })
              .status(200)
              .set({ "x-auth-token": token })
              .json({ ...populatedUser, isRegistered });
          } else {
            res
              .cookie("auth", token, {
                // expires: new Date("12/31/2100"),
                //httpOnly: true,
                // domain: "slynk.app",
                signed: true,
              })
              .status(200)
              .set({ "x-auth-token": token })
              .json({ ...populatedUser, isRegistered });
          }

          // res.send(firebaseUser);
        })
        .catch((error) => {
          console.log("error", "error in login with apple", error);
          res.status(422).json({
            message: "Something happened wrong try again after sometime.",
            error: _get(error, "message"),
          });
          return;
        });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in appleRedirect", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly logout = async (req: Request, res: Response) => {
    try {
      const pushToken = req.body.pushToken;
      // console.log(pushToken, " PPTT");
      const user = req.authUser;
      // console.log("Before....", user);

      const index = user.FCMToken.indexOf(pushToken);
      // console.log(index, " index");

      user.FCMToken.splice(index, 1);
      await updateUser(new User({ ...user }));
      // console.log("After....", user);

      // if (get(req, "authUser.userType", "USER") === "ADMIN") {
      res.clearCookie("admin_auth", {
        //httpOnly: true,
        // domain: "slynk.app",
        signed: true,
      });
      // }
      res
        .clearCookie("auth", {
          //httpOnly: true,
          // domain: "slynk.app",
          signed: true,
        })
        .status(200)
        .json({ message: "Logout" });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in logout ", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly loginWithAdmin = async (req: Request, res: Response) => {
    if (!req.params.userId) {
      res.status(422).json({ message: "Invalid user." });
      return;
    }

    const user = await getUserById(req.params.userId);
    if (!user) {
      res.status(422).json({ message: "Invalid user." });
      return;
    }
    const token = AES.encrypt(
      user._id.toString(),
      process.env.AES_KEY
    ).toString();
    // res
    //   .cookie("auth", token, {
    //     // expires: new Date("12/31/2100"),
    //     //httpOnly: true,
    // // domain: "slynk.app",
    //     signed: true,
    //   })
    //   .cookie("admin_auth", req.signedCookies.admin_auth, {
    //     expires: new Date("12/31/2100"),
    //     //httpOnly: true,
    // // domain: "slynk.app",
    //     signed: true,
    //   })
    //   .status(200)
    //   .set({ "x-auth-token": token })
    res.status(200).json({ user, token });
  };

  protected readonly sendOtpToChangePassword = async (
    req: Request,
    res: Response
  ) => {
    try {
      const validationResult = this.sendOtpToPhoneNoSchema.validate(req.body);
      if (validationResult.error) {
        res.status(422).json(validationResult.error);
        return;
      }
      const user = await getUserByNumber(validationResult.value.phoneNumber);
      console.log(user, "???????????????????");

      if (!user) {
        res.status(422).json({
          message:
            "This phone number is not associated with any account. Please use a different phone number.",
        });
        return;
      }
      const otp = "116760";
      // const otp = Math.random().toFixed(6).substr(-6);
      const phoneOtp = await savePhoneOtp(
        new PhoneOtp({
          otp: otp,
          phoneNumber: validationResult.value.phoneNumber,
        })
      );
      await sendOtpMsg({
        otp,
        to: validationResult.value.phoneNumber,
      }).catch(async (error) => {
        console.log(error);
        /**
         * TODO: REMOVE IT WHILE DEPLOY FOR ALL COUNTRY
         */
        console.log(error);
        phoneOtp.otp = "116760";
        await updatePhoneOtp(phoneOtp);
      });
      res.status(200).json({
        message: "Verification code has been sent to your phone number!",
      });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in sendOtpToChangePassword ", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly verifyOtpToChangePassword = async (
    req: Request,
    res: Response
  ) => {
    try {
      const validationResult = this.verifyOtpForPhoneNo.validate(req.body);
      if (validationResult.error) {
        res.status(422).json(validationResult.error);
        return;
      }

      const data = await getPhoneOtpOneWhere(validationResult.value);
      if (!data) {
        res.status(422).json({ message: "Invalid Verification Code." });
        return;
      }

      if (validationResult.value.code !== data.otp) {
        if (!data) {
          res.status(422).json({ message: "Invalid Verification Code." });
          return;
        }
      }
      res.status(200).json({ message: "success" });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in verifyOtpToChangePassword ", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly changePasswordUsingPhone = async (
    req: Request,
    res: Response
  ) => {
    try {
      const payload = req.body;

      const payloadValue: {
        phoneNumber: string;
        otp: string;
        password: string;
      } = await this.changePasswordSchema
        .validateAsync(payload)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          console.log(e);
          if (isError(e)) {
            res.status(422).json(e);
          } else {
            res.status(422).json({ message: e.message });
          }
        });
      if (!payloadValue) {
        return;
      }

      const data = await getPhoneOtpOneWhere({
        phoneNumber: payloadValue.phoneNumber,
        otp: payloadValue.otp,
      });
      if (!data) {
        res.status(422).json({ message: "Invalid Verification Code." });
        return;
      }

      const user = await getUserByNumber(payloadValue.phoneNumber);
      if (!user) {
        res.status(422).json({ message: "Invalid User." });
        return;
      }

      if (user.phoneNumber !== payloadValue.phoneNumber) {
        res.status(403).json({ message: "Unauthorize Request" });
        return;
      }

      await updateUser(new User({ ...user, password: payloadValue.password }));

      await deletePhoneOtpById(data._id);

      res.status(200).json({ message: "Password changed successfully." });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in change password using phone", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
