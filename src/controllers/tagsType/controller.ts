import { Response } from "express";
import { get as _get } from "lodash";
import { Request } from "../../request";
import Joi from "joi";
import { log } from "winston";
import {
  getTagsTypeById,
  QRColorType,
  QRTypeCode,
  saveTagsType,
  TagType,
} from "../../modules/tagsType";
import { getTagsByDetails } from "../../modules/tags/getTagsByDetails";
import { Tag, updateTags } from "../../modules/tags";
import * as Sentry from "@sentry/node";

// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_URL,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

Sentry.configureScope((scope) => scope.setTransactionName("In Tags Type"));

export default class Controller {
  protected readonly tagsTypeCreateSchema = Joi.object().keys({
    size: Joi.string().optional(),
    color: Joi.string()
      .required()
      .valid(...Object.values(QRColorType)),
    batchNo: Joi.string().required(),
    type: Joi.string()
      .required()
      .valid(...Object.values(QRTypeCode)),
    tagImage: Joi.string().required(),
  });
  protected readonly tagsTypeUpdateSchema = Joi.object().keys({
    size: Joi.string().optional(),
    color: Joi.string()
      .optional()
      .valid(...Object.values(QRColorType)),
    batchNo: Joi.string().required(),
    type: Joi.string()
      .optional()
      .valid(...Object.values(QRTypeCode)),
    tagImage: Joi.string().optional(),
  });

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      if (this.tagsTypeCreateSchema.validate(payload).error) {
        res
          .status(422)
          .json({ error: this.tagsTypeCreateSchema.validate(payload).error });
        return;
      }

      const payloadValue = this.tagsTypeCreateSchema.validate(payload).value;
      const newTagType = new TagType({
        ...payloadValue,
      });

      await saveTagsType(newTagType);

      const oldTag = await getTagsByDetails(newTagType);

      await Promise.all(
        oldTag.map((tag: Tag) => {
          return updateTags(
            new Tag({
              ...tag.toJSON(),
              tagImage: newTagType.tagImage,
            })
          );
        })
      );
      res.status(200).json(newTagType);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in create tag type", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly update = async (req: Request, res: Response) => {
    try {
      const _id = req.params._id;
      if (!_id) {
        res.status(422).json({ message: "Invalid Tag Type." });
        return;
      }
      const tagType = await getTagsTypeById(_id);
      if (!tagType) {
        res.status(422).json({ message: "Invalid Tag Type." });
        return;
      }
      const payload = req.body;
      if (this.tagsTypeUpdateSchema.validate(payload).error) {
        res
          .status(422)
          .json({ error: this.tagsTypeUpdateSchema.validate(payload).error });
        return;
      }

      const payloadValue = this.tagsTypeUpdateSchema.validate(payload).value;
      const updatableTagType = new TagType({
        ...tagType.toJSON(),
        ...payloadValue,
      });

      const oldTag = await getTagsByDetails(updatableTagType);

      await Promise.all(
        oldTag.map((tag: Tag) => {
          return updateTags(
            new Tag({
              ...tag.toJSON(),
              tagImage: updatableTagType.tagImage,
            })
          );
        })
      );
      res.status(200).json(updatableTagType);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in create tag type", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
