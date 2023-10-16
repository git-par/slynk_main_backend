import { Response } from "express";
import Joi from "joi";
import { log } from "winston";
import { Request } from "../../request";
import * as Sentry from "@sentry/node";
import { get as _get } from "lodash";
import { deleteReportType, getReportTypeById, getReportTypes, ReportType, saveReportType } from "../../modules/reportType";

// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_URL,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

Sentry.configureScope((scope) => scope.setTransactionName("In Report Type"));
export default class Controller {
  private readonly createReportTypeSchema = Joi.object().keys({
    title: Joi.string().required(),
  });

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const payload = req.body;

      if (this.createReportTypeSchema.validate(payload).error) {
        res.status(422).json({
          message: "Invalid Data",
          error: this.createReportTypeSchema.validate(payload).error,
        });
        return;
      }

      const payloadValue =
        this.createReportTypeSchema.validate(payload).value;

      const reportType = await saveReportType(
        new ReportType({
          ...payloadValue,
        })
      );

      res.status(200).json(reportType);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in create Report Type", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
  protected readonly get = async (req: Request, res: Response) => {
    try {
      const reportType = await getReportTypes();

      res.status(200).json(reportType);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in create Report Type", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly delete = async (req: Request, res: Response) => {
    try {
      const reportTypeId = req.params._id;
      if (!reportTypeId) {
        res.status(422).json({ message: "Invalid ReportType." });
        return;
      }
      const reportType = await getReportTypeById(reportTypeId);
      if (!reportType) {
        res.status(422).json({ message: "Invalid ReportType." });
        return;
      }
      await deleteReportType(reportTypeId);
      res.status(200).json({ message: "ReportType is Deleted Successfully. " });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in Deleting ReportType", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
