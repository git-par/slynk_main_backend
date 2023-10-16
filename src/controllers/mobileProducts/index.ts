import { Router } from "express";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import { validateIsAdmin } from "../../middleware/validateIsAdmin";
import Controller from "./controller";

export default class MobileProducts extends Controller {
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
    this.router.get(
      "/app/:platform",
      validateAuthIdToken,
      this.getOriginalProduct
    );
    this.router.post(
      "/find/:name",
      validateAuthIdToken,
      this.findDiscountProduct
    );
  }
}
