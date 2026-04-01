function requireTeacherToken(req, res, next) {
  const configuredToken = String(process.env.TEACHER_UPLOAD_TOKEN || "").trim();

  if (!configuredToken) {
    return res.status(503).json({
      message: "Teacher upload is not configured on the server.",
    });
  }

  const providedToken = String(req.headers["x-teacher-token"] || "").trim();

  if (!providedToken || providedToken !== configuredToken) {
    return res.status(401).json({
      message: "Unauthorized teacher upload request.",
    });
  }

  next();
}

module.exports = {
  requireTeacherToken,
};
