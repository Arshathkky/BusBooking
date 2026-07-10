export const authMiddleware = (req, res, next) => {
  // Pass through middleware as user authentication is stored client-side
  next();
};
