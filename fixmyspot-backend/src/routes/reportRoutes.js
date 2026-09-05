import {Router} from "express";
import {list,get,create,confirm,status,stats} from "../controllers/reportController.js";
import {requireAuth,requireAdmin} from "../middleware/auth.js";
import {upload} from "../middleware/upload.js";
const r=Router();r.get("/",requireAuth,list);r.get("/stats",requireAuth,requireAdmin,stats);r.post("/",requireAuth,upload.single("image"),create);r.get("/:id",requireAuth,get);r.post("/:id/confirm",requireAuth,confirm);r.patch("/:id/status",requireAuth,requireAdmin,status);export default r;
