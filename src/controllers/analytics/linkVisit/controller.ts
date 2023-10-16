import { Response } from "express";
import Joi, { isError } from "joi";
import { log } from "winston";
import { Request } from "../../../request";
import * as Sentry from "@sentry/node";
import { get as _get } from "lodash";
import {
  AnalyticsLinkVisit,
  saveAnalyticsLinkVisit,
} from "../../../modules/analyticsLinkVisit";
import { getAccountLinkById } from "../../../modules/accountLinks";
import { getAccountById } from "../../../modules/account";
import geoip from "geoip-lite";
import { getProfileVisitById } from "../../../modules/analyticsProfileVisit";

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
  private readonly createLinkVisitSchema = Joi.object().keys({
    deviceId: Joi.string().optional(),
    browserId: Joi.string().optional(),
    deviceType: Joi.string().optional(),
    browserType: Joi.string().optional(),
    accountLinkId: Joi.string()
      .required()
      .external(async (v: string) => {
        if (!v) return v;
        const accountLink = await getAccountLinkById(v);
        if (!accountLink) {
          throw new Error("Invalid AccountLink.");
        }
        return v;
      }),
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
    profileVisitId: Joi.string()
      .required()
      .external(async (v: string) => {
        if (!v) return v;
        const profileVisitId = await getProfileVisitById(v);
        if (!profileVisitId) {
          throw new Error("Invalid profileVisitId.");
        }
        return v;
      }),
  });

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const remoteIp = req.ip;
      const geo = geoip.lookup(remoteIp);
      const ownerAccountId = req.params.ownerAccountId;

      if (!ownerAccountId) {
        res.status(422).json({ message: "Invalid  ownerAccountId." });
        return;
      }

      const account = await getAccountById(ownerAccountId);
      if (!account) {
        res.status(422).json({ message: "Invalid  ownerAccountId." });
        return;
      }
      const payloadValue = await this.createLinkVisitSchema
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

      const linkVisit = await saveAnalyticsLinkVisit(
        new AnalyticsLinkVisit({
          ...payloadValue,
          remoteIp: remoteIp,
          location: geo?.country,
          geoLocation: geo,
          ownerAccountId: ownerAccountId,
          slynkUser: payloadValue.visiterAccountId ? true : false,
        })
      );

      res.status(200).json(linkVisit);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in create linkVisit", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
