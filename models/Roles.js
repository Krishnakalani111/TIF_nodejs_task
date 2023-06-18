import mongoose from "mongoose";
import { Snowflake } from "@theinternetfolks/snowflake";

const RoleSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: Snowflake.generate(),
  },
  name: {
    type: String,
    required: true,
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

const Role = mongoose.model("Role", RoleSchema);
export default Role;
