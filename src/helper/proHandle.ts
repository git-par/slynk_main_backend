import { get } from "lodash";
import moment from "moment";
import { getUserById, IUser, updateUser, User } from "../modules/user";
import { stripeInstance } from "./stripe";

export const proHandle = async (user: IUser) => {
  const { data } = await stripeInstance()
    .subscriptions.list({
      customer: user.stripeAccount,
    })
    .catch(console.log);
  let endTime = 0;
  let trialEndDate = null;

  const currentTime = new Date(new Date().toISOString()).getTime();

  for (let index = 0; index < data.length; index++) {
    const element = data[index];
    if (!trialEndDate) {
      if (element.trial_end) {
        trialEndDate = new Date(element.trial_end * 1000);
      }
    }
    if (currentTime < element.current_period_end * 1000) {
      if (!endTime) {
        endTime = element.current_period_end * 1000;
      } else {
        endTime = moment(endTime)
          .add(
            moment(element.current_period_end * 1000).diff(
              moment(element.current_period_start * 1000),
              "milliseconds"
            ),
            "milliseconds"
          )
          .toDate()
          .getTime();
      }
    }
  }
  const { data: chargesData } = await stripeInstance().charges.list({
    customer: user.stripeAccount,
  });

  for (let index = 0; index < chargesData.length; index++) {
    const element = chargesData[index];
    if (element.paid && !element.refunded && element.metadata.product) {
      const { data: priceData } = await stripeInstance().prices.list({
        active: true,
        limit: 100,
        expand: ["data.product"],
        type: "recurring",
      });
      const expiryDate = moment(chargesData[index].created * 1000).add(
        1,
        get(priceData, "0.recurring.interval")
      );
      if (currentTime < expiryDate.toDate().getTime()) {
        if (!endTime) {
          endTime = expiryDate.toDate().getTime();
        } else {
          endTime = moment(endTime)
            .add(1, get(priceData, "0.recurring.interval"))
            .toDate()
            .getTime();
        }
      }
    }
  }
  endTime = new Date(new Date(endTime).toISOString()).getTime();
  if (currentTime > endTime) {
    // need to update user
    if (user.isAdminPro || user.isInAppPro || user.isFreePro) {
      if (user.subscriptionTill) {
        if (new Date(user.subscriptionTill).getTime() > new Date().getTime()) {
          // need to update user
          user.isPro = true;
          const updatableUser: User = await getUserById(user._id);
          await updateUser(
            new User({ ...updatableUser.toJSON(), isPro: true, trialEndDate })
          );
        } else {
          user.isPro = false;
          const updatableUser: User = await getUserById(user._id);
          await updateUser(
            new User({
              ...updatableUser.toJSON(),
              isPro: false,
              isFreeUsed: user.isFreePro ? true : false,
              isInAppPro: false,
              isFreePro: false,
              trialEndDate,
            })
          );
        }
      }
    } else {
      user.isPro = false;
      const updatableUser: User = await getUserById(user._id);
      await updateUser(
        new User({
          ...updatableUser.toJSON(),
          trialEndDate,
          // isPro: false,
          // isFreePro: false,
          // isFreeUsed: false,
        })
      );
    }
  } else {
    // need to update user
    user.isPro = true;
    const updatableUser: User = await getUserById(user._id);
    await updateUser(
      new User({
        ...updatableUser.toJSON(),
        isPro: true,
        subscriptionTill: new Date(endTime),
        trialEndDate,
      })
    );
  }
  return;
};
