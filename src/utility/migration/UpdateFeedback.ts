import { connectDb } from "../../dbConnection";

import * as fs from "fs";

import * as dotenv from "dotenv";
import { FeedBack, getFeedback, updateFeedback } from "../../modules/feedback";
dotenv.config();

const ran = async () => {
  await connectDb()
    .then(async () => {
      const feedback = await getFeedback();
      const success = [];
      const error = [];
      // console.log(feedback);
      
      for await (const value of feedback) {
        console.log(value._id);
        
        await updateFeedback(
          new FeedBack({
            ...value,
            isCompleted: false,
            isDeleted: false,
            isArchived: false,
          })
        )
          .then((result) => {
            success.push(result);
            // console.log(result);
          })
          .catch((err) => {
            error.push(err);
            console.log(err);
          });
      }

      fs.writeFileSync(
        "./exports/feedbackUtilitySuccess.json",
        JSON.stringify(success)
      );

      fs.writeFileSync(
        "./exports/feedbackUtilityError.json",
        JSON.stringify(error)
      );
    })
    .catch((error) => {
      console.log(error);
    });
};

ran().then(() => {
  process.exit();
});
