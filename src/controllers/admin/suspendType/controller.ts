import { Response } from "express";
import Joi from "joi";
import { log } from "winston";
import {
  SuspendType,
  getSuspendTypes,
  saveSuspendType,
  getSuspendTypeById,
  updateSuspendType,
} from "../../../modules/suspendType";
import { Request } from "../../../request";
import * as Sentry from "@sentry/node";
import { get as _get } from "lodash";

// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_URL,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

Sentry.configureScope((scope) => scope.setTransactionName("In Suspend Type"));

export default class Controller {
  private readonly createSuspendTypeSchema = Joi.object().keys({
    reason: Joi.string().required(),
  });
  private readonly updateSuspendTypeSchema = Joi.object().keys({
    reason: Joi.string().optional(),
  });
  protected readonly create = async (req: Request, res: Response) => {
    try {
      const payload = req.body;

      if (this.createSuspendTypeSchema.validate(payload).error) {
        res.status(422).json({
          message: "Invalid Data",
          error: this.createSuspendTypeSchema.validate(payload).error,
        });
        return;
      }
      const payloadValue = this.createSuspendTypeSchema.validate(payload).value;
      const suspendType = await saveSuspendType(
        new SuspendType({ ...payloadValue })
      );
      res.status(200).json(suspendType);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in create suspend type", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly get = async (req: Request, res: Response) => {
    try {
      const suspendType = await getSuspendTypes();
      res.status(200).json(suspendType);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in create suspend type", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly update = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      if (!id) {
        res.status(422).json({ message: "Invalid Suspend Type." });
        return;
      }

      const suspendType = await getSuspendTypeById(id);
      if (!suspendType) {
        res.status(422).json({ message: "Invalid Suspend Type." });
      }

      const payload = req.body;
      if (this.updateSuspendTypeSchema.validate(payload).error) {
        res.status(422).json({
          error: this.updateSuspendTypeSchema.validate(payload).error,
        });
        return;
      }

      const payloadValue = this.updateSuspendTypeSchema.validate(payload).value;
      const updatedSuspendType = new SuspendType({
        ...suspendType.toJSON(),
        ...payloadValue,
      });

      await updateSuspendType(updatedSuspendType);

      res.status(200).json(updatedSuspendType);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in update suspend type", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
