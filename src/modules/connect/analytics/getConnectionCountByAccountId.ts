import { ConnectModel } from "../schema";

/**
 * 
 * @param accountId 
 * @param startDate 
 * @param endDate 
 * @param diffStartDate 
 * @returns 
 */

export const getConnectionCountByAccountId = async (
  accountId: string,
  startDate: Date,
  endDate: Date,
  diffStartDate: Date
) => {
  const startConnect = await ConnectModel.find({
    "targetAccount.account": accountId,
    createdAt: {
      $lte: startDate,
      $gte: diffStartDate,
    },
  }).countDocuments();

  const endConnect = await ConnectModel.find({
    "targetAccount.account": accountId,
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  }).countDocuments();

  const connect = {
    startConnect,
    endConnect,
  };
  return connect;
};

export const getConnectionCountByOwner = async (
  accountId: string,
  startDate: Date,
  endDate: Date,
  diffStartDate: Date
) => {
  const startConnect = await ConnectModel.find({
    account: accountId,
    createdAt: {
      $lte: startDate,
      $gte: diffStartDate,
    },
  }).countDocuments();

  const endConnect = await ConnectModel.find({
    account: accountId,
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  }).countDocuments();

  const connect = {
    startConnect,
    endConnect,
  };
  return connect;
};
