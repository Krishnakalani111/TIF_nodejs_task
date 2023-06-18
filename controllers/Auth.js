import dotenv from "dotenv";
dotenv.config();
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
const secretKey = process.env.SECRET_KEY;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SignUp = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: "email",
            message: "User with this email already exists",
            code: "RESOURCE_EXISTS",
          },
        ],
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

    if (password.length < 2) {
      return res.status(400).json({
        status: false,
        errors: [
          {
            param: "password",
            message: "password should be atleast 2 characters",
            code: "INVALID_INPUT",
          },
        ],
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
    });

    await newUser
      .save()
      .then((user) => {
        res.status(201).json({
          status: true,
          content: {
            data: {
              id: user._id,
              name: user.name,
              email: user.email,
              created_at: user.created_at,
              updated_at: user.updated_at
            },
            meta: {
              access_token: "your_access_token_here",
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
  } catch (err) {
    return next(err);
  }
};

//SignIn
export const SignIn = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find the user by email
    const user = await User.findOne({ email });

    // Check if the user exists and the password is correct
    if (!emailRegex.test(email)) {
      return res.status(401).json({
        status: false,
        errors: [
          {
            "param": "email",
            "message": "Please provide a valid email address.",
            "code": "INVALID_INPUT"
          },
        ],
      });
    }
    if (!user || !bcrypt.compare(password, user.password)) {
      return res.status(401).json({
        status: false,
        errors: [
          {
            "param": "password",
            "message": "Invalid email or password.",
            "code": "INVALID_CREDENTIALS"
          },
        ],
      });
    }
    
    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, secretKey);
    
    // Return the success response with the JWT token
    res.status(200).json({
      status: true,
      content: {
        data: {
          id: user._id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
           updated_at: user.updated_at
        },
        meta: {
          access_token: token,
        },
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

export const getMe = async (req, res) => {
  const { authorization } = req.headers;

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return res.status(401).json({
      status: false,
      errors: [{ message: 'You need to sign in to proceed' }],
      "code": "NOT_SIGNEDIN"
    });
  }

  const token = authorization.split(' ')[1];

  try {
    // Verify and decode the access token
    const decodedToken = jwt.verify(token, secretKey);
  
    // Retrieve the user ID from the decoded token
    const userId = decodedToken.userId;
    if (userId === null) {
      return res.status(404).json({
        status: false,
        errors: [{ message: 'You need to sign in to proceed.' }],
      })
    }
    

    // Fetch the user details from the database
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({
        status: false,
        errors: [{ message: 'User not found' }],
      });
    }

    // Create the response object with the required user details
    const response = {
      status: true,
      content: {
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
          created_at: user.created_at,
           updated_at: user.updated_at
        },
      },
    };

    // Send the response
    res.json(response);
  } catch (error) {
    console.error('Error retrieving user details:', error);
    res.status(500).json({
      status: false,
      message:error.message,
      errors: [{ message: error.message }],
    });
  }
};