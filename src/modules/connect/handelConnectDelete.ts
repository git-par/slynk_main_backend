import { getGroupsByConnect, updateGroup } from "../group";

/**
 * will remove connect reference from group
 * @param _id connect id
 */
export const handelConnectDelete = async (_id: string) => {
  const groups = (await getGroupsByConnect(_id)).map((group) => {
    group.connects = group.connects.filter(
      (connect) => connect.toString() != _id.toString()
    );
    return group;
  });

  await Promise.allSettled(groups.map(updateGroup));
};
