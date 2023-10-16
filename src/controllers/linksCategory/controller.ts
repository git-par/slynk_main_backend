import { Response } from "express";
import { Request } from "./../../request";
import { log } from "winston";
import Joi, { isError } from "joi";
import {
  deleteLinksCategory,
  getLinksCategoryById,
  saveLinksCategory,
  updateLinksCategory,
  getLinksCategoryByTitle,
  getPopulatedLinksCategories,
  getLinksCategories,
  ILinksCategory,
} from "../../modules/linksCategory";
import { LinkCategory as LinkCategoryType } from "../../modules/linksCategory";
import { getPopulatedLinksCategory } from "../../modules/linksCategory/";
import * as Sentry from "@sentry/node";
import { getLinkById } from "../../modules/links";
import { get as _get } from "lodash";

// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_URL,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

Sentry.configureScope((scope) => scope.setTransactionName("In Links Category"));
export default class Controller {
  private readonly linkCategoryCreateSchema = Joi.object().keys({
    title: Joi.string()
      .required()
      .external(async (value: string) => {
        const linkCategory = await getLinksCategoryByTitle(value);
        if (linkCategory) {
          throw new Error("Link Already Taken.");
        }
        return value;
      }),
  });

  private readonly updateLinkOrderSchema = Joi.object().keys({
    links: Joi.array()
      .required()
      /* eslint-disable @typescript-eslint/no-explicit-any */
      .external(async (value: any) => {
        await Promise.allSettled(
          value.map(async (item) => {
            const link = getLinkById(item);
            if (!link) {
              throw new Error("Link Not Found.");
            }
          })
        );
        return value;
      }),
  });

  private readonly linkCategoryUpdateSchema = Joi.object().keys({
    title: Joi.string()
      .required()
      .external(async (value: string) => {
        const linkCategory = await getLinksCategoryByTitle(value);
        if (linkCategory) {
          throw new Error("Link Already Taken.");
        }
        return value;
      }),
  });

  private readonly updateCategoryIndexSchema = Joi.object().keys({
    category: Joi.array()
      .required()
      /* eslint-disable @typescript-eslint/no-explicit-any */
      .external(async (value: any) => {
        await Promise.allSettled(
          value.map(async (item: ILinksCategory) => {
            const category = getLinksCategoryById(item._id);
            if (!category) {
              throw new Error("Category Not Found.");
            }
          })
        );
        return value;
      }),
  });

