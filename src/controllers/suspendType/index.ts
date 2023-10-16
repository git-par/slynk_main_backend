import { Router } from "express";
import { validateIsAdmin } from "../../middleware/validateIsAdmin";
import Controller from "./controller";

export default class SuspendType extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("",validateIsAdmin,  this.create);
    this.router.get("", this.get);
    this.router.patch("/:id",validateIsAdmin, this.update);
  }
}