import { Router } from "express";
import Controller from "./controller";

export default class Group extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("", this.create);
    this.router.patch("/:_id", this.update);
    this.router.get("/", this.get);
    this.router.get("/:_id", this.get);
    this.router.delete("/:_id", this.delete);
    this.router.patch("/:_id/add_to_group", this.addToGroup);
    this.router.patch("/:_id/remove_from_group", this.removeFromGroup);
  }
}
