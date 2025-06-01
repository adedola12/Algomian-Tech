import jwt from "jsonwebtoken";

const generateToken = (id, permissions = []) =>
  jwt.sign({ id, permissions }, process.env.JWT_SECRET, { expiresIn: "30d" });

export default generateToken;
