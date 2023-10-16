import { connectDb } from "../../dbConnection";
import {
  getRandomNumberTags,
  QRColorType,
  QRTypeCode,
  saveTags,
  Tag as TagType,
} from "../../modules/tags";
import * as fs from "fs";
import Joi from "joi";

import * as dotenv from "dotenv";
dotenv.config();

const ran = async () => {
  await connectDb()
    .then(async () => {
      const result = await getRandomNumberTags();
      let start;

      if (result[0] === undefined) {
        start = 10001;
      } else {
        start = 10001 + result[0].arr.length;
      }

      let i: number;
      const appLink = "slynk.app/";
      const linkArr = [];
      const lengthRandom = 1000;
      const end = start + lengthRandom;
      const size = "";
      const color = "MWT";
      const batchNo = "1";
      const type = "PC";
      const payload = {
        size,
        color,
        batchNo,
        type,
      };

      if (tagsCreateSchema().validate(payload).error) {
        // res.status(422).json(this.loginSchema.validate(payload).error);
        process.exit();
      }

      for (i = start; i < end; i++) {
        const urlName = appLink + size + color + batchNo + type + i;
        const payloadValue = {
          size,
          color,
          batchNo,
          type,
          random: i,
          urlName,
          accounts: null,
          block: false,
        };
        linkArr.push(payloadValue);
      }

      const success = [];
      const error = [];

      for await (const value of linkArr) {
        await saveTags(new TagType(value))
          .then((result) => success.push(result))
          .catch((err) => error.push(err));
      }
      // await Promise.all(
      //   linkArr.map(async (value) => {
      //     await saveTags(new TagType(value))
      //       .then((result) => {

      //         success.push(result)
      //       })
      //       .catch((err) => error.push(err));
      //   })
      // );
      fs.writeFileSync(
        "./exports/getRandomNumberTagsSuccess.json",
        JSON.stringify(success)
      );
      fs.writeFileSync(
        "./exports/getRandomNumberTagsError.json",
        JSON.stringify(error)
      );
    })
    .catch((error) => {
      console.log(error);
    });
};

const tagsCreateSchema = () =>
  Joi.object().keys({
    size: Joi.string().optional().allow(""),
    color: Joi.string()
      .required()
      .valid(...Object.values(QRColorType)),
    batchNo: Joi.string().required(),
    type: Joi.string()
      .required()
      .valid(...Object.values(QRTypeCode)),
    random: Joi.string().optional(),
  });

ran().then(() => {
  process.exit();
});
