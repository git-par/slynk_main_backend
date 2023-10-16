import { Router } from "express";
import { validateAuthIdToken } from "../../../middleware/validateAuthIdToken";
import Controller from "./controller";

export default class ProfileVisit extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/:ownerAccId", this.create);
    this.router.patch("/:id", this.update);
    // this.router.get("", this.get);
  }
}
