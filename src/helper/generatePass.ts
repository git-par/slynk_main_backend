import axios from "axios";
import * as fs from "fs";
import { exec } from "child_process";
import { IAccount } from "../modules/account";
import { get as _get } from "lodash";
import { AES } from "crypto-js";
import { hexToRgb } from "./hexToRGB";
import { whiteColorIdentifier } from "./whiteColorIdentifier";

export const generatePass = async (
  dirPath: string,
  accountId: string,
  account: IAccount
) => {
  const profileImage = _get(account, "profileImage.url")
    ? _get(account, "profileImage.url")
    : process.env.DEFAULT_URL;

  const token = AES.encrypt(
    accountId.toString(),
    process.env.AES_KEY_PASS
  ).toString();

  const thumbnailPath = dirPath + "/" + "thumbnail.png";
  const thumbnailPath2 = dirPath + "/" + "thumbnail@2x.png";
  const passFilepath = dirPath + "/" + "pass.json";
  const manifestFilePath = dirPath + "/" + "manifest.json";
  const signatureFilePath = dirPath + "/" + "signature";
  const pkPassFilePath = dirPath + "/" + "slynk.pkpass";
  const thumbnailPathFile = fs.createWriteStream(thumbnailPath);
  const thumbnailPath2File = fs.createWriteStream(thumbnailPath2);
  const profileImageData = await axios.get(profileImage, {
    responseType: "stream",
  });

  const isWhite = whiteColorIdentifier(account.rsb);
  const logo = !isWhite ? "./credentials/pkpass/black/logo.png" : "./credentials/pkpass/white/logo.png";
  const logo2x = !isWhite ? "./credentials/pkpass/black/logo@2x.png" : "./credentials/pkpass/white/logo@2x.png"
  const icon = !isWhite ? "./credentials/pkpass/black/icon.png" : "./credentials/pkpass/white/icon.png";
  const icon2x = !isWhite ? "./credentials/pkpass/black/icon@2x.png" : "./credentials/pkpass/white/icon@2x.png";

  const THUMBNAIL_PATH_SHA1 = `openssl sha1 ${thumbnailPath}`;
  const THUMBNAIL_PATH_2_SHA1 = `openssl sha1 ${thumbnailPath2}`;
  const PASS_SHA1 = `openssl sha1 ${passFilepath}`;

  const CMD_SIGNATURE = `openssl smime -binary -sign -certfile ./credentials/pkpass/WWDR.pem -signer ./credentials/pkpass/passcertificate.pem -inkey ./credentials/pkpass/passkey.pem -in ${manifestFilePath} -out ${signatureFilePath} -outform DER -passin pass:${process.env.APPLE_CERT}`;

  let CMD_ZIP = `zip -9jpr ${pkPassFilePath} ${manifestFilePath} ${passFilepath} ${signatureFilePath} ${logo} ${logo2x} ${icon} ${icon2x}  ${thumbnailPath}  ${thumbnailPath2}`;
  // let CMD_ZIP = `zip -9jpr ${pkPassFilePath} ${manifestFilePath} ${passFilepath} ${signatureFilePath} ./credentials/pkpass/logo.png ./credentials/pkpass/logo@2x.png ./credentials/pkpass/icon.png ./credentials/pkpass/icon@2x.png  ${thumbnailPath}  ${thumbnailPath2}`;
  // if (!isWhite) {
  //   CMD_ZIP = `zip -9jpr ${pkPassFilePath} ${manifestFilePath} ${passFilepath} ${signatureFilePath} ./credentials/pkpass/blackLogo.png ./credentials/pkpass/blackLogo@2x.png ./credentials/pkpass/blackIcon.png ./credentials/pkpass/blackIcon@2x.png  ${thumbnailPath}  ${thumbnailPath2}`;
  // }

  return new Promise((resolve) => {
    profileImageData.data.pipe(thumbnailPathFile);
    profileImageData.data.pipe(thumbnailPath2File);
    thumbnailPath2File.on("close", () => {
      exec(THUMBNAIL_PATH_SHA1, (error, stdout, stderr) => {
        if (error || stderr) {
          console.log("+++++++++++++++++++ in CMD_SHA1");
          console.log(error);
          console.log(stderr);
          throw new Error(
            "Something went wrong, Please try again after sometimes."
          );
        }

        const THUMBNAIL_SHA1 = stdout.split("=");
        const THUMBNAIL_SHA1_KEY = THUMBNAIL_SHA1.at(-1).trim();

        //SHA1 for THUMBNAIL_2
        exec(THUMBNAIL_PATH_2_SHA1, (error, stdout, stderr) => {
          if (error || stderr) {
            console.log("+++++++++++++++++++ in CMD_SHA1");
            console.log(error);
            console.log(stderr);
            throw new Error(
              "Something went wrong, Please try again after sometimes."
            );
          }

          const THUMBNAIL_2_SHA1 = stdout.split("=");
          const THUMBNAIL_2_SHA1_KEY = THUMBNAIL_2_SHA1.at(-1).trim();
          const passFile = {
            formatVersion: 1,
            passTypeIdentifier: process.env.APPLE_PASS_IDENTIFIER,
            serialNumber: accountId,
            webServiceURL: process.env.APPLE_WEB_SERVICE_URL,
            authenticationToken: token,
            teamIdentifier: process.env.APPLE_TEAM_ID,
            appLaunchURL: `${process.env.APP_LAUNCH_URL}/${account.accountName}`,
            associatedStoreIdentifiers: [parseInt(process.env.APPLE_ID)],

            barcode: {
              message: `${process.env.APP_LAUNCH_URL}/awc/${account.accountName}`,
              format: "PKBarcodeFormatQR",
              messageEncoding: "UTF8",
            },
            organizationName: "",
            description: "Welcome to Slynk",
            logoText: "",
            foregroundColor:
              account.fc && account.fc !== ""
                ? hexToRgb(account.fc)
                  ? hexToRgb(account.fc)
                  : "rgb(255,255,255)"
                : "rgb(255,255,255)",
            backgroundColor:
              account.rsb && account.rsb !== ""
                ? hexToRgb(account.rsb)
                  ? hexToRgb(account.rsb)
                  : "rgb(195,223,218)"
                : "rgb(195,223,218)",

            labelColor:
              account.fc && account.fc !== ""
                ? hexToRgb(account.fc)
                  ? hexToRgb(account.fc)
                  : "rgb(255,255,255)"
                : "rgb(255,255,255)",
            generic: {
              headerFields: [
                {
                  label: account.type,
                  key: "type",
                  value: "",
                  changeMessage: "",
                },
              ],
              primaryFields: [
                {
                  key: "member",
                  value: account.firstName + " " + account.lastName,
                },
              ],
              secondaryFields: [
                {
                  key: "subtitle",
                  label: account.companyName ? "Company Name" : "",
                  value: account.companyName,
                },
              ],
              auxiliaryFields: [
                {
                  key: "level",
                  label: account.role ? "Position" : "",
                  value: account.role,
                },
                // {
                //   key: "favorite",
                //   label: "City",
                //   value: account.location.split(",").at(-1).trim(),
                //   textAlignment: "PKTextAlignmentRight",
                // },
              ],
              backFields: [
                {
                  key: "aboutMe",
                  label: "About Me",
                  value: account.aboutMe,
                },
                {
                  key: "viewProfile",
                  label: "View my profile",
                  value: `<a href="${process.env.APP_LAUNCH_URL}/${account.accountName}">Click here to view my Profile</a>`,
                },
              ],
            },
          };

          fs.writeFileSync(passFilepath, JSON.stringify(passFile), "utf-8");

          exec(PASS_SHA1, (error, stdout, stderr) => {
            if (error || stderr) {
              console.log("+++++++++++++++++++ in CMD_SHA1");
              console.log(error);
              console.log(stderr);
              throw new Error(
                "Something went wrong, Please try again after sometimes."
              );
            }

            const PASS_SHA1 = stdout.split("=");
            const PASS_SHA1_KEY = PASS_SHA1.at(-1).trim();

            let manifestFile = {
              "icon.png": "f1785391afec03bb4b085f804defc77ff7b80965",
              "logo.png": "f1785391afec03bb4b085f804defc77ff7b80965",
              "icon@2x.png": "f1785391afec03bb4b085f804defc77ff7b80965",
              "logo@2x.png": "f1785391afec03bb4b085f804defc77ff7b80965",
              "pass.json": PASS_SHA1_KEY,
              "thumbnail.png": THUMBNAIL_SHA1_KEY,
              "thumbnail@2x.png": THUMBNAIL_2_SHA1_KEY,
            };

            if (!isWhite) {
               manifestFile = {
                "icon.png": "6e4aa486301d0b712ed51e780ff6c4cca59b35e9",
                // "icon.png": "6e4aa486301d0b712ed51e780ff6c4cca59b35e9",
                "logo.png": "6e4aa486301d0b712ed51e780ff6c4cca59b35e9",
                "icon@2x.png": "6e4aa486301d0b712ed51e780ff6c4cca59b35e9",
                "logo@2x.png": "6e4aa486301d0b712ed51e780ff6c4cca59b35e9",
                "pass.json": PASS_SHA1_KEY,
                "thumbnail.png": THUMBNAIL_SHA1_KEY,
                "thumbnail@2x.png": THUMBNAIL_2_SHA1_KEY,
              };
            }
            fs.writeFileSync(
              manifestFilePath,
              JSON.stringify(manifestFile),
              "utf-8"
            );

            exec(CMD_SIGNATURE, (error, stdout, stderr) => {
              if (error || stderr) {
                console.log("+++++++++++++++++++ in CMD_SHA1");
                console.log(error);
                console.log(stderr);
                throw new Error(
                  "Something went wrong, Please try again after sometimes."
                );
              }

              exec(CMD_ZIP, (error, stdout, stderr) => {
                if (error || stderr) {
                  console.log("+++++++++++++++++++ in CMD_SHA1");
                  console.log(error);
                  console.log(stderr);
                  throw new Error(
                    "Something went wrong, Please try again after sometimes."
                  );
                }
                console.log("-------");
                return resolve(pkPassFilePath);
              });
            });
          });
        });
      });
    });
  }).catch((error) => {
    console.log(error);
    throw new Error("Something went wrong, Please try again after sometimes.");
  });
};
