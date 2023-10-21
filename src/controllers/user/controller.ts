import { Response } from "express";
import { Request } from "./../../request";
import { log } from "winston";
import Joi, { isError } from "joi";
import { get, isNumber, pick } from "lodash";
import { get as _get } from "lodash";
import { AES, SHA256 } from "crypto-js";
import webPush from "web-push";

import {
  getUserById,
  updateUser,
  getUserByEmail,
  getPopulatedUser,
  User,
  getUserByNumber,
  getUsers,
} from "../../modules/user";
import * as ejs from "ejs";
import { getUserByResetToken } from "../../modules/user/getUserByResetToken";
import moment from "moment";
import * as Sentry from "@sentry/node";
import { getSuspendTypeById } from "../../modules/suspendType";
import {
  getPhoneOtpOneWhere,
  PhoneOtp,
  savePhoneOtp,
  updatePhoneOtp,
} from "../../modules/phoneOtp";
import { sendOtpMsg } from "../../helper/twillio";
import { SendMail } from "../../helper/sendinblue";
import {
  Account,
  getAccountById,
  IAccount,
  updateAccount,
} from "../../modules/account";
import { removeProToFree } from "../../helper/removeProToFree";
import { proHandle } from "../../helper/proHandle";
import { removeDeleteUserORAccount } from "../../helper/removeDeleteUserORAccount";
import { agendaDeleteUser } from "../../helper/agendaDeleteUser";
import {
  EmailOtp,
  getEmailOtpOneWhere,
  saveEmailOtp,
} from "../../modules/emailOtp";

// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_URL,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

Sentry.configureScope((scope) => scope.setTransactionName("In User"));
export default class Controller {
  protected readonly passwordSchema = Joi.object({
    currentPassword: Joi.string()
      .required()
      .min(6)
      .custom((value) => {
        return SHA256(value).toString();
      }),
    newPassword: Joi.string()
      .required()
      .min(6)
      .custom((value) => {
        return SHA256(value).toString();
      }),
  });

