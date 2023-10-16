import { Response } from "express";
import Joi, { isError } from "joi";
import { get as _get } from "lodash";
import * as ejs from "ejs";
import { log } from "winston";
import { getAccountById } from "../../modules/account";
import {
  Connect,
  getConnectById,
  getIncomingConnectionWithConnection,
  getReverseConnection,
  saveConnect,
  updateConnect,
} from "../../modules/connect";
import {
  deleteIncomingConnection,
  getIncomingConnectionByAccountIdAndTargetAccount,
  getIncomingConnectionById,
  getNewRequestBySlynkAndNonSlynk,
  getPopulatedIncomingConnectionByID,
  getPopulatedIncomingConnectionByTargetAccountId,
  getReverseIncomingConnection,
  IncomingConnection,
  saveIncomingConnection,
  updateIncomingConnection,
} from "../../modules/incomingConnection";
import { Request } from "./../../request";
import * as Sentry from "@sentry/node";
import { SendMail } from "../../helper/sendinblue";

// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_URL,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

Sentry.configureScope((scope) =>
  scope.setTransactionName("In Create connection request")
);
export default class Controller {
  private readonly createConnectionValidationSchema = Joi.object().keys({
    targetAccount: Joi.object()
      .optional()
      .allow(null)
      .keys({
        account: Joi.string()
          .required()
          .allow(null)
          .external(async (value) => {
            const account = await getAccountById(value);
            if (!account) {
              throw new Error("Invalid targeted account ID");
            }
            return value;
          }),
        show: Joi.boolean().required(),
      }),
    userData: Joi.array().optional(),
    image: Joi.string().optional().allow(null),
    firstName: Joi.string().optional().allow(null, ""),
    lastName: Joi.string().optional().allow(null, ""),
    phoneNumber: Joi.string().optional().allow(null, ""),
    email: Joi.string().optional().allow(null, ""),
    companyName: Joi.string().optional().allow(null, ""),
    role: Joi.string().optional().allow(null, ""),
    account: Joi.string().optional().allow(""),
    isSlynkUser: Joi.boolean().required(),
  });

