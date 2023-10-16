import { Response } from "express";
import { get as _get, isUndefined, omitBy, isError } from "lodash";
import { Request } from "./../../request";
import Joi from "joi";
import { log } from "winston";
import {
  getTagByUrl,
  updateTags,
  Tag,
  getTagsById,
  getTagByUniqueUrl,
  saveMultipleTags,
  getSortedTags,
  getTags,
  getTagsCount,
  getTagsByAccountIdForAPI,
} from "../../modules/tags";
import { Tag as TagType } from "../../modules/tags";
import { QRColorType, QRTypeCode } from "../../modules/tags";
import { getPopulatedAccountByAccountName } from "../../modules/account/getAccountByAccountName";
import {
  Account,
  getAccountById,
  incrementAccountView,
} from "../../modules/account";
import { getTagNoPopulatedByUrl } from "../../modules/tags/getTagNoPopulatedByUrl";
import * as Sentry from "@sentry/node";
import { getConnectionByAccountAndTargetedAccount } from "../../modules/connect";
import { removeProLinks } from "../../helper/removeProToFree";
import { getTagsByAccountId } from "../../modules/tags/getTagsByAccountId";
import { getImageByUrl } from "../../modules/image";

// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_URL,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

Sentry.configureScope((scope) => scope.setTransactionName("In Tags"));

export default class Controller {
  protected readonly tagsCreateSchema = Joi.object().keys({
    size: Joi.string().optional().allow(""),
    color: Joi.string()
      .required()
      .valid(...Object.values(QRColorType)),
    batchNo: Joi.string().required(),
    tagImage: Joi.string().optional().allow(null),
    type: Joi.string()
      .required()
      .valid(...Object.values(QRTypeCode)),
    numberOfTags: Joi.number().required(),
    isCustomTag: Joi.boolean().required(),
  });

  protected readonly sortedTagsSchema = Joi.object().keys({
    size: Joi.string().optional().allow(""),
    color: Joi.optional()
      .allow("")
      .valid(...Object.values(QRColorType)),
    batchNo: Joi.string().optional().allow(""),
    type: Joi.string()
      .optional()
      .allow("")
      .valid(...Object.values(QRTypeCode)),
    isCustomTag: Joi.boolean().optional(),

    // numberOfTags: Joi.number().optional(),
  });

  protected readonly linkTagToAccount = Joi.object().keys({
    account: Joi.string().required(),
    label: Joi.string().required(),
  });

