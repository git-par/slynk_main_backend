import { Response } from "express";
import Joi from "joi";
import { log } from "winston";
import { getImageById } from "../../../modules/image";
import { get as _get } from "lodash";
import {
  deletePersonalConnectionById,
  getPersonalConnectionByAccountId,
  getPersonalConnectionById,
  IPersonalConnection,
  PersonalConnection,
  savePersonalConnection,
  updatePersonalConnection,
} from "../../../modules/personalConnection";
import { Request } from "../../../request";

import * as Sentry from "@sentry/node";

// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_URL,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

Sentry.configureScope((scope) =>
  scope.setTransactionName("In Personal Connection")
);

export class Controller {
  private readonly personalConnectionValidationSchema = Joi.object().keys({
    profileImage: Joi.string()
      .optional()
      .external(async (v: string) => {
        if (!v) return v;
        const image = await getImageById(v);
        if (!image) {
          throw new Error("Please provide valid image.");
        }
        return v;
      }),
    phone: Joi.string().optional().allow(""),
    email: Joi.string().optional().email(),
    name: Joi.string().required(),
    companyName: Joi.string().optional().allow(""),
    position: Joi.string().optional().allow(""),
    location: Joi.string().optional().allow(""),
    slynk: Joi.string().optional().allow(""),
    instagram: Joi.string().optional().allow(""),
    facebook: Joi.string().optional().allow(""),
    twitter: Joi.string().optional().allow(""),
    account: Joi.string().required(), //it will be automated from middelware
  });

  protected readonly get = async (req: Request, res: Response) => {
    const _id = req.params._id;
    const accountId = req.currentAccountId;
    if (_id) {
      const personalConnection = await getPersonalConnectionById(_id);
      if (!personalConnection) {
        res.status(422).json({ message: "Invalid personal connection." });
        return;
      }
      if (personalConnection.account.toString() !== accountId.toString()) {
        res.status(403).json({ message: "Unauthorized request." });
        return;
      }
      res.status(200).json(personalConnection.toJSON());
      return;
    }
    const personalConnections = await getPersonalConnectionByAccountId(
      accountId
    );
    res.status(200).json(personalConnections);
  };

  protected readonly create = async (req: Request, res: Response) => {
    const accountId = req.currentAccountId;
    const payload = req.body;
    this.personalConnectionValidationSchema
      .validateAsync(payload)
      .then((value) => {
        return {
          account: accountId.toString(),
          ...value,
        } as IPersonalConnection;
      })
      .then((result) => savePersonalConnection(new PersonalConnection(result)))
      .then((result) => res.status(200).json(result))
      .catch((error) => {
        console.log(error);
        Sentry.captureException(error);
        log("error", "error in create personal connection", error);
        res.status(500).json({
          message: "Hmm... Something went wrong. Please try again later.",
          error: _get(error, "message"),
        });
      });
  };

  protected readonly update = async (req: Request, res: Response) => {
    const accountId = req.currentAccountId;
    const payload = req.body;
    const _id = req.params._id;
    this.personalConnectionValidationSchema
      .validateAsync(payload)
      .then(() => getPersonalConnectionById(_id))
      .then((result: PersonalConnection) => {
        if (!result) {
          throw new Error("Personal connection not found.");
        }
        if (result.account.toString() !== accountId.toString()) {
          throw new Error("Unauthorized request.");
        }
        return {
          ...result.toJSON(),
          profileImage: _get(result, "profileImage._id", null),
        } as IPersonalConnection;
      })
      .then((result: IPersonalConnection) =>
        updatePersonalConnection(new PersonalConnection(result))
      )
      .then((result) => res.status(200).json(result))
      .catch((error) => {
        console.log(error);
        Sentry.captureException(error);
        log("error", "error in update personal connection", error);
        console.log(error);
        res.status(500).json({
          message: "Hmm... Something went wrong. Please try again later.",
          error: _get(error, "message"),
        });
      });
  };

  protected readonly delete = async (req: Request, res: Response) => {
    const accountId = req.currentAccountId;
    const _id = req.params._id;

    if (!_id) {
      res.status(422).json({ message: "Invalid personal link." });
      return;
    }
    const personalConnection = await getPersonalConnectionById(_id);
    if (!personalConnection) {
      res.status(422).json({ message: "Invalid personal link." });
      return;
    }
    if (personalConnection.account.toString() !== accountId.toString()) {
      res.status(403).json({ message: "Unauthorized request." });
      return;
    }
    await deletePersonalConnectionById(_id);
    res
      .status(200)
      .json({ message: "Personal connection Successfully removed." });
  };
}
