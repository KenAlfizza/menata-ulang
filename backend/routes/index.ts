import { Hono } from "hono";
import auth from "./auth.ts";
import user from "./user.ts";
import reflection from "./reflection.ts";
import feedback from "./feedback.ts";
import author from "./author.ts";
import host from "./host.ts"
import researcher from "./researcher.ts";
import files from "./files.ts";
import editor from "./editor.ts";
import explore from "./explore.ts";

// Router object
const router = new Hono();

// Router endpoints
router.route("/auth", auth);
router.route("/user", user);
router.route("/reflection", reflection);
router.route("/feedback", feedback);
router.route("/author", author);
router.route("/host", host);
router.route("/researcher", researcher);
router.route("/files", files);
router.route("/editor", editor);
router.route("/explore", explore);

export default router;