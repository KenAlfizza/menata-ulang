import { Hono } from "hono";

const app = new Hono();

app.get("/", (c) => c.text("Hello World!"));
app.get("/json", (c) => c.json({ ok: true }));

export default app;