import { Response } from "express";
import { get as _get } from "lodash";
import { Request } from "./../../../request";

import Joi from "joi";
import { log } from "winston";
import {
  Account,
  getAccountById,
  getPopulatedAccount,
  updateAccount,
} from "../../../modules/account";
import {
  AccountLink,
  deleteAccountLinkById,
  getAccountLinkById,
  getAccountLinksByAccountId,
  getAccountLinkWhere,
  IAccountLink,
  saveAccountLink,
  updateAccountLink,
} from "../../../modules/accountLinks";
import { getLinkById } from "../../../modules/links";
import { getImageById, Image, saveImageToDb } from "../../../modules/image";
import * as Sentry from "@sentry/node";

// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_URL,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

Sentry.configureScope((scope) => scope.setTransactionName("In Account Link"));
export default class Controller {
  private readonly accountLinkCreateSchema = Joi.object().keys({
    link: Joi.string()
      .required()
      .external(async (val: string) => {
        if (!val) {
          throw new Error("Please provide a valid link provider.");
        }
        const linkFromDatabase = await getLinkById(val);
        if (!linkFromDatabase) {
          throw new Error("Please provide a valid link provider.");
        }
        return linkFromDatabase;
      }),
    profileShow: Joi.boolean().optional(),
    links: Joi.array().optional(),
    cardShow: Joi.boolean().optional(),
    displayOnTop: Joi.boolean().optional(),
    value: Joi.string().required(),
    fileType: Joi.string().optional(),
    label: Joi.string().optional().allow(""),
    extraTitle: Joi.string().optional().allow(""),
    extraDescription: Joi.string().optional().allow(""),
    account: Joi.string()
      .required()
      .external(async (val: string) => {
        return await getPopulatedAccount(val);
      }),
    logo: Joi.string()
      .optional()
      .external(async (v: string) => {
        if (!v) return v;
        const image = await getImageById(v);
        if (!image) {
          throw new Error("Please provide valid image.");
        }
        return v;
      }),
  });

  private readonly accountUpdateSchema = Joi.object().keys({
    profileShow: Joi.boolean().optional(),
    cardShow: Joi.boolean().optional(),
    displayOnTop: Joi.boolean().optional(),
    value: Joi.string().optional().allow(""),
    fileType: Joi.string().optional(),
    account: Joi.string().optional().allow(""),
    label: Joi.string().optional().allow(""),
    links: Joi.array().optional(),
    extraTitle: Joi.string().optional().allow(""),
    extraDescription: Joi.string().optional().allow(""),
    logo: Joi.string()
      .optional()
      .external(async (v: string) => {
        if (!v) return v;
        const image = await getImageById(v);
        if (!image) {
          throw new Error("Please provide valid image.");
        }
        return v;
      }),
  });

  protected readonly get = async (req: Request, res: Response) => {
    const _id = req.params._id;
    const accountId = req.currentAccountId;
    if (_id) {
      const accountLink = await getAccountLinkById(_id);
      if (!accountLink) {
        res.status(422).json({ message: "Invalid account link." });
        return;
      }
      res.status(200).json(accountLink.toJSON());
      return;
    }
    const accountLinks = await getAccountLinksByAccountId(accountId);
    res.status(200).json(accountLinks);
  };

