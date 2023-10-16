import { Router } from "express";

import { validateIsAdmin } from "../../middleware/validateIsAdmin";
import Controller from "./controller";

export default class TagsType extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // this.router.post("", this.create);
    this.router.post("/", validateIsAdmin, this.create);
    this.router.patch("/:id", validateIsAdmin, this.update);
    // this.router.patch(
    //   "/:_id",
    //   validateAuthIdToken,
    //   validateIsAdmin,
    //   this.updateTagLabel
    // );
  }
}