  protected readonly create = async (req: Request, res: Response) => {
    try {
      const payload = req.body;
      const payloadValue = await this.linkCategoryCreateSchema
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

      const category = await getLinksCategories();
      payloadValue.index = category.length;
      payloadValue.links = [];
      const linkCategory = await saveLinksCategory(
        new LinkCategoryType(payloadValue)
      );

      res.status(200).send(linkCategory);
    } catch (error) {
      console.log(error);
      log("error", "error in create account", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly update = async (req: Request, res: Response) => {
    try {
      const payload = req.body;

      const _id = req.params._id;

      if (!_id) {
        res.status(422).json({ message: "Invalid Link Category." });
        return;
      }

      const linkCategory = await getLinksCategoryById(_id);
      if (!linkCategory) {
        res.status(422).json({ message: "Invalid Link Category." });
        return;
      }

      if (linkCategory.title === payload.title) {
        res.status(200).json({
          linkCategory,
          message: "Link Category Successfully Updated.",
        });
        return;
      }
      const payloadValue = await this.linkCategoryUpdateSchema
        .validateAsync(payload)
        .then((value) => {
          return value;
        })
        .catch((e) => {
          if (isError(e)) {
            res.status(422).json(e);
          } else {
            res.status(422).json({ message: e.message });
          }
        });

      if (!payloadValue) {
        return;
      }
      const toBeUpdatedLinksCategory = new LinkCategoryType({
        ...linkCategory.toJSON(),
        ...payloadValue,
      });

      await updateLinksCategory(toBeUpdatedLinksCategory);
      const updateLinkCategory = await getPopulatedLinksCategory(_id);
      res.status(200).send(updateLinkCategory);
    } catch (error) {
      log("error", "error in create account", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: JSON.stringify(error),
      });
    }
  };

  protected readonly updateLinkOrder = async (req: Request, res: Response) => {
    try {
      const _id = req.params._id;

      if (!_id) {
        res.status(422).json({ message: "Invalid Link Category." });
        return;
      }

      const linkCategory = await getLinksCategoryById(_id);
      if (!linkCategory) {
        res.status(422).json({ message: "Invalid Link Category." });
        return;
      }
      const payload = req.body;
      const payloadValue = await this.updateLinkOrderSchema
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
      const toBeUpdatedLinksCategory = new LinkCategoryType({
        ...linkCategory.toJSON(),
        ...payloadValue,
      });

      await updateLinksCategory(toBeUpdatedLinksCategory);
      const updateLinkCategory = await getPopulatedLinksCategory(_id);
      res.status(200).send(updateLinkCategory);
    } catch (error) {
      console.log(error);
      log("error", "error in update category link order", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly updateCategoryIndex = async (
    req: Request,
    res: Response
  ) => {
    try {
      const payload = req.body;

      const payloadValue = await this.updateCategoryIndexSchema
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

      const category = await getLinksCategories();

      const updatableCategory = category.map((catItem: ILinksCategory) => {
        const data = payloadValue.category.filter(
          (orderItem: ILinksCategory) => catItem._id === orderItem._id
        );
        console.log(data);
        return {
          ...catItem,
          index: data[0].index + 1,
        };
      });
      await Promise.all(
        updatableCategory.map((item) => {
          updateLinksCategory(
            new LinkCategoryType({
              ...item,
            })
          );
        })
      );
      res
        .status(200)
        /* eslint-disable @typescript-eslint/no-explicit-any */
        .json(updatableCategory.sort((a: any, b: any) => a.index - b.index));
    } catch (error) {
      console.log(error);
      log("error", "error in update category order", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };

  protected readonly get = async (req: Request, res: Response) => {
    try {
      const _id = req.params._id;
      // if (!_id && req.isAdmin) {
      //   const linkCategory = await getPopulatedLinksCategories();
      //   res.status(200).json(linkCategory);
      //   return;
      // }
      if (!_id) {
        const linkCategory = await getPopulatedLinksCategories();
        res.status(200).json(linkCategory);
        return;
      }

      const populatedLinksCategory = await getPopulatedLinksCategory(_id);
      if (!populatedLinksCategory) {
        res.status(422).json({ message: "Invalid Link Category." });
        return;
      }
      res.status(200).json(populatedLinksCategory.toJSON());
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in get populated links category", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
  protected readonly get_not_populated = async (
    req: Request,
    res: Response
  ) => {
    try {
      const _id = req.params._id;
      if (!_id) {
        const linkCategory = await getLinksCategories();
        res.status(200).json(linkCategory);
        return;
      }

      const populatedLinksCategory = await getLinksCategoryById(_id);
      // const populatedlinkscategory = await getPopulatedLinkById(_id)
      if (!populatedLinksCategory) {
        res.status(422).json({ message: "Invalid Link Category." });
        return;
      }
      res.status(200).json(populatedLinksCategory.toJSON());
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in get not populated links category", error);
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
        res.status(422).json({ message: "Invalid Link Category." });
        return;
      }
      const linksCategory = await getLinksCategoryById(_id);
      if (!linksCategory) {
        res.status(422).json({ message: "Invalid Link Category." });
        return;
      }
      await deleteLinksCategory(_id);
      res.status(200).json({ message: "Link Category Successfully Deleted." });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
      log("error", "error in create account", error);
      res.status(500).json({
        message: "Hmm... Something went wrong. Please try again later.",
        error: _get(error, "message"),
      });
    }
  };
}
