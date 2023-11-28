import { Router } from "express";
import Controller from "./controller";

export default class VirtualBackGround extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("", this.create);
    this.router.patch("/:virtualBackGroundId", this.update);
    this.router.get("/", this.get);
    this.router.get("/:virtualBackGroundId", this.get);
    this.router.delete("/:virtualBackGroundId", this.delete);
  
  }
}
