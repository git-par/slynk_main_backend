import { getLiteAccountByIdForWallet } from "../modules/account";
import { GoogleAuth } from "google-auth-library";
import jwt from "jsonwebtoken";

export const googleWalletGeneric = async (accountId: string) => {
  const account = await getLiteAccountByIdForWallet(accountId);
  const serviceAccountFile = process.env.GOOGLE_WALLET_FILE;
  const issuerId = process.env.WALLET_ISSUER_ID;
  const classId = process.env.WALLET_CLASS_ID;

  const credentials = require(serviceAccountFile);
  const httpClient = new GoogleAuth({
    credentials: credentials,
    scopes: "https://www.googleapis.com/auth/wallet_object.issuer",
  });

  const objectUrl =
    "https://walletobjects.googleapis.com/walletobjects/v1/genericObject/";

  const walletData = {
    id: `${issuerId}.${account._id
      .toString()
      .replace(/[^\w.-]/g, "_")}-${classId}`,
    classId: `${issuerId}.${classId}`,
    genericType: "GENERIC_TYPE_UNSPECIFIED",
    hexBackgroundColor: "#428124",
    logo: {
      sourceUri: {
        uri: process.env.DEFAULT_N_SLYNK_LOGO,
      },
    },
    cardTitle: {
      defaultValue: {
        language: "en",
        value: "slynk",
      },
    },
    subheader: {
      defaultValue: {
        language: "en",
        value: "Name",
      },
    },
    header: {
      defaultValue: {
        language: "en",
        value: account.firstName + " " + account.lastName,
      },
    },
    barcode: {
      type: "QR_CODE",
      value: process.env.APP_LAUNCH_URL + "/gwc/" + account.accountName,
    },
    heroImage: {
      sourceUri: {
        uri: account.googleWalletPicId
          ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            account.googleWalletPicId.url
          : process.env.DEFAULT_URL,
      },
    },
    textModulesData: [
      {
        header: account.companyName ? "Company Name" : "",
        body: account.companyName,
        id: "points",
      },
      {
        header: account.role ? "Role" : "",
        body: account.role,
        id: "contacts",
      },
    ],
  };

  let objectResponse;
  try {
    objectResponse = await httpClient.request({
      url: objectUrl + walletData.id,
      method: "GET",
      //   data: walletData,
    });
    if (objectResponse.status === 200) {
      objectResponse = await httpClient.request({
        url: objectUrl + walletData.id,
        method: "PUT",
        data: walletData,
      });
    }
    console.log("existing object", walletData.id);
  } catch (err) {
    if (err.response && err.response.status === 404) {
      objectResponse = await httpClient.request({
        url: objectUrl,
        method: "POST",
        data: walletData,
      });
      console.log("new object", walletData.id);
    } else {
      return {
        message: err.message,
      };
    }
  }
  const claims = {
    iss: credentials.client_email, // `client_email` in service account file.
    aud: "google",
    origins: "*",
    typ: "savetowallet",
    payload: {
      genericObjects: [{ id: walletData.id }],
    },
  };

  const token = jwt.sign(claims, credentials.private_key, {
    algorithm: "RS256",
  });
  const saveUrl = `https://pay.google.com/gp/v/save/${token}`;
  return { URL: saveUrl };
};
