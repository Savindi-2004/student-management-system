// Blocks a route unless the user has an active session (any role)
function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: "Please log in to continue." });
  }
  next();
}

// Blocks a route unless the logged-in user has one of the allowed roles
// Usage: requireRole("admin")  or  requireRole("admin", "student")
function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: "Please log in to continue." });
    }
    if (!allowedRoles.includes(req.session.user.role)) {
      return res.status(403).json({ message: "You do not have permission to do that." });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
