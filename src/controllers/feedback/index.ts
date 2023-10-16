import { Router } from "express";
import { validateIsAdmin } from "../../middleware/validateIsAdmin";
import { validateSelfAccount } from "../../middleware/validateSelfAccount";
import Controller from "./controller";

export default class FeedBack extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/admin_reply", validateIsAdmin, this.admin_feedback);
    this.router.post("/mail_all_user", validateIsAdmin, this.replyAllUser);
    this.router.post("/:accountId", validateSelfAccount, this.create);
    this.router.get("", validateIsAdmin, this.get);
    this.router.patch("/:id", validateIsAdmin, this.updateFeedback);
  }
}
