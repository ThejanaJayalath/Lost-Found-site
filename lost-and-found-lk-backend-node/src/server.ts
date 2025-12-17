import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import { connectToDatabase } from "./config/db";
import { healthRouter } from "./routes/health.routes";
import { postsRouter } from "./routes/posts.routes";

const app = express();

export default app;

// Configure Helmet to allow Firebase Auth popups by not setting COOP headers
app.use(
  helmet({
    crossOriginOpenerPolicy: false, // Allow Firebase Auth popups
    crossOriginEmbedderPolicy: false, // Allow cross-origin embeds
  }),
);
app.use(
  cors({
    origin: true, // allow all origins for now so frontend can call the API
    credentials: true,
  }),
);
app.use(express.json());
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));

app.use("/api/health", healthRouter);
app.use("/api/posts", postsRouter);

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

if (require.main === module) {
  void start();
}


