/* eslint-disable @typescript-eslint/no-unused-vars */
import { Response } from "express";
import { Request } from "../../request";
import { log } from "winston";
import { get as _get } from "lodash";
import { getPopulatedAccount } from "../../modules/account";
import * as fs from "fs";
import {
  createAndUploadPkPass,
  getLatestPkPassByAccountId,
} from "../../modules/pkPass";
import {
  deletePassIdentifier,
  getOnePassIdentifierByData,
  getPassIdentifierByData,
  IPassIdentifier,
  PassIdentifier,
  savePassIdentifier,
  updateManyPassIdentifier,
} from "../../modules/passIdentifier";
import { generatePass } from "../../helper/generatePass";

export default class Controller {
  protected readonly create = async (req: Request, res: Response) => {
    try {
      const accountId = req.params.accountId;
      if (!accountId) {
        res.status(422).json({ message: "Account Required." });
        return;
      }

      const account = await getPopulatedAccount(accountId);
      if (!account) {
        res.status(422).json({ message: "Account Required." });
        return;
      }

      const dirPath = `./pkpassStorage/${accountId}_${new Date().getTime()}`;
      fs.mkdirSync(dirPath, { recursive: true });

      //Profile Image Save to local

      const pkPassFilePath = await generatePass(dirPath, accountId, account);
      if (!pkPassFilePath) {
        throw new Error(
          "Something went wrong, Please try again after sometimes."
        );
      }
      const pkpassURL = await createAndUploadPkPass(
        "slynk.pkpass",
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        pkPassFilePath,
        accountId
      );
      fs.rm(dirPath, { recursive: true }, (err) => {
        if (err) console.log(err);
        else {
          console.log("\nDeleted Symbolic Link: symlinkToFile");
        }
      });
      res.status(200).json({
        message: "Pass Successfully created.",
        URL: `${process.env.GOOGLE_CLOUD_BUCKET_URL}/${pkpassURL.url}`,
      });
      return;
    } catch (error) {
      console.log(error);
      log("error", "error in create PKPASS URL", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly getPassByRegistrations = async (
    req: Request,
    res: Response
  ) => {
    try {
      const params = req.params;

      const queryPassesUpdatedSince = req.query.passesUpdatedSince as string;
      const passesData = await getPassIdentifierByData(params);
      const serialNumbers: string[] = [];
      let lastUpdatedDate = 0;

      if (!queryPassesUpdatedSince) {
        passesData.forEach((item: IPassIdentifier) => {
          serialNumbers.push(item.serialNumber);
          if (lastUpdatedDate < parseInt(item.lastUpdatedDate)) {
            lastUpdatedDate = parseInt(item.lastUpdatedDate);
          }
        });

        res
          .status(200)
          .json({ serialNumbers, lastUpdated: lastUpdatedDate.toString() });
        return;
      }

      passesData.forEach((item: IPassIdentifier) => {
        if (
          parseInt(queryPassesUpdatedSince) < parseInt(item.lastUpdatedDate)
        ) {
          serialNumbers.push(item.serialNumber);
          if (lastUpdatedDate < parseInt(item.lastUpdatedDate)) {
            lastUpdatedDate = parseInt(item.lastUpdatedDate);
          }
        }
      });

      res
        .status(200)
        .json({ serialNumbers, lastUpdated: lastUpdatedDate.toString() });
      return;
    } catch (error) {
      console.log(error);
      log("error", "error in create PKPASS URL", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly postPkPass = async (req: Request, res: Response) => {
    try {
      const params = req.params;
      const payload = req.body;

      const existingPass = await getLatestPkPassByAccountId(
        params.serialNumber
      );
      if (!existingPass) {
        res.status(204).json({
          message: "Hmm... Something went wrong. Please try again later.",
        });
        return;
      }

      const passIdentifier = await getOnePassIdentifierByData(params);

      if (!passIdentifier) {
        await savePassIdentifier(
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-ignore
          new PassIdentifier({
            ...params,
            pkPassId: _get(existingPass, "_id"),
            pushToken: payload.pushToken,
            passDataJSON: "",
          })
        );
        res.status(201).json({
          message: "Pass successfully added",
        });
        return;
      }

      res.status(200);
    } catch (error) {
      console.log(error);
      log("error", "error in create PKPASS URL", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly getPassBySerial = async (req: Request, res: Response) => {
    try {
        // const params = req.params;
        // const reqHeader = req.headers;

      // const ifModifiedSince = reqHeader["if-modified-since"];
      // const passData = await getOnePassIdentifierByData(params);

      // if (
      //   !passData.isUpdateRequired ||
      //   parseInt(passData.lastUpdatedDate) <= parseInt(ifModifiedSince)
      // ) {
      //   res.setHeader("lastUpdated", (new Date().getTime() / 1000).toString());

      //   return res.status(304);
      // }

      const accountId = req.accountId;

      if (!accountId) {
        res.status(401);
        return;
      }

      const account = await getPopulatedAccount(accountId);
      if (!account) {
        res.status(401);
        return;
      }

      const dirPath = `./pkpassStorage/${accountId}_${new Date().getTime()}`;
      fs.mkdirSync(dirPath, { recursive: true });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pkPassFilePath: any = await generatePass(
        dirPath,
        accountId,
        account
      );
      if (!pkPassFilePath) {
        throw new Error(
          "Something went wrong, Please try again after sometimes."
        );
      }

      res.setHeader("Content-type", "application/vnd.apple.pkpass");
      res.setHeader("Last-Modified", (new Date().getTime() / 1000).toString());
      res.sendFile(pkPassFilePath, { root: "./" });

      fs.rm(dirPath, { recursive: true }, (err) => {
        if (err) console.log(err);
        else {
          console.log("\nDeleted Symbolic Link: symlinkToFile");
        }
      });
      await updateManyPassIdentifier(
        {
          passTypeIdentifier: process.env.APPLE_PASS_IDENTIFIER,
          serialNumber: accountId,
        },
        false
      );

      return;
    } catch (error) {
      console.log(error);
      log("error", "error in create PKPASS URL", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly deletePkPass = async (req: Request, res: Response) => {
    try {
      const params = req.params;
      const existIngPass = await getOnePassIdentifierByData(params);
      if (!existIngPass) {
        return res.status(200).json();
      }
      await deletePassIdentifier(existIngPass._id);

      return res.status(200).json();
    } catch (error) {
      console.log(error);
      log("error", "error in create PKPASS URL", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly passLog = async (req: Request, res: Response) => {
    try {
      const params = req.body;
      console.log(params);
      console.log("in passLog");
      res.status(200).json({ message: "Done." });
    } catch (error) {
      console.log(error);
      log("error", "error in create PKPASS URL", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
