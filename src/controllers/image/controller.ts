import { Response } from "express";
import { Request } from "./../../request";

import {
  createAndUploadImage,
  createAndUploadLogo,
  createAndUploadFile,
  createAndUploadFeedBack,
} from "../../modules/image";
import { log } from "winston";
import * as Sentry from "@sentry/node";
import { get as _get } from "lodash";

// Importing @sentry/tracing patches the global hub for tracing to work.
// import * as Tracing from "@sentry/tracing";

Sentry.init({
  dsn: process.env.SENTRY_URL,

  // We recommend adjusting this value in production, or using tracesSampler
  // for finer control
  tracesSampleRate: 1.0,
});

Sentry.configureScope((scope) =>
  scope.setTransactionName("In Image / Logo uploading")
);
export default class Controller {
  protected readonly create = async (req: Request, res: Response) => {
    /*
    {
      fieldname: 'file',        String - name of the field used in the form
      originalname,             String - original filename of the uploaded image
      encoding,                 String - encoding of the image (e.g. "7bit")
      mimetype,                 String - MIME type of the file (e.g. "image/jpeg")
      buffer,                   Buffer - buffer containing binary data
      size,                     Number - size of buffer in bytes
      filename,                 String - file name
      filepath                  String - file path
    }
  */
    try {
      const file = req.files[0];
      const image = await createAndUploadImage(
        file,
        req.body.title,
        req.body.description
      );
      res.status(200).send(image.toJSON());
    } catch (err) {
      console.log(err);
      Sentry.captureException(err);
      log("error", "error in upload image", err);

      res.status(500).json({ error: _get(err, "message") });
    }
  };
  protected readonly logo_create = async (req: Request, res: Response) => {
    /*
    {
      fieldname: 'file',        String - name of the field used in the form
      originalname,             String - original filename of the uploaded image
      encoding,                 String - encoding of the image (e.g. "7bit")
      mimetype,                 String - MIME type of the file (e.g. "image/jpeg")
      buffer,                   Buffer - buffer containing binary data
      size,                     Number - size of buffer in bytes
      filename,                 String - file name
      filepath                  String - file path
    }
  */
    try {
      const file = req.files[0];
      const image = await createAndUploadLogo(
        file,
        req.body.title,
        req.body.description
      );
      res.status(200).send(image.toJSON());
    } catch (err) {
      console.log(err);
      Sentry.captureException(err);
      log("error", "error in upload image", err);

      res.status(500).json({ error: _get(err, "message") });
    }
  };
  protected readonly file_create = async (req: Request, res: Response) => {
    /*
    {
      fieldname: 'file',        String - name of the field used in the form
      originalname,             String - original filename of the uploaded image
      encoding,                 String - encoding of the image (e.g. "7bit")
      mimetype,                 String - MIME type of the file (e.g. "image/jpeg")
      buffer,                   Buffer - buffer containing binary data
      size,                     Number - size of buffer in bytes
      filename,                 String - file name
      filepath                  String - file path
    }
  */
    try {
      const file = req.files[0];
      const image = await createAndUploadFile(
        file,
        req.body.title,
        req.body.description
      );
      res.status(200).send(image.toJSON());
    } catch (err) {
      console.log(err);
      Sentry.captureException(err);
      log("error", "error in upload file", err);

      res.status(500).json({ error: _get(err, "message") });
    }
  };

  protected readonly feedback_create = async (req: Request, res: Response) => {
    /*
    {
      fieldname: 'file',        String - name of the field used in the form
      originalname,             String - original filename of the uploaded image
      encoding,                 String - encoding of the image (e.g. "7bit")
      mimetype,                 String - MIME type of the file (e.g. "image/jpeg")
      buffer,                   Buffer - buffer containing binary data
      size,                     Number - size of buffer in bytes
      filename,                 String - file name
      filepath                  String - file path
    }
  */
    try {
      const file = req.files[0];
      const image = await createAndUploadFeedBack(
        file,
        req.body.title,
        req.body.description
      );
      res.status(200).send(image.toJSON());
    } catch (err) {
      console.log(err);
      Sentry.captureException(err);
      log("error", "error in upload file", err);

      res.status(500).json({ error: _get(err, "message") });
    }
  };
}
