import {Router} from "express";
import {users} from "../controllers/userController.js";
import {requireAuth,requireAdmin} from "../middleware/auth.js";
const r=Router();r.get("/",requireAuth,requireAdmin,users);export default r;
