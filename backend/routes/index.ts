import { Hono } from "hono";
import auth from "./auth.ts";
import user from "./user.ts";

// Router object
const router = new Hono();

// Router endpoints
router.route("/auth", auth);
router.route("/user", user);

export default router;