import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import { error } from "./middlewares/errorHandler.js";
import userRouter from "./routes/users.js";
import articleRouter from "./routes/articles.js";
import volumeRouter from "./routes/volumes.js";
import announcementRouter from "./routes/announcements.js";

export const app = express();

//specify path to env variables
config({ path: "./configs/config.env" });

//Middlewares
const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  credentials: true,
};
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/articles", articleRouter);
app.use("/api/v1/volumes", volumeRouter);
app.use("/api/v1/announcements", announcementRouter);

app.get("/", (req, res) => {
  res.send("working");
});

//Error Middleware
app.use(error);
