import Controller from "./controller";
import { Router } from "express";
import { validateAuthIdToken } from "../../middleware/validateAuthIdToken";
import { validateIsAdmin } from "../../middleware/validateIsAdmin";
import { validatePassword } from "../../middleware/validatePassword";

export default class User extends Controller {
  public router = Router();

  constructor() {
    super();
    this.initializeRoutes();
  }
  private initializeRoutes() {
    this.router.post(
      "/password_verification",
      validatePassword,
      this.passwordVerification
    );

    this.router.post(
      "/email_verification",
      validateAuthIdToken,
      this.emailVerification
    );
    this.router.post("/email_update", validateAuthIdToken, this.updateEmail);

    this.router.post(
      "/phone_verification",
      validateAuthIdToken,
      this.phoneVerification
    );
    this.router.post("/phone_update", validateAuthIdToken, this.updatePhone);
    this.router.post(
      "/update_password",
      validateAuthIdToken,
      this.updatePassword
    );
    this.router.post("/send_phone_otp", this.sendOtpToPhoneNo);
    this.router.post("/send_otp", this.sendOtp);
    this.router.post("/send_email_otp", this.sendEmailOtp);
    this.router.post("/verify_otp", this.verifyOtp);
    this.router.post("/forget_password", this.forgetPassword);
    this.router.post("/change_password", this.changePassword);
    this.router.post("/reset_password", this.resetPassword);
    this.router.get("/", validateAuthIdToken, this.getUser);

    this.router.get(
      "/all",
      validateAuthIdToken,
      validateIsAdmin,
      this.getAllUser
    );

    this.router.post(
      "/suspendUser/:userId",
      validateAuthIdToken,
      validateIsAdmin,
      this.suspendUser
    );

    this.router.post("/freeTire/:userId", validateAuthIdToken, this.freeTire);

    this.router.post(
      "/makeProUser/:userId",
      validateAuthIdToken,
      validateIsAdmin,
      this.makeProUser
    );

    this.router.post(
      "/unSuspendUser/:userId",
      validateAuthIdToken,
      validateIsAdmin,
      this.unSuspendUser
    );

    // this.router.patch("/", validateAuthIdToken, this.deleteRequest);
    this.router.patch(
      "/deactivate/:_id",
      validateAuthIdToken,
      validateIsAdmin,
      this.deactivate
    );
    this.router.delete(
      "/:_id",
      validateAuthIdToken,
      // validateIsAdmin,
      this.deleteUser
    );
    this.router.patch("/:id", validateAuthIdToken, this.updateUser);
    this.router.get("/isPrivate/:id", this.checkIsPrivate);
    this.router.post("/sendWebPush", this.sendWebPush);
  }
}
