import { Hono } from "hono";
import auth from "./auth.ts";

// Router object
const router = new Hono();

// Router endpoints
router.route("/auth", auth);

export default router;