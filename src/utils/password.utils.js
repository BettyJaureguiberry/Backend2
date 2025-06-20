import bcrypt from "bcrypt";

export const createHash = async (password) => {
  return await bcrypt.hash(password, 10);
};

export const isValidPassword = async (user, inputPassword) => {
  return await bcrypt.compare(inputPassword, user.password);
};