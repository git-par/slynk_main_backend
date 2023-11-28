import { Response } from "express";
import { get as _get } from "lodash";
import { Request } from "../../../request";
import Joi from "joi";
import { log } from "winston";
import * as Sentry from "@sentry/node";
import { getAccountById } from "../../../modules/account";
import {
  CustomQR,
  deleteCustomQR,
  getCustomQRByAccountId,
  getCustomQRById,
  getCustomQRByURL,
  saveCustomQR,
  updateCustomQR,
} from "../../../modules/customQR";

// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_URL,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

Sentry.configureScope((scope) => scope.setTransactionName("In Custom QR"));

export default class Controller {
  private readonly createCustomQRSchema = Joi.object().keys({
    accountId: Joi.string()
      .required()
      .external(async (val: string) => {
        const account = await getAccountById(val);
        if (!account) {
          throw new Error("Please provide valid account.");
        }
        return val;
      }),
    URL: Joi.string()
      .required()
      .external(async (val: string) => {
        const account = await getCustomQRByURL(val);
        if (account) {
          throw new Error("This URL is already in use.");
        }
        return val;
      }),
    type: Joi.string().required().valid("PERSONAL", "PROFESSIONAL"),
  });

  private readonly updateCustomQRSchema = Joi.object().keys({
    accountId: Joi.string()
      .required()
      .external(async (val: string) => {
        const account = await getAccountById(val);
        if (!account) {
          throw new Error("Please provide valid account.");
        }
        return val;
      }),
    URL: Joi.string().optional(),
    type: Joi.string().optional().valid("PERSONAL", "PROFESSIONAL"),
  });

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const payloadValue = await this.createCustomQRSchema
        .validateAsync(payload)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          console.log(e);
          res.status(422).json({ message: e.message });
        });
      if (!payloadValue) {
        return;
      }

      const customQR = await saveCustomQR(new CustomQR({ ...payloadValue }));
      res.status(200).json(customQR);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      console.log(error.message);
      log("error", "error in create custom QR", error);
      console.log(error);
      res.status(500).json({
        message: _get(error, "message"),
        error: "Hmm... Something went wrong. Please try again later.",
      });
    }
  };

  protected readonly get = async (req: Request, res: Response) => {
    try {
      const { customQRId } = req.params;
      if (customQRId) {
        const customQR = await getCustomQRById(customQRId);
        if (!customQR) {
          res.status(422).json({ message: "Please provide valid custom QR." });
          return;
        }

        res.status(200).json(customQR);
        return;
      }

      if (!req.body.accountId) {
        res.status(422).json({ message: "Please provide valid account." });
        return;
      }

      const customQR = await getCustomQRByAccountId(req.body.accountId);
      res.status(200).json(customQR);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      console.log(error.message);
      log("error", "error in get custom QR", error);
      console.log(error);
      res.status(500).json({
        message: _get(error, "message"),
        error: "Hmm... Something went wrong. Please try again later.",
      });
    }
  };

  protected readonly update = async (req: Request, res: Response) => {
    try {
      const { customQRId } = req.params;
      if (!customQRId) {
        res.status(422).json({ message: "Please provide valid custom QR." });
        return;
      }

      const customQR = await getCustomQRById(customQRId);
      if (!customQR) {
        res.status(422).json({ message: "Please provide valid custom QR." });
        return;
      }

      const payload = req.body;

      const payloadValue = await this.updateCustomQRSchema
        .validateAsync(payload)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          console.log(e);
          res.status(422).json({ message: e.message });
        });
      if (!payloadValue) {
        return;
      }

      if (payloadValue.accountId !== customQR.accountId.toString()) {
        res.status(403).json({ message: "Unauthorize Request." });
        return;
      }

      if (payloadValue.URL && payloadValue.URL !== customQR.URL) {
        const tmp = await getCustomQRByURL(payloadValue.URL);
        if (tmp) {
          res.status(422).json({ message: "This URL is already in use." });
          return;
        }
      }
      const updatedCustomQR = new CustomQR({
        ...customQR,
        ...payloadValue,
      });

      await updateCustomQR(updatedCustomQR);

      res.status(200).json(updatedCustomQR);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      console.log(error.message);
      log("error", "error in create custom QR", error);
      console.log(error);
      res.status(500).json({
        message: _get(error, "message"),
        error: "Hmm... Something went wrong. Please try again later.",
      });
    }
  };

  protected readonly delete = async (req: Request, res: Response) => {
    try {
      const { customQRId } = req.params;
      if (!customQRId) {
        res.status(422).json({ message: "Please provide valid custom QR." });
        return;
      }

      const customQR = await getCustomQRById(customQRId);
      if (!customQR) {
        res.status(422).json({ message: "Please provide valid custom QR." });
        return;
      }

      if (req.body.accountId !== customQR.accountId) {
        res.status(403).json({ message: "Unauthorize Request." });
        return;
      }

      await deleteCustomQR(customQRId);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      console.log(error.message);
      log("error", "error in delete custom QR", error);
      console.log(error);
      res.status(500).json({
        message: _get(error, "message"),
        error: "Hmm... Something went wrong. Please try again later.",
      });
    }
  };
}
