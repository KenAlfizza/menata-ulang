import { Hono } from "hono";
import router from "./routes/index.ts";
import { authMiddleware } from "./middleware/auth.ts";

const app = new Hono();

app.get("/hello", authMiddleware,(c) => c.text("Hello World!"));
app.get("/json", (c) => c.json({ ok: true }));

// Routes
app.route("/", router);

export default app;