import express, { Router } from "express";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import Controller from "./controller";
import Coupons from "./coupons";
import Products from "./products";
import PromoCode from "./promocode";

export default class Stripe extends Controller {
  public router = Router();
  public instance: express.Application;

  constructor() {
    super();
    this.instance = express();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.post("", this.create);

    this.router.post("/success", validateAuthIdToken, this.paymentSuccess);
    this.router.use("/products", validateAuthIdToken, new Products().router);
    this.router.use("/coupons", validateAuthIdToken, new Coupons().router);
    this.router.use("/promocde", validateAuthIdToken, new PromoCode().router);
    // this.router.get("/coupons", this.getCoupons);
    // this.router.post("/coupons", this.createCoupons);
    this.router.all("/webhook", this.paymentWebhook);
    this.router.post("/pay", validateAuthIdToken, this.pay);
    this.router.post("/cancelSub", this.cancelSub);
    // this.router.post("/cancelSub", validateAuthIdToken, this.cancelSub);
  }
}
