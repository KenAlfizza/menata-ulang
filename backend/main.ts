import { Hono } from "hono";
import { cors } from "hono/cors";
import router from "./routes/index.ts";
import { authMiddleware } from "./middleware/auth.ts";

const app = new Hono();

// Cors Middelware
app.use(
    "*", // All Routes
    cors({
    origin: "http://localhost:3000", // Allow your Next.js app
    allowMethods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  })
);

app.get("/hello", authMiddleware,(c) => c.text("Hello World!"));
app.get("/json", (c) => c.json({ ok: true }));

// Routes
app.route("/", router);

export default app;