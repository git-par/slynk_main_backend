import { BetaUserModel } from "./schema";

export const getLitePopulatedBetaUsersForAdmin = async () => {
  return await BetaUserModel.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $project: {
        "user._id": 1,
        "user.email": 1,
        "user.phoneNumber": 1,
        "user.userType": 1,
        _id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        phoneNumber: 1,
        platform: 1,
        views: 1,
        tags: 1,
      },
    },
    {
      $project: {
        user: {
          $arrayElemAt: ["$user", 0],
        },
        _id: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        phoneNumber: 1,
        platform: 1,
        tags: 1,
        views: 1,
      },
    },
    { $match: { "user.userType": { $ne: "SUPER ADMIN" } } },
  ]);
};
