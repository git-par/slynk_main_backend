import { Router } from "express";
import { validateSelfAccount } from "../../middleware/validateSelfAccount";
import Controller from "./controller";

export default class GoogleWallet extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/:accountId", this.create);
  }
}
