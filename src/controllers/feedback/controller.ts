import { Response } from "express";
import Joi, { isError } from "joi";
import { log } from "winston";
// import { getBetaUsers } from "../../modules/betaUser";
import {
  FeedBack,
  getFeedback,
  saveFeedback,
  getFeedBackById,
  updateFeedback,
  getPopulatedFeedback,
} from "../../modules/feedback";
import { getUserByEmail, getUsers, IUser } from "../../modules/user";
import { Request } from "./../../request";
import * as Sentry from "@sentry/node";
import { get as _get } from "lodash";
import { SendMail } from "../../helper/sendinblue";
import { getImageById } from "../../modules/image";
// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_URL,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

Sentry.configureScope((scope) => scope.setTransactionName("In FeedBack"));
export default class Controller {
  private readonly createFeedbackSchema = Joi.object().keys({
    messageType: Joi.string().required(),
    responseType: Joi.boolean().required(),
    subject: Joi.string().required(),
    message: Joi.string().required(),
    account: Joi.string().required(),
    attachment: Joi.array()
      .optional()
      .external((value) => {
        if (!value) return;
        value.map(async (item) => {
          const image = await getImageById(item.toString());

          if (!image) throw Error;
        });
        return value;
      }),
  });

  private readonly updateFeedbackSchema = Joi.object().keys({
    isCompleted: Joi.boolean().optional(),
    isDeleted: Joi.boolean().optional(),
    isArchived: Joi.boolean().optional(),
  });

  private readonly adminFeedbackSchema = Joi.object().keys({
    email: Joi.string()
      .email()
      .required()
      .external(async (v: string) => {
        const user: IUser = await getUserByEmail(v);
        if (!user) {
          throw new Error("Provide Valid Email");
        }
        return v;
      }),
    from: Joi.string().required(),
    subject: Joi.string().required(),
    message: Joi.string().required(),
  });

  private readonly adminReplyAllSchema = Joi.object().keys({
    subject: Joi.string().required(),
    message: Joi.string().required(),
  });

  protected readonly get = async (req: Request, res: Response) => {
    try {
      const feedback = await getFeedback();

      res.status(200).json(feedback);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in sending FeedBack", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const payload = req.body;

      const payloadValue = await this.createFeedbackSchema
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
      const user = req.authUser;

      await saveFeedback(
        new FeedBack({
          ...payloadValue,
          email: user.email,
          userId: user._id,
          accountId: payloadValue.account,
          isArchived: false,
          isCompleted: false,
          isDeleted: false,
        })
      );

      SendMail(
        user.email,
        process.env.MAIL_BETASUPPORT,
        payloadValue.subject,
        payloadValue.message
      )
        .then(() => {
          res.status(200).json({ message: "Thank you for your feedback." });
        })
        .catch((error) => {
          console.log(error);
          Sentry.captureException(error);
          res.status(224).json({
            message: "Thank you for your feedback.",
          });
        });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in sending FeedBack", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly admin_feedback = async (req: Request, res: Response) => {
    try {
      const payload = req.body;

      await this.adminFeedbackSchema
        .validateAsync(payload)
        .then((result) => {
          SendMail(result.from, result.email, result.subject, result.message)
            .then(() => {
              res.status(200).json({ message: "Reply has been Sent." });
            })
            .catch((error) => {
              console.log(error);
              res.status(224).json({
                message: "Hmm... Something went wrong. Please try again later.",
                error: _get(error, "message"),
              });
            });
        })
        .catch((e) => {
          console.log(e);
          if (isError(e)) {
            res.status(422).json(e);
          } else {
            res.status(422).json({ message: e.message });
          }
        });
    } catch (error) {
      console.log(error);
      log("error", "error in sending FeedBack", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly replyAllUser = async (req: Request, res: Response) => {
    try {
      const payload = req.body;

      if (this.adminReplyAllSchema.validate(payload).error) {
        res
          .status(422)
          .json({ message: this.adminReplyAllSchema.validate(payload).error });
        return;
      }

      const payloadValue = this.adminReplyAllSchema.validate(payload).value;

      // const betaUser = await getBetaUsers();
      const user = await getUsers();

      // const betaUserEmail = betaUser.map((item) => item.email);
      const userEmail = user.map((item) => item.email);

      // const allUserMail = betaUserEmail.concat(
      // userEmail.filter((value) => !betaUserEmail.includes(value))
      // );

      await Promise.allSettled(
        userEmail.map(async (item) => {
          await SendMail(
            process.env.MAIL_BETASUPPORT,
            item,
            payloadValue.subject,
            payloadValue.message
          );
        })
      );

      res.status(200).json({ message: "Mail Successfully send." });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in sending FeedBack", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly updateFeedback = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const feedbackId = req.params.id;
      if (!feedbackId) {
        res.status(422).json({ message: "Invalid feedback." });
        return;
      }
      const feedback = await getFeedBackById(feedbackId);
      if (!feedback) {
        res.status(422).json({ message: "Invalid feedback." });
        return;
      }

      const payloadValue = await this.updateFeedbackSchema
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

      const updatedFeedback = await updateFeedback(
        new FeedBack({ ...feedback.toJSON(), ...payloadValue })
      );
      const populatedFeedback = await getPopulatedFeedback(
        updatedFeedback._id.toString()
      );

      res.status(200).json(populatedFeedback);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in update FeedBack", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
