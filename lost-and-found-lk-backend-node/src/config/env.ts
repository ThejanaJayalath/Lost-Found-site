import dotenv from "dotenv";

dotenv.config();

export const env = {
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? process.env.SERVER_PORT ?? 8082),
  mongoUri:
    process.env.MONGODB_URI ??
    process.env.SPRING_DATA_MONGODB_URI ??
    "mongodb+srv://todoListApp:sinhalanews@cluster0.gdcsnzk.mongodb.net/lost_and_found?retryWrites=true&w=majority&tls=true",
  jwt: {
    secret:
      process.env.JWT_SECRET ??
      "5367566B59703373367639792F423F4528482B4D6251655468576D5A71347437",
    accessTtl: process.env.JWT_ACCESS_TTL ?? "15m",
    refreshTtl: process.env.JWT_REFRESH_TTL ?? "7d",
  },
  cors: {
    allowedOrigins:
      (process.env.APP_CORS_ALLOWEDORIGINS ??
        "http://localhost:5173,https://lost-found-site.vercel.app,https://trackback.website,https://www.trackback.website")
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean),
  },
} as const;


