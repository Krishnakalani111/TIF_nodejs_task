import express from "express";
import { errorHandler } from "../middleware/ErrorHandler.js";

import { addRole, getAllroles } from "../controllers/Role.js";

const RoleRouter = express.Router();
RoleRouter.use(errorHandler);

RoleRouter.post("/", addRole).get("/",getAllroles)

export default RoleRouter;