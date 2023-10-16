import Controller from "./controller";
import { Router } from "express";
import { validateIsAdmin } from "../../middleware/validateIsAdmin";

export default class linksCategory extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("", validateIsAdmin, this.create); // FOR ADMIN 
    this.router.patch("/:_id", validateIsAdmin, this.update); // FOR ADMIN 
    this.router.get("", this.get);
    this.router.get("/:_id", this.get);
    this.router.patch("/updateLinkOrder/:_id", validateIsAdmin, this.updateLinkOrder); // FOR ADMIN 
    this.router.patch("/updateCategoryIndex", validateIsAdmin, this.updateCategoryIndex); // FOR ADMIN 
    this.router.get("/not_populated", this.get_not_populated);
    // this.router.delete("/:_id", this.delete); for admin
  }
}
