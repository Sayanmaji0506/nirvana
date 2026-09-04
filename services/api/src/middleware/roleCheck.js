/**
 * Role-based access control middleware
 * Valid roles: 'driver', 'reporter', 'official'
 */
function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, error: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access forbidden: Required role [${allowedRoles.join(', ')}], current role is '${req.user.role}'`
      });
    }

    next();
  };
}

module.exports = {
  requireRole
};
