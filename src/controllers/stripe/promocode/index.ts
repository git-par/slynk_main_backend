import { Router } from "express";
import { validateIsAdmin } from "../../../middleware/validateIsAdmin";
import Controller from "./controller";

export default class PromoCode extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.get);
    // this.router.get("/:_id", this.get);
    this.router.post("", validateIsAdmin, this.create);
    this.router.patch("/:promoCodeId", validateIsAdmin, this.update);
    this.router.get("/stripeCheck/:promoCodeId", this.stripeGet);
    this.router.delete("/:promoCodeId", this.delete);
  }
}