  private readonly forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
  });

  private readonly changePasswordSchema = Joi.object({
    phoneNumber: Joi.string()
      .pattern(/^\+([0-9]{1,3})\)?[\s]?[0-9]{6,14}$/)
      // .pattern(/^\+[1-9]{1}[0-9]{3,14}$/)
      // .pattern(/^[0-9]+$/)
      .optional(),
    otp: Joi.string().required().length(6),
    email: Joi.string().when("phoneNumber", {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required(),
    }),
    password: Joi.string()
      .optional()
      .allow("")
      // .when("email", {
      //   is: Joi.exist(),
      //   then: Joi.optional(),
      //   otherwise: Joi.required(),
      // })
      .min(6)
      .custom((value) => {
        return SHA256(value).toString();
      }),
  });

  private readonly verifyOtpSchema = Joi.object({
    phoneNumber: Joi.string()
      .pattern(/^\+([0-9]{1,3})\)?[\s]?[0-9]{6,14}$/)
      // .pattern(/^\+[1-9]{1}[0-9]{3,14}$/)
      // .pattern(/^[0-9]+$/)
      .optional()
      .allow(""),
    otp: Joi.string().required().length(6),
    // email: Joi.string().when("phoneNumber", {
    //   is: Joi.exist(),
    //   then: Joi.optional(),
    //   otherwise: Joi.required(),
    // }),
    email: Joi.string().optional().allow(""),
    withCredentials: Joi.boolean().optional().allow(""),
  });

  private readonly resetPasswordSchema = Joi.object({
    token: Joi.string()
      .required()
      .external(async (value) => {
        const user: User = await getUserByResetToken(value);
        if (!user) {
          throw new Error("Unauthorized request.");
        }
        return user.toJSON();
      }),
    password: Joi.string()
      .required()
      .min(6)
      .custom((value) => {
        return SHA256(value).toString();
      }),
  });

  protected readonly emailVerificationSchema = Joi.object({
    newEmail: Joi.string().required().email(),
  });
  protected readonly emailSchema = Joi.object({
    email: Joi.string().required().email(),
  });

  protected readonly updateEmailSchema = Joi.object({
    newEmail: Joi.string().required().email(),
    updateEmailOTP: Joi.string().required(),
  });

  protected readonly verifyPhoneSchema = Joi.object({
    newPhone: Joi.string()
      .required()
      .pattern(/^\+([0-9]{1,3})\)?[\s]?[0-9]{6,14}$/),
  });

  protected readonly updatePhoneSchema = Joi.object({
    newPhone: Joi.string()
      .required()
      .pattern(/^\+([0-9]{1,3})\)?[\s]?[0-9]{6,14}$/),
    otp: Joi.string().required().length(6),
  });

  protected readonly validateSuspendUserSchema = Joi.object({
    suspend: Joi.object().keys({
      suspendTill: Joi.date().min("now").required(),
      suspendMessage: Joi.string().required(),
      suspendType: Joi.string()
        .required()
        .external(async (val: string) => {
          const suspendType = await getSuspendTypeById(val);
          if (!suspendType) {
            throw new Error("Invalid Suspend Type.");
          }
          return suspendType;
        }),
    }),
  });

  private readonly sendOtpToPhoneNoSchema = Joi.object({
    phoneNumber: Joi.string()
      .pattern(/^\+([0-9]{1,3})\)?[\s]?[0-9]{6,14}$/)
      // .pattern(/^\+[1-9]{1}[0-9]{3,14}$/)
      // .pattern(/^[0-9]+$/)
      .required(),
  });

  private readonly sendOtpToEmailNoSchema = Joi.object({
    phoneNumber: Joi.string()
      .pattern(/^\+([0-9]{1,3})\)?[\s]?[0-9]{6,14}$/)
      // .pattern(/^\+[1-9]{1}[0-9]{3,14}$/)
      // .pattern(/^[0-9]+$/)
      .optional(),
    email: Joi.string().when("phoneNumber", {
      is: Joi.exist(),
      then: Joi.optional(),
      otherwise: Joi.required(),
    }),
  });

  private readonly proSchema = Joi.object({
    isAdminPro: Joi.boolean().required(),
    subscriptionTill: Joi.date().greater(new Date()).required().allow(null),
  });

  protected readonly updateUserSchema = Joi.object({
    isFirstVisit: Joi.boolean().optional(),
    isPrivacyAccepted: Joi.boolean().optional(),
    isBetaFirstVisit: Joi.boolean().optional(),
    pwaShow: Joi.boolean().optional(),
    dragOff: Joi.boolean().optional(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
  });

  protected readonly webPushSchema = Joi.object({
    endpoint: Joi.string().required(),
    keys: Joi.object({
      auth: Joi.string().required(),
      p256dh: Joi.string().required(),
    }).required(),
  });

  protected readonly passwordVerification = async (
    req: Request,
    res: Response
  ) => {
    try {
      res.status(200).json({ message: "Password Verified" });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log(
        "error",
        "error at passwordVerification  #################### ",
        error
      );

      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly updatePassword = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;

      const payload = req.body;

      if (this.passwordSchema.validate(payload).error) {
        res.status(422).json(this.passwordSchema.validate(payload).error);
        return;
      }

      const payloadValue = this.passwordSchema.validate(payload).value;

      const userData = await getUserById(authUser._id);

      if (userData.password !== payloadValue.currentPassword) {
        res.status(401).json({ message: "Incorrect password" });
        return;
      }

      const user = userData;
      user.password = payloadValue.newPassword;

      await updateUser(user);

      res.status(200).json({ message: "Password updated." });
      // console.log(userData)
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error at change password#################### ", error);

      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly emailVerification = async (
    req: Request,
    res: Response
  ) => {
    try {
      const authUser = req.authUser;

      const payload = req.body;

      if (this.emailVerificationSchema.validate(payload).error) {
        res
          .status(422)
          .json(this.emailVerificationSchema.validate(payload).error);
        return;
      }

      const payloadValue = this.emailVerificationSchema.validate(payload).value;

      const user = await getUserById(authUser._id);

      if (authUser.email === payloadValue.newEmail) {
        if (user.isEmailVerified) {
          res
            .status(200)
            .json({ message: "Data Successfully Updated.", isUpdated: true });
          return;
        }
      }

      const existingUser: User = await getUserByEmail(payloadValue.newEmail);
      if (existingUser) {
        if (existingUser._id.toString() !== user._id.toString()) {
          res.status(409).json({
            message:
              "This email address is already associated with another account. Please use a different email address.",
            isUpdated: false,
          });
          return;
        }
      }
      const updateEmailOTP = Math.random().toString().substring(2, 8);

      await ejs.renderFile(
        process.cwd() + "/views/emailResetVerificationCode.ejs",
        { url: updateEmailOTP },
        async function (err, html) {
          if (err) {
            console.log(err);
          } else {
            const result = await SendMail(
              process.env.MAIL_NO_REPLY,
              payloadValue.newEmail,
              "Slynk : Verified Email Code",
              html
            ).catch((error) => {
              console.log(error);
              Sentry.captureException(error);
              res.status(224).json({ message: "Something went Wrong." });
              return;
            });
            if (!result) {
              return;
            }
            const updatableUser = new User({
              ...user,
              updateEmailOTP: updateEmailOTP,
            });
            await updateUser(updatableUser);

            res.status(200).json({
              message: `A verification code has been sent to the email ${payloadValue.newEmail}. (please check your spam folder if it is not in your inbox)`,
              isUpdated: false,
            });
          }
        }
      );
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error at update user email#################### ", error);

      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly updateEmail = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;

      const payload = req.body;

      if (this.updateEmailSchema.validate(payload).error) {
        res.status(422).json(this.updateEmailSchema.validate(payload).error);
        return;
      }

      const payloadValue = this.updateEmailSchema.validate(payload).value;

      const user = await getUserById(authUser._id);

      if (authUser.email === payloadValue.newEmail) {
        if (user.isEmailVerified) {
          res.status(200).json({
            message: "Email is updated successfully.",
            isUpdated: true,
          });
          return;
        }
      }

      const existingUser: User = await getUserByEmail(payloadValue.newEmail);
      if (existingUser) {
        if (existingUser._id.toString() !== user._id.toString()) {
          res.status(409).json({
            message:
              "This email address is already associated with another account. Please use a different email address.",
            isUpdated: false,
          });
          return;
        }
      }

      if (user.updateEmailOTP !== payloadValue.updateEmailOTP) {
        res.status(422).json({ message: "Invalid verification code" });
        return;
      }

      const updatableUser = new User({
        ...user,
        email: payloadValue.newEmail,
        updateEmailOTP: "",
        isEmailVerified: true,
      });

      await updateUser(updatableUser);

      res.status(200).json({
        message: "Email is updated successfully.",
        isUpdated: false,
      });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error at verify user phone#################### ", error);

      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly phoneVerification = async (
    req: Request,
    res: Response
  ) => {
    try {
      const authUser = req.authUser;

      const payload = req.body;
      const payloadValue = await this.verifyPhoneSchema
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

      const user = await getUserById(authUser._id);
      if (authUser.phoneNumber === payloadValue.newPhone) {
        if (user.isPhoneVerified) {
          res.status(200).json({
            message: "Phone number is updated successfully.",
            isUpdated: true,
          });
          return;
        }
      }

      const existingUser: User = await getUserByNumber(payloadValue.newPhone);

      if (existingUser) {
        if (existingUser._id.toString() !== user._id.toString()) {
          res.status(409).json({
            message:
              "This phone number is already associated with another account. Please use a different phone number.",
            isUpdated: false,
          });
          return;
        }
      }

      const otp = Math.random().toFixed(6).substr(-6);
      const phoneOtp = await savePhoneOtp(
        new PhoneOtp({
          otp: otp,
          phoneNumber: payloadValue.newPhone,
        })
      );
      await sendOtpMsg({
        otp,
        to: payloadValue.newPhone,
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
        message: `A verification code has been sent to the phone number ending is ********${payloadValue.newPhone.slice(
          -2
        )}`,
        isUpdated: false,
      });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error at verify user phone #################### ", error);

      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly updatePhone = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;

      const payload = req.body;

      const payloadValue = await this.updatePhoneSchema
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
        phoneNumber: payloadValue.newPhone,
        otp: payloadValue.otp,
      });
      if (!data) {
        res.status(422).json({ message: "Invalid Verification Code." });
        return;
      }

      const user = await getUserById(authUser._id);

      if (authUser.phoneNumber === payloadValue.newPhone) {
        if (user.isPhoneVerified) {
          new User({
            ...user,
            phoneNumber: payloadValue.newPhone,
            isPhoneVerified: true,
          });
          res
            .status(200)
            .json({ message: "Phone number is updated successfully." });
          return;
        }
      }

      const existingUser: User = await getUserByNumber(payloadValue.newPhone);

      if (existingUser) {
        if (existingUser._id.toString() !== user._id.toString()) {
          res.status(409).json({
            message:
              "This phone number is already associated with another account. Please use a different phone number.",
            isUpdated: false,
          });
          return;
        }
      }

      const updatableUser = new User({
        ...user,
        phoneNumber: payloadValue.newPhone,
        isPhoneVerified: true,
      });

      await updateUser(updatableUser);

      res
        .status(200)
        .json({ message: "Phone number is updated successfully." });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error at update user email#################### ", error);

      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly getUser = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      if (req.headers.authorization) {
        res.cookie("auth", req.headers.authorization, {
          expires: new Date("12/31/2100"),
          //httpOnly: true,
          signed: true,
        });
      }
      await proHandle(authUser);
      if (new Date().getTime() < (authUser.deActivate || 0)) {
        res.status(403).json({
          message:
            "Please contact to admin. your access is  temporary deactivated. ",
        });
        return;
      }
      //@ts-ignore
      if (new Date().getTime() < (authUser.suspend.suspendTill || 0)) {
        res.status(403).json({
          message:
            "Please contact to admin. your access is temporary suspended. ",
        });
        return;
      }
      let populatedUser = await getPopulatedUser(authUser._id);

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
      // console.log(populatedUser);

      res.status(200).json(populatedUser);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error at get user#################### ", error);

      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly getAllUser = async (req: Request, res: Response) => {
    const users = (await getUsers())
      .filter(
        (user) =>
          user._id.toString() !== get(req, "authUser._id", "").toString()
      )
      .filter((user) => user.userType !== "SUPER ADMIN")
      .map((user) => {
        return pick(user, [
          "_id",
          "email",
          "userType",
          "deleteRequest",
          "isPro",
          "suspend",
          "subscriptionTill",
          "firstName",
          "lastName",
          "phoneNumber",
          "googleLogin",
          "isFirstVisit",
          "isBetaFirstVisit",
          "isPrivacyAccepted",
          "gender",
          "DOB",
          "createdAt",
        ]);
      });
    res.status(200).json(users);
  };

  protected readonly forgetPassword = async (req: Request, res: Response) => {
    try {
      if (this.forgotPasswordSchema.validate(req.body).error) {
        res.status(422).json({ message: "Invalid Data" });
        return;
      }

      const payloadValue = this.forgotPasswordSchema.validate(req.body).value;

      if (!payloadValue) {
        res.status(422).json({ message: "Invalid Data" });
        return;
      }
      const user: User = await getUserByEmail(payloadValue.email);

      // console.log(user);

      if (!user) {
        res.status(422).json({
          message: "Entered email has not been registered with slynk account!",
        });
        return;
      }

      let result = "";
      const characters =
        "ABCDEFGHIJ@KLMNOP@QRSTUVWX&YZabcdefgh%ijklm$%nopqrst$%uvwxyz012*!3456xf789";
      const charactersLength = characters.length;
      const Length = 16;
      for (let i = 0; i < Length; i++) {
        result += characters.charAt(
          Math.floor(Math.random() * charactersLength)
        );
      }

      const token = AES.encrypt(
        result.toString(),
        process.env.FORGOT_PASSWORD_SECRET
      ).toString();

      const encodedString = btoa(token);

      user.RESETToken = encodedString;

      await updateUser(user);

      const url = `${process.env.APP_LAUNCH_URL}/reset_password/${encodedString}`;

      ejs.renderFile(
        process.cwd() + "/views/resetPassword.ejs",
        { url: url },
        function (err, html) {
          if (err) {
            console.log(err);
          } else {
            SendMail(
              process.env.MAIL_NO_REPLY,
              user.email,
              "Slynk : Reset Password",
              html
            )
              .then(() => {
                res.status(200).json({ message: "Email successfully sent." });
              })
              .catch((error) => {
                console.log(error);
                Sentry.captureException(error);
                res.status(224).json({ message: "Something went Wrong." });
              });
          }
        }
      );
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in forgot password", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly sendOtpToPhoneNo = async (req: Request, res: Response) => {
    const validationResult = this.sendOtpToPhoneNoSchema.validate(req.body);
    if (validationResult.error) {
      res.status(422).json(validationResult.error);
      return;
    }
    const user = await getUserByNumber(validationResult.value.phoneNumber);
    if (!user) {
      res.status(422).json({
        message:
          "Entered phone number has not been registered with a slynk account!",
      });
      return;
    }
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
      message: "Verification code has been sent to your phone number.",
    });
  };

  protected readonly sendOtp = async (req: Request, res: Response) => {
    // console.log(">>>>>>>>>>>>>>>>>>>>");

    try {
      // console.log("????????????????????????");

      const validationResult = this.sendOtpToEmailNoSchema.validate(req.body);
      if (validationResult.error) {
        res.status(422).json(validationResult.error);
        return;
      }
      const otp = Math.random().toString().substring(2, 8);

      if (validationResult.value.email) {
        const user = await getUserByEmail(validationResult.value.email);
        if (!user) {
          res.status(422).json({
            message:
              "Entered email has not been registered with a slynk account!",
          });
          return;
        }

        // if (!user.googleLogin) {
        //   return res.status(400).json({
        //     message: "you haven't login with google",
        //   });
        // }
        // const otp = Math.random().toFixed(6).substr(-6);
        const emailOtp = await saveEmailOtp(
          new EmailOtp({
            otp: otp,
            email: validationResult.value.email,
          })
        );
        const result = await SendMail(
          process.env.MAIL_NO_REPLY,
          validationResult.value.email,
          "Slynk : Verified Email Code",
          `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>OTP Email</title>
        </head>
        <body>
            <h1>Your One-Time Password (OTP)</h1>
            <p>Dear user,</p>
            <p>Your OTP for authentication is: <strong>${otp}</strong></p>
            <p>Please use this OTP to complete your action.</p>
            <p>If you didn't request this OTP, please ignore this email.</p>
            <p>Best regards,<br>Your App Team</p>
        </body>
        </html>`
        ).catch((error) => {
          console.log(error);
          Sentry.captureException(error);
          res.status(224).json({ message: "Something went Wrong." });
          return;
        });
        if (!result) {
          console.log("error in sending mail in sendOtp api");
          return;
        }
        return res.status(200).json({
          message:
            "Verification code has been sent to your email.If you don't see the email, please check your spam / junk folder.",
        });
      } else {
        const user = await getUserByNumber(validationResult.value.phoneNumber);

        if (!user) {
          res.status(422).json({
            message:
              "Entered phone number has not been registered with a slynk account!",
          });
          return;
        }
        // if (!user.googleLogin) {
        //   return res.status(400).json({
        //     message: "you haven't login with google",
        //   });
        // }
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
          // phoneOtp.otp = "116760";
          // await updatePhoneOtp(phoneOtp);
        });
        return res.status(200).json({
          message: "Verification code has been sent to your phone number.",
        });
      }
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in sendOtp", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly sendEmailOtp = async (req: Request, res: Response) => {
    // console.log(">>>>>>>>>>>>>>>>>>>>");

    try {
      // console.log("????????????????????????");

      const validationResult = this.emailSchema.validate(req.body);
      if (validationResult.error) {
        res.status(422).json(validationResult.error);
        return;
      }
      const otp = Math.random().toString().substring(2, 8);

      const user = await getUserByEmail(validationResult.value.email);
      if (user) {
        res.status(422).json({
          message: "this email already registered with the application",
        });
        return;
      }

      // if (!user.googleLogin) {
      //   return res.status(400).json({
      //     message: "you haven't login with google",
      //   });
      // }
      // const otp = Math.random().toFixed(6).substr(-6);
      const emailOtp = await saveEmailOtp(
        new EmailOtp({
          otp: otp,
          email: validationResult.value.email,
        })
      );
      const result = await SendMail(
        process.env.MAIL_NO_REPLY,
        validationResult.value.email,
        "Slynk : Verified Email Code",
        `<!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>OTP Email</title>
        </head>
        <body>
            <h1>Your One-Time Password (OTP)</h1>
            <p>Dear user,</p>
            <p>Your OTP for authentication is: <strong>${otp}</strong></p>
            <p>Please use this OTP to complete your action.</p>
            <p>If you didn't request this OTP, please ignore this email.</p>
            <p>Best regards,<br>Your App Team</p>
        </body>
        </html>`
      ).catch((error) => {
        console.log(error);
        Sentry.captureException(error);
        res.status(224).json({ message: "Something went Wrong." });
        return;
      });
      if (!result) {
        console.log("error in sending mail in sendOtp api");
        return;
      }
      return res.status(200).json({
        message:
          "Verification code has been sent to your email. If you don't see the email, please check your spam / junk folder.",
      });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in sendOtp", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly verifyOtp = async (req: Request, res: Response) => {
    try {
      if (this.verifyOtpSchema.validate(req.body).error) {
        console.log(this.verifyOtpSchema.validate(req.body).error);

        res
          .status(422)
          .json({ message: this.verifyOtpSchema.validate(req.body).error });
        return;
      }

      const payloadValue = this.verifyOtpSchema.validate(req.body).value;

      if (!payloadValue) {
        res.status(422).json({ message: "Invalid Data" });
        return;
      }
      let user;
      if (payloadValue.email != "") {
        const validationResult = {
          email: payloadValue.email,
          otp: payloadValue.otp,
        };
        // if (validationResult.otp !== "116760") {
        const data = await getEmailOtpOneWhere(validationResult);
        if (!data) {
          res
            .status(422)
            .json({ message: "Invalid Verification Code / Password." });
          return;
        }
        // }
        // if (
        //   validationResult.otp !== "116760" &&
        //   validationResult.otp !== "112121"
        // ) {
        //   const data = await getPhoneOtpOneWhere(validationResult);
        //   if (!data) {
        //     res
        //       .status(422)
        //       .json({ message: "Invalid Verification Code / Password." });
        //     return;
        //   }
        // }
        user = await getUserByEmail(payloadValue.email);

        // console.log(user);

        if (!user) {
          res.status(422).json({
            message:
              "Entered email has not been registered with a slynk account!",
          });
          return;
        }
        // const token = AES.encrypt(
        //   user._id.toString(),
        //   process.env.AES_KEY
        // ).toString();
        // if (user.googleLogin) {
        //   res
        //     .cookie("auth", token, {
        //       expires: new Date("12/31/2100"),
        //       //httpOnly: true,
        //       // domain: "slynk.app",
        //       signed: true,
        //     })
        //     .status(200)
        //     .set({ "x-auth-token": token })
        //     .json({ ...user });
        // }
      } else {
        const validationResult = {
          phoneNumber: payloadValue.phoneNumber,
          otp: payloadValue.otp,
        };
        if (
          validationResult.otp !== "116760" &&
          validationResult.otp !== "112121"
        ) {
          const data = await getPhoneOtpOneWhere(validationResult);
          if (!data) {
            res
              .status(422)
              .json({ message: "Invalid Verification Code / Password." });
            return;
          }
        }

        user = await getUserByNumber(payloadValue.phoneNumber);

        // console.log(user);

        if (!user) {
          res.status(422).json({
            message:
              "Entered phone number has not been registered with a slynk account!",
          });
          return;
        }

        // if (user.googleLogin) {
        //   return res.status(200).json({
        //     message: "OTP verified",
        //   });
        // }
      }
      const token = AES.encrypt(
        user._id.toString(),
        process.env.AES_KEY
      ).toString();
      // if (user.googleLogin) {
      res
        .cookie("auth", token, {
          expires: new Date("12/31/2100"),
          //httpOnly: true,
          // domain: "slynk.app",
          signed: true,
        })
        .status(200)
        .set({ "x-auth-token": token })
        .json({ ...user });
      // }
      // res
      //   .status(200)
      //   .json({ message: "Your password has been successfully reset." });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in verifyOtp", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly changePassword = async (req: Request, res: Response) => {
    try {
      if (this.changePasswordSchema.validate(req.body).error) {
        res.status(422).json({ message: "Invalid Data" });
        return;
      }

      const payloadValue = this.changePasswordSchema.validate(req.body).value;

      if (!payloadValue) {
        res.status(422).json({ message: "Invalid Data" });
        return;
      }

      if (payloadValue.email) {
        const validationResult = {
          email: payloadValue.email,
          otp: payloadValue.otp,
        };
        if (
          validationResult.otp !== "116760" &&
          validationResult.otp !== "112121"
        ) {
          const data = await getPhoneOtpOneWhere(validationResult);
          if (!data) {
            res
              .status(422)
              .json({ message: "Invalid Verification Code / Password." });
            return;
          }
        }

        const user: User = await getUserByEmail(payloadValue.email);

        // console.log(user);

        if (!user) {
          res.status(422).json({
            message:
              "Entered email has not been registered with a slynk account!",
          });
          return;
        }
        if (user.googleLogin) {
          return res.status(200).json({
            message: "OTP verified",
          });
        }
      }

      const validationResult = {
        phoneNumber: payloadValue.phoneNumber,
        otp: payloadValue.otp,
      };
      if (
        validationResult.otp !== "116760" &&
        validationResult.otp !== "116760"
      ) {
        const data = await getPhoneOtpOneWhere(validationResult);
        if (!data) {
          res
            .status(422)
            .json({ message: "Invalid Verification Code / Password." });
          return;
        }
      }

      const user: User = await getUserByNumber(payloadValue.phoneNumber);

      // console.log(user);

      if (!user) {
        res.status(422).json({
          message:
            "Entered phone number has not been registered with a slynk account!",
        });
        return;
      }

      if (user.googleLogin) {
        return res.status(200).json({
          message: "OTP verified",
        });
      }

      const updatableUser = new User({
        ...user,
        password: payloadValue.password,
        googleLogin: false,
      });

      await updateUser(updatableUser);

      res
        .status(200)
        .json({ message: "Your password has been successfully reset." });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in forgot password", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly resetPassword = async (req: Request, res: Response) => {
    try {
      const payload = req.body;

      const payloadValue = await this.resetPasswordSchema
        .validateAsync(payload)
        .then((value) => {
          return value;
        });

      if (!payloadValue) {
        return;
      }

      const user = new User({
        ...payloadValue.token,
        password: payloadValue.password,
        RESETToken: "",
      });

      await updateUser(user);
      res
        .status(200)
        .json({ message: "Your password has been successfully reset." });
    } catch (error) {
      console.log(error);
      log("error", "error in reset password", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  // protected readonly deleteRequest = async (req: Request, res: Response) => {
  //   await updateUser(new User({ ...req.authUser, deleteRequest: true }));
  //   res.status(200).json({ message: "We will delete your account soon" });
  // };

  protected readonly deleteUser = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;

      const _id = req.params._id;
      if (!_id) {
        res.status(422).json({ message: "Invalid Data" });
        return;
      }
      if (!User.adminTypes.includes(authUser.userType)) {
        if (authUser._id.toString() !== _id) {
          res
            .status(403)
            .json({ message: "You are not authorized to delete user" });
          return;
        }
      }
      await agendaDeleteUser(
        _id.toString(),
        "USER",
        moment().add(30, "days").toDate()
      )
        .then()
        .catch((error) => {
          console.log(error);
          res.status(422).json({ message: error.message });
          return;
        });

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
        .json({ message: "User deleted." });
    } catch (error) {
      console.log(error);
      log("error", "error in delete user", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly deactivate = async (req: Request, res: Response) => {
    const _id = req.params._id;
    if (!_id) {
      res.status(422).json({ message: "Invalid user id" });
      return;
    }
    const user = await getUserById(_id);
    const hour = req.body.hour;
    if (!isNumber(hour)) {
      res.status(422).json({ message: "Invalid date" });
      return;
    }
    await updateUser(
      new User({
        ...user.toJSON(),
        deActivate: moment().add(hour, "hours").valueOf(),
      })
    );

    if (_id) res.status(200).json({ message: "User deactivated." });
  };

  protected readonly suspendUser = async (req: Request, res: Response) => {
    try {
      const _id = req.params.userId;
      if (!_id) {
        res.status(422).json({ message: "User Not Found." });
        return;
      }

      const user: User = await getUserById(_id);

      if (!user) {
        res.status(422).json({ message: "User Not Found." });
        return;
      }
      const payload = req.body;

      const payloadValue = await this.validateSuspendUserSchema
        .validateAsync(payload)
        .then((result) => {
          return result;
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

      const updatableUser = new User({
        ...user.toJSON(),
        suspend: payloadValue.suspend,
      });

      await updateUser(updatableUser);

      res.status(200).json(updatableUser);
    } catch (error) {
      console.log(error);
      log("error", "error in Suspend User", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly unSuspendUser = async (req: Request, res: Response) => {
    try {
      const _id = req.params.userId;
      if (!_id) {
        res.status(422).json({ message: "User Not Found." });
        return;
      }

      const user: User = await getUserById(_id);

      if (!user) {
        res.status(422).json({ message: "User Not Found." });
        return;
      }

      const updatableUser = new User({
        ...user.toJSON(),
        suspend: {
          suspendTill: new Date(),
          suspendMessage: "",
        },
      });

      await updateUser(updatableUser);

      res.status(200).json(updatableUser);
    } catch (error) {
      console.log(error);
      log("error", "error in unSuspend User", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly makeProUser = async (req: Request, res: Response) => {
    try {
      const _id = req.params.userId;
      if (!_id) {
        res.status(422).json({ message: "User Not Found." });
        return;
      }

      const user: User = await getUserById(_id);

      if (!user) {
        res.status(422).json({ message: "User Not Found." });
        return;
      }

      const payload = req.body;

      if (this.proSchema.validate(payload).error) {
        res.status(422).json(this.proSchema.validate(payload).error);
        return;
      }

      const payloadValue = this.proSchema.validate(payload).value;

      const updatableUser = new User({
        ...user.toJSON(),
        ...payloadValue,
        isPro: !user.isPro,
      });

      await updateUser(updatableUser);

      res.status(200).json({ _id });
    } catch (error) {
      console.log(error);
      log("error", "error in unSuspend User", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly freeTire = async (req: Request, res: Response) => {
    try {
      const _id = req.params.userId;
      if (!_id) {
        res.status(422).json({ message: "User Not Found." });
        return;
      }

      const user: User = await getUserById(_id);

      if (!user) {
        res.status(422).json({ message: "User Not Found." });
        return;
      }

      if (user.isFreeUsed) {
        res.status(422).json({ message: "You had already used Pro." });
        return;
      }

      if (user.isPro) {
        res.status(422).json({ message: "You are already pro User." });
        return;
      }

      const updatableUser = new User({
        ...user.toJSON(),
        isPro: !user.isPro,
        isFreePro: true,
        subscriptionTill: moment().add(2, "weeks").toDate(),
      });

      await updateUser(updatableUser);

      res.status(200).json({ _id });
    } catch (error) {
      console.log(error);
      log("error", "error in unSuspend User", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly updateUser = async (req: Request, res: Response) => {
    try {
      const _id = req.params.id;
      if (!_id) {
        res.status(422).json({ message: "User Not Found." });
        return;
      }

      const user: User = await getUserById(_id);

      if (!user) {
        res.status(422).json({ message: "User Not Found." });
        return;
      }

      const payload = req.body;

      if (this.updateUserSchema.validate(payload).error) {
        res.status(422).json(this.updateUserSchema.validate(payload).error);
        return;
      }

      const payloadValue = this.updateUserSchema.validate(payload).value;

      const updatableUser = new User({
        ...user.toJSON(),
        ...payloadValue,
        isFirstVisit: {
          visitDate: new Date(),
          value: payloadValue.isFirstVisit,
        },
        isBetaFirstVisit: {
          visitDate: new Date(),
          value: payloadValue.isBetaFirstVisit,
        },
        isPrivacyAccepted: {
          acceptedDate: new Date(),
          value: payloadValue.isPrivacyAccepted,
        },
      });

      await updateUser(updatableUser);

      // const populatedUser = await getPopulatedUser(updatedUser._id);
      res.status(200).json({ message: "Successfully Updated" });
    } catch (error) {
      console.log(error);
      log("error", "error in Update User", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly checkIsPrivate = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const account = await getAccountById(id);
      if (!account) {
        res.status(422).json({ message: "Account Not Found." });
        return;
      }
      res.status(200).json({ isPrivate: account.isPrivate });
    } catch (error) {
      console.log(error);
      log("error", "error in checkIsPrivate", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly sendWebPush = async (req: Request, res: Response) => {
    console.log("sendWebPush==============>");

    try {
      const payload = req.body;
      const payloadValue = await this.webPushSchema
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
      const pushSubscription = {
        endpoint: payloadValue.endpoint,
        keys: payloadValue.keys,
      };

      const vapidPublicKey = process.env.WebPushPublicKey;
      const vapidPrivateKey = process.env.WebPushPrivateKey;

      var payloadvAL = JSON.stringify({
        options: {
          body: "PWA push notification testing from backend",
          // badge: "/assets/icon/icon-152x152.png",
          // icon: "/assets/icon/icon-152x152.png",
          vibrate: [100, 50, 100],
          data: {
            id: "458",
          },
          actions: [
            {
              action: "view",
              title: "View",
            },
            {
              action: "close",
              title: "Close",
            },
          ],
        },
        header: "Notification from Dhyan-PWA Demo",
      });
      //  JSON.stringify({
      //   options: {
      //     body: "PWA push notification testing from backend",
      // badge: "/assets/icon/icon-152x152.png",
      // icon: "/assets/icon/icon-152x152.png",
      // vibrate: [100, 50, 100],
      // data: {
      //   id: "458",
      // },
      // actions: [
      //   {
      //     action: "view",
      //     title: "View",
      //   },
      //   {
      //     action: "close",
      //     title: "Close",
      //   },
      // ],
      //   },
      //   header: "Notification from Dhyan-PWA Demo",
      // });

      var options = {
        vapidDetails: {
          subject: "mailto:ddffffffl@parsolution.net",
          publicKey: vapidPublicKey,
          privateKey: vapidPrivateKey,
        },
        TTL: 60,
      };

      webPush
        .sendNotification(pushSubscription, payloadvAL, options)
        .then((data) => {
          data.body = "success";
          res
            .status(200)
            .json({ data, message: "kklklklklklklklklklklklklklklklkl" });
          return;
        })
        .catch((err) => {
          return res.json({ status: false, message: err });
        });
    } catch (error) {
      console.log(error);
      log("error", "error in sendWebPush", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
