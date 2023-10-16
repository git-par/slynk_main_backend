import { Response } from "express";
import Joi, { isError } from "joi";
import { log } from "winston";
import { Request } from "../../../request";
import * as Sentry from "@sentry/node";
import { get as _get } from "lodash";
import {
  AnalyticsProfileVisit,
  getProfileVisitById,
  saveAnalyticsProfileVisit,
} from "../../../modules/analyticsProfileVisit";
import geoip from "geoip-lite";
import { updateAnalyticsProfileVisit } from "../../../modules/analyticsProfileVisit";
import {
  getAccountByAccountName,
  IAccount,
  getAccountById,
  // getPopulatedAccountForVisit,
} from "../../../modules/account";
import { getTagByUrl } from "../../../modules/tags";
// import { getConnectionByAccountAndTargetedAccount } from "../../../modules/connect";
// import { removeProLinks } from "../../../helper/removeProToFree";

// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_URL,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

Sentry.configureScope((scope) =>
  scope.setTransactionName("In Analytics Link Visit")
);

export default class Controller {
  private readonly createProfileVisitSchema = Joi.object().keys({
    visiterAccountId: Joi.string()
      .optional()
      .external(async (v: string) => {
        if (!v) return v;
        const account = await getAccountById(v);
        if (!account) {
          throw new Error("Invalid Account.");
        }
        return v;
      }),
    sessionId: Joi.string().optional(),
    deviceId: Joi.string().optional(),
    browserId: Joi.string().optional(),
    deviceType: Joi.string().optional(),
    browserType: Joi.string().optional(),
    timeSpend: Joi.number().required(),
    type: Joi.string()
      .optional()
      .allow(null)
      .valid("awc", "gwc", "share", "qr", "tag"),
  });
  private readonly updateProfileVisitSchema = Joi.object().keys({
    timeSpend: Joi.number().optional(),
    clickThrow: Joi.boolean().optional(),
  });

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const remoteIp = req.ip;
      const geo = geoip.lookup(remoteIp);

      const query = req.params.ownerAccId;

      // const ownerAccountId = req.params.ownerAccId;

      // if (!ownerAccountId) {
      //   res.status(422).json({ message: "Invalid  ownerAccountId." });
      //   return;
      // }
      // const account = await getAccountById(ownerAccountId);
      // if (!account) {
      //   res.status(422).json({ message: "Invalid  account." });
      //   return;
      // }

      const payloadValue = await this.createProfileVisitSchema
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

      let account: IAccount = null;
      let type = null;
      let tagId = null;
      let isShouldUpdateRoute = true;

      if (
        payloadValue.type === "awc" ||
        payloadValue.type === "gwc" ||
        payloadValue.type === "share" ||
        payloadValue.type === "qr"
      ) {
        account = await getAccountByAccountName(query);
        type = payloadValue.type;
      } else if (payloadValue.type === "tag") {
        const tag = await getTagByUrl(query);
        if (tag) {
          if (tag.account) {
            type = "tag";
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            account = tag.account;
            tagId = tag._id;
          } else {
            res.status(200).json({
              tag: tag,
              isShouldUpdateRoute: true,
              isTagLinked: false,
              profileVisitId: null,
              accountURL: null,
            });
            return;
          }
        }
      } else {
        account = await getAccountById(query);
        if (account) {
          isShouldUpdateRoute = true;
          type = "profile";
        } else {
          const tag = await getTagByUrl(query);
          if (tag) {
            if (tag.account) {
              type = "tag";
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              account = tag.account;
              tagId = tag._id;
            } else {
              res.status(200).json({
                tag: tag,
                isShouldUpdateRoute: true,
                isTagLinked: false,
                profileVisitId: null,
                accountURL: null,
              });
              return;
            }
          }
        }
      }

      if (!account || !type) {
        res.status(422).json({ message: "Invalid  account." });
        return;
      }

      const profileVisit = await saveAnalyticsProfileVisit(
        new AnalyticsProfileVisit({
          ...payloadValue,
          remoteIp: remoteIp,
          location: geo?.country,
          geoLocation: geo,
          ownerAccountId: account._id,
          clickThrow: false,
          visiterAccountId:
            req.authUser &&
            payloadValue.visiterAccountId &&
            !!req.authUser.accounts.find(
              // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //@ts-ignore
              (ac) => ac._id.toString() === payloadValue.visiterAccountId
            )
              ? payloadValue.visiterAccountId
              : null,
          slynkUser: req.authUser ? true : false,
          type,
          tagId,
          accountType: account.type,
        })
      );

