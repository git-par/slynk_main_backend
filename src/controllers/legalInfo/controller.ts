import { Response } from "express";
import { Request } from "../../request";

import Joi, { isError } from "joi";
import { log } from "winston";
import * as Sentry from "@sentry/node";
import { get as _get } from "lodash";
import {
  deleteLegalInfo,
  getLegalInfo,
  getLegalInfoById,
  LegalInfo,
  saveLegalInfo,
  updateLegalInfo,
} from "../../modules/legalInfo";

// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_URL,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

Sentry.configureScope((scope) => scope.setTransactionName("In LegalInfos"));
export default class Controller {
  private readonly createSchema = Joi.object().keys({
    title: Joi.string().required(),
    url: Joi.string().required().allow(null, ""),
  });
  private readonly updateSchema = Joi.object().keys({
    title: Joi.string().optional(),
    url: Joi.string().optional().allow(null, ""),
  });

  protected readonly get = async (req: Request, res: Response) => {
    const legalInfoId = req.params._id;
    if (legalInfoId) {
      const legalInfo = await getLegalInfoById(legalInfoId);
      if (!legalInfo) {
        res.status(422).json({ message: "Invalid LegalInfo." });
        return;
      }
      res.status(200).json(legalInfo);
      return;
    }
    const legalInfos = await getLegalInfo();
    res.status(200).json(legalInfos);
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

      const legalInfo = await saveLegalInfo(
        new LegalInfo({
          ...payloadValue,
        })
      );

      const newLegalInfo = await getLegalInfoById(legalInfo._id);
      res.status(200).json(newLegalInfo);
    } catch (error) {
      console.log(error);
      log("error", "error in create LegalInfo", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly update = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const legalInfoId = req.params._id;
      if (!legalInfoId) {
        res.status(422).json({ message: "Invalid LegalInfo." });
        return;
      }
      const legalInfo = await getLegalInfoById(legalInfoId);
      if (!legalInfo) {
        res.status(422).json({ message: "Invalid LegalInfo." });
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

      const updatedLegalInfo = await updateLegalInfo(
        new LegalInfo({ ...legalInfo.toJSON(), ...payloadValue })
      );

      res.status(200).json(updatedLegalInfo);
    } catch (error) {
      console.log(error);
      log("error", "error in Updating LegalInfo", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly delete = async (req: Request, res: Response) => {
    try {
      const legalInfoId = req.params._id;
      if (!legalInfoId) {
        res.status(422).json({ message: "Invalid LegalInfo." });
        return;
      }
      const legalInfo = await getLegalInfoById(legalInfoId);
      if (!legalInfo) {
        res.status(422).json({ message: "Invalid LegalInfo." });
        return;
      }
      await deleteLegalInfo(legalInfoId);
      res.status(200).json({ message: "LegalInfo is Deleted Successfully. " });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in Deleting LegalInfo", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
