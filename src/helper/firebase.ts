import { applicationDefault, initializeApp } from "firebase-admin/app";
export const firebase = () => {
  // console.log("firebase");
  return initializeApp({
    credential: applicationDefault(),
  });
};
