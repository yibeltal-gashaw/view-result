const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { prisma } = require("../config/database");
const { normalizeOptionalText } = require("../utils/text");

const USER_ROLES = {
  ADMIN: "ADMIN",
  TEACHER: "TEACHER",
};

function getUserModel() {
  if (!prisma || !prisma.user) {
    const message =
      "Prisma client User model is unavailable. Ensure prisma generate/migrations are current.";
    console.error(message, {
      hasPrisma: !!prisma,
      hasUserModel: !!prisma?.user,
    });
    return null;
  }

  return prisma.user;
}

async function ensureAdminUser() {
  const email = normalizeEmail(process.env.ADMIN_EMAIL);
  const password = String(process.env.ADMIN_PASSWORD || "").trim();

  console.log("Ensuring admin user:", { email: email ? "set" : "not set", password: password ? "set" : "not set" });

  if (!email || !password) {
    console.log("Admin credentials not set, skipping admin user creation");
    return;
  }

  const userModel = getUserModel();
  if (!userModel) {
    console.log("User model not available, cannot create admin user");
    return;
  }

  try {
    const existingAdmin = await userModel.findUnique({
      where: {
        email,
      },
    });

    if (existingAdmin) {
      console.log("Admin user already exists");
      return;
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await userModel.create({
      data: {
        email,
        passwordHash,
        role: USER_ROLES.ADMIN,
      },
    });

    console.log(`Bootstrapped admin user: ${email}`);
  } catch (error) {
    console.error("Error creating admin user:", error);
  }
}

async function loginUser(payload = {}) {
  const { email, password } = payload;
  const normalizedEmail = normalizeEmail(email);
  const normalizedPassword = String(password || "");

  console.log("Login attempt for:", normalizedEmail);

  if (!normalizedEmail || !normalizedPassword) {
    return {
      status: 400,
      body: {
        message: "Email and password are required.",
      },
    };
  }

  const userModel = getUserModel();
  if (!userModel) {
    return {
      status: 500,
      body: {
        message:
          "Internal server error: user model not available. Check Prisma generation.",
      },
    };
  }

  try {
    const user = await userModel.findUnique({
      where: {
        email: normalizedEmail,
      },
    });

    console.log("User found:", user ? "yes" : "no");

    if (!user) {
      return {
        status: 401,
        body: {
          message: "Invalid email or password.",
        },
      };
    }

    const isValidPassword = await bcrypt.compare(
      normalizedPassword,
      user.passwordHash,
    );

    console.log("Password valid:", isValidPassword);

    if (!isValidPassword) {
      return {
        status: 401,
        body: {
          message: "Invalid email or password.",
        },
      };
    }

    return {
      status: 200,
      body: {
        token: signUserToken(user),
        user: buildPublicUser(user),
      },
    };
  } catch (error) {
    console.error("Error in loginUser:", error);
    throw error;
  }
}

async function createUser(currentUser, payload = {}) {
  const email = normalizeEmail(payload.email);
  const password = String(payload.password || "").trim();
  const requestedRole = normalizeRole(payload.role);
  const requestedCourses = normalizeCoursesInput(payload.courses ?? payload.course);

  if (currentUser?.role !== USER_ROLES.ADMIN) {
    return {
      status: 403,
      body: {
        message: "Only admins can create user accounts.",
      },
    };
  }

  if (!email || !password) {
    return {
      status: 400,
      body: {
        message: "Email and password are required.",
      },
    };
  }

  if (!requestedRole) {
    return {
      status: 400,
      body: {
        message: "Role must be ADMIN or TEACHER.",
      },
    };
  }

  if (requestedRole === USER_ROLES.TEACHER && requestedCourses.length === 0) {
    return {
      status: 400,
      body: {
        message: "At least one course is required for teacher accounts.",
      },
    };
  }

  const userModel = getUserModel();
  if (!userModel) {
    return {
      status: 500,
      body: {
        message:
          "Internal server error: user model not available. Check Prisma generation.",
      },
    };
  }

  const existingUser = await userModel.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    return {
      status: 409,
      body: {
        message: "A user with this email already exists.",
      },
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await userModel.create({
    data: {
      email,
      passwordHash,
      role: requestedRole,
      course:
        requestedRole === USER_ROLES.TEACHER
          ? serializeCourses(requestedCourses)
          : "",
    },
  });

  return {
    status: 201,
    body: {
      message: "User account created successfully.",
      user: buildPublicUser(user),
    },
  };
}

async function listUsers(currentUser) {
  if (currentUser?.role !== USER_ROLES.ADMIN) {
    return {
      status: 403,
      body: {
        message: "Only admins can view user accounts.",
      },
    };
  }

  const userModel = getUserModel();
  if (!userModel) {
    return {
      status: 500,
      body: {
        message:
          "Internal server error: user model not available. Check Prisma generation.",
      },
    };
  }

  const users = await userModel.findMany({
    orderBy: [{ role: "asc" }, { createdAt: "desc" }],
  });

  return {
    status: 200,
    body: {
      users: users.map(buildPublicUser),
    },
  };
}

async function updateUserRole(currentUser, userId, updates = {}) {
  if (currentUser?.role !== USER_ROLES.ADMIN) {
    return {
      status: 403,
      body: {
        message: "Only admins can update user roles.",
      },
    };
  }

  const userModel = getUserModel();
  if (!userModel) {
    return {
      status: 500,
      body: {
        message:
          "Internal server error: user model not available. Check Prisma generation.",
      },
    };
  }

  const normalizedRole = normalizeRole(updates.role);
  if (!normalizedRole) {
    return {
      status: 400,
      body: {
        message: "Role must be ADMIN or TEACHER.",
      },
    };
  }

  const numericId = Number(userId);
  if (!Number.isFinite(numericId)) {
    return {
      status: 400,
      body: {
        message: "Invalid user id.",
      },
    };
  }

  const existingUser = await userModel.findUnique({
    where: { id: numericId },
  });

  if (!existingUser) {
    return {
      status: 404,
      body: {
        message: "User not found.",
      },
    };
  }

  const nextCourses = normalizeCoursesInput(updates.courses ?? updates.course);
  if (normalizedRole === USER_ROLES.TEACHER && nextCourses.length === 0) {
    return {
      status: 400,
      body: {
        message: "At least one course is required for teacher accounts.",
      },
    };
  }

  const updated = await userModel.update({
    where: { id: numericId },
    data: {
      role: normalizedRole,
      course: serializeCourses(nextCourses),
    },
  });

  return {
    status: 200,
    body: {
      message: "User role updated successfully.",
      user: buildPublicUser(updated),
    },
  };
}

function signUserToken(user) {
  const courses = deserializeCourses(user.course);
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      course: courses[0] || "",
      courses,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "12h",
    },
  );
}

function buildPublicUser(user) {
  const courses = deserializeCourses(user.course);
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    course: courses[0] || "",
    courses,
    createdAt: user.createdAt,
  };
}

function normalizeEmail(value) {
  return normalizeOptionalText(value).toLowerCase();
}

function normalizeRole(value) {
  const normalizedValue = normalizeOptionalText(value).toUpperCase();
  return Object.values(USER_ROLES).includes(normalizedValue)
    ? normalizedValue
    : "";
}

function normalizeCoursesInput(value) {
  const rawValues = Array.isArray(value) ? value : [value];
  const normalized = rawValues
    .flatMap((item) => String(item || "").split(","))
    .map((item) => normalizeOptionalText(item).toLowerCase())
    .filter(Boolean);

  return [...new Set(normalized)];
}

function serializeCourses(courses = []) {
  return normalizeCoursesInput(courses).join(",");
}

function deserializeCourses(value) {
  return normalizeCoursesInput(value);
}

module.exports = {
  USER_ROLES,
  createUser,
  ensureAdminUser,
  listUsers,
  updateUserRole,
  loginUser,
};
