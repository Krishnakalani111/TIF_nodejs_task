import dotenv from "dotenv";
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import AuthRouter from "./routes/Auth.js";

import communityRouter from "./routes/Community.js";
import MemberRouter from "./routes/Member.js";
import RoleRouter from "./routes/Role.js";

const port = process.env.PORT;
const mongo_url = process.env.MONGO_URL;
const app = express();

mongoose
  .connect(mongo_url, {})
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.log(err.message);
  });
app.use(express.json());

app.use("/v1/auth", AuthRouter)
app.use("/v1/community",communityRouter)
app.use("/v1/member", MemberRouter)
app.use("/v1/role",RoleRouter) 
app.listen(port, () => {
  console.log(`server running on ${port}`);
})
