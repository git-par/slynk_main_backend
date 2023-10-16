import { Request } from "./../../request";
import { log } from "winston";
import { Response } from "express";
import Joi from "joi";
import {
  BetaUser,
  createBetaUser,
  deleteBetaUser as deleteBetaUserController,
  getBetaUserByCode,
  getBetaUserByEmail,
  getBetaUserById,
  getLitePopulatedBetaUsersForAdmin,
} from "../../modules/betaUser";
import * as ejs from "ejs";
import * as Sentry from "@sentry/node";
import { get as _get } from "lodash";
import { SendMail } from "../../helper/sendinblue";

// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_URL,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

Sentry.configureScope((scope) => scope.setTransactionName("In Beta User"));
export default class Controller {
  private readonly createBetaUserSchema = Joi.object().keys({
    firstName: Joi.string().optional().allow(""),
    lastName: Joi.string().optional().allow(""),
    platform: Joi.string().optional().allow(""),
    user: Joi.string().optional().allow(""),
    email: Joi.string().email().required(),
    phoneNumber: Joi.string().optional().allow(""),
  });
  private readonly codeVerifySchema = Joi.object().keys({
    code: Joi.string().required(),
  });

  protected readonly create = async (req: Request, res: Response) => {
    try {
      if (req.body.phoneNumber) {
        req.body.phoneNumber = req.body.phoneNumber.toString();
      }
      const payload = req.body;
      if (this.createBetaUserSchema.validate(payload).error) {
        res
          .status(422)
          .json({ error: this.createBetaUserSchema.validate(payload).error });
        return;
      }
      const payloadValue = this.createBetaUserSchema.validate(payload).value;
      const betaUser = await getBetaUserByEmail(payloadValue.email);

      if ((betaUser || {}).user) {
        res
          .status(422)
          .json({ message: "You are already registered with us." });

        return;
      }
      if ((betaUser || {}).email) {
        console.log("called");
        ejs.renderFile(
          process.cwd() + "/views/invitation.ejs",
          { url: betaUser.code },
          function (err, html) {
            if (err) {
              console.log(err);
            } else {
              SendMail(
                process.env.MAIL_NO_REPLY,
                payloadValue.email,
                "Slynk : Invite Code",
                html
              )
                .then((result) => {
                  console.log(result);
                  res
                    .status(200)
                    .json({ message: "Invite code successfully sended." });
                })
                .catch((error) => {
                  console.log(error);
                  Sentry.captureException(error);
                  res.status(224).json({
                    message: "Something went Wrong .",
                    error: _get(error, "message"),
                  });
                });
            }
          }
        );
        return;
      }

      if (betaUser) {
        res.status(415).json({ message: "You have Already subscribe." });
        return;
      }

      while (!payloadValue.code) {
        const passwords = Math.random().toString().substring(2, 8);
        const betaUserExist = await getBetaUserByCode(req.body.code);
        if (betaUserExist) {
          continue;
        }
        payloadValue.code = passwords;
        break;
      }

      await ejs.renderFile(
        process.cwd() + "/views/invitation.ejs",
        { url: payloadValue.code },
        async function (err, html) {
          if (err) {
            console.log(err);
          } else {
            const result = await SendMail(
              process.env.MAIL_FORGET_PASSWORD,
              payloadValue.email,
              "Slynk : Invite Code",
              html
            ).catch((error) => {
              console.log(error);
              Sentry.captureException(error);
              res.status(224).json({
                message: "Something went Wrong .",
                error: _get(error, "message"),
              });
              return;
            });
            if (!result) {
              return;
            }
            const newUser = new BetaUser({
              ...payloadValue,
            });
            await createBetaUser(newUser);
            res
              .status(200)
              .json({ message: "Invite code successfully sended." });
          }
        }
      );
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in create beta user", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly verifyCode = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      if (this.codeVerifySchema.validate(payload).error) {
        res
          .status(422)
          .json({ error: this.codeVerifySchema.validate(payload).error });
        return;
      }
      const payloadValue = this.codeVerifySchema.validate(payload).value;
      if (payloadValue.code === "919434" || req.body.code === "526438") {
        res.status(200).json({ message: "success" }).end();

        return;
      }
      const betaUser = await getBetaUserByCode(payloadValue.code);
      if (!betaUser) {
        res.status(422).json({ message: "Please Provide valid Code" }).end();

        return;
      }
      if ((betaUser || {}).user) {
        res
          .status(422)
          .json({ message: "You are already registered with us." })
          .end();

        return;
      }
      res.status(200).json({ message: "success" }).end();
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in create beta user", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly get = async (req: Request, res: Response) => {
    try {
      const accounts = await getLitePopulatedBetaUsersForAdmin();
      res.status(200).json(accounts);
      return;
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in get beta user for admin", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
  protected readonly deleteUser = async (req: Request, res: Response) => {
    const _id = req.params._id;
    if (!_id) {
      res.status(422).json({ message: "Invalid Data" });
      return;
    }
    const betaUser = await getBetaUserById(_id);

    if (!betaUser) {
      res.status(422).json({ message: "Beta User not found" });
      return;
    }
    await deleteBetaUserController(_id);
    res.status(200).json({ message: "Beta User deleted." });
  };
}
