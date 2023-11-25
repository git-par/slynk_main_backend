import { Response } from "express";
import { Request } from "./../../request";
import { get as _get } from "lodash";
import { googleWalletGeneric } from "../../helper/googleWalletGeneric";
import { getAccountById } from "../../modules/account";

export default class Controller {
  protected readonly create = async (req: Request, res: Response) => {
    try {
      const accountId = req.params.accountId;
      if (!accountId) {
        res.status(422).json({ message: "Invalid account." });
        return;
      }

      const account = await getAccountById(accountId);
      if (!account) {
        res.status(422).json({ message: "Invalid account." });
        return;
      }

      const data = await googleWalletGeneric(account._id.toString());
      if (data.message) {
        throw new Error(data.message);
      }
      res.status(200).json(data);
    } catch (error) {
      console.log(error);
      res.status(200).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
