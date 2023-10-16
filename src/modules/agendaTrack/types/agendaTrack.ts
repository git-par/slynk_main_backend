import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IAccount } from "../../account";
import { IUser } from "../../user";

export interface IAgendaTrack {
  _id?: string;
  userId?: string | IUser;
  accountId?: string | IAccount;
  type: string;
  agendaName: string;
  timeInterval: string;
  isCompleted: boolean;
  startDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export class AgendaTrack implements IAgendaTrack {
  _id?: string;
  userId?: string | IUser;
  accountId?: string | IAccount;
  type: string;
  agendaName: string;
  timeInterval: string;
  isCompleted: boolean;
  startDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;

  constructor(input?: IAgendaTrack) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();

    this.userId = input.userId;
    this.accountId = input.accountId;
    this.type = input.type;
    this.agendaName = input.agendaName;
    this.timeInterval = input.timeInterval;
    this.isCompleted = input.isCompleted;
    this.startDate = input.startDate;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }
  toJSON(): IAgendaTrack {
    return omitBy(this, isUndefined) as IAgendaTrack;
  }
}
