import { Response } from "express";
import { Request } from "../../request";
import Joi from "joi";
import { log } from "winston";
import * as Sentry from "@sentry/node";
import { get as _get } from "lodash";
import { getAccountById } from "../../modules/account";
import {
  getConnectionCountByAccountId,
  getConnectionCountByOwner,
} from "../../modules/connect";
import moment from "moment";
import { getProfileVisitCountByOwner } from "../../modules/analyticsProfileVisit";
import { getLinkVisitCountByOwner } from "../../modules/analyticsLinkVisit";
import { getContactCountByOwner } from "../../modules/analyticsContactCount";

// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_URL,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

Sentry.configureScope((scope) => scope.setTransactionName("In Analytics"));
export default class Controller {
  private readonly analyticsSchema = Joi.object().keys({
    endDate: Joi.date().required(),
    startDate: Joi.date().required().less(Joi.ref("endDate")),
  });

  protected readonly getAnalytics = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const accountId = req.params.accountId;
      if (!accountId) {
        res.status(422).json({ message: "Please Provide Valid Account Id" });
        return;
      }

      const account = await getAccountById(accountId);
      if (!account) {
        res.status(422).json({ message: "Please Provide Valid Account Id" });
        return;
      }
      if (
        !accountId ||
        !req.authUser.accounts.find((ac) => ac.toString() === accountId)
      ) {
        res.status(403).json({ message: "Unauthorized request." });
        return;
      }

      payload.startDate = new Date(payload.startDate);
      payload.endDate = new Date(payload.endDate);

      if (this.analyticsSchema.validate(payload).error) {
        res.status(422).json({
          message: this.analyticsSchema.validate(payload).error.message,
        });
        return;
      }

      const payloadValue = this.analyticsSchema.validate(payload).value;

      if (!payloadValue) {
        res.status(422).json({ message: "Please Provide Valid Value" });
        return;
      }

      const dayDiff = moment(payloadValue.endDate).diff(
        moment(payloadValue.startDate),
        "days"
      );
      const endDate = dayDiff
        ? moment(payloadValue.endDate).toDate()
        : moment(payloadValue.endDate).endOf("day").toDate();

      const diffStartDate = moment(payloadValue.startDate)
        .subtract(dayDiff ? dayDiff : 1, "day")
        .startOf("day")
        .toDate();

      const inOtherConnectCount = await getConnectionCountByAccountId(
        accountId,
        payloadValue.startDate,
        endDate,
        diffStartDate
      );

      const myConnectCount = await getConnectionCountByOwner(
        accountId,
        payloadValue.startDate,
        endDate,
        diffStartDate
      );

      const profileVisitCount = await getProfileVisitCountByOwner(
        accountId,
        payloadValue.startDate,
        endDate,
        diffStartDate
      );

      const linkVisitCount = await getLinkVisitCountByOwner(
        accountId,
        payloadValue.startDate,
        endDate,
        diffStartDate
      );

      const contactCount = await getContactCountByOwner(
        accountId,
        payloadValue.startDate,
        endDate,
        diffStartDate
      );

      res.status(200).json({
        myConnectCount,
        inOtherConnectCount,
        profileVisitCount: profileVisitCount.connect,
        startClickThrow: profileVisitCount.startClickThrow,
        endClickThrow: profileVisitCount.endClickThrow,
        timeSpend: profileVisitCount.timeSpend,
        linkVisitCount,
        contactCount,
      });
    } catch (error) {
      console.log(error);
      log("error", "error in get Analytics", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
