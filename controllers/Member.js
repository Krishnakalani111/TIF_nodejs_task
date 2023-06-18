import Member from "../models/Members.js";
import Role from "../models/Roles.js";
import User from "../models/User.js";
import Community from "../models/Community.js";
import jwt from "jsonwebtoken";
const secretKey = process.env.SECRET_KEY;


//adding a new member
export const addMember = async (req, res) => {
  try {
    const { authorization } = req.headers;
    const { community, user, role } = req.body;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        errors: [{ message: "You need to sign in to proceed" }],
        code: "NOT_SIGNEDIN",
      });
    }
    const token = authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, secretKey);
    const userId = decodedToken.userId;
    //admin verification completed

    const member = await Member.findOne({ user: userId });

    if (member.role !== "Community Admin") {
      return res.status(403).json({
        status: false,
        errors: [
          {
            message: "Only Community Admin can add members.",
            code: "NOT_ALLOWED_ACCESS",
          },
        ],
      });
    }
    // Check if the user is already a member of the community
    const existingMember = await Member.findOne({
      community: community,
      user: user,
    });

    if (existingMember) {
      return res.status(400).json({
        status: false,
        error: {
          message: "User is already a member of the community.",
          code: "ALREADY_EXISTS",
        },
      });
    }
    // Find the community
    const targetCommunity = await Community.findById(community);
    if (!targetCommunity) {
      return res.status(404).json({
        status: false,
        errors: [
          {
            message: "Community not found.",
            code: "RESOURCE_NOT_FOUND",
          },
        ],
      });
    }
    // Find the Role
    const targetRole = await Role.findById(role);
    if (!targetRole) {
      return res.status(404).json({
        status: false,
        errors: [
          {
            message: "Role not found.",
            code: "RESOURCE_NOT_FOUND",
          },
        ],
      });
    }

    // Find the User
    const targetUser = await User.findById(user);
    if (!targetUser) {
      return res.status(404).json({
        status: false,
        errors: [
          {
            message: "User not found.",
            code: "RESOURCE_NOT_FOUND",
          },
        ],
      });
    }

    // Create a new member
    const newMember = new Member({
      community,
      user,
      role,
    });

    // Save the member
    await newMember.save();

    res.status(201).json({
      status: true,
      content: {
        data: newMember,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      status: false,
      errors: [
        {
          message: "Internal Server Error",
        },
      ],
    });
  }
};

//Deleting the member
export const deleteMember = async (req, res) => {
    try {
    const { authorization } = req.headers;
    const memberId = req.params.id;
     if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        errors: [{ message: "You need to sign in to proceed" }],
        code: "NOT_SIGNEDIN",
      });
    }
    const token = authorization.split(" ")[1];
    const decodedToken = jwt.verify(token, secretKey);
    const userId = decodedToken.userId;
        const Admin = await Member.findOne({ user: userId })

    // Find the member by ID
    const member = await Member.findById(memberId);

    // Check if the member exists
    if (!member) {
      return res.status(404).json({
        status: false,
        error: {
          message: 'Member not found.',
          code: 'NOT_FOUND',
        },
      });
    }

    // Check if the user is allowed to remove the member
    const allowedRoles = ['Community Admin', 'Community Moderator'];
    if (!allowedRoles.includes(Admin.role)) {
      return res.status(403).json({
        status: false,
        error: {
          message: 'Access denied. You do not have permission to remove a member.',
          code: 'NOT_ALLOWED_ACCESS',
        },
      });
    }

    

    // Remove the member
    await member.deleteOne();

    return res.status(200).json({
      status: true,
      message: 'Member removed successfully.',
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: {
        message: error.message,
        code: 'INTERNAL_ERROR',
      },
    });
  }
};