      res.status(200).json({
        isShouldUpdateRoute,
        profileVisitId: profileVisit._id.toString(),
        accountURL: account.accountName,
        isTagLinked: true,
      });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in create profileVisit", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly update = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const profileVisitId = req.params.id;
      if (!profileVisitId) {
        res.status(422).json({ message: "Invalid profileVisitId." });
        return;
      }
      const profileVisit = await getProfileVisitById(profileVisitId);
      if (!profileVisit) {
        res.status(422).json({ message: "Invalid ProfileVisit." });
        return;
      }

      const payloadValue = await this.updateProfileVisitSchema
        .validateAsync(payload)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          console.log(e);
          if (isError(e)) {
            res.status(422).json(e);
            return;
          } else {
            res.status(422).json({ message: e.message });
            return;
          }
        });
      if (!payloadValue) {
        return;
      }

      const updatedProfileVisit = await updateAnalyticsProfileVisit(
        new AnalyticsProfileVisit({ ...profileVisit.toJSON(), ...payloadValue })
      );

      res.status(200).json(updatedProfileVisit);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in update profileVisit", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  // protected readonly get = async (req: Request, res: Response) => {
  //   try {
  //     const { profileVisitId } = req.params;
  //     if (!profileVisitId) {
  //       res.status(422).json({ message: "Invalid profileVisitId." });
  //       return;
  //     }
  //     const profileVisit = await getProfileVisitById(profileVisitId);
  //     if (!profileVisit) {
  //       res.status(422).json({ message: "Invalid ProfileVisit." });
  //       return;
  //     }
  //     let tag = null;
  //     let account: IAccount = null;
  //     if (profileVisit.type === "tag") {
  //       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //       //@ts-ignore
  //       tag = await getPopulatedTag(profileVisit.tagId);
  //       if (tag) {
  //         account = tag.account;
  //         if (tag.block) {
  //           res.status(200).json({ message: tag.blockMessage });
  //           return;
  //         }
  //       }
  //     } else {
  //       account = await getPopulatedAccountForVisit(
  //         // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //         //@ts-ignore
  //         profileVisit.ownerAccountId
  //       );
  //     }
  //     if (!account) {
  //       res.status(422).json({ message: "Invalid  account." });
  //       return;
  //     }
  //     if (_get(account, "isArchive")) {
  //       res.status(200).json({ message: "User Not found" });
  //       return;
  //     }

  //     if (_get(account, "isPrivate")) {
  //       const privateAccData = {
  //         firstName: account.firstName,
  //         lastName: account.lastName,
  //         profileImage: _get(account, "profileImage"),
  //         _id: account._id,
  //         isConnected: false,
  //       };

  //       if (req.authUser) {
  //         const connect = await getConnectionByAccountAndTargetedAccount({
  //           account: account._id.toString(),
  //           targetAccount: {
  //             account: req.authUser.accounts[0].toString(),
  //           },
  //         });
  //         if (connect) {
  //           if (!_get(account, "user.isPro")) {
  //             // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //             //@ts-ignore
  //             account.links = await removeProLinks(account);
  //           }
  //           res.status(200).json({
  //             account: account,
  //             shouldUpdateRoute: false,
  //             isConnected: true,
  //           });
  //           return;
  //         } else {
  //           res.status(200).json({
  //             account: privateAccData,
  //             shouldUpdateRoute: false,
  //             isConnected: false,
  //           });
  //           return;
  //         }
  //       } else {
  //         res.status(200).json({
  //           account: privateAccData,
  //           shouldUpdateRoute: false,
  //           isConnected: false,
  //         });
  //         return;
  //       }
  //     }
  //     if (!_get(account, "user.isPro")) {
  //       // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //       //@ts-ignore
  //       account.links = await removeProLinks(account);
  //     }
  //     res.status(200).json({
  //       account: account,
  //       shouldUpdateRoute: false,
  //       isConnected: true,
  //     });
  //     return;
  //     // res.status(200).json(profileVisit);
  //   } catch (error) {
  //     console.log(error);
  //     Sentry.captureException(error);
  //     log("error", "error in get profileVisit", error);
  //     res.status(500).json({
  //       message: "Hmm... Something went wrong. Please try again later.",
  //       error: _get(error, "message"),
  //     });
  //   }
  // };
}
