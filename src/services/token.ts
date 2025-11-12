import jwt from "jsonwebtoken";
import constants from "../config/constants";
import { IJwt } from "../interfaces/jwt/jwt";

class TokenService {
  private jwtSecret: string;
  constructor() {
    if (!constants.JWT_SECRET) {
      throw new Error("Errort jwt secret not found");
    }
    this.jwtSecret = constants.JWT_SECRET as string;
  }

  public encodeToken(payload: IJwt): string {
    return jwt.sign(payload, this.jwtSecret);
  }
  public verifyToken(token: string): IJwt | { error: string } {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as IJwt;
      return decoded;
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return { error: "token expired" };
      } else if (error.name === "JsonWebTokenError") {
        return { error: "invalid token" };
      } else {
        return { error: "internal error" };
      }
    }
  }
  public decodeToken(token: string): IJwt | null {
    try {
      const decoded = jwt.decode(token) as IJwt;
      return decoded;
    } catch (error) {
      return null;
    }
  }
}

export default TokenService;
