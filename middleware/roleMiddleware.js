const roleCheck = (role) => {
  return (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Forbidden, insufficient permissions' });
    }
  };
};

module.exports = { roleCheck };
