import { Router } from "express";
import Controller from "./controller";

export default class Connect extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("", this.create);
    // this.router.patch("/:_id", this.update);
    this.router.get("/", this.get);
    this.router.get("/:_id", this.get);
    this.router.delete("/:_id", this.delete);
    this.router.post("/newRequest/:id", this.new_request);
    this.router.get("/targetAccount/:id", this.targetAccount);
    this.router.get("/privateAccount/:id", this.privateAccount);
  }
}
