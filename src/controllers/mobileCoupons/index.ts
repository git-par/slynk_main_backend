import { Router } from "express";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import { validateIsAdmin } from "../../middleware/validateIsAdmin";
import Controller from "./controller";

export default class MobileCoupons extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("", validateAuthIdToken, validateIsAdmin, this.create);
    this.router.get("", validateAuthIdToken, validateIsAdmin, this.get);
    this.router.patch(
      "/:id",
      validateAuthIdToken,
      validateIsAdmin,
      this.update
    );
  }
}
