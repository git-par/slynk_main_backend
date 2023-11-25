import cookieParser from "cookie-parser";
import winston from "winston";
import expressWinston from "express-winston";
import express from "express";
import cors from "cors";
import Auth from "./controllers/auth";
import { middleware as contextMiddleware } from "express-http-context";
import User from "./controllers/user";
import Account from "./controllers/account";
import { validateAuthIdToken } from "./middleware/validateAuthIdToken";
import Image from "./controllers/image";
import linksCategory from "./controllers/linksCategory";
import Tags from "./controllers/tags";
import IncomingConnection from "./controllers/incomingConnection";
import * as path from "path";
import Links from "./controllers/links";
import BetaUser from "./controllers/betaUser";
import TagsType from "./controllers/tagsType";
import FeedBack from "./controllers/feedback";
import FeedBackType from "./controllers/feedbackType";
import SuspendType from "./controllers/suspendType";
import MobileProducts from "./controllers/mobileProducts";
import MobileCoupons from "./controllers/mobileCoupons";

import Stripe from "./controllers/stripe";
import Dashboard from "./controllers/dashboard";
import { validateIsAdmin } from "./middleware/validateIsAdmin";
import InternalNotes from "./controllers/internalNotes";
import PrivateURL from "./controllers/privateURL";
import PkPass from "./controllers/pkPass";
import Admin from "./controllers/admin";
import Tutorial from "./controllers/tutorial";
import Faq from "./controllers/faq";
import LegalInfo from "./controllers/legalInfo";
import Report from "./controllers/report";
import ReportType from "./controllers/reportType";
import Analytics from "./controllers/analytics";
import { firebase } from "./helper/firebase";
import GoogleWallet from "./controllers/googleWallet";


export default class App {
  public static instance: express.Application;
  private static port: number;
  public static start(port) {
    this.instance = express();
    this.port = port;

    // due to logger
    this.instance.use(
      expressWinston.errorLogger({
        transports: [new winston.transports.Console()],
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.json()
        ),
      })
    );
    // Add middleware.
    this.initializeMiddleware();

    // Add controllers
    this.initializeControllers();
  }

  private static initializeMiddleware() {
    // logger
    firebase()

    // CORS
    this.instance.use(
      cors({
        origin: true,
        credentials: true,
        exposedHeaders: "x-auth-token",
      })
    );

    // Cookie parser.
    this.instance.use(cookieParser(process.env.COOKIE_SECRET));

    // enable http context
    this.instance.use(contextMiddleware);

    // Body Parser
    this.instance.use(express.json({ limit: "50mb" })); // support json encoded bodies
    this.instance.set("views", path.join(__dirname, "views"));
    this.instance.set("view engine", "ejs");
    this.instance.use(express.static(process.cwd() + "/public"));
    this.instance.use(express.static(process.cwd() + "/pkpassStorage"));
  }

  private static initializeControllers() {
    //admin
    this.instance.use(
      "/admin",
      validateAuthIdToken,
      validateIsAdmin,
      new Admin().instance
    );

    //user
    this.instance.use("/auth", new Auth().router);
    this.instance.use("/user", new User().router);
    this.instance.use("/account", validateAuthIdToken, new Account().instance);
    this.instance.use("/image", new Image().router);
    this.instance.use(
      "/links_category",
      validateAuthIdToken,
      new linksCategory().router
    );
    this.instance.use("/tags", new Tags().router);
    this.instance.use("/tags_type", validateAuthIdToken, new TagsType().router);
    this.instance.use("/links", validateAuthIdToken, new Links().router);
    this.instance.use("/feedback", validateAuthIdToken, new FeedBack().router);
    this.instance.use(
      "/feedback_type",
      validateAuthIdToken,
      new FeedBackType().router
    );
    this.instance.use("/beta_user", new BetaUser().router);
    this.instance.use("/incoming_connection", new IncomingConnection().router);
    this.instance.use(
      "/suspend_type",
      validateAuthIdToken,
      new SuspendType().router
    );

    this.instance.use("/stripe", new Stripe().router);
    this.instance.use("/mobileProduct", new MobileProducts().router);
    this.instance.use("/mobileCoupon", new MobileCoupons().router);
    this.instance.use(
      "/dashboard",
      validateAuthIdToken,
      new Dashboard().router
    );
    this.instance.use(
      "/internal_notes",
      validateAuthIdToken,
      validateIsAdmin,
      new InternalNotes().router
    );
    this.instance.use("/privateURL", new PrivateURL().router);

    this.instance.use("/pkpass", new PkPass().router);
    this.instance.use("/tutorial", validateAuthIdToken, new Tutorial().router);
    this.instance.use("/faq", validateAuthIdToken, new Faq().router);
    this.instance.use(
      "/legalInfo",
      validateAuthIdToken,
      new LegalInfo().router
    );
    this.instance.use("/report", validateAuthIdToken, new Report().router);
    this.instance.use(
      "/reportType",
      validateAuthIdToken,
      new ReportType().router
    );

    this.instance.use("/googleWallet", new GoogleWallet().router);


    this.instance.use("/analytics", new Analytics().instance);
  }
}
