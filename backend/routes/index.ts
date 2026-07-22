import { Hono } from "hono";
import auth from "./auth.ts";
import user from "./user.ts";
import story from "./story.ts";
import podcast from "./podcast.ts";
import reflection from "./reflection.ts";
import feedback from "./feedback.ts";
import author from "./author.ts";
import researcher from "./researcher.ts";

// Router object
const router = new Hono();

// Router endpoints
router.route("/auth", auth);
router.route("/user", user);
router.route("/story", story);
router.route("/podcast", podcast);
router.route("/reflection", reflection);
router.route("/feedback", feedback);
router.route("/author", author);
router.route("/feedback", feedback)
router.route("/researcher", researcher);

export default router;