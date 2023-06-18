import express from "express";
import { errorHandler } from "../middleware/ErrorHandler.js";
import {
  creatingCommunity,
  findMyCommunities,
  getAll,
  getAllmembersOfACommunity,
  getMyCommunities,
} from "../controllers/Community.js";
const communityRouter = express.Router();
communityRouter.use(errorHandler);

communityRouter.post("/", creatingCommunity).get("/", getAll);
communityRouter.get("/:id/members", getAllmembersOfACommunity);
communityRouter.get("/me/owner", getMyCommunities);
communityRouter.get("/me/member", findMyCommunities);

export default communityRouter;
