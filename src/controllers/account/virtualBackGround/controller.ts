import { Response } from "express";
import { get as _get } from "lodash";
import { Request } from "../../../request";
import Joi from "joi";
import { log } from "winston";
import * as Sentry from "@sentry/node";
import { getAccountById } from "../../../modules/account";
import {
  VirtualBackGround,
  deleteVirtualBackGround,
  getVirtualBackGroundByAccountId,
  getVirtualBackGroundById,
  getVirtualBackGroundByURL,
  saveVirtualBackGround,
  updateVirtualBackGround,
} from "../../../modules/VirtualBackGround";

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
  private readonly createVirtualBackGroundSchema = Joi.object().keys({
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
        const account = await getVirtualBackGroundByURL(val);
        if (account) {
          throw new Error("This URL is already in use.");
        }
        return val;
      }),
    type: Joi.string().required().valid("PERSONAL", "PROFESSIONAL"),
  });

  private readonly updateVirtualBackGroundSchema = Joi.object().keys({
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
      const payloadValue = await this.createVirtualBackGroundSchema
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

      const virtualBackGround = await saveVirtualBackGround(new VirtualBackGround({ ...payloadValue }));
      res.status(200).json(virtualBackGround);
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
      const { virtualBackGroundId } = req.params;
      if (virtualBackGroundId) {
        const virtualBackGround = await getVirtualBackGroundById(virtualBackGroundId);
        if (!virtualBackGround) {
          res.status(422).json({ message: "Please provide valid custom QR." });
          return;
        }

        res.status(200).json(virtualBackGround);
        return;
      }

      if (!req.body.accountId) {
        res.status(422).json({ message: "Please provide valid account." });
        return;
      }

      const virtualBackGround = await getVirtualBackGroundByAccountId(req.body.accountId);
      res.status(200).json(virtualBackGround);
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
      const { virtualBackGroundId } = req.params;
      if (!virtualBackGroundId) {
        res.status(422).json({ message: "Please provide valid custom QR." });
        return;
      }

      const virtualBackGround = await getVirtualBackGroundById(virtualBackGroundId);
      if (!virtualBackGround) {
        res.status(422).json({ message: "Please provide valid custom QR." });
        return;
      }

      const payload = req.body;

      const payloadValue = await this.updateVirtualBackGroundSchema
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

      if (payloadValue.accountId !== virtualBackGround.accountId.toString()) {
        res.status(403).json({ message: "Unauthorize Request." });
        return;
      }

      if (payloadValue.URL && payloadValue.URL !== virtualBackGround.URL) {
        const tmp = await getVirtualBackGroundByURL(payloadValue.URL);
        if (tmp) {
          res.status(422).json({ message: "This URL is already in use." });
          return;
        }
      }
      const updatedVirtualBackGround = new VirtualBackGround({
        ...virtualBackGround,
        ...payloadValue,
      });

      await updateVirtualBackGround(updatedVirtualBackGround);

      res.status(200).json(updatedVirtualBackGround);
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
      const { virtualBackGroundId } = req.params;
      if (!virtualBackGroundId) {
        res.status(422).json({ message: "Please provide valid custom QR." });
        return;
      }

      const virtualBackGround = await getVirtualBackGroundById(virtualBackGroundId);
      if (!virtualBackGround) {
        res.status(422).json({ message: "Please provide valid custom QR." });
        return;
      }

      if (req.body.accountId !== virtualBackGround.accountId) {
        res.status(403).json({ message: "Unauthorize Request." });
        return;
      }

      await deleteVirtualBackGround(virtualBackGroundId);
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
