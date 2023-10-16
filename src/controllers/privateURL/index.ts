import Controller from "./controller";
import express, { Router } from "express";
import { validateSelfAccount } from "../../middleware/validateSelfAccount";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
export default class PrivateURL extends Controller {
  public instance: express.Application;
  public router = Router();

  constructor() {
    super();
    this.instance = express();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/:accountId",
      validateAuthIdToken,
      validateSelfAccount,
      this.create
    );
  }
}
