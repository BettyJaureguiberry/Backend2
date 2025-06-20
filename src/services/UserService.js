import UserRepository from '../repositories/UserRepository.js';
import userModel from '../models/user.model.js';
import bcrypt from 'bcrypt';

const userRepository = new UserRepository();

class UserService {
    async createUser(userData) {
  console.log("🎯 UserService → Data recibida:", userData);
  userData.password = bcrypt.hashSync(userData.password, 10);
  console.log("🔐 UserService → Hash generado:", userData.password);

  return await userRepository.registerUser(userData);
}


  async findUserByEmail(email) {
    return await userRepository.findUserByEmail(email);
  }

  async resetUserPassword(email, newHashedPassword) {
    return await userRepository.resetUserPassword(email, newHashedPassword);
  }

  // 👇 Este es el que te falta
  /*async registerUser(userData) {
    return await userRepository.registerUser(userData);
  }*/
}

export default new UserService();