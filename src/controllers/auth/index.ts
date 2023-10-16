import { Router } from "express";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import { validateIsAdmin } from "../../middleware/validateIsAdmin";
import Controller from "./controller";

export default class Auth extends Controller {
  public router = Router();
  constructor() {
    super();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post("/send_phone_otp", this.sendOtpToPhoneNo);
    this.router.post("/verify_otp", this.verifyPhoneNo);
    this.router.post("/login", this.login);
    this.router.post(
      "/session",
      validateAuthIdToken,
      validateIsAdmin,
      this.session
    );
    this.router.post("/logout", validateAuthIdToken, this.logout);
    this.router.post("/duplicate", this.duplicate);
    this.router.post("/register", this.register);
    this.router.post("/login_with_google", this.loginWithGoogle);
    this.router.post("/appleLogin", this.appleLogin);
    this.router.post(
      "/login_with_admin/:userId",
      validateAuthIdToken,
      validateIsAdmin,
      this.loginWithAdmin
    );
    this.router.post("/sendOtp", this.sendOtpToChangePassword);
    this.router.post("/verifyOtp", this.verifyOtpToChangePassword);
    this.router.post("/changePassword", this.changePasswordUsingPhone);
  }
}
