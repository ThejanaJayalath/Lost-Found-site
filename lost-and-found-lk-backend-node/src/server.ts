import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import { env } from "./config/env";
import { connectToDatabase } from "./config/db";
import { healthRouter } from "./routes/health.routes";
import { postsRouter } from "./routes/posts.routes";
import { usersRouter } from "./routes/users.routes";
import { interactionsRouter } from "./routes/interactions.routes";

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

// Debug Middleware: Log all requests
app.use((req, res, next) => {
  console.log(`Incoming request: ${req.method} ${req.url}`);
  next();
});

// Middleware to ensure database connection
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error("Database connection failed in middleware:", err);
    res.status(500).json({
      message: "Database connection error",
      error: env.nodeEnv === "development" ? (err as Error).message : undefined,
    });
  }
});

app.use("/api/health", healthRouter);
app.use("/api/posts", postsRouter);
app.use("/api/users", usersRouter);
app.use("/api/interactions", interactionsRouter);

// 404 Handler to debug route mismatch
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({
    message: "Route not found",
    path: req.url,
    method: req.method,
    availableRoutes: ["/api/health", "/api/posts", "/api/users", "/api/interactions"]
  });
});

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


