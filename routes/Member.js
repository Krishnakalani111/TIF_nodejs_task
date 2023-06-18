import express from "express";
import { errorHandler } from "../middleware/ErrorHandler.js";
import { addMember, deleteMember } from "../controllers/Member.js";

const MemberRouter = express.Router();
MemberRouter.use(errorHandler);

MemberRouter.post("/", addMember);
MemberRouter.delete("/:id", deleteMember)



export default MemberRouter;