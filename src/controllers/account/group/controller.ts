import { Response } from "express";
import Joi from "joi";
import { log } from "winston";
import { get as _get } from "lodash";
import { MAX_GROUP_ACCOUNT } from "../../../constant";
import {
  deleteGroupById,
  getConnectByIds,
  getGroupById,
  getGroupByOwner,
  getPopulatedGroupById,
  Group,
  saveGroup,
  updateGroup,
} from "../../../modules/group";
// import {
//   getPersonalConnectionById,
//   getPersonalConnectionsByAccountIds,
// } from "../../../modules/personalConnection";
import { Request } from "../../../request";
import { getConnectById } from "../../../modules/connect";

import * as Sentry from "@sentry/node";

// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_URL,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

Sentry.configureScope((scope) => scope.setTransactionName("In Group"));
export default class Controller {
  private readonly groupValidationSchema = Joi.object()
    .keys({
      title: Joi.string().required(),
      connects: Joi.array()
        .optional()
        .external(async (v: string[]) => {
          if (!v) {
            throw new Error("Please provide valid connects.");
          }
          if (v.length > 100) {
            throw new Error(
              "You can add max 100 connects each(personal connection and account)."
            );
          }
          const connect = await getConnectByIds(v);
          if (v.length != connect.length) {
            throw new Error("Invalid connects.");
          }
          return v;
        }),
    })
    .unknown(true);

  private readonly groupEntrySchema = Joi.object()
    .keys({
      connect: Joi.string().external(async (v) => {
        if (!v) {
          throw new Error("Please provide valid account.");
        }
        const account = await getConnectById(v);
        if (!account) {
          throw new Error("Please provide valid account.");
        }
        return v;
      }),
    })
    .unknown(true);

  protected readonly get = async (req: Request, res: Response) => {
    const _id = req.params._id;
    const accountId = req.currentAccountId;
    if (_id) {
      const group = await getPopulatedGroupById(_id);
      if (!group) {
        res.status(422).json({ message: "Invalid group." });
        return;
      }

      const newGroup = group.connects.filter((item) => {
        if (!_get(item, "targetAccount.account.isArchive") ) {
          return item;
        }
      });

      group.connects = newGroup;

      res.status(200).json(newGroup);
      return;
    }
    const groups = await getGroupByOwner(accountId);
    const newGroups = groups.map((item) => {
      const newGroup = item.connects.filter(
        (item2) => !_get(item2, "targetAccount.account.isArchive") 
      );
      return {
        ...item,
        connects: newGroup,
      };
    });
    res.status(200).json(newGroups);
  };

  protected readonly create = async (req: Request, res: Response) => {
    const accountId = req.currentAccountId;
    this.groupValidationSchema
      .validateAsync(req.body)
      .then((value) =>
        saveGroup(
          new Group({
            title: value.title,
            connects: value.connects,
            // personalConnection: value.personalConnection,
            owner: accountId,
          })
        )
      )
      .then((result: Group) => res.status(200).json(result))
      .catch((error) => {
        console.log(error);
        Sentry.captureException(error);
        log("error", "error in create group", error);
        console.log(error);
        res.status(500).json({
          message: "Hmm... Something went wrong. Please try again later.",
          error: _get(error, "message"),
        });
      });
  };

  protected readonly update = async (req: Request, res: Response) => {
    const accountId = req.currentAccountId;
    const _id = req.params._id;
    const payload = req.body;
    this.groupValidationSchema
      .validateAsync(req.body)
      .then(() => {
        if (!_id) {
          throw new Error("Group not found.");
        }
        return getGroupById(_id);
      })
      .then((group: Group) => {
        if (!group) {
          throw new Error("Group not found.");
        }
        if (group.owner.toString() !== accountId.toString()) {
          throw new Error("Unauthorized request.");
        }
        group.title = payload.title;
        group.connects = payload.connects;
        // group.personalConnection = payload.personalConnection;
        return group;
      })
      .then((group: Group) => updateGroup(new Group(group.toJSON())))
      .then(async (result: Group) => {
        const group = await getPopulatedGroupById(result._id);
        res.status(200).json(group);
      })
      .catch((error) => {
        console.log(error);
        Sentry.captureException(error);
        log("error", "error in update group", error);
        res.status(500).json({
          message: "Hmm... Something went wrong. Please try again later.",
          error: _get(error, "message"),
        });
      });
  };

  protected readonly delete = async (req: Request, res: Response) => {
    const _id = req.params._id;
    const accountId = req.currentAccountId;

    if (!_id) {
      res.status(422).json({ message: "Invalid group." });
      return;
    }
    const group = await getGroupById(_id);
    if (!group) {
      res.status(422).json({ message: "Invalid group." });
      return;
    }
    if (group.owner.toString() !== accountId.toString()) {
      res.status(403).json({ message: "Unauthorized request." });
      return;
    }
    await deleteGroupById(_id);
    res.status(200).json({ message: "Group Successfully removed." });
  };

  protected readonly addToGroup = async (req: Request, res: Response) => {
    const _id = req.params._id;
    const accountId = req.currentAccountId;
    const payload = req.body;
    let targetedGroup: Group;
    getGroupById(_id)
      .then((result: Group) => {
        if (!result) {
          throw new Error("Group not found.");
        }
        if (result.owner.toString() !== accountId.toString()) {
          throw new Error("Unauthorized request.");
        }
        targetedGroup = result;
      })
      .then(() => this.groupEntrySchema.validateAsync(payload))
      .then((result) => {
        if (_get(targetedGroup, "connects", []).length >= MAX_GROUP_ACCOUNT) {
          throw new Error(
            "Maximum account reached try with create new account."
          );
        }

        if (
          _get(targetedGroup, "connects", []).find(
            (acc) => acc.toString() === result.connect.toString()
          )
        ) {
          throw new Error("Account is Already available in group.");
        }

        targetedGroup.connects.push(result.connect);

        return targetedGroup;
      })
      .then((group: Group) => updateGroup(group))
      .then((result: Group) => res.status(200).json(result))
      .catch((error) => {
        console.log(error);
        Sentry.captureException(error);
        log("error", "error in add entry in group", error);
        res.status(500).json({
          message: "Hmm... Something went wrong. Please try again later.",
          error: _get(error, "message"),
        });
      });
  };

  protected readonly removeFromGroup = async (req: Request, res: Response) => {
    const _id = req.params._id;
    const accountId = req.currentAccountId;
    const payload = req.body;
    let targetedGroup: Group;
    getGroupById(_id)
      .then((result: Group) => {
        if (!result) {
          throw new Error("Group not found.");
        }
        if (result.owner.toString() !== accountId.toString()) {
          throw new Error("Unauthorized request.");
        }
        targetedGroup = result;
      })
      .then(() => this.groupEntrySchema.validateAsync(payload))
      .then((result) => {
        if (result.type === "ACCOUNT") {
          targetedGroup.connects = targetedGroup.connects.filter(
            (acc) => result.connect.toString() !== acc.toString()
          );
        }
        return targetedGroup;
      })
      .then((group: Group) => updateGroup(group))
      .then((result: Group) => res.status(200).json(result))
      .catch((error) => {
        console.log(error);
        Sentry.captureException(error);
        log("error", "error in add entry in group", error);

        res.status(500).json({
          message: "Hmm... Something went wrong. Please try again later.",
          error: _get(error, "message"),
        });
      });
  };
}
