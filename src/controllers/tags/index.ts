import { Router } from "express";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import { validateConnectAuthIdToken } from "../../middleware/validateConnectAuthId";
import { validateIsAdmin } from "../../middleware/validateIsAdmin";
import Controller from "./controller";

export default class Tags extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("", validateAuthIdToken, validateIsAdmin, this.create);
    this.router.post(
      "/getSortedTag",
      validateConnectAuthIdToken,
      this.getSortedTag
    );
    this.router.get("", validateConnectAuthIdToken, this.getTagsByPagination);
    this.router.get("/:urlName", validateConnectAuthIdToken, this.get);
    this.router.post("/block/:urlName", validateAuthIdToken, this.blockTag);
    this.router.post("/free/:urlName", validateAuthIdToken, this.freeTag);
    this.router.post("/:urlName", validateAuthIdToken, this.linkAccount);
    this.router.patch("/:_id", validateAuthIdToken, this.updateTagLabel);
    this.router.patch(
      "/:tagId/update/accId",
      validateAuthIdToken,
      this.updateTag
    );
    this.router.get(
      "/byAccId/:accId",
      validateAuthIdToken,
      validateIsAdmin,
      this.getTagByAccId
    );
  }
}
