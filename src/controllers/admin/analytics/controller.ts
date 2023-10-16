import { Response } from "express";
import { Request } from "../../../request";
import { get as _get } from "lodash";
import Joi from "joi";
import { log } from "winston";
import { getLinkVisitForAdmin } from "../../../modules/analyticsLinkVisit/admin";
import { getProfileVisitForAdmin } from "../../../modules/analyticsProfileVisit/admin";
import { getContactCountForAdmin } from "../../../modules/analyticsContactCount/admin";
import moment from "moment";

export default class Controller {
  private readonly analyticsSchema = Joi.object().keys({
    endDate: Joi.date().required(),
    startDate: Joi.date().required().less(Joi.ref("endDate")),
  });

  protected readonly getAnalytics = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      if (this.analyticsSchema.validate(payload).error) {
        res.status(422).json({
          message: this.analyticsSchema.validate(payload).error.message,
        });
        return;
      }
      const payloadValue = this.analyticsSchema.validate(payload).value;

      const endDate = moment(payloadValue.endDate)
        // .startOf("month")
        .toDate();
      const startDate = moment(payloadValue.startDate)
        // .endOf("month")
        .toDate();

      const linkVisitCount = await getLinkVisitForAdmin(startDate, endDate);
      const profileVisitCount = await getProfileVisitForAdmin(
        startDate,
        endDate
      );
      const contactCardCount = await getContactCountForAdmin(
        startDate,
        endDate
      );

      res
        .status(200)
        .json({ linkVisitCount, profileVisitCount, contactCardCount });
    } catch (error) {
      console.log("error in get Analytics", error);
      log("error", "error in get Analytics", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
