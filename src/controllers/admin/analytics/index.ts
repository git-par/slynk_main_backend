import { Router } from "express";
import Controller from "./controller";

export default class Analytics extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("", this.getAnalytics);
  }
}
