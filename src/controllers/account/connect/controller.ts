import { Response } from "express";
import Joi, { isError } from "joi";
// import { isArray } from "lodash";
import { get as _get } from "lodash";
import { io } from "../../../server";
// import { log } from "winston";
import { getAccountById } from "../../../modules/account";
import {
  Connect,
  deleteConnect,
  getPopulatedConnectByAccountId,
  getPopulatedConnectById,
  // IConnect,
  saveConnect,
  updateConnect,
  getConnectionByAccountAndTargetedAccount,
} from "../../../modules/connect";
import { Request } from "../../../request";

import * as Sentry from "@sentry/node";
import { sendNotification } from "../../../helper/notification";
// import { _addTracingExtensions } from "@sentry/tracing/dist/hubextensions";

// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_URL,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

Sentry.configureScope((scope) => scope.setTransactionName("In Connect"));

export default class Controller {
  private readonly connectValidationSchema = Joi.object().keys({
    targetAccount: Joi.object()
      .required()
      .keys({
        account: Joi.string()
          .required()
          .external(async (value) => {
            const account = await getAccountById(value);
            if (!account) {
              throw new Error("Invalid targeted account ID");
            }
            return value;
          }),
      }),
  });
  private readonly newRequestValidationSchema = Joi.object().keys({
    newRequest: Joi.boolean().required,
  });

  protected readonly get = async (req: Request, res: Response) => {
    const _id = req.params._id;
    const accountId = req.currentAccountId;
    if (_id) {
      const connect = await getPopulatedConnectById(_id);
      if (!connect) {
        res.status(422).json({ message: "Invalid  connection." });
        return;
      }
      if (connect.account.toString() !== accountId.toString()) {
        res.status(403).json({ message: "Unauthorized request." });
        return;
      }
      res.status(200).json(connect.toJSON());

      return;
    }
    const connects = await getPopulatedConnectByAccountId(accountId);
    const newConnect = connects.filter(
      (item) => !_get(item, "targetAccount.account.isArchive")
    );
    // let notificationObj = {
    //   tokens: [payloadValue.pushToken],
    //   notification: {
    //     title: "🎉 Sign-up Successful! 🎉",
    //     body: "🎉 Welcome to ScaleUp! It's the perfect time to unleash your creativity and bring your ideas to life with Upscale creation. Start exploring now! You got 3 Pixels free...",
    //   },
    //   data: {
    //     type: "google Sign-up notification",
    //   },
    // };
    // await sendNotification(notificationObj);
    res.status(200).json(newConnect);
  };

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const accountId = req.currentAccountId;

      const payload = req.body;
      const payloadValue = await this.connectValidationSchema
        .validateAsync({
          targetAccount: payload.targetAccount,
        })
        .then((value) => {
          return value;
        })
        .catch((e) => {
          console.log(e);
          if (isError(e)) {
            res.status(422).json(e);
          } else {
            res.status(422).json({ message: e.message });
          }
        });

      if (!payloadValue) {
        return;
      }

      if (!payloadValue.targetAccount) {
        res.status(422).json({ message: "Invalid account." });
        return;
      }
      if (
        payloadValue.targetAccount.account.toString() === accountId.toString()
      ) {
        res.status(415).json({ message: "You can not connect Your Self." });
        return;
      }

      const targetAccount = await getAccountById(
        payloadValue.targetAccount.account
      );
      if (!targetAccount) {
        res.status(422).json({ message: "Invalid account." });
        return;
      }

      const newConnect = await saveConnect(
        new Connect({
          ...payloadValue,
          account: accountId.toString(),
          isSlynkUser: true,
        })
      );
      // console.log({ newConnect }, "?????????????");

      io.emit("saveConnection", newConnect);

      res.status(200).json({
        newConnect,
        message: `${targetAccount.firstName} ${targetAccount.lastName}  successfully added in your connection.`,
      });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  // protected readonly update = async (req: Request, res: Response) => {
  //   try {
  //     const _id = req.params._id;
  //     const accountId = req.currentAccountId;

  //     if (!_id) {
  //       res.status(422).json({ message: "Invalid account." });
  //       return;
  //     }

  //     const account = await getAccountById(accountId);
  //     if (!account) {
  //       res.status(422).json({ message: "Invalid account." });
  //       return;
  //     }

  //     const connection = await getConnectById(_id);

  //     if(!connection) {
  //       res.status(422).json({ message: "Invalid Connection." });
  //       return;
  //     }
  //   } catch (error) {
  // console.log(error)
  //     log("error", "error in update account", error);

  //     res.status(500).json({
  //       message: "Hmm... Something went wrong. Please try again later.",
  //       error: _get(error,"message"),
  //     });
  //   }
  // };

  protected readonly delete = async (req: Request, res: Response) => {
    // console.log(req.authUser,">>>>>>>>>>>>>>>>>>>>>>>>>>>");
    const user=req.authUser
    const _id = req.params._id;
    const accountId = req.currentAccountId;
    if (!_id) {
      res.status(422).json({ message: "Invalid  connection." });
      return;
    }
    const connect = await getPopulatedConnectById(_id);
    if (!connect) {
      res.status(422).json({ message: "Invalid  connection." });
      return;
    }
    if (connect.account.toString() !== accountId.toString()) {
      res.status(403).json({ message: "Unauthorized request." });
      return;
    }
    await deleteConnect(connect._id);
    let notificationObj = {
      tokens: [...user.FCMToken],
      notification: {
        title: "Dalle - create art with api",
        body: "🎉 Welcome to Dalle! It's the perfect time to unleash your creativity and bring your ideas to life with text-to-image creation. Start exploring now!",
      },
    };
    await sendNotification(notificationObj);
    res.status(200).json({
      message: `${connect.firstName} was Successfully removed from your Connect.`,
    });
  };

  protected readonly new_request = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      // const accountId = req.params.accountId;
      // const payload = req.body;
      // if (this.newRequestValidationSchema.validate(payload).error) {
      //   res.status(422).json({ message: "Invalid Data." });
      //   return;
      // }
      if (!id) {
        res.status(422).json({ message: "Invalid Account." });
        return;
      }
      const connection = await getPopulatedConnectById(id);
      if (!connection) {
        res.status(422).json({ message: "Invalid Connection." });
        return;
      }

      // if (accountId.toString() !== connection.account.toString()) {
      //   res.status(403).json({ message: "Unauthorized request." });
      //   return;
      // }

      const newConnection = new Connect({
        ...connection,
        newRequest: false,
      });

      const updatedConnection = await updateConnect(newConnection);
      res.status(200).json({ updatedConnection });
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly targetAccount = async (req: Request, res: Response) => {
    try {
      const _id = req.params.id;
      const accountId = req.currentAccountId;

      const connect = await getConnectionByAccountAndTargetedAccount({
        account: accountId,
        targetAccount: {
          account: _id,
        },
      });

      res.status(200).json(connect);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly privateAccount = async (req: Request, res: Response) => {
    try {
      const accountId = req.currentAccountId;
      const _id = req.params.id;

      const connect = await getConnectionByAccountAndTargetedAccount({
        account: _id,
        targetAccount: {
          account: accountId,
        },
      });

      res.status(200).json(connect ? true : false);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
