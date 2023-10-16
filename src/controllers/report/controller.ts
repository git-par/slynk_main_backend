import { Response } from "express";
import { Request } from "../../request";
import Joi, { isError } from "joi";
import { log } from "winston";
import * as Sentry from "@sentry/node";
import { get as _get } from "lodash";
import {
  deleteReport,
  getReport,
  getReportById,
  Report,
  saveReport,
  updateReport,
} from "../../modules/report";
import { getAccountById } from "../../modules/account";

// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_URL,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

Sentry.configureScope((scope) => scope.setTransactionName("In Reports"));
export default class Controller {
  private readonly createSchema = Joi.object().keys({
    title: Joi.string().required(),
    description: Joi.string().required(),
    reportedAccount: Joi.string()
      .required()
      .external(async (v: string) => {
        if (!v) return v;
        const image = await getAccountById(v);
        if (!image) {
          throw new Error("Please provide valid Account.");
        }
        return v;
      }),
  });
  private readonly updateSchema = Joi.object().keys({
    title: Joi.string().optional(),
    description: Joi.string().optional(),
    // reportedUser: Joi.string().optional().allow(null, ""),
  });

  protected readonly get = async (req: Request, res: Response) => {
    const reportId = req.params._id;
    if (reportId) {
      const report = await getReportById(reportId);
      if (!report) {
        res.status(422).json({ message: "Invalid Report." });
        return;
      }
      res.status(200).json(report);
      return;
    }
    const reports = await getReport();
    res.status(200).json(reports);
  };

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const authUser = req.authUser;
      const payloadValue = await this.createSchema
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

      const report = await saveReport(
        new Report({
          ...payloadValue,
          reportBy: authUser._id,
        })
      );

      await getReportById(report._id);
      res.status(200).json({ message: "report successfully submitted." });
    } catch (error) {
      console.log(error);
      log("error", "error in create Report", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly update = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const reportId = req.params._id;
      if (!reportId) {
        res.status(422).json({ message: "Invalid Report." });
        return;
      }
      const report = await getReportById(reportId);
      if (!report) {
        res.status(422).json({ message: "Invalid Report." });
        return;
      }

      const payloadValue = await this.updateSchema
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

      const updatedReport = await updateReport(
        new Report({ ...report.toJSON(), ...payloadValue })
      );

      res.status(200).json(updatedReport);
    } catch (error) {
      console.log(error);
      log("error", "error in Updating Report", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly delete = async (req: Request, res: Response) => {
    try {
      const reportId = req.params._id;
      if (!reportId) {
        res.status(422).json({ message: "Invalid Report." });
        return;
      }
      const report = await getReportById(reportId);
      if (!report) {
        res.status(422).json({ message: "Invalid Report." });
        return;
      }
      await deleteReport(reportId);
      res.status(200).json({ message: "Report is Deleted Successfully. " });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in Deleting Report", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
