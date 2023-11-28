import express, { Router } from "express";
import { validateIsAdmin } from "../../middleware/validateIsAdmin";
import { validateSelfAccount } from "../../middleware/validateSelfAccount";
import { validateSelfAccountId } from "../../middleware/validateSelfAccountId";
import AccountLink from "./accountLink";
import Connect from "./connect";
import Controller from "./controller";
import CustomQR from "./customQR";
import Group from "./group";
import PersonalConnection from "./personalConnection";
import VirtualBackGround from "./virtualBackGround";

export default class Account extends Controller {
  public instance: express.Application;
  public router = Router();

  constructor() {
    super();
    this.instance = express();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    // account_link_route
    this.instance.use(
      "/:accountId/link",
      validateSelfAccount,
      new AccountLink().router
    );
    // personal_connection_route
    this.instance.use(
      "/:accountId/personal_connection",
      validateSelfAccount,
      new PersonalConnection().router
    );
    //connect
    this.instance.use(
      "/:accountId/connect",
      validateSelfAccount,
      new Connect().router
    );
    //group
    this.instance.use(
      "/:accountId/group",
      validateSelfAccount,
      new Group().router
    );
    this.instance.use(
      "/:accountId/customQR",
      validateSelfAccountId,
      new CustomQR().router
    );
    this.instance.use(
      "/:accountId/customQR",
      validateSelfAccountId,
      new VirtualBackGround().router
    );

    this.instance.put(
      "/:accountId/verify",
      validateIsAdmin,
      this.verifyAccount
    );
    this.router.get("/searchAccount", this.searchAccountQuery);
    this.router.get("/searchAccount/:accountId", this.searchAccount);

    // account router
    this.router.get("/qrcode/:_id", this.getQRCode);
    this.router.post("", this.create);
    this.router.patch("/:_id", this.update);
    this.router.get("/", this.get);
    this.router.get("/:_id", this.get);
    this.router.delete("/:_id", this.delete);
    this.router.get(
      "/:_id/get_connection",
      this.getPersonalConnectionAndConnect
    );
    this.router.get("/:_id/tags", this.getTags);
    this.router.post("/archive/:id", this.archiveAccount);

    this.instance.use("", this.router);
  }
}
