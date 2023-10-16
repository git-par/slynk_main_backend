import { Router } from "express";
import { validateIsAdmin } from "../../middleware/validateIsAdmin";
import Controller from "./controller";

export default class LegalInfo extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("",validateIsAdmin, this.create);
    this.router.patch("/:_id",validateIsAdmin, this.update);
    this.router.get("/", this.get);
    this.router.get("/:_id", this.get);
    this.router.delete("/:_id", this.delete);
  }
}
