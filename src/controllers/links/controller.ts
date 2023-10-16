import { Response } from "express";
import { Request } from "./../../request";

import {
  deleteLinkById,
  getLinkById,
  getLinkByTitle,
  getLinks,
  Links,
  saveLink,
  updateLink,
} from "../../modules/links";
import Joi from "joi";
import {
  getLinksCategoryById,
  LinkCategory,
  updateLinksCategory,
} from "../../modules/linksCategory";
import { LinkCategory as LinkCategoryType } from "../../modules/linksCategory";
import { log } from "winston";
import { getLinkLength } from "../../modules/links/getLinkLength";
import * as Sentry from "@sentry/node";
import { get as _get, uniq as _uniq, uniqBy as _uniqBy } from "lodash";

// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_URL,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

Sentry.configureScope((scope) => scope.setTransactionName("In Links"));
export default class Controller {
  private readonly linkSchema = Joi.object().keys({
    title: Joi.string().required(),
    logo: Joi.string().required(),
    isPro: Joi.boolean().required(),
    isDeactive: Joi.boolean().optional().default(false),
    prefix: Joi.string().optional().allow(""),
    androidPrefix: Joi.string().optional().allow(""),
    iosPrefix: Joi.string().optional().allow(""),
    suffix: Joi.string().optional().allow(""),
    placeholder: Joi.string().optional().allow(""),
    extraLabel: Joi.boolean().optional().default(false),
    extraImage: Joi.boolean().optional().default(false),
    extraPlaceholder: Joi.string().optional().allow(""),
    type: Joi.string().optional().allow(""),
    key: Joi.string().optional().allow(""),
    category: Joi.array()
      .required()
      .external(async (value: string) => {
        const linkCategory = await getLinksCategoryById(value);
        if (!linkCategory) {
          throw new Error("Invalid category.");
        }
        return value;
      }),
    maxLinks: Joi.object()
      .keys({
        forFreeUser: Joi.number().required(),
        forPaidUser: Joi.number().required(),
      })
      .required(),
    skippedWords: Joi.array().optional(),
  });

  private readonly deactivateSchema = Joi.object().keys({
    isDeactive: Joi.boolean().required(),
  });

  private readonly linkLengthUpdateSchema = Joi.object().keys({
    length: Joi.number().required(),
  });

  protected readonly get = async (req: Request, res: Response) => {
    const _id = req.params._id;
    if (_id) {
      const link = await getLinkById(_id);
      if (!link) {
        res.status(422).json({ message: "Invalid link." });
        return;
      }
      res.status(200).json(link);
      return;
    }
    const links = await getLinks();
    res.status(200).json(links);
  };

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      await this.linkSchema.validateAsync(payload);
      const linkWithTitle = await getLinkByTitle(payload.title);
      if (linkWithTitle) {
        res
          .status(422)
          .json({ message: "Link with this title is already available" })
          .end();
        return;
      }
      const length = await getLinkLength();
      const link = new Links({
        ...payload,
        length: length,
        category: _uniqBy([...payload.category, process.env.ALLCATID], (id) =>
          id.toString()
        ),
      });
      const newLink = await saveLink(link);

      /////// Add New_Link To All Category ///////
      const allCategory = await getLinksCategoryById(process.env.ALLCATID);

      await updateLinksCategory(
        new LinkCategoryType({
          ...allCategory.toJSON(),
          links: _uniqBy([newLink._id.toString(), ...allCategory.links], (id) =>
            id.toString()
          ),
        })
      );

      await Promise.all(
        link.category.map((l: string) => {
          return getLinksCategoryById(l.toString()).then((category) => {
            return updateLinksCategory(
              new LinkCategory({
                ...category.toJSON(),
                links: _uniqBy([...category.links, link._id], (id) =>
                  id.toString()
                ),
              })
            );
          });
        })
      );

      res.status(200).json(link);
    } catch (error) {
      console.log(error);
      log("error", "error in create link", error);
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
        res.status(422).json({ message: "Invalid Link." });
        return;
      }
      let link = await getLinkById(_id);
      if (!link) {
        res.status(422).json({ message: "Invalid Link Category." });
        return;
      }

      const category = await getLinksCategoryById(process.env.ALLCATID);

      const payload = req.body;
      payload.category = _uniq([...payload.category, category._id.toString()]);

      await this.linkSchema.validateAsync(payload);
      const linkWithTitle = await getLinkByTitle(payload.title);
      if (linkWithTitle && linkWithTitle._id.toString() !== _id) {
        res
          .status(422)
          .json({ message: "Link with this title is already available" })
          .end();
        return;
      }
      const oldCategory: string[] = link.category.map((cat) => cat.toString());
      const newCategory: string[] = (payload.category || []).map((cat) =>
        cat.toString()
      );

      const removableCategory = oldCategory.filter(
        (cat) => !newCategory.includes(cat)
      );

      const newAddableCategory = newCategory.filter(
        (cat) => !oldCategory.includes(cat)
      );

      link = new Links({ ...link.toJSON(), ...payload });
      await updateLink(link);

      await Promise.all([
        ...removableCategory.map((cat) =>
          getLinksCategoryById(cat).then((cat) =>
            updateLinksCategory(
              new LinkCategory({
                ...cat.toJSON(),
                links: cat.links.filter(
                  (oldLink) => link._id.toString() !== oldLink.toString()
                ),
              })
            )
          )
        ),
        ...newAddableCategory.map((cat) =>
          getLinksCategoryById(cat).then((cat) =>
            updateLinksCategory(
              new LinkCategory({
                ...cat.toJSON(),
                links: _uniqBy([...cat.links, link._id], (id) => id.toString()),
              })
            )
          )
        ),
      ]);

      res.status(200).json(link);
    } catch (error) {
      console.log(error);
      log("error", "error in create link", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly deactivate = async (req: Request, res: Response) => {
    try {
      const _id = req.params._id;
      if (!_id) {
        res.status(422).json({ message: "Invalid Link." });
        return;
      }
      const link = await getLinkById(_id);
      if (!link) {
        res.status(422).json({ message: "Invalid Link Category." });
        return;
      }

      if (this.deactivateSchema.validate(req.body).error) {
        res.status(422).json(this.deactivateSchema.validate(req.body).error);
        return;
      }
      const updatableLink = new Links({
        ...link,
        isDeactive: req.body.isDeactive,
      });

      await updateLink(updatableLink);

      res.status(200).json(updatableLink);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in create link", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly delete = async (req: Request, res: Response) => {
    try {
      const _id = req.params._id;
      if (!_id) {
        res.status(422).json({ message: "Invalid Link." });
        return;
      }
      const link = await getLinkById(_id);
      if (!link) {
        res.status(422).json({ message: "Invalid link." });
        return;
      }
      await deleteLinkById(_id);
      res.status(200).json({ message: "Link is deleted. " });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in create link", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly updateLength = async (req: Request, res: Response) => {
    try {
      const payload = req.body;

      if (this.linkLengthUpdateSchema.validate(payload).error) {
        res
          .status(422)
          .json(this.linkLengthUpdateSchema.validate(payload).error);
        return;
      }

      const payloadValue = this.linkLengthUpdateSchema.validate(payload).value;

      const links = await getLinks();

      await Promise.all(
        links.map((l: Links) => {
          return updateLink(
            new Links({
              ...l,
              length: payloadValue.length,
            })
          );
        })
      );

      res.status(200).json({ message: "Length successfully Updated." });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in update links length", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
