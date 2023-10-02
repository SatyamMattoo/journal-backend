import mongoose from "mongoose";

//Connecting to database
export const connectDB = () => {
  console.log(process.env.NODE_DB_URI)
  mongoose
    .connect(process.env.NODE_DB_URI, {
      useNewURLParser: true,
      dbName: "HPU",
    })
    .then((data) =>
      console.log(`Connected to database on ${data.connection.host}`)
    )
};
