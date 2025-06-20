import UserModel from '../models/User.model.js';

class UserRepository {
  async registerUser(userData) {
    console.log("📩 DAO → intento de guardar:", userData.email);
    const result = await UserModel.create(userData);
    console.log("📥 DAO → resultado real en base:", result);
    return result;
  }

  async findUserByEmail(email) {
    return await UserModel.findOne({ email });
  }

  async resetUserPassword(email, hashedPassword) {
    return await UserModel.updateOne({ email }, { $set: { password: hashedPassword } });
  }
}

export default UserRepository;