  protected readonly linkBlockTag = Joi.object().keys({
    block: Joi.boolean().required(),
    blockMessage: Joi.string().required().allow("", null),
  });

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const payloadValue = await this.tagsCreateSchema
        .validateAsync(payload)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          console.log(e);
          if (isError(e)) {
            res.status(422).json(e);
          } else {
            res.status(422).json({ message: e.message });
          }
        });
      if (!payloadValue) {
        return;
      }
      // console.log(req.body);
      // console.log(payloadValue);

      if (payloadValue.tagImage != null) {
        const image = await getImageByUrl(payloadValue.tagImage);
        console.log({ image });

        payloadValue.tagImage = image._id;
      }

      const numberOfTags = payloadValue.numberOfTags;
      // const chars =
      //   "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
      // const passwordLength = 8;
      // let password = "";
      // for (let i = 0; i <= passwordLength; i++) {
      //   const randomNumber = Math.floor(Math.random() * chars.length);
      //   password += chars.substring(randomNumber, randomNumber + 1);
      // }
      // payloadValue.password = password;
      payloadValue.accounts = null;
      payloadValue.label = null;
      payloadValue.block = false;
      const allUrlArr: TagType[] = [];
      while (allUrlArr.length !== numberOfTags) {
        const ranNo = Math.floor(Math.random() * (9999999 - 1000000) + 1000000);
        payloadValue.size = payloadValue.size || "";

        payloadValue.urlName = payloadValue.isCustomTag
          ? payloadValue.size +
            payloadValue.color +
            payloadValue.batchNo +
            "C" +
            payloadValue.type +
            ranNo
          : payloadValue.size +
            payloadValue.color +
            payloadValue.batchNo +
            payloadValue.type +
            ranNo;

        // console.log(payloadValue.urlName);
        const checkUrl = await getTagByUniqueUrl(payloadValue.urlName);

        const dataUrl = allUrlArr.filter(
          (item) => item.random === ranNo.toString()
        );
        if (!checkUrl && !dataUrl.length) {
          allUrlArr.push(
            new TagType({
              ...payloadValue,
              random: ranNo,
            })
          );
        }
      }
      const SMT = await saveMultipleTags(allUrlArr);
      res.status(200).json(SMT);
    } catch (error) {
      console.log(error);
      log("error", "error in create account", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly getSortedTag = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const payloadValue = await this.sortedTagsSchema
        .validateAsync(payload)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          console.log(e);
          if (isError(e)) {
            res.status(422).json(e);
          } else {
            res.status(422).json({ message: e.message });
          }
        });
      if (!payloadValue) {
        return;
      }
      const data = {
        size: payloadValue.size,
        color: payloadValue.color,
        batchNo: payloadValue.batchNo,
        type: payloadValue.type,
        isCustomTag: payloadValue.isCustomTag,
      };

      const tag = await getSortedTags(omitBy(data, isUndefined));
      res.status(200).json({ tags: tag, tagsCount: tag.length });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in getting Sorted Tag", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly getTagsByPagination = async (
    req: Request,
    res: Response
  ) => {
    try {
      const { page } = req.query;
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      const tags = await getTags(parseInt(page), 100);

      const tagsCount = await getTagsCount();

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      //@ts-ignore
      res.status(200).json({ tags, tagsCount });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in get Tags By Pagination", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly get = async (req: Request, res: Response) => {
    // const getTagFromAccountLink = async () => {
    //   const account = await getPopulatedAccountByAccountName(
    //     req.params.urlName
    //   );
    //   if (!account) {
    //     res.status(403).json({ message: "User Not found" });
    //     return;
    //   }
    //   res.status(200).json({ account });
    // };
    getTagByUrl(req.params.urlName)
      .then(async (result) => {
        let account: Account;
        if (!result) {
          account = await getPopulatedAccountByAccountName(req.params.urlName);
          if (!account) {
            res.status(422).json({ message: "User Not found" });
            return;
          }
          if (account.isArchive) {
            res.status(200).json({ message: "User Not found" });
            return;
          }
        } else {
          if (result.block) {
            res.status(200).json({ message: result.blockMessage });
            return;
          }
        }
        if (!account && !result) {
          res.status(422).json({ message: "User Not found" });
          return;
        }

        if (_get(result, "account.isArchive")) {
          res.status(200).json({ message: "User Not found" });
          return;
        }
        const accountId = _get(result, "account._id") || _get(account, "_id");
        if (accountId) {
          await incrementAccountView(accountId);
        } else {
          if (result) {
            if (
              !_get(result, "account._id") ||
              _get(result, "account._id") === null
            ) {
              // if (!_get(result, "account.user.isPro")) {
              //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
              //   //@ts-ignore
              //   result.account.links = await removeProLinks(result.account);
              // }

              res.status(200).json({
                ...result,
                shouldUpdateRoute: true,
                isConnected: false,
              });
              return;
            }
          }
        }

        if (_get(result, "account.isPrivate") || _get(account, "isPrivate")) {
          const privateAccData = result
            ? {
                firstName: _get(result, "account.firstName"),
                lastName: _get(result, "account.lastName"),
                profileImage: _get(result, "account.profileImage"),
                _id: _get(result, "account._id"),
                isConnected: false,
              }
            : {
                firstName: account.firstName,
                lastName: account.lastName,
                profileImage: _get(account, "profileImage"),
                _id: account._id,
                isConnected: false,
              };

          if (req.authUser) {
            const connect = await getConnectionByAccountAndTargetedAccount({
              account: accountId,
              targetAccount: {
                account: req.authUser.accounts[0].toString(),
              },
            });
            if (connect) {
              if (result) {
                // if (!_get(result, "account.user.isPro")) {
                //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                //   //@ts-ignore
                //   result.account.links = await removeProLinks(result.account);
                // }
                res.status(200).json({
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  //@ts-ignore
                  account: { ...result.account, isConnected: true },
                  shouldUpdateRoute: true,
                  isConnected: true,
                });
                return;
              } else {
                if (!_get(account, "user.isPro")) {
                  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                  //@ts-ignore
                  account.links = await removeProLinks(account);
                }
                res.status(200).json({
                  account: { ...account, isConnected: true },
                  shouldUpdateRoute: false,
                  isConnected: true,
                });
                return;
              }
            } else {
              res.status(200).json(
                result
                  ? {
                      account: privateAccData,
                      shouldUpdateRoute: true,
                      isConnected: false,
                    }
                  : {
                      account: privateAccData,
                      shouldUpdateRoute: false,
                      isConnected: false,
                    }
              );
              return;
            }
          } else {
            res.status(200).json(
              result
                ? {
                    account: privateAccData,
                    shouldUpdateRoute: true,
                    isConnected: false,
                  }
                : {
                    account: privateAccData,
                    shouldUpdateRoute: false,
                    isConnected: false,
                  }
            );
            return;
          }
        }
        if (result) {
          // if (!_get(result, "account.user.isPro")) {
          //   // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //   //@ts-ignore
          //   result.account.links = await removeProLinks(result.account);
          // }
          res.status(200).json({
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            account: { ...result.account, isConnected: true },
            shouldUpdateRoute: true,
            isConnected: true,
          });
          return;
        } else {
          if (!_get(account, "user.isPro")) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            account.links = await removeProLinks(account);
          }
          res.status(200).json({
            account: { ...account, isConnected: true },
            shouldUpdateRoute: false,
            isConnected: true,
          });
          return;
        }
      })
      .catch((error) => {
        console.log(error);
        Sentry.captureException(error);
        log("error", "error in create personal connection", error);
        res.status(500).json({
          message: "Hmm... Something went wrong. Please try again later.",
          error: _get(error, "message"),
        });
      });
  };

  protected readonly linkAccount = async (req: Request, res: Response) => {
    this.linkTagToAccount
      .validateAsync(req.body)
      .then((value) => {
        if (
          !req.authUser.accounts.find(
            (ac) => ac.toString() === req.body.account
          )
        ) {
          throw new Error("Unauthorized request");
        }
        return value;
      })
      .then(() => getTagByUrl(req.params.urlName))
      .then((result) => {
        if (!result) {
          throw new Error("Invalid Tag");
        }
        if (result.account) {
          throw new Error("Tag is already in use.");
        }
        return result;
      })
      .then((result) => {
        result.account = req.body.account;
        result.label = req.body.label;
        return updateTags(result);
      })
      // .then(() => {
      //   return getTagByUrl(req.params.urlName);
      // })
      .then((result) => res.status(200).json(result))
      .catch((error) => {
        console.log(error);
        log("error", "error in create personal connection", error);
        res.status(500).json({
          message: "Hmm... Something went wrong. Please try again later.",
          error: isError(error)
            ? error.toString().replace("Error:", "")
            : error,
        });
      });
  };

  protected readonly updateTagLabel = async (req: Request, res: Response) => {
    this.linkTagToAccount
      .validateAsync(req.body)
      .then((value) => {
        if (
          !req.authUser.accounts.find(
            (ac) => ac.toString() === req.body.account
          )
        ) {
          throw new Error("Unauthorized request");
        }
        return value;
      })
      .then(() => getTagsById(req.params._id))
      .then((result) => {
        if (!result) {
          throw new Error("Invalid Tag");
        }
        if (result.account.toString() !== req.body.account) {
          throw new Error("Invalid Tag");
        }
        return result;
      })
      .then((result) => {
        result.account = req.body.account;
        result.label = req.body.label;
        return updateTags(result);
      })
      .then(() => {
        return getTagsById(req.params._id);
      })
      .then((result) => res.status(200).json(result))
      .catch((error) => {
        console.log(error);
        log("error", "error in create personal connection", error);
        res.status(500).json({
          message: "Hmm... Something went wrong. Please try again later.",
          error: isError(error)
            ? error.toString().replace("Error:", "")
            : error,
        });
      });
  };

  protected readonly blockTag = async (req: Request, res: Response) => {
    try {
      const payload = req.body;

      if (this.linkBlockTag.validate(payload).error) {
        res
          .status(422)
          .json({ message: this.linkBlockTag.validate(payload).error });
        return;
      }

      const payloadValue = this.linkBlockTag.validate(payload).value;

      if (!payloadValue) {
        res.status(422).json({ message: "Please Provide Valid Value" });
        return;
      }

      if (!req.params.urlName) {
        res.status(422).json({ message: "Please Provide Tag Id" });
        return;
      }

      const tag = await getTagNoPopulatedByUrl(req.params.urlName);

      if (
        !_get(req, "authUser.accounts", []).find(
          (ac) => ac.toString() === tag.account.toString()
        )
      ) {
        res.status(403).json({ message: "Unauthorized request." });
        return;
      }

      if (!tag) {
        res.status(422).json({ message: "Please Provide Tag Id" });
        return;
      }

      if (
        payloadValue.block &&
        (!payloadValue.blockMessage || payloadValue.blockMessage === "")
      ) {
        res.status(422).json({ message: "Message is required." });
      }
      const updatableTags = new Tag({
        ...tag,
        ...payloadValue,
      });

      await updateTags(updatableTags);
      const populatedTag = await getTagsById(tag._id);
      res.status(200).json(populatedTag);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in block tag", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: isError(error) ? error.toString().replace("Error:", "") : error,
      });
    }
  };

  protected readonly freeTag = async (req: Request, res: Response) => {
    try {
      const tag = await getTagNoPopulatedByUrl(req.params.urlName);
      if (!tag) {
        res.status(422).json({ message: "Please Provide Tag Id" });
        return;
      }

      if (
        !_get(req, "authUser.accounts", []).find(
          (ac) => ac.toString() === tag.account.toString()
        )
      ) {
        res.status(403).json({ message: "Unauthorized request." });
        return;
      }

      const updatable = new Tag({
        ...tag,
        account: null,
        label: "",
      });

      await updateTags(updatable);
      const populatedTag = getTagsById(req.params._id);
      res.status(200).json(populatedTag);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in free tag", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: isError(error) ? error.toString().replace("Error:", "") : error,
      });
    }
  };

  protected readonly updateTag = async (req: Request, res: Response) => {
    try {
      const authUser = req.authUser;
      const tag = await getTagsById(req.params.tagId);
      if (!tag) {
        res.status(422).json({ message: "Please Provide Tag Id" });
        return;
      }
      const account = await getAccountById(req.params.accId);
      if (!account) {
        res.status(422).json({ message: "Please Provide Tag Id" });
        return;
      }

      if (authUser.accounts.includes?.(account._id)) {
        res.status(403).json({ message: "Unauthorized request." });
        return;
      }

      // const updatable = new Tag({
      //   ...tag,
      //   ...req.body,
      // });

      // await updateTags(updatable);
      // const populatedTag = getTagsById(req.params._id);
      // res.status(200).json(populatedTag);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in update tag", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: isError(error) ? error.toString().replace("Error:", "") : error,
      });
    }
  };

  protected readonly getTagByAccId = async (req: Request, res: Response) => {
    try {
      const accountId = req.params.accId;
      const account = await getAccountById(accountId);
      if (!account) {
        res.status(422).json({ message: "Please Provide accountId" });
        return;
      }

      const tags = await getTagsByAccountIdForAPI(accountId);
      if (!tags) {
        res.status(422).json({ message: "Please Provide TagId" });
        return;
      }

      res.status(200).json(tags);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in getTagByAccId", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: isError(error) ? error.toString().replace("Error:", "") : error,
      });
    }
  };
}
