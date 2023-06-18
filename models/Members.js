import mongoose from "mongoose";
import { Snowflake } from "@theinternetfolks/snowflake";

const MemberSchema = new mongoose.Schema({
    _id: {
        type: String,
        default: Snowflake.generate(),
    },
    community: {
        type: String,
        ref: 'Community',
        required: true,
    },
    role: {
        type: String,
        ref: 'Role',
        required: true,
    },
    user: {
        type: String,
        ref: 'User',
        required: true,
    },
    created_at: {
    type: Date,
    default: Date.now,
  }
});

const Member = mongoose.model("Member", MemberSchema);
export default Member;