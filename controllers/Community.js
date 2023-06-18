import Community from "../models/Community.js";
import slugify from "slugify";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { query } from "express";
import Member from "../models/Members.js";
const secretKey = process.env.SECRET_KEY;

export const creatingCommunity = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const { name } = req.body;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        errors: [{ message: "You need to sign in to proceed" }],
        code: "NOT_SIGNEDIN",
      });
    }

    const token = authorization.split(" ")[1];

    // Verify and decode the access token
    const decodedToken = jwt.verify(token, secretKey);

    // Retrieve the user ID from the decoded token
    const userId = decodedToken.userId;
    if (userId === null) {
      return res.status(404).json({
        status: false,
        errors: [{ message: "You need to sign in to proceed." }],
      });
    }

    // Fetch the user details from the database
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return res.status(404).json({
        status: false,
        errors: [{ message: "User not found" }],
      });
    }

    if (name.length < 2) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: "name",
            message: "Name should be atleast 2 characters",
            code: "INVALID_INPUT",
          },
        ],
      });
    }
    const slug = slugify(name, {
      lower: true, // Convert the slug to lowercase
      strict: true, // Replace special characters with dashes
    });

    const newCommunity = new Community({
      name,
      slug,
      owner: userId,
    });

    await newCommunity
      .save()
      .then((community) => {
        res.status(201).json({
          status: true,
          content: {
            data: {
              id: community._id,
              name: community.name,
              slug: community.slug,
              owner: community.owner,
              created_at: community.created_at,
               updated_at: community.updated_at
            },
          },
        });
      })
      .catch((error) => {
        res.status(500).json({
          status: false,
          error: error.message,
        });
      });

    const Admin = new Member({
      community: newCommunity._id,
      user: userId,
      role: "Community Admin",
    });
    await Admin.save().catch((err) => {
      console.log("could not add the community creator as admin");
    });
  } catch (err) {
    res.status(500).json({
      status: false,
      errors: [
        {
          message: err.message,
        },
      ],
    });
  }
};

export const getAll = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * 10;

    const communities = await Community.find()
      .populate("owner", "id name ")
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await Community.countDocuments();

    const formattedCommunities = communities.map((community) => ({
      id: community._id,
      name: community.name,
      slug: community.slug,
      owner: {
        id: community.owner._id,
        name: community.owner.name,
      },
      created_at: community.created_at,
       updated_at: community.updated_at
    }));

    const totalPages = Math.ceil(totalCount / limit);

    const response = {
      status: true,
      content: {
        meta: {
          total: formattedCommunities.length,
          pages: totalPages,
          page: page,
        },
        data: formattedCommunities,
      },
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({
      status: false,
      error: "Internal Server Error",
    });
  }
};

//get all the members
export const getAllmembersOfACommunity = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * 10;
    const communityId = req.params.id;
    const membersOfThatCommunity = await Member.find({ community: communityId })
      .populate("user", "id name")
      .skip(skip)
      .limit(limit)
    const totalCount = await Member.countDocuments({ community: communityId })
    const formattedMembers = membersOfThatCommunity.map((member) => ({
      id: member._id,
      community: communityId,
      user: {
        id: member.user._id,
        name: member.user.name,
      },
      created_at: member.created_at,
      updated_at: community.updated_at
    }));
    const totalPages = Math.ceil(totalCount / limit);
   
    const response = {
      status: true,
      content: {
        meta: {
          total: formattedMembers.length,
          pages: totalPages,
          page: page,
        },
        data: formattedMembers,
      },
    };

    res.json(response);
  } catch (err) {
    res.status(500).json({
      status: false,
      error:err.message,
    });
  }
};

//get my onwed communities
export const getMyCommunities = async (req, res) => {
  try {
    
     const { authorization } = req.headers;

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        errors: [{ message: "You need to sign in to proceed" }],
        code: "NOT_SIGNEDIN",
      });
    }

    const token = authorization.split(" ")[1];

    // Verify and decode the access token
    const decodedToken = jwt.verify(token, secretKey);

    // Retrieve the user ID from the decoded token
    const userId = decodedToken.userId;
    // Get the pagination parameters from the query string
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
    const limit = 10; // Number of documents per page

    // Find communities owned by the user
    const communities = await Community.find({ owner: userId })
      .skip((page - 1) * limit)
      .limit(limit);

    // Count the total number of owned communities
    const totalCount = await Community.countDocuments({ owner: userId });

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalCount / limit);

    return res.status(200).json({
      status: true,
      content: {
        meta: {
          total: totalCount,
          pages: totalPages,
          page: page,
        },
        data: communities,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: {
        message: 'Internal Server Error',
        code: 'INTERNAL_ERROR',
      },
    });
  }
};

export const findMyCommunities =  async (req, res) => {
  try {
    const { authorization } = req.headers;
    

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return res.status(401).json({
        status: false,
        errors: [{ message: "You need to sign in to proceed" }],
        code: "NOT_SIGNEDIN",
      });
    }

    const token = authorization.split(" ")[1];

    // Verify and decode the access token
    const decodedToken = jwt.verify(token, secretKey);

    // Retrieve the user ID from the decoded token
    const userId = decodedToken.userId; // Assuming the user ID is available in req.user

    // Get the pagination parameters from the query string
    const page = parseInt(req.query.page) || 1; // Default to page 1 if not specified
    const limit = 10; // Number of documents per page

    // Find communities where the user is a member
    const memberCommunities = await Member.find({ user: userId })
      .populate('community', 'id name slug owner created_at updated_at')
      .skip((page - 1) * limit)
      .limit(limit);

    // Count the total number of member communities
    const totalCount = await Member.countDocuments({ user: userId });

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalCount / limit);

    const communities = memberCommunities.map((memberCommunity) => memberCommunity.community);

    return res.status(200).json({
      status: true,
      content: {
        meta: {
          total: totalCount,
          pages: totalPages,
          page: page,
        },
        data: communities,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      status: false,
      error: {
        message: 'Internal Server Error',
        code: 'INTERNAL_ERROR',
      },
    });
  }
}
