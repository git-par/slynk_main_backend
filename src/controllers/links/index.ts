import { Router } from "express";
import { validateIsAdmin } from "../../middleware/validateIsAdmin";
import Controller from "./controller";

export default class Links extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/update_length", validateIsAdmin, this.updateLength);
    this.router.post("", validateIsAdmin, this.create);
    this.router.patch("/:_id", validateIsAdmin, this.update);
    this.router.post("/:_id", validateIsAdmin, this.deactivate);
    this.router.get("/", this.get);
    this.router.get("/:_id", this.get);
    this.router.delete("/:_id", validateIsAdmin, this.delete);
  }
}
