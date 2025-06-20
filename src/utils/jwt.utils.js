
import jwt from "jsonwebtoken";

export const generateJWToken = (user) => {
    return jwt.sign(user, process.env.JWT_SECRET, { expiresIn: "1h" });
};

