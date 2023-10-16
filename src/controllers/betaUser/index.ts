import { Router } from "express";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import { validateIsAdmin } from "../../middleware/validateIsAdmin";
import Controller from "./controller";

export default class BetaUser extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/invite", this.create);
    this.router.post("/verify", this.verifyCode);

    this.router.get("", validateAuthIdToken, validateIsAdmin, this.get);
    this.router.delete(
      "/:_id",
      validateAuthIdToken,
      validateIsAdmin,
      this.deleteUser
    );
  }
}
