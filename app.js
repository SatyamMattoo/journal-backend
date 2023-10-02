import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { config } from "dotenv";
import { error } from "./middlewares/errorHandler.js";
import userRouter from "./routes/users.js";
import articleRouter from "./routes/articles.js";
import volumeRouter from "./routes/volumes.js";
import announcementRouter from "./routes/announcements.js";
import { rateLimit } from "express-rate-limit";
import helmet from "helmet";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

export const app = express();

const corsOptions = {
  origin: [process.env.FRONTEND_URL],
  methods: ["GET","HEAD","PUT","PATCH","POST","DELETE"],
  credentials: true,
};

app.use(cors(corsOptions));

//specify path to env variables
config({ path: "./configs/config.env" });

//Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());

// const limiter = rateLimit({
//   windowMs: process.env.LIMIT_TIME,
//   max: process.env.LIMIT_AMT,
// });

// //Limits no of api calls in a time period
// app.use("/api", limiter);

// Apply security headers
// app.use(helmet());

// Enable specific headers as needed
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: ["'self'"],
//       scriptSrc: ["'self'", "trusted-cdn.com"],
//       // Add more directives as needed
//     },
//   })
// );

// app.use((req, res, next) => {
//   res.header("X-Frame-Options", "SAMEORIGIN");
//   next();
// });

app.use("/api/v1/users", userRouter);
app.use("/api/v1/articles", articleRouter);
app.use("/api/v1/volumes", volumeRouter);
app.use("/api/v1/announcements", announcementRouter);

//Error Middleware
app.use(error);

app.get("*", (req, res) => {
  res.send("Working")
});
