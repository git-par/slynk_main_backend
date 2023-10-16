import express, { Router } from "express";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";

import Controller from "./controller";
import LinkVisit from "./linkVisit";
import ProfileVisit from "./profileVisit";
import ContactCount from "./contactCount";

export default class Analytics extends Controller {
  public instance: express.Application;

  public router = Router();

  constructor() {
    super();
    this.instance = express();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/getAnalytics/:accountId",
      validateAuthIdToken,
      this.getAnalytics
    );

    this.instance.use("/linkVisit", new LinkVisit().router);
    this.instance.use("/profileVisit", new ProfileVisit().router);
    this.instance.use("/contactCount", new ContactCount().router);
    this.instance.use("", this.router);
  }
}
