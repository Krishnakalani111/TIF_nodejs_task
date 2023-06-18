import express from "express";
import { SignIn, SignUp, getMe } from "../controllers/Auth.js";
import { errorHandler } from "../middleware/ErrorHandler.js";
const router = express.Router();
router.use(errorHandler);

router.post("/signup", SignUp);
router.post("/signin", SignIn);
router.get("/me",getMe)

export default router;