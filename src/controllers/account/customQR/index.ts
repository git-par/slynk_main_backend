import { Router } from "express";
import Controller from "./controller";

export default class CustomQR extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("", this.create);
    this.router.patch("/:customQRId", this.update);
    this.router.get("/", this.get);
    this.router.get("/:customQRId", this.get);
    this.router.delete("/:customQRId", this.delete);
  
  }
}
