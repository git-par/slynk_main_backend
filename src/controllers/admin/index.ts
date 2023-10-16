import express, { Router } from "express";
import { validateIsSuperAdmin } from "../../middleware/validateIsSuperAdmin";
import Analytics from "./analytics";
import SuperAdmin from "./superAdmin";
import UserUpdate from "./userUpdate";
import SuspendType from "./suspendType";

export default class Admin {
  public instance: express.Application;
  public router = Router();

  constructor() {
    this.instance = express();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.instance.use(
      "/superAdmin",
      validateIsSuperAdmin,
      new SuperAdmin().router
    );
    this.instance.use("/userUpdate", new UserUpdate().router);
    this.instance.use("/analytics", new Analytics().router);
    this.instance.use("/suspendType", new SuspendType().router);
  }
}
