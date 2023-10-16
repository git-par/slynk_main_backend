import { isUndefined, omitBy } from "lodash";
import { Types } from "mongoose";
import { IAccount } from "../../account";

export enum genderType {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
  NOT_SPECIFIED = "NOT_SPECIFIED",
}
export interface IUser {
  _id?: string;
  email: string;
  firstName: string;
  lastName: string;
  password?: string;
  DOB?: Date;
  gender?: string;
  stripeAccount: string;
  googleId: string;
  googleLogin?: boolean;
  appleLogin?: boolean;
  FCMToken: string[];
  accounts: (string | IAccount)[];
  // betaUser: string | IBetaUser;
  isPro?: boolean;
  isAdminPro?: boolean;
  isInAppPro?: boolean;
  isFreePro?: boolean;
  isFreeUsed?: boolean;
  RESETToken?: string;
  updateEmailOTP?: string;
  phoneNumber: string;
  userType?: string;
  deleteRequest?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;
  isFirstVisit?: {
    visitDate: Date;
    value: boolean;
  };
  isBetaFirstVisit?: {
    visitDate: Date;
    value: boolean;
  };
  isPrivacyAccepted?: {
    acceptedDate: Date;
    value: boolean;
  };
  deActivate?: number;
  suspend?: {
    suspendTill: Date;
    suspendMessage: string;
  };
  subscriptionTill?: Date;
  trialEndDate?: Date;
  pwaShow?: boolean; 
  dragOff?: boolean; 
  createdAt?: Date;
  updatedAt?: Date;
}
export interface UserDefaults {
  googleId: "";
  RESETToken: "";
  FCMToken: [];
  accounts: [];
  updateEmailOTP: "";
  isPro: false;
  isAdminPro: false;
  isInAppPro: false;
  isFreePro: false;
  isFreeUsed: false;
  googleLogin: false;
  appleLogin: false;
  isEmailVerified: false;
  isPhoneVerified: false;
}

export class User implements IUser {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  stripeAccount: string;
  password: string;
  DOB?: Date;
  gender?: string;
  googleId: string;
  googleLogin?: boolean;
  appleLogin?: boolean;
  FCMToken: string[];
  accounts: (string | IAccount)[];
  // betaUser: string | IBetaUser;
  isPro = false;
  isAdminPro?: boolean;
  isInAppPro?: boolean;
  isFreePro?: boolean;
  isFreeUsed?: boolean;
  RESETToken: string;
  updateEmailOTP: string;
  phoneNumber: string;
  userType: string;
  suspend?: {
    suspendTill: Date;
    suspendMessage: string;
  };
  deleteRequest: boolean;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isFirstVisit?: {
    visitDate: Date;
    value: boolean;
  };
  isBetaFirstVisit?: {
    visitDate: Date;
    value: boolean;
  };
  isPrivacyAccepted?: {
    acceptedDate: Date;
    value: boolean;
  };
  deActivate: number;
  subscriptionTill?: Date;
  trialEndDate?: Date;
  pwaShow?: boolean;
  dragOff?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  constructor(input?: IUser) {
    this._id = input._id
      ? input._id.toString()
      : new Types.ObjectId().toString();
    this.email = input.email;
    this.firstName = input.firstName;
    this.lastName = input.lastName;
    this.stripeAccount = input.stripeAccount;
    this.password = input.password;
    this.googleLogin = input.googleLogin;
    this.appleLogin = input.appleLogin;
    this.googleId = input.googleId;
    this.FCMToken = input.FCMToken;
    this.accounts = input.accounts;
    // this.betaUser = input.betaUser;
    this.RESETToken = input.RESETToken;
    this.updateEmailOTP = input.updateEmailOTP;
    this.isPro = !!input.isPro;
    this.isAdminPro = !!input.isAdminPro;
    this.isInAppPro = !!input.isInAppPro;
    this.isFreePro = !!input.isFreePro;
    this.isFreeUsed = !!input.isFreeUsed;
    this.isEmailVerified = !!input.isEmailVerified;
    this.isPhoneVerified = !!input.isPhoneVerified;
    this.isFirstVisit = input.isFirstVisit;
    this.isBetaFirstVisit = input.isBetaFirstVisit;
    this.isPrivacyAccepted = input.isPrivacyAccepted;
    this.phoneNumber = input.phoneNumber;
    this.userType =
      input.userType === "ADMIN" ||
      input.userType === "USER" ||
      input.userType === "SUPER ADMIN"
        ? input.userType
        : "USER";
    this.deleteRequest = !!input.deleteRequest;
    this.suspend = input.suspend;
    this.DOB = input.DOB;
    this.gender = input.gender;
    this.deActivate = input.deActivate ?? 0;
    this.subscriptionTill = input.subscriptionTill;
    this.trialEndDate = input.trialEndDate;
    this.pwaShow = input.pwaShow;
    this.dragOff = input.dragOff;
    this.createdAt = input.createdAt;
    this.updatedAt = input.updatedAt;
  }

  static defaults: UserDefaults = {
    googleId: "",
    RESETToken: "",
    FCMToken: [],
    accounts: [],
    updateEmailOTP: "",
    isPro: false,
    isAdminPro: false,
    isInAppPro: false,
    isFreePro: false,
    isFreeUsed: false,
    googleLogin: false,
    appleLogin: false,
    isEmailVerified: false,
    isPhoneVerified: false,
  };

  static adminTypes = ["ADMIN", "SUPER ADMIN"];
  static feedBackFields = ["email", "phoneNumber"];

  toJSON(): IUser {
    return omitBy(this, isUndefined) as IUser;
  }
}
