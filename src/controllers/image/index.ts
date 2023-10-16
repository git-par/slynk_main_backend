import { Router } from "express";
import { filesUpload } from "../../middleware/filesUpload";
import Controller from "./controller";

export default class Image extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("", filesUpload, this.create);
    this.router.post("/logo", filesUpload, this.logo_create);
    this.router.post("/file", filesUpload, this.file_create);
    this.router.post("/feedback", filesUpload, this.feedback_create);
  }
}
