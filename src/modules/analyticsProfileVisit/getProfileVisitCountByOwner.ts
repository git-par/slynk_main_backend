import { AnalyticsProfileVisitModal, IAnalyticsProfileVisit } from ".";

/**
 *
 * @param accountId
 * @param startDate
 * @param endDate
 * @param diffStartDate
 * @returns
 */

export const getProfileVisitCountByOwner = async (
  accountId: string,
  startDate: Date,
  endDate: Date,
  diffStartDate: Date
) => {
  const startConnect = await AnalyticsProfileVisitModal.find({
    ownerAccountId: accountId,
    createdAt: {
      $lte: startDate,
      $gte: diffStartDate,
    },
  });

  const endConnect = await AnalyticsProfileVisitModal.find({
    ownerAccountId: accountId,
    createdAt: {
      $gte: startDate,
      $lte: endDate,
    },
  });

  const connect = {
    startConnect: startConnect.length,
    endConnect: endConnect.length,
  };

  const startClickThrowYes = startConnect.filter((item) => item.clickThrow);
  const startClickThrowNo = startConnect.filter((item) => !item.clickThrow);

  const endClickThrowYes = endConnect.filter((item) => item.clickThrow);
  const endClickThrowNo = endConnect.filter((item) => !item.clickThrow);

  let startTotalTime = 0,
    endTotalTime = 0;

  //add number from array
  startConnect.forEach((item: IAnalyticsProfileVisit) => {
    startTotalTime += item.timeSpend;
  });
  endConnect.forEach((item: IAnalyticsProfileVisit) => {
    endTotalTime += item.timeSpend;
  });

  const finalObject = {
    connect,
    startClickThrow: {
      startClickThrowYes: startClickThrowYes.length,
      startClickThrowNo: startClickThrowNo.length,
    },
    endClickThrow: {
      endClickThrowYes: endClickThrowYes.length,
      endClickThrowNo: endClickThrowNo.length,
    },
    timeSpend: {
      startTotalTime,
      endTotalTime,
    },
  };
  return finalObject;
};
