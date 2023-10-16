import { Router } from "express";
import { validateIsAdmin } from "../../middleware/validateIsAdmin";
import Controller from "./controller";

export default class Report extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("", this.create);
    this.router.patch("/:_id",validateIsAdmin, this.update);
    this.router.get("/",validateIsAdmin, this.get);
    this.router.get("/:_id",validateIsAdmin, this.get);
    this.router.delete("/:_id",validateIsAdmin, this.delete);
  }
}
