import { Router } from "express";
import Controller from "./controller";

export default class InternalNotes extends Controller {
    public router = Router();

    constructor() {
        super();
        this.initializeRoutes();
    }
    private initializeRoutes() {
        this.router.post("", this.create);
        this.router.get("/:accountId", this.get);

    }
}