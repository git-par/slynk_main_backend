import { Response } from "express";
import { get as _get, get, pick } from "lodash";
import { getUserWithCondition } from "../../../modules/user";
import { Request } from "../../../request";
import moment from "moment";
import { stripeInstance } from "../../../helper/stripe";

export default class Controller {
  protected readonly get = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 15;
      let user;
      if (payload.type == "RUNNING SUBSCRIPTION") {
        user = (await getUserWithCondition({ isPro: true }, page, limit))
          .filter(
            (user) =>
              user._id.toString() !== get(req, "authUser._id", "").toString()
          )
          .filter((user) => user.userType !== "SUPER ADMIN")
          .map((user) => {
            return pick(user, [
              "_id",
              "email",
              "userType",
              "deleteRequest",
              "isPro",
              "suspend",
              "subscriptionTill",
              "firstName",
              "lastName",
              "phoneNumber",
              "googleLogin",
              "isFirstVisit",
              "isBetaFirstVisit",
              "isPrivacyAccepted",
              "gender",
              "DOB",
              "createdAt",
            ]);
          });
      } else if (payload.type == "FINISHED SUBSCRIPTION") {
        user = (await getUserWithCondition({ isPro: false }, page, limit))
          .filter(
            (user) =>
              user._id.toString() !== get(req, "authUser._id", "").toString()
          )
          .filter((user) => user.userType !== "SUPER ADMIN")
          .map((user) => {
            return pick(user, [
              "_id",
              "email",
              "userType",
              "deleteRequest",
              "isPro",
              "suspend",
              "subscriptionTill",
              "firstName",
              "lastName",
              "phoneNumber",
              "googleLogin",
              "isFirstVisit",
              "isBetaFirstVisit",
              "isPrivacyAccepted",
              "gender",
              "DOB",
              "createdAt",
            ]);
          });
      } else if (payload.type == "SUBSCRIPTION FINISHING") {
        const endDate = moment().add(30, "days").format("YYYY-MM-DD");
        const startDate = moment().format("YYYY-MM-DD");
        user = (
          await getUserWithCondition(
            {
              isPro: true,
              subscriptionTill: { $lt: endDate, $gte: startDate },
            },
            page,
            limit
          )
        )
          // user = (await proUserWithFinishTime(startDate, endDate, page, limit))
          .filter(
            (user) =>
              user._id.toString() !== get(req, "authUser._id", "").toString()
          )
          .filter((user) => user.userType !== "SUPER ADMIN")
          .map((user) => {
            return pick(user, [
              "_id",
              "email",
              "userType",
              "deleteRequest",
              "isPro",
              "suspend",
              "subscriptionTill",
              "firstName",
              "lastName",
              "phoneNumber",
              "googleLogin",
              "isFirstVisit",
              "isBetaFirstVisit",
              "isPrivacyAccepted",
              "gender",
              "DOB",
              "createdAt",
            ]);
          });
      } else if (payload.type == "NOT REPEATED USER") {
        let userArr = [];
        const filteredUser = (
          await getUserWithCondition(
            {
              isPro: false,
              // subscriptionTill: { $lt: moment().format("YYYY-MM-DD") },
            },
            1,
            1000000000000 // change the value if the number of user is greater than this
          )
        )
          .filter(
            (user) =>
              user._id.toString() !== get(req, "authUser._id", "").toString()
          )
          .filter((user) => user.userType !== "SUPER ADMIN")
          .map((user) => {
            return pick(user, [
              "_id",
              "email",
              "userType",
              "deleteRequest",
              "stripeAccount",
              "isPro",
              "suspend",
              "subscriptionTill",
              "firstName",
              "lastName",
              "phoneNumber",
              "googleLogin",
              "isFirstVisit",
              "isBetaFirstVisit",
              "isPrivacyAccepted",
              "gender",
              "DOB",
              "createdAt",
            ]);
          });
        console.log(filteredUser.length);

        for await (const user of filteredUser) {
          const purchaseDetail = await stripeInstance().paymentIntents.list({
            // customer: "cus_NDoqusXTU9x1UM",
            customer: user.stripeAccount,
          });
          if (purchaseDetail.data.length == 0) {
            userArr.push(user);
          } else if (
            purchaseDetail.data.length > 0 &&
            purchaseDetail.data.length < 2 &&
            purchaseDetail.data[purchaseDetail.data.length - 1].status ==
              "succeeded"
          ) {
            userArr.push(purchaseDetail);
          }
        }
        return res
          .status(200)
          .json(userArr.slice((page - 1) * limit, page * limit));
      } else {
        return res.status(422).json("invalid type");
      }
      return res.status(200).json(user);
    } catch (error) {
      console.log("########## Error in get", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
