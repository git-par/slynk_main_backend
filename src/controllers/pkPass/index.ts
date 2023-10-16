import Controller from "./controller";
import express, { Router } from "express";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import { validateSelfAccount } from "../../middleware/validateSelfAccount";
import { validateSelfPass } from "../../middleware/validateSelfPass";
export default class PkPass extends Controller {
  public instance: express.Application;
  public router = Router();

  constructor() {
    super();
    this.instance = express();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      "/:accountId",
      validateAuthIdToken,
      validateSelfAccount,
      this.create
    );

    this.router.get(
      "/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier",
      this.getPassByRegistrations
    );

    this.router.get(
      "/v1/passes/:passTypeIdentifier/:serialNumber",
      validateSelfPass,
      this.getPassBySerial
    );

    this.router.post(
      "/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber",
      validateSelfPass,
      this.postPkPass
    );

    this.router.delete(
      "/v1/devices/:deviceLibraryIdentifier/registrations/:passTypeIdentifier/:serialNumber",
      validateSelfPass,
      this.deletePkPass
    );

    this.router.post("/v1/log", this.passLog);
  }
}
