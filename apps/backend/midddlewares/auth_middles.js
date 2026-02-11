const protect = (req, res, next) => {
  if (!req.session?.isLoggedIn || !req.session?.userId) {
    return res.status(401).json({ message: "user is not logged in" });
  }
  next();
};

export default protect;
