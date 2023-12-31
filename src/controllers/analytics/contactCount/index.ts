import { Router } from "express";
import Controller from "./controller";

export default class ContactCount extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/:ownerAccountId", this.create);
    // this.router.get("", this.get);
  }
}
