import { Response } from "express";
import Joi from "joi";
import { log } from "winston";
import {
  FeedBackType,
  getFeedbackTypes,
  saveFeedbackType,
} from "../../modules/feedbackType";
import { Request } from "../../request";
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

Sentry.configureScope((scope) => scope.setTransactionName("In Feedback Type"));
export default class Controller {
  private readonly createFeedbackTypeSchema = Joi.object().keys({
    title: Joi.string().required(),
  });

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const payload = req.body;

      if (this.createFeedbackTypeSchema.validate(payload).error) {
        res.status(422).json({
          message: "Invalid Data",
          error: this.createFeedbackTypeSchema.validate(payload).error,
        });
        return;
      }

      const payloadValue =
        this.createFeedbackTypeSchema.validate(payload).value;

      const feedbackType = await saveFeedbackType(
        new FeedBackType({
          ...payloadValue,
        })
      );

      res.status(200).json(feedbackType);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in create feedback type", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
  protected readonly get = async (req: Request, res: Response) => {
    try {
      const feedbackType = await getFeedbackTypes();

      res.status(200).json(feedbackType);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in create feedback type", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
