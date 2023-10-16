import { Response } from "express";
import { Request } from "../../request";

import Joi, { isError } from "joi";
import { log } from "winston";
import * as Sentry from "@sentry/node";
import { get as _get } from "lodash";
import {
  getFaq,
  getFaqById,
  Faq,
  saveFaq,
  updateFaq,
  deleteFaq,
} from "../../modules/faq";

// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_URL,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

Sentry.configureScope((scope) => scope.setTransactionName("In Faqs"));
export default class Controller {
  private readonly createSchema = Joi.object().keys({
    title: Joi.string().required(),
    embeddedLink: Joi.string().required().allow(null, ""),
    description: Joi.string().required().allow(null, ""),
  });
  private readonly updateSchema = Joi.object().keys({
    title: Joi.string().optional(),
    embeddedLink: Joi.string().optional().allow(null, ""),
    description: Joi.string().optional().allow(null, ""),
  });

  protected readonly get = async (req: Request, res: Response) => {
    const FaqId = req.params._id;
    if (FaqId) {
      const faq = await getFaqById(FaqId);
      if (!faq) {
        res.status(422).json({ message: "Invalid Faq." });
        return;
      }
      res.status(200).json(faq);
      return;
    }
    const faqs = await getFaq();
    res.status(200).json(faqs);
  };

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const payload = req.body;

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

      const faq = await saveFaq(
        new Faq({
          ...payloadValue,
        })
      );

      const newFaq = await getFaqById(faq._id);
      res.status(200).json(newFaq);
    } catch (error) {
      console.log(error);
      log("error", "error in create faq", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly update = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const faqId = req.params._id;
      if (!faqId) {
        res.status(422).json({ message: "Invalid Faq." });
        return;
      }
      const faq = await getFaqById(faqId);
      if (!faq) {
        res.status(422).json({ message: "Invalid Faq." });
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

      const updatedFaq = await updateFaq(
        new Faq({ ...faq.toJSON(), ...payloadValue })
      );

      res.status(200).json(updatedFaq);
    } catch (error) {
      console.log(error);
      log("error", "error in Updating Faq", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly delete = async (req: Request, res: Response) => {
    try {
      const faqId = req.params._id;
      if (!faqId) {
        res.status(422).json({ message: "Invalid Faq." });
        return;
      }
      const faq = await getFaqById(faqId);
      if (!faq) {
        res.status(422).json({ message: "Invalid Faq." });
        return;
      }
      await deleteFaq(faqId);
      res.status(200).json({ message: "Faq is Deleted Successfully. " });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in Deleting Faq", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
