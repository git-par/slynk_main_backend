import { Response } from "express";
// import Joi from "joi";
import { log } from "winston";
import { Request } from "../../request";
import { get as _get } from "lodash";
import { getAccountById } from "../../modules/account";
import { PrivateURL, savePrivateURL } from "../../modules/privateURL";
export default class Controller {
  protected readonly create = async (req: Request, res: Response) => {
    try {
      const _id = req.params._id;

      if (!_id) {
        res.status(422).json({ message: "Invalid account." });
        return;
      }

      const account = await getAccountById(_id);
      if (!account) {
        res.status(422).json({ message: "Invalid account." });
        return;
      }

      const r = (Math.random() + 1).toString(36).substring(7);
      // console.log("random", r);
      const privateURL = "";
      const privateURLSave = new PrivateURL({
        accountId: _id,
        privateURL: privateURL,
        isQrURL: false,
      });

      await savePrivateURL(privateURLSave);
      res.status(200).json(privateURLSave);
    } catch (error) {
      console.log(error);
      log("error", "error in create private URL", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
