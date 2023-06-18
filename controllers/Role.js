import Role from "../models/Roles.js";

export const addRole = async (req, res) => {
  try {
    const { name } = req.body;

    // Validate the role name (e.g., minimum length, required)
    if (!name || name.length < 2) {
      return res.status(400).json({
        status: false,
        error: {
          message:
            "Role name is required and should be at least 2 characters long.",
          code: "INVALID_INPUT",
        },
      });
    }

    // Create a new role using the role name
    const newRole = new Role({
      name,
    });

    await newRole.save().catch((err) => {
      res.status(400).json({
        message: err.message,
      });
    });
    // Return the created role in the response
    return res.status(201).json({
      status: true,
      content: {
        data: newRole,
      },
    });
  } catch (err) {}
};


//getting all roles
export const getAllroles = async (req, res, next) => {
    try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * 10;

    const roles = await Role.find()
      .skip(skip)
      .limit(limit)
      .lean();

    const totalCount = await Role.countDocuments();

    const formattedRoles = roles.map((role) => ({
      id: role._id,
      name: role.name,
        created_at: role.created_at,
      updated_at: role.updated_at
    }));

    const totalPages = Math.ceil(totalCount / limit);

    const response = {
      status: true,
      content: {
        meta: {
          total: formattedRoles.length,
          pages: totalPages,
          page: page,
        },
        data: formattedRoles,
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