  private readonly updateConnectionValidationSchema = Joi.object().keys({
    targetAccount: Joi.object()
      .optional()
      .allow(null)
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
        show: Joi.boolean().required(),
      }),
    userData: Joi.array().optional(),
    image: Joi.string().optional().allow(null),
    firstName: Joi.string().optional().allow(null, ""),
    lastName: Joi.string().optional().allow(null, ""),
    phoneNumber: Joi.string().optional().allow(null, ""),
    email: Joi.string().optional().allow(null, ""),
    companyName: Joi.string().optional().allow(null, ""),
    role: Joi.string().optional().allow(null, ""),
    account: Joi.string().optional().allow(""),
  });

  private readonly approveConnectionValidationSchema = Joi.object().keys({
    approved: Joi.string().required().valid("APPROVED", "REJECTED"),
  });

  protected readonly get = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const accountId = req.currentAccountId;

      if (id) {
        const incomingConnection = await getPopulatedIncomingConnectionByID(id);
        if (!incomingConnection) {
          res.status(422).json({ message: "Invalid Incoming Connection." });
          return;
        }
        res.status(200).json(incomingConnection);

        return;
      } else {
        const account = await getAccountById(accountId);
        if (!account) {
          res.status(422).json({ message: "Invalid account." });
          return;
        }

        const incomingConnection =
          await getPopulatedIncomingConnectionByTargetAccountId(accountId);

        const newIncomingConnection = incomingConnection.filter(
          (item) => !_get(item, "account.isArchive")
        );

        res.status(200).json(newIncomingConnection);

        return;
      }
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in get Incoming Connection", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const _id = req.params.id;
      if (!_id) {
        res.status(422).json({ message: "Invalid Profile Account." });
        return;
      }

      const account = await getAccountById(_id);

      if (!account) {
        res.status(422).json({ message: "Invalid Profile Account." });
        return;
      }

      const payloadValue = await this.createConnectionValidationSchema
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

      if (req.authUser) {
        if (
          !payloadValue.targetAccount ||
          !payloadValue.targetAccount.account
        ) {
          res.status(422).json({ message: "Invalid account." });
          return;
        }

        if (payloadValue.targetAccount.account.toString() === _id.toString()) {
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
      } else {
        if (payloadValue.targetAccount) {
          res.status(422).json({ message: "Invalid Data." });
          return;
        }
      }

      // if (req.authUser) {
      //   if (!payloadValue.targetAccount) {
      //     res.status(422).json({ message: "Invalid account." });
      //     return;
      //   }
      //   if (payloadValue.userData && payloadValue.targetAccount) {
      //     const existingConnection: IConnect =
      //       await getIncomingConnectionWithConnection({
      //         account: _id.toString(),
      //         targetAccount: payloadValue.targetAccount.account.toString(),
      //       });
      //     if (existingConnection) {
      //       res.status(200).json(existingConnection);
      //       return;
      //     }

      //     const ExistingIncomingConnection: IIncomingConnection =
      //       await getIncomingConnectionByAccountIdAndTargetAccount({
      //         account: payloadValue.targetAccount.account.toString(),
      //         targetAccount: _id.toString(),
      //       });
      //     if (ExistingIncomingConnection) {
      //       res.status(200).json(ExistingIncomingConnection);
      //       return;
      //     }
      //     const incomingConnection = await saveIncomingConnection(
      //       new IncomingConnection({
      //         ...payloadValue,
      //         account: payloadValue.targetAccount.account.toString(),
      //         targetAccount: {
      //           account: _id.toString(),
      //           show: payloadValue.targetAccount.show,
      //         },
      //       })
      //     );
      //     res.status(200).json({
      //       incomingConnection,
      //       message: "Request Successfully Send.",
      //     });
      //     return;
      //   }
      //   const existingConnection: IConnect =
      //     await getIncomingConnectionWithConnection({
      //       account: payloadValue.targetAccount.account.toString(),
      //       targetAccount: _id.toString(),
      //     });
      //   if (existingConnection) {
      //     res.status(200).json(existingConnection);
      //     return;
      //   }
      //   const ExistingIncomingConnection: IIncomingConnection =
      //     await getIncomingConnectionByAccountIdAndTargetAccount({
      //       account: _id.toString(),
      //       targetAccount: payload.targetAccount.account.toString(),
      //     });
      //   if (ExistingIncomingConnection) {
      //     res.status(200).json(ExistingIncomingConnection);
      //     return;
      //   }
      //   if (payloadValue.userData) {
      //     const incomingConnection = await saveIncomingConnection(
      //       new IncomingConnection({
      //         ...payloadValue,
      //         account: _id,
      //       })
      //     );

      //     res.status(200).json({
      //       incomingConnection,
      //       message: "Request Successfully Send.",
      //     });
      //     return;
      //   }
      //   const existingReverseConnection: IConnect = await getReverseConnection({
      //     account: _id.toString(),
      //     targetAccount: payloadValue.targetAccount.account.toString(),
      //   });
      //   const connect = await saveConnect(
      //     new Connect({
      //       ...payloadValue,
      //       account: payloadValue.targetAccount.account.toString(),
      //       targetAccount: {
      //         account: _id.toString(),
      //         show: false,
      //       },
      //       isMutual: existingReverseConnection ? true : false,
      //     })
      //   );
      //   if (existingConnection) {
      //     const updatableIncomingConnection = new Connect({
      //       ...existingConnection,
      //       isMutual: true,
      //     });
      //     await updateConnect(updatableIncomingConnection);
      //   }

      //   res.status(200).json({
      //     connect,
      //     message: "Connection Successfully Added.",
      //   });
      //   return;
      // } else {
      //   if (payloadValue.targetAccount) {
      //     res.status(422).json({ message: "Invalid Data." });
      //     return;
      //   }

      const exits = await getReverseConnection({
        account: payloadValue.targetAccountId,
        targetAccount: {
          account: payloadValue.accountId,
        },
      });
      if (exits) {
        res.status(422).json({ message: "Your Account is Already Connected." });
        return;
      }

      const exits2 = await getReverseIncomingConnection({
        account: payloadValue.targetAccountId,
        targetAccount: {
          account: payloadValue.accountId,
        },
      });
      if (exits2) {
        res
          .status(422)
          .json({ message: "Your already send the request to connected." });
        return;
      }

      const incomingConnection = await saveIncomingConnection(
        new IncomingConnection({
          ...payloadValue,
          isSlynkUser: req.authUser ? true : false,
          account: req.authUser
            ? payloadValue.targetAccount.account.toString()
            : null,
          targetAccount: {
            account: _id.toString(),
            show: payloadValue.targetAccount
              ? payloadValue.targetAccount.show
              : false,
          },
        })
      );

      res.status(200).json({
        incomingConnection,
        message: "Request Successfully Send.",
      });
      return;
      // }
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly update_connection = async (
    req: Request,
    res: Response
  ) => {
    try {
      const id = req.params.id;
      const accountId = req.params.accountId;
      const payload = req.body;
      if (!id) {
        res.status(422).json({ message: "Invalid Incoming Connection." });
        return;
      }
      const account = await getAccountById(accountId);
      if (!account) {
        res.status(422).json({ message: "Invalid Account." });
        return;
      }

      const payloadValue = await this.updateConnectionValidationSchema
        .validateAsync(payload)
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

      if (payloadValue.targetAccount) {
        if (payloadValue.targetAccount.account.toString() === id.toString()) {
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
      }

      let flag = false;
      let incomingConnection = await getIncomingConnectionById(id);
      if (!incomingConnection) {
        incomingConnection = await getConnectById(id);
        if (!incomingConnection) {
          res.status(422).json({ message: "Invalid Incoming Connection." });
          return;
        }
        flag = true;
      }
      if (flag) {
        const updatableIncomingConnection = new Connect({
          ...incomingConnection,
          ...payloadValue,
          account: incomingConnection.account,
          targetAccount: {
            account: incomingConnection.targetAccount.account,
            show: payloadValue.targetAccount.show,
          },
        });

        await updateConnect(updatableIncomingConnection);
        res.status(200).json(updatableIncomingConnection);
      } else {
        const updatableIncomingConnection = new IncomingConnection({
          ...incomingConnection,
          ...payloadValue,
          account: incomingConnection.account,
          targetAccount: {
            account: incomingConnection.targetAccount.account,
            show: payloadValue.targetAccount.show,
          },
        });

        await updateIncomingConnection(updatableIncomingConnection);
        res.status(200).json(updatableIncomingConnection);
      }
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in Create details incoming Connection", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly approved_connection = async (
    req: Request,
    res: Response
  ) => {
    try {
      const id = req.params.id;
      const accountId = req.params.accountId;
      if (!id) {
        res.status(422).json({ message: "Invalid account." });
        return;
      }
      if (this.approveConnectionValidationSchema.validate(req.body).error) {
        console.log(
          this.approveConnectionValidationSchema.validate(req.body).error
        );
        res.status(422).json({ message: "Invalid Data." });
        return;
      }

      if (
        !accountId ||
        !req.authUser.accounts.find((ac) => ac.toString() === accountId)
      ) {
        res.status(403).json({ message: "Unauthorized request." });
        return;
      }

      const account = await getAccountById(accountId);
      if (!account) {
        res.status(422).json({ message: "Invalid account." });
        return;
      }

      const incomingConnection = await getIncomingConnectionById(id);
      if (!incomingConnection) {
        res.status(422).json({ message: "Invalid Connection." });
        return;
      }

      if (req.body.approved === "APPROVED") {
        const newConnect = new Connect({
          ...incomingConnection,
          account: incomingConnection.targetAccount.account.toString(),
          targetAccount: {
            account: incomingConnection.account
              ? incomingConnection.account.toString()
              : null,
            show: incomingConnection.targetAccount.show,
          },
        });
        let existingReverseConnection = null;
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        if (incomingConnection.isSlynkUser) {
          existingReverseConnection = await getReverseConnection({
            account: incomingConnection.account.toString(),
            targetAccount: {
              account: incomingConnection.targetAccount.account.toString(),
            },
          });
        }
        const connect = await saveConnect(
          new Connect({
            ...newConnect,
            isMutual: existingReverseConnection ? true : false,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
        );

        if (existingReverseConnection) {
          const updatableIncomingConnection = new Connect({
            ...existingReverseConnection,
            isMutual: true,
          });
          await updateConnect(updatableIncomingConnection);
        }

        if (account.isPrivate) {
          ejs.renderFile(
            process.cwd() + "/views/requestAccepted.ejs",

            function (err, html) {
              if (err) {
                console.log(err);
              } else {
                SendMail(
                  process.env.MAIL_NO_REPLY,
                  req.authUser.email,
                  "Slynk : Request Accepted",
                  html
                )
                  .then(() => {
                    res
                      .status(200)
                      .json({ message: "Email successfully sent." });
                  })
                  .catch((error) => {
                    console.log(error);
                    Sentry.captureException(error);
                    res.status(224).json({ message: "Something went Wrong." });
                  });
              }
            }
          );
        }

        res.status(200).json({ message: "Connection Added", connect });
        await deleteIncomingConnection(id);

        return;
      } else {
        await deleteIncomingConnection(id);
        res.status(200).json({ message: "Connection Rejected" });
      }
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in reject Incoming Connection", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly new_request = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;

      if (!id) {
        res.status(422).json({ message: "Invalid Account." });
        return;
      }
      const incomingConnection = await getIncomingConnectionById(id);
      if (!incomingConnection) {
        res.status(422).json({ message: "Invalid Connection." });
        return;
      }

      // if (accountId.toString() !== incomingConnection.account.toString()) {
      //   res.status(403).json({ message: "Unauthorized request." });
      //   return;
      // }

      const newIncomingConnection = new IncomingConnection({
        ...incomingConnection,
        newRequest: false,
      });

      const updatedConnection = await updateIncomingConnection(
        newIncomingConnection
      );
      const incomingConnection1 = await getPopulatedIncomingConnectionByID(
        updatedConnection._id
      );

      res.status(200).json(incomingConnection1);
    } catch (error) {
      console.log(error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly get_connection = async (req: Request, res: Response) => {
    try {
      const _id = req.params.id;
      const accountId = req.currentAccountId;

      if (!_id) {
        res.status(422).json({ message: "Invalid account." });
        return;
      }
      const account = await getAccountById(accountId);
      if (!account) {
        res.status(422).json({ message: "Invalid account." });
        return;
      }
      const authUser = req.authUser;
      const userId =
        account.user &&
        account.user.toString() == _get(authUser, "_id", "").toString()
          ? account.user
          : null;
      if (!userId) {
        // As of now only owner of account can update account
        res.status(403).json({ message: "Unauthorized request." });
        return;
      }

      if (req.authUser) {
        let incomingConnection;

        incomingConnection = await getIncomingConnectionWithConnection({
          account: _id.toString(),
          targetAccount: accountId.toString(),
        });

        if (!incomingConnection) {
          incomingConnection =
            await getIncomingConnectionByAccountIdAndTargetAccount({
              account: accountId.toString(),
              targetAccount: _id.toString(),
            });
        }
        res.status(200).json(incomingConnection);
        return;
      } else {
        res.status(403).json({ message: "Unauthorized request." });
        return;
      }
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in Create details incoming Connection", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly getNewRequestBySlynkNonSlynk = async (
    req: Request,
    res: Response
  ) => {
    try {
      const accountId = req.params.accountId;
      if (!accountId) {
        res.status(422).json({ message: "Invalid account." });
        return;
      }

      const incomingConnection = await getNewRequestBySlynkAndNonSlynk(
        accountId
      );

      const data = {
        slynkReq: false,
        nonSlynkReq: false,
      };

      incomingConnection.map((item) => {
        if (item.isSlynkUser) {
          data.slynkReq = true;
        } else {
          data.nonSlynkReq = true;
        }
      });

      res.status(200).json(data);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in getNewRequest.", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
