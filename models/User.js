import mongoose from "mongoose";
import { Snowflake } from "@theinternetfolks/snowflake";

const UserSchema = new mongoose.Schema({
  _id: {
    type: String,
    default: Snowflake.generate()
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
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

const User = mongoose.model("User", UserSchema);
export default User;
