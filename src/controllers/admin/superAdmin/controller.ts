import { Response } from "express";
import { Request } from "../../../request";
import { get as _get } from "lodash";
import { getUserById, updateUser, User } from "../../../modules/user";

export default class Controller {
  protected readonly assignRole = async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const payload = req.body;
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
          userType: payload.userType ? payload.userType : "USER",
        })
      );

      res
        .status(200)
        .json({ message: "This user has been assigned as an ADMIN." });
    } catch (error) {
      console.log("########## Error in makeAdmin", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
