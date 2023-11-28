import { Response } from "express";
import { Request } from "./../../request";
import { log } from "winston";
import { get as _get, isArray } from "lodash";
import Joi, { isError } from "joi";
import {
  getAccountById,
  getPopulatedAccount,
  saveAccount,
  updateAccount,
  getAccountsByAccountName,
  getLiteAccountsForAdmin,
  getLiteAccountByIdQr,
  getAccountByQuery,
  getAccByAccNameFromQuery,
  getAccountByAccountName,
} from "../../modules/account";
import { Account as AccountType } from "../../modules/account";
import { getUserById, updateUser, User } from "../../modules/user";
import { getImageById } from "../../modules/image";
import { getPopulatedConnectByAccountId } from "../../modules/connect";
import { getPersonalConnectionByAccountId } from "../../modules/personalConnection";
import { getTagsByAccountId } from "../../modules/tags/getTagsByAccountId";

import * as Sentry from "@sentry/node";
import {
  getPassIdentifierByData,
  IPassIdentifier,
  updateManyPassIdentifier,
} from "../../modules/passIdentifier";
import { apnProvider } from "../../helper/apnProvider";
import apn from "apn";
import { agendaDeleteAccount } from "../../helper/agendaDeleteAccount";
import moment from "moment";
import { googleWalletGeneric } from "../../helper/googleWalletGeneric";
import { getTagByUniqueUrl } from "../../modules/tags";
// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_URL,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

Sentry.configureScope((scope) => scope.setTransactionName("In Account"));

export default class Controller {
  private readonly accountUpdateSchema = Joi.object().keys({
    firstName: Joi.string().optional().allow(""),
    lastName: Joi.string().optional().allow(""),
    //   TODO: validate image when image module will implement
    profileImage: Joi.string()
      .optional()
      .external(async (v: string) => {
        if (!v) return v;
        const image = await getImageById(v);
        if (!image) {
          throw new Error("Please provide valid image for profile image.");
        }
        return v;
      }),
    googleWalletPicId: Joi.string()
      .optional()
      .allow(null)
      .external(async (v: string) => {
        if (!v) return v;
        const image = await getImageById(v);
        if (!image) {
          throw new Error("Please provide valid image for profile image.");
        }
        return v;
      }),
    logo: Joi.string()
      .optional()
      .external(async (v: string) => {
        if (!v) return v;
        if (v === "") return v;
        const image = await getImageById(v);
        if (!image) {
          throw new Error("Please provide valid image for logo.");
        }
        return v;
      })
      .allow("", null),
    companyName: Joi.string().optional().allow(""),
    role: Joi.string().optional().allow(""),
    location: Joi.string().optional().allow(""),
    direct: Joi.boolean().optional(),
    isPrivate: Joi.boolean().optional(),
    links: Joi.array().optional(),
    rsb: Joi.string().optional().allow(""),
    ls: Joi.string().optional().allow(""),
    background: Joi.string().optional().allow(""),
    fc: Joi.string().optional().allow(""),
    aboutMe: Joi.string().optional().allow(""),
    city: Joi.string().optional().allow(""),
    state: Joi.string().optional().allow(""),
    darkMode: Joi.boolean().optional(),
    accountName: Joi.string()
      .optional()
      .pattern(/^[a-zA-Z0-9_]*$/),
    recentColor: Joi.array().optional(),
    qrColor: Joi.string().optional(),
    qrBg: Joi.string().optional(),
    qrImage: Joi.string()
      .optional()
      .allow(null)
      .external(async (v: string) => {
        if (!v) return v;
        const image = await getImageById(v);
        if (!image) {
          throw new Error("Please provide valid image for qr Image.");
        }
        return v;
      }),
    backgroundImage: Joi.string()
      .optional()
      .allow(null)
      .external(async (v: string) => {
        if (!v) return v;
        const image = await getImageById(v);
        if (!image) {
          throw new Error("Please provide valid image for qr Image.");
        }
        return v;
      }),
    isDiscoverable: Joi.boolean().optional(),
    isArchive: Joi.boolean().optional(),
    dragOff: Joi.boolean().optional(),
    linkDarkMode: Joi.boolean().optional(),

    // .external(async (v: string) => {
    //   if (!v) return v;
    //   const accounts = await getAccountsByAccountName(v);
    //   if (accounts.length > 1) {
    //     throw new Error("Please provide valid account name.");
    //   }
    //   const acc = accounts[0];
    //   return v;
    // }),
  });

