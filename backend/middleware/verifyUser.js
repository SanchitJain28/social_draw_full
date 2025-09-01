import { User } from "../Schemmas/UserSchemma.js";
import jwt from "jsonwebtoken";
export async function verifyUser(req, res, next) {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized ,No token provided",
      });
    }
    const decodedToken = jwt.verify(token, "SanchitkaKhufiyaSecret");
    if (!decodedToken) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized ,Please register or login",
      });
    }
    //FIND USER
    const user = await User.findOne({ _id: decodedToken.id });
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized ,Please register or login",
      });
    }
    req.user = user;
    next();
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      status: false,
      message: "Internal Server Error",
      error,
    });
  }
}
