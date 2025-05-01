import jwt from "jsonwebtoken";

const refreshToken = (user) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
  return token;
};

export default refreshToken;
