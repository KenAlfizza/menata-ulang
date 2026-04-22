import { Hono } from "hono";
import auth from "./auth.ts";
import user from "./user.ts";
import story from "./story.ts";
import podcast from "./podcast.ts";

// Router object
const router = new Hono();

// Router endpoints
router.route("/auth", auth);
router.route("/user", user);
router.route("/story", story);
router.route("/podcast", podcast);

export default router;