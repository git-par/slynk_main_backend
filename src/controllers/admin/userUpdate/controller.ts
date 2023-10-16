import { Response } from "express";
import { Request } from "../../../request";
import { get as _get } from "lodash";
import { getUserById, updateUser, User } from "../../../modules/user";
import Joi from "joi";

export default class Controller {
  private readonly resetPopupSchema = Joi.object().keys({
    isFirstVisit: Joi.boolean().optional(),
    isPrivacyAccepted: Joi.boolean().optional(),
  });

  protected readonly resetPopup = async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const payload = req.body;

      if (this.resetPopupSchema.validate(payload).error) {
        res.status(422).json({
          message: this.resetPopupSchema.validate(payload).error.message,
        });
        return;
      }
      const payloadValue = this.resetPopupSchema.validate(payload).value;
      if (!userId) {
        res.status(422).json({ message: "Invalid User." });
        return;
      }
      const user = await getUserById(userId);
      if (!user) {
        res.status(422).json({ message: "Invalid User." });
        return;
      }
      await updateUser(
        new User({
          ...user,
          isFirstVisit: {
            visitDate: user.isFirstVisit.visitDate,
            value: payloadValue.isFirstVisit,
          },
          isPrivacyAccepted: {
            acceptedDate: user.isPrivacyAccepted.acceptedDate,
            value: payloadValue.isFirstVisit,
          },
        })
      );

      res.status(200).json({ message: "Popup reset." });
    } catch (error) {
      console.log("########## Error in Popup reset", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