  private readonly accountCreateSchema = this.accountUpdateSchema.keys({
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    user: Joi.string()
      .required()
      .external(async (v: string) => {
        const user = await getUserById(v);
        if (!user) {
          throw new Error("Please provide a valid user.");
        }
        if (!user.isPro && user.accounts.length > 0) {
          throw new Error(
            "You does not have access for this functionality try with pro version."
          );
        }
        if (user.accounts.length < 1) {
          throw new Error(
            "Something happened wrong try again after sometimes."
          );
        }
        return v;
      }),
    profileImage: Joi.string().optional(),
    logo: Joi.string().optional(),
    direct: Joi.boolean().optional(),
    aboutMe: Joi.string().optional(),
    darkMode: Joi.boolean().optional(),
    accountName: Joi.string()
      .optional()
      .pattern(/^[a-zA-Z0-9_]*$/),
    type: Joi.string().valid("PERSONAL", "PROFESSIONAL").required(),
    backgroundImage: Joi.string()
      .optional()
      .allow(null)
      .external(async (v: string) => {
        if (!v) return v;
        const image = await getImageById(v);
        if (!image) {
          throw new Error("Please provide valid image for qr Image.");
        }
        return v;
      }),
  });

  private readonly searchSchema = Joi.object({
    query: Joi.string().required(),
  });

