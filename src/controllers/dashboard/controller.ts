import { Response } from "express";
import { log } from "winston";
import { getIncomingConnectionByNewRequest } from "../../modules/incomingConnection";
import { Request } from "./../../request";
import { get as _get } from "lodash";
import * as Sentry from "@sentry/node";

// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_URL,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

Sentry.configureScope((scope) => scope.setTransactionName("In Dashboard"));

export default class Controller {
  protected readonly get = async (req: Request, res: Response) => {
    try {
      // const payload = req.body
      const accountId = req.currentAccountId;
      let newRequest = false;
      // const connect = await getConnectionByNewRequest(accountId);
      // if (connect) {
      //   newRequest = true;
      // } else {
      const incomingConnection = await getIncomingConnectionByNewRequest(
        accountId
      );
      if (incomingConnection) {
        newRequest = true;
      }
      // }
      res.status(200).json({ newRequest });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in Dashboard", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
