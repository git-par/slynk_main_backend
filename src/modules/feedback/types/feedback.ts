import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IAccount } from "../../account";
import { IFeedBackType } from "../../feedbackType";
import { IImage } from "../../image";
import { IUser } from "../../user";

export interface IFeedBack {
  _id?: string;
  messageType?: string | IFeedBackType;
  accountId: string | IAccount;
  userId: string | IUser;
  responseType?: boolean;
  isCompleted?: boolean;
  isDeleted?: boolean;
  isArchived?: boolean;
  subject?: string;
  message?: string;
  email?: string;
  attachment?: (string | IImage)[];
  createdAt?: Date;
  updatedAt?: Date;
}

export class FeedBack implements IFeedBack {
  _id?: string;
  messageType?: string | IFeedBackType;
  accountId: string | IAccount;
  userId: string | IUser;
  responseType?: boolean;
  isCompleted?: boolean;
  isDeleted?: boolean;
  isArchived?: boolean;
  subject?: string;
  message?: string;
  email?: string;
  attachment?: (string | IImage)[];
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IFeedBack) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.email = input.email;
    this.messageType = input.messageType;
    this.accountId = input.accountId;
    this.userId = input.userId;
    this.responseType = input.responseType;
    this.isCompleted = input.isCompleted;
    this.isDeleted = input.isDeleted;
    this.isArchived = input.isArchived;
    this.subject = input.subject;
    this.message = input.message;
    this.attachment = input.attachment;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  toJSON(): IFeedBack {
    return omitBy(this, isUndefined) as IFeedBack;
  }
}
