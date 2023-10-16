import { Response } from "express";
import { Request } from "../../request";

import Joi, { isError } from "joi";
import { log } from "winston";
import * as Sentry from "@sentry/node";
import { get as _get } from "lodash";
import {
  getTutorial,
  getTutorialById,
  Tutorial,
  saveTutorial,
  updateTutorial,
  deleteTutorial,
} from "../../modules/tutorial";

// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_URL,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

Sentry.configureScope((scope) => scope.setTransactionName("In Tutorials"));
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
    const TutorialId = req.params._id;
    if (TutorialId) {
      const tutorial = await getTutorialById(TutorialId);
      if (!tutorial) {
        res.status(422).json({ message: "Invalid Tutorial." });
        return;
      }
      res.status(200).json(tutorial);
      return;
    }
    const tutorials = await getTutorial();
    res.status(200).json(tutorials);
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

      const tutorial = await saveTutorial(
        new Tutorial({
          ...payloadValue,
        })
      );

      const newTutorial = await getTutorialById(tutorial._id);
      res.status(200).json(newTutorial);
    } catch (error) {
      console.log(error);
      log("error", "error in create tutorial", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly update = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const tutorialId = req.params._id;
      if (!tutorialId) {
        res.status(422).json({ message: "Invalid Tutorial." });
        return;
      }
      const tutorial = await getTutorialById(tutorialId);
      if (!tutorial) {
        res.status(422).json({ message: "Invalid Tutorial." });
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

      const updatedTutorial = await updateTutorial(
        new Tutorial({ ...tutorial.toJSON(), ...payloadValue })
      );

      res.status(200).json(updatedTutorial);
    } catch (error) {
      console.log(error);
      log("error", "error in Updating Tutorial", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly delete = async (req: Request, res: Response) => {
    try {
      const tutorialId = req.params._id;
      if (!tutorialId) {
        res.status(422).json({ message: "Invalid Tutorial." });
        return;
      }
      const tutorial = await getTutorialById(tutorialId);
      if (!tutorial) {
        res.status(422).json({ message: "Invalid Tutorial." });
        return;
      }
      await deleteTutorial(tutorialId);
      res.status(200).json({ message: "Tutorial is Deleted Successfully. " });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in Deleting Tutorial", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
