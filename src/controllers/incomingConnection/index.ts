import { Router } from "express";
import { validateSelfAccount } from "../../middleware/validateSelfAccount";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import Controller from "./controller";
import { validateConnectAuthIdToken } from "../../middleware/validateConnectAuthId";
import { validateSelfAccountWithoutBody } from "../../middleware/validateSelfAccountWithoutBody";
export default class IncomingConnection extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/:id/in_connection",
      validateConnectAuthIdToken,
      this.create
    );

    this.router.get(
      "/:accountId/in_connection/",
      validateAuthIdToken,
      validateSelfAccount,
      this.get
    );
    this.router.get(
      "/:accountId/in_connection/:id",
      validateAuthIdToken,
      validateSelfAccount,
      this.get
    );

    this.router.post(
      "/:accountId/in_connection/update/:id",
      validateAuthIdToken,
      validateSelfAccountWithoutBody,
      this.update_connection
    );

    this.router.post(
      "/:accountId/in_connection/approve/:id",
      validateAuthIdToken,
      validateSelfAccountWithoutBody,
      this.approved_connection
    );

    this.router.post(
      "/:accountId/in_connection/newRequest/:id",
      validateAuthIdToken,
      validateSelfAccountWithoutBody,
      this.new_request
    );

    this.router.get(
      "/:accountId/in_connection/targetAccount/:id",
      validateConnectAuthIdToken,
      validateSelfAccount,
      this.get_connection
    );

    this.router.get("/in_connection/newRequestBySNS/:accountId",validateConnectAuthIdToken,
    validateSelfAccount,
    this.getNewRequestBySlynkNonSlynk)
  }
}
