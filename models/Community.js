import mongoose from "mongoose";
import { Snowflake } from "@theinternetfolks/snowflake";

const communitySchema = new mongoose.Schema({
  _id: {
    type: String,
    default: Snowflake.generate(),
  },
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
  },
  owner: {
    type: String, // Use String type for Snowflake-generated IDs
    required: true,
    ref: 'User',
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

const Community = mongoose.model("Community", communitySchema);
export default Community;
