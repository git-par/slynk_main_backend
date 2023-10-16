import { AccountModel } from "./schema";

export const getLiteAccountsForAdmin = async () => {
  // return await AccountModel.find()
  //   .select(["user", "_id", "firstName", "lastName"])
  //   .populate("user", "_id email phoneNumber")
  //   .lean();
  return await AccountModel.aggregate([
    {
      $lookup: {
        from: "tags",
        localField: "_id",
        foreignField: "account",
        as: "tags",
        pipeline: [
          {
            $project: {
              _id: 1,
            },
          },
        ],
      },
    },
    { $addFields: { accountId: { $toString: "$_id" } } },
    {
      $lookup: {
        from: "passidentifiers",
        localField: "accountId",
        foreignField: "serialNumber",
        as: "pkpasses",
        pipeline: [
          {
            $project: {
              _id: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user",
      },
    },
    {
      $lookup: {
        from: "images",
        localField: "profileImage",
        foreignField: "_id",
        as: "profileImage",
      },
    },
    {
      $project: {
        "user._id": 1,
        "user.email": 1,
        "user.phoneNumber": 1,
        "user.userType": 1,
        "user.isPro": 1,
        "user.suspend": 1,
        "profileImage._id": 1,
        "profileImage.description": 1,
        "profileImage.title": 1,
        "profileImage.url": 1,
        _id: 1,
        firstName: 1,
        lastName: 1,
        companyName: 1,
        views: 1,
        tags: 1,
        type: 1,
        pkpasses: 1,
        isVerify: 1,
        accountName: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $project: {
        user: {
          $arrayElemAt: ["$user", 0],
        },
        profileImage: {
          $arrayElemAt: ["$profileImage", 0],
        },
        _id: 1,
        firstName: 1,
        lastName: 1,
        companyName: 1,
        type: 1,
        tags: 1,
        views: 1,
        pkpasses: 1,
        isVerify: 1,
        accountName: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    // { $match: { "user.userType": { $ne: "SUPER ADMIN" } } },
  ]);
};
