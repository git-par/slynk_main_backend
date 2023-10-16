import { IAccount } from "../../account";
import { Types } from "mongoose";
import { isUndefined, omitBy } from "lodash";

export interface IInternalNotes {
    _id?: string;
    accountId: (string | IAccount);
    createdBy: (string | IAccount);
    updatedBy: (string | IAccount);
    notes: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export class InternalNotes implements IInternalNotes {
    _id?: string;
    accountId: string | IAccount;
    createdBy: (string | IAccount);
    updatedBy: (string | IAccount);
    notes: string;
    createdAt?: Date;
    updatedAt?: Date;

    constructor(input?: IInternalNotes) {
        this._id = input._id
            ? input._id.toString()
            : new Types.ObjectId().toString();
        this.accountId = input.accountId
        this.createdBy = input.createdBy
        this.updatedBy = input.updatedBy
        this.notes = input.notes
        this.createdAt = input.createdAt;
        this.updatedAt = input.updatedAt;
    }

    toJSON(): IInternalNotes {
        return omitBy(this, isUndefined) as IInternalNotes;

    }
}