  protected readonly get = async (req: Request, res: Response) => {
    try {
      const _id = req.params._id;
      if (!_id && req.isAdmin) {
        const { page } = req.query;
        const accounts = await getLiteAccountsForAdmin(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          parseInt(page)
        );
        res.status(200).json(accounts);
        return;
      }
      if (!_id) {
        res.status(422).json({ message: "Invalid account." });
        return;
      }

      const account = await getPopulatedAccount(_id);
      if (!account) {
        res.status(422).json({ message: "Invalid account." });
        return;
      }

      const tags = await getTagsByAccountId(_id);

      const acc = {
        account: account,
        tags: tags,
      };

      res.status(200).json(acc);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in get account", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly getQRCode = async (req: Request, res: Response) => {
    try {
      const _id = req.params._id;
      if (!_id) {
        res.status(422).json({ message: "Invalid account." });
        return;
      }

      const account = await getLiteAccountByIdQr(_id);
      if (!account) {
        res.status(422).json({ message: "Invalid account." });
        return;
      }

      res.status(200).json(account);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in get qrCode account", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const payload = req.body;

      const payloadValue = await this.accountCreateSchema
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
      const user = await getUserById(payloadValue.user);

      if (payloadValue.type === "PROFESSIONAL") {
        while (!payloadValue.accountName) {
          let result = "";
          const characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
          const charactersLength = characters.length;
          for (let i = 0; i < 10; i++) {
            result += characters.charAt(
              Math.floor(Math.random() * charactersLength)
            );
          }
          result = result.replace(/\s/g, "");
          const accounts = await getAccountsByAccountName(result);
          if (accounts.length >= 1) {
            continue;
          } else {
            const tagURL = await getTagByUniqueUrl(result);
            if (tagURL) {
              continue;
            }
          }
          payloadValue.accountName = result;
          break;
        }

        if (!user.isPro) {
          res.status(401).json({
            message:
              "This functionality is not available for you upgrade to pro.",
          });
          return;
        }
      } else {
        while (!payloadValue.accountName) {
          let val =
            payload.firstName +
            payload.lastName +
            Math.floor(Math.random() * 90 + 10);
          val = val.replace(/\s/g, "");
          const accounts = await getAccountsByAccountName(
            val.replace(/\s/g, "")
          );
          if (accounts.length >= 1) {
            continue;
          } else {
            const tagURL = await getTagByUniqueUrl(val.replace(/\s/g, ""));
            if (tagURL) {
              continue;
            }
          }
          payloadValue.accountName = val.replace(/\s/g, "");
          break;
        }
      }
      const account = await saveAccount(
        new AccountType({ ...payloadValue, links: [] })
      );
      user.accounts.push(account._id);
      await updateUser(user);
      const newAccount = await getAccountById(account._id);
      res.status(200).json(newAccount);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in create account", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly update = async (req: Request, res: Response) => {
    try {
      const _id = req.params._id;

      if (!_id) {
        res.status(422).json({ message: "Invalid account." });
        return;
      }

      const account = await getAccountById(_id);
      if (!account) {
        res.status(422).json({ message: "Invalid account." });
        return;
      }

      const authUser = req.authUser;
      if (!User.adminTypes.includes(authUser.userType)) {
        const userId =
          account.user &&
          account.user.toString() == _get(authUser, "_id", "").toString()
            ? account.user
            : null;
        if (!userId) {
          // As of now only owner of account can update account
          res.status(403).json({ message: "Unauthorized request." });
          return;
        }
      }

      // validate payload
      const payload = req.body;
      const payloadValue = await this.accountUpdateSchema
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
      if (payloadValue.accountName) {
        const aws = await getAccountByAccountName(
          payloadValue.accountName.replace(/\s/g, "")
        );
        const tagURL = await getTagByUniqueUrl(
          payloadValue.accountName.replace(/\s/g, "")
        );
        if (tagURL) {
          throw new Error("accountName is already taken");
        }
        if (aws) {
          if (aws._id.toString() !== _id.toString()) {
            throw new Error("accountName is already taken");
          } else {
            payloadValue.accountName = payloadValue.accountName.replace(
              /\s/g,
              ""
            );
          }
        }
      }

      if (payloadValue.links !== undefined) {
        if (payloadValue.links.length !== account.links.length) {
          res.status(422).send({ message: "Please provide Valid Links." });
          return;
        }

        let flag = false;

        (payloadValue.links || []).map((link) => {
          if (!account.links.includes(link)) {
            flag = true;
          }
        });

        if (flag) {
          res.status(422).send({ message: "Please provide Valid Links." });
          return;
        }
      }

      if (payloadValue.background) {
        account.backgroundImage = null;
        payloadValue.backgroundImage = null;
      }

      const toBeUpdatedAccount = new AccountType({
        ...account.toJSON(),
        ...payloadValue,
      });
      if (toBeUpdatedAccount.direct && !toBeUpdatedAccount.links.length) {
        res
          .status(422)
          .json({ message: "For Direct on you need to add at least one link" });
        return;
      }
      await updateAccount(toBeUpdatedAccount);
      const populatedAcc = await getPopulatedAccount(toBeUpdatedAccount._id);
      // if (
      //   account.profileImage &&
      //   _get(payloadValue, "profileImage", "").length
      // ) {
      //   const imageId =
      //     _get(account, "profileImage._id", null) || account._id.toString();
      //   // delete image if available
      //   if (imageId != payloadValue.profileImage) {
      //     const image = await getImageById(imageId);
      //     if (image) await deleteImage(image);
      //   }
      // }
      res.status(200).json(populatedAcc);

      const passData = await getPassIdentifierByData({
        passTypeIdentifier: process.env.APPLE_PASS_IDENTIFIER,
        serialNumber: _id,
      });
      if (isArray(passData) && passData.length) {
        const note = new apn.Notification();

        note.payload = { aps: "" };
        note.topic = "pass.com.slynk.app";
        apnProvider()
          .send(
            note,
            passData.map((item: IPassIdentifier) => item.pushToken)
          )
          .then(() => {
            //ios key is holding array of device ID's to which notification has to be sent
          });
        apnProvider().shutdown();
        await updateManyPassIdentifier(
          {
            passTypeIdentifier: process.env.APPLE_PASS_IDENTIFIER,
            serialNumber: _id,
          },
          true
        );
      }

      const walletData = await googleWalletGeneric(populatedAcc._id.toString());
      console.log("walletData", walletData);
      return;
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in update account", error);

      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly delete = async (req: Request, res: Response) => {
    try {
      const _id = req.params._id;
      const authUser = req.authUser;

      if (!_id) {
        res.status(422).json({ message: "Invalid account." });
        return;
      }

      const account = await getAccountById(_id);
      if (!account) {
        res.status(422).json({ message: "Invalid account." });
        return;
      }

      // if (account.type === "PERSONAL") {
      //   res
      //     .status(422)
      //     .json({ message: "You can not delete your PERSONAL account." });
      //   return;
      // }
      if (!User.adminTypes.includes(authUser.userType)) {
        if (!req.authUser.accounts.find((ac) => ac.toString() === _id)) {
          res.status(403).json({ message: "Unauthorized request." });
          return;
        }
      }
      await agendaDeleteAccount(
        account._id.toString(),
        "ACCOUNT",
        moment().add(30, "days").toDate()
      )
        .then(() => {
          res.status(200).json({ message: "Account Will deleted shortly." });
          return;
        })
        .catch((error) => {
          console.log(error);
          res.status(422).json({ message: error.message });
          return;
        });
    } catch (error) {
      console.log("***********");
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in delete account", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly getPersonalConnectionAndConnect = async (
    req: Request,
    res: Response
  ) => {
    const _id = req.params._id;

    if (!_id) {
      res.status(422).json({ message: "Invalid account." });
      return;
    }

    const account = await getAccountById(_id);
    if (!account) {
      res.status(422).json({ message: "Invalid account." });
      return;
    }
    const personalConnection = await getPersonalConnectionByAccountId(_id);
    const slynkConnection = await getPopulatedConnectByAccountId(_id);
    res.status(200).json({ personalConnection, slynkConnection });
  };

  protected readonly getTags = async (req: Request, res: Response) => {
    try {
      const _id = req.params._id;

      if (!_id) {
        res.status(422).json({ message: "Invalid account." });
        return;
      }

      const account = await getAccountById(_id);
      if (!account) {
        res.status(422).json({ message: "Invalid account." });
        return;
      }

      const authUser = req.authUser;
      const userId =
        account.user &&
        account.user.toString() == _get(authUser, "_id", "").toString()
          ? account.user
          : null;
      if (!userId) {
        // As of now only owner of account can update account
        res.status(403).json({ message: "Unauthorized request." });
        return;
      }

      const tags = await getTagsByAccountId(_id);

      res.status(200).json(tags);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in get tags by account ID", error);

      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly searchAccountQuery = async (
    req: Request,
    res: Response
  ) => {
    try {
      const { q } = req.query;
      if (this.searchSchema.validate({ query: q }).error) {
        res.status(422).json(this.searchSchema.validate({ query: q }).error);
        return;
      }

      const payloadValue = this.searchSchema.validate({ query: q }).value;
      const userName = await getAccountByQuery(
        payloadValue.query.replace(/^\s+|\s+$/gm, "")
      );

      res.status(200).json(userName);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in searchUser", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly verifyAccount = async (req: Request, res: Response) => {
    try {
      const { accountId } = req.params;
      if (!accountId) {
        res.status(422).json({ message: "Invalid account." });
        return;
      }
      const account = await getAccountById(accountId);
      if (!account) {
        res.status(422).json({ message: "Invalid account." });
        return;
      }

      await updateAccount(
        new AccountType({
          ...account,
          isVerify: !account.isVerify,
        })
      );

      res.status(200).json({
        message: `User successfully ${
          account.isVerify ? "unverified." : "verified."
        }`,
      });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in verifyAccount", error);

      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly searchAccount = async (req: Request, res: Response) => {
    try {
      const { q } = req.query;
      const accountId = req.params.accountId;

      if (this.searchSchema.validate({ query: q }).error) {
        res.status(422).json(this.searchSchema.validate({ query: q }).error);
        return;
      }
      const payloadValue = this.searchSchema.validate({ query: q }).value;
      const userAcc = await getAccByAccNameFromQuery(payloadValue.query);

      if (
        !userAcc ||
        (userAcc && accountId.toString() === userAcc?._id.toString())
      ) {
        res.status(200).json({ message: "Success", available: true });
      } else {
        res.status(200).json({ message: "Success", available: false });
        return;
      }
    } catch (error) {
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly archiveAccount = async (req: Request, res: Response) => {
    try {
      const accountId = req.params.id;
      if (!accountId) {
        res.status(422).json({ message: "Invalid account." });
        return;
      }
      const account = await getAccountById(accountId);
      if (!account) {
        res.status(422).json({ message: "Invalid account." });
        return;
      }

      await updateAccount(
        new AccountType({
          ...account,
          isArchive: !account.isArchive,
        })
      );

      res.status(200).json({
        message: `User successfully ${
          account.isArchive ? "unArchived." : "Archived."
        }`,
      });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in ArchiveAccount", error);

      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
