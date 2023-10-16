import { IncomingConnectionModel } from ".";


/**
 * 
 * @param _id 
 */
export const deleteIncomingConnection = async (_id: string) => {
  await IncomingConnectionModel.findByIdAndDelete(_id);
};
