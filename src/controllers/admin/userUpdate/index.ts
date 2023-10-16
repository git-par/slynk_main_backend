import { Router } from "express";
import Controller from "./controller";

export default class UserUpdate extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/resetPopup/:userId", this.resetPopup);
  }
}
