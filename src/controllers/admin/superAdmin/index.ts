import { Router } from "express";
import Controller from "./controller";

export default class SuperAdmin extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/assignRole/:userId", this.assignRole); //TODO: Get *ROLE* data from body
  }
}
