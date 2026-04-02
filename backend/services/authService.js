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

function signUserToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "12h",
    },
  );
}

function buildPublicUser(user) {
  return {
    id: user.id,
    email: user.email,
    role: user.role,
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

module.exports = {
  USER_ROLES,
  createUser,
  ensureAdminUser,
  loginUser,
};