  protected readonly create = async (req: Request, res: Response) => {
    req.body.value = (req.body.value || "").toString();

    this.accountLinkCreateSchema
      .validateAsync(req.body)
      .then(async (value) => {
        const authUser = req.authUser;
        const accountLinks = await getAccountLinkWhere({
          link: value.link._id,
          account: req.currentAccountId,
        });

        if (
          value.link.maxLinks.forFreeUser <= accountLinks.length &&
          !authUser.isPro
        ) {
          throw new Error(
            "You exceed the limit of link. This functionality is not available for you upgrade to pro."
          );
        }

        if (
          value.link.maxLinks.forPaidUser <= accountLinks.length &&
          authUser.isPro
        ) {
          throw new Error("You exceed the limit of link.");
        }

        // if ((value.link.isPro || accountLinks.length) && !authUser.isPro) {
        //   throw new Error(
        //     "This functionality is not available for you upgrade to pro."
        //   );
        // }
        if (value.link.type === "file") {
          if (value.value.includes("http")) {
            const image = await saveImageToDb(
              new Image({
                url: value.value,
              })
            );
            value.value = image._id;
          } else {
            const image = await getImageById(value.value);
            if (!image) {
              res.status(422).json({ message: "Please provide valid file." });
              return;
            }
          }
        }
        const toBeInsert: IAccountLink = {
          account: req.currentAccountId,
          link: value.link._id,
          profileShow: value.profileShow,
          cardShow: value.cardShow,
          displayOnTop: value.displayOnTop,
          value: value.link.type !== "file" ? value.value : "file",
          fileValue: value.link.type === "file" ? value.value : null,
          logo: value.logo,
          label: value.label,
          links: value.links,
          fileType: value.fileType,
          extraTitle: value.extraTitle,
          extraDescription: value.extraDescription,
        };
        return { payload: value, accountLink: new AccountLink(toBeInsert) };
      })
      .then(async ({ payload, accountLink }) => {
        await saveAccountLink(accountLink);
        // update account link
        payload.account.links = payload.account.links.map((link) => link._id);
        payload.account.links.push(accountLink._id.toString());
        await updateAccount(
          new Account({
            ...payload.account,
            user: _get(payload, "account.user._id").toString(),
            profileImage: _get(payload, "account.profileImage._id"),
          })
        );
        return { payload, accountLink };
      })
      .then(async ({ accountLink }) => {
        const accountPopulatedLink = await getAccountLinkById(accountLink._id);

        res.status(200).send(accountPopulatedLink.toJSON());
      })
      .catch((error) => {
        console.log(error);
        Sentry.captureException(error);
        console.log(error.message);
        log("error", "error in create account link", error);
        console.log(error);
        res.status(500).json({
          message: _get(error, "message"),
          error: "Hmm... Something went wrong. Please try again later.",
        });
      });
  };

  protected readonly update = async (req: Request, res: Response) => {
    req.body.value = req.body.value?.toString();
    const payload = req.body;
    const _id = req.params._id;
    this.accountUpdateSchema
      .validateAsync(payload)
      .then(() => getAccountLinkById(_id))
      .then((result) => {
        if (!result) {
          throw new Error("Account Link not found.");
        }
        if (result.account.toString() !== req.currentAccountId.toString()) {
          throw new Error("Unauthorized request.");
        }
        return result;
      })
      .then(async (result: AccountLink) => {
        const linkFromDatabase = await getLinkById(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          _get(result, "link._id")?.toString()
        );

        if (linkFromDatabase.type === "file") {
          if (payload.value) {
            if (payload.value.includes("http")) {
              const image = await saveImageToDb(
                new Image({
                  url: payload.value,
                })
              );
              payload.value = image._id;
            } else {
              const image = await getImageById(payload.value);
              if (!image) {
                res.status(422).json({ message: "Please provide valid file." });
                return;
              }
            }
          }
        }
        return updateAccountLink(
          new AccountLink({
            ...result.toJSON(),
            ...payload,
            value: linkFromDatabase.type !== "file" ? payload.value : "",
            fileValue:
              linkFromDatabase.type === "file"
                ? payload.value
                  ? payload.value
                  : result.fileValue
                : result.fileValue,
          })
        );
      })
      .then(async (result: AccountLink) => {
        const accountPopulatedLink = await getAccountLinkById(result._id);
        res.status(200).send(accountPopulatedLink.toJSON());
      })
      .catch((error) => {
        console.log(error);
        Sentry.captureException(error);
        log("error", "error in update account link", error);
        console.log(error);
        res.status(500).json({
          message: "Hmm... Something went wrong. Please try again later.",
          error: _get(error, "message"),
        });
      });
  };

  protected readonly delete = async (req: Request, res: Response) => {
    const _id = req.params._id;
    if (!_id) {
      res.status(422).json({ message: "Invalid account link." });
      return;
    }

    const accountLink = await getAccountLinkById(_id);

    if (!accountLink) {
      res.status(422).json({ message: "Invalid account link." });
      return;
    }

    await deleteAccountLinkById(_id);
    const account = await getAccountById(req.currentAccountId);
    account.links = account.links.filter(
      (al) => al.toString() !== _id.toString()
    );
    await updateAccount(new Account({ ...account.toJSON() }));
    res.status(200).json({ message: "Account link Successfully Deleted." });
  };
}
