import mongoose from "mongoose";

export const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      dbName: "HOSPITAL_MANAGEMENT",
    })
    .then(() => console.log("MongoDb Connected!!"))
    .catch((err) => console.log(`Error while connecting Mongodb: ${err}`));
};
