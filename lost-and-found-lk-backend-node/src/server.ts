import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import { connectToDatabase } from "./config/db";
import { healthRouter } from "./routes/health.routes";

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || env.cors.allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

app.use("/api/health", healthRouter);

// TODO: mount actual routers here once implemented
// app.use("/api/auth", authRouter);
// app.use("/api/posts", postRouter);
// app.use("/api/interactions", interactionRouter);
// app.use("/api/admin", adminRouter);

async function start() {
  await connectToDatabase();

  app.listen(env.port, () => {
    // eslint-disable-next-line no-console
    console.log(
      `Node backend listening on port ${env.port} in ${env.nodeEnv} mode`,
    );
  });
}

void start();


