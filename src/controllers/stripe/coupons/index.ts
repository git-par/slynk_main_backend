import { Router } from "express";
import { validateIsAdmin } from "../../../middleware/validateIsAdmin";
import Controller from "./controller";

export default class Coupons extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get("/", this.get);
    this.router.get("/stripeCoupon", this.getCouponFromStripe);
    // this.router.get("/:_id", this.get);
    this.router.post("", validateIsAdmin, this.create);
    this.router.patch("/:couponId", validateIsAdmin, this.update);
    this.router.delete("/:couponId", this.delete);
  }
}